import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProcurement } from "@/contexts/ProcurementContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, makeAuthenticatedRequest } from "@/integrations/supabase/client";
import { AlertCircle, Loader } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import ProductList from "./ProductList";
import FileUpload from "./FileUpload";
import { formSchema, productSchema, FormValues, ProductFormValues } from "./validationSchema";

interface NewRequestFormProps {
  clientId: string | null;
  disabled?: boolean;
}

const NewRequestForm = ({ clientId, disabled = false }: NewRequestFormProps) => {
  const { createRequest, uploadFile } = useProcurement();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<ProductFormValues[]>([{
    description: '',
    qtyRequested: 1
  }]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rfqNumber: "",
      poNumber: "",
      entity: "MGP Investments",
      description: "",
      placeOfDelivery: "",
      placeOfArrival: "",
      expDeliveryDate: "",
    },
  });

  const validateProducts = (): boolean => {
    let isValid = true;
    
    products.forEach((product, index) => {
      try {
        productSchema.parse(product);
      } catch (error) {
        isValid = false;
        toast({
          title: `Product ${index + 1} Error`,
          description: `Please check product ${index + 1} details`,
          variant: "destructive",
        });
      }
    });
    
    return isValid;
  };

  const onSubmit = async (data: FormValues) => {
    if (!clientId) {
      toast({
        title: "Error",
        description: user?.role === "admin" 
          ? "Please select a client first" 
          : "Client ID is missing",
        variant: "destructive",
      });
      return;
    }

    if (!validateProducts()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const totalQtyRequested = products.reduce((sum, product) => sum + product.qtyRequested, 0);
      
      const dbRequest = {
        rfq_number: data.rfqNumber || "",
        po_number: data.poNumber || "",
        entity: data.entity,
        description: data.description,
        place_of_delivery: data.placeOfDelivery,
        place_of_arrival: data.placeOfArrival || "",
        exp_delivery_date: data.expDeliveryDate || null,
        qty_requested: totalQtyRequested,
        qty_delivered: 0,
        qty_pending: totalQtyRequested,
        stage: "New Request", 
        status: "pending",
        client_id: clientId,
        is_public: true
      };
      
      console.log("Attempting to insert request:", dbRequest);
      
      const { error: tableCheckError } = await supabase
        .from("procurement_requests")
        .select("id")
        .limit(1);
      
      let newRequest;
      if (tableCheckError) {
        console.log("Using mock createRequest as procurement_requests table doesn't exist");
        newRequest = await createRequest({
          ...data,
          qtyRequested: totalQtyRequested,
          qtyDelivered: 0,
          qtyPending: totalQtyRequested,
          clientId: clientId,
        }, products);
      } else {
        console.log("Adding request directly to database");
        
        const authClient = await makeAuthenticatedRequest();
        
        const { data: insertData, error } = await authClient
          .from("procurement_requests")
          .insert(dbRequest)
          .select()
          .single();
        
        if (error) {
          console.error("Database insert error:", error);
          throw error;
        }
        
        for (const product of products) {
          const { error: itemError } = await authClient
            .from("request_items")
            .insert({
              request_id: insertData.id,
              description: product.description,
              qty_requested: product.qtyRequested,
              qty_delivered: 0,
              item_number: `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            });
            
          if (itemError) {
            console.error("Error adding product item:", itemError);
            throw itemError;
          }
        }
        
        newRequest = {
          id: insertData.id,
          rfqNumber: insertData.rfq_number,
          poNumber: insertData.po_number || "",
          entity: insertData.entity,
          description: insertData.description,
          placeOfDelivery: insertData.place_of_delivery,
          qtyRequested: insertData.qty_requested,
          qtyDelivered: 0,
          qtyPending: insertData.qty_pending,
          stage: insertData.stage,
          status: insertData.status,
          createdAt: insertData.created_at,
          updatedAt: insertData.updated_at,
          clientId: insertData.client_id,
          isPublic: insertData.is_public,
          files: []
        };
      }

      if (files.length > 0 && newRequest) {
        toast({
          title: "Uploading files",
          description: `Uploading ${files.length} files...`,
        });

        for (const file of files) {
          await uploadFile(newRequest.id, file);
        }
      }

      toast({
        title: "Success",
        description: "New procurement request created successfully",
      });

      navigate("/requests");
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role === "admin" && !clientId) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          Please select a client before creating a request.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Procurement Request</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="rfqNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RFQ Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="poNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="entity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expDeliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} disabled={disabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="placeOfDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place of Delivery</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="placeOfArrival"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place of Arrival (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ProductList 
              products={products} 
              setProducts={setProducts} 
              disabled={disabled} 
            />

            <FileUpload 
              files={files} 
              setFiles={setFiles} 
              disabled={disabled} 
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Request"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NewRequestForm;
