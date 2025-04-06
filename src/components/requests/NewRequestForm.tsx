
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProcurement } from "@/contexts/ProcurementContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RequestItem } from "@/types";

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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, Loader, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const productSchema = z.object({
  itemNumber: z.string().optional(),
  description: z.string().min(1, "Product description is required"),
  qtyRequested: z.coerce.number().positive("Quantity must be greater than 0"),
  unitPrice: z.coerce.number().optional(),
});

const formSchema = z.object({
  rfqNumber: z.string().optional(),
  poNumber: z.string().optional(),
  entity: z.string().min(1, "Entity is required"),
  description: z.string().min(1, "Description is required"),
  placeOfDelivery: z.string().min(1, "Place of delivery is required"),
  placeOfArrival: z.string().optional(),
  expDeliveryDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type ProductFormValues = z.infer<typeof productSchema>;

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
    itemNumber: '',
    description: '',
    qtyRequested: 1,
    unitPrice: undefined
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const addProduct = () => {
    setProducts([...products, {
      itemNumber: '',
      description: '',
      qtyRequested: 1,
      unitPrice: undefined
    }]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Cannot Remove",
        description: "You must have at least one product",
        variant: "destructive",
      });
    }
  };

  const updateProduct = (index: number, field: keyof ProductFormValues, value: any) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
  };

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
    // Make sure we have a client ID
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

    // Validate products
    if (!validateProducts()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Total quantity from all products
      const totalQtyRequested = products.reduce((sum, product) => sum + product.qtyRequested, 0);
      
      // Format the data for insertion
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
      
      // Check if the procurement_requests table exists
      const { error: tableCheckError } = await supabase
        .from("procurement_requests")
        .select("id")
        .limit(1);
      
      let newRequest;
      if (tableCheckError) {
        // Table doesn't exist, use the mock createRequest function
        console.log("Using mock createRequest as procurement_requests table doesn't exist");
        newRequest = await createRequest({
          ...data,
          qtyRequested: totalQtyRequested,
          qtyDelivered: 0,
          qtyPending: totalQtyRequested,
          clientId: clientId,
        }, products.map(p => ({
          itemNumber: p.itemNumber,
          description: p.description,
          qtyRequested: p.qtyRequested,
          unitPrice: p.unitPrice
        })));
      } else {
        // Table exists, insert directly to database
        console.log("Adding request directly to database");
        
        const { data: insertData, error } = await supabase
          .from("procurement_requests")
          .insert(dbRequest)
          .select()
          .single();
        
        if (error) {
          console.error("Database insert error:", error);
          throw error;
        }
        
        // Add products as request items
        for (const product of products) {
          const { error: itemError } = await supabase
            .from("request_items")
            .insert({
              request_id: insertData.id,
              item_number: product.itemNumber || `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              description: product.description,
              qty_requested: product.qtyRequested,
              qty_delivered: 0,
              unit_price: product.unitPrice
            });
            
          if (itemError) {
            console.error("Error adding product item:", itemError);
            throw itemError;
          }
        }
        
        // Map the returned data to our model
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

      // Upload files if any
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

      // Redirect to the requests list
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

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // If an admin hasn't selected a client yet, show a message
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

            {/* Products Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Products</h3>
                <Button 
                  type="button" 
                  onClick={addProduct} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  disabled={disabled}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Product
                </Button>
              </div>
              
              {products.map((product, index) => (
                <Card key={index} className="border border-muted">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Product {index + 1}</CardTitle>
                    {products.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(index)}
                        className="h-8 w-8 p-0 text-red-500"
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0 grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`product-${index}-item-number`}>Item Number (Optional)</Label>
                        <Input
                          id={`product-${index}-item-number`}
                          value={product.itemNumber || ''}
                          onChange={(e) => updateProduct(index, 'itemNumber', e.target.value)}
                          placeholder="Auto-generated if empty"
                          disabled={disabled}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`product-${index}-qty`}>Quantity</Label>
                        <Input
                          id={`product-${index}-qty`}
                          type="number"
                          min="1"
                          value={product.qtyRequested}
                          onChange={(e) => updateProduct(index, 'qtyRequested', parseInt(e.target.value) || 1)}
                          disabled={disabled}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`product-${index}-description`}>Description</Label>
                      <Textarea
                        id={`product-${index}-description`}
                        value={product.description}
                        onChange={(e) => updateProduct(index, 'description', e.target.value)}
                        disabled={disabled}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`product-${index}-price`}>Unit Price (Optional)</Label>
                      <Input
                        id={`product-${index}-price`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.unitPrice || ''}
                        onChange={(e) => updateProduct(index, 'unitPrice', parseFloat(e.target.value) || undefined)}
                        placeholder="Optional"
                        disabled={disabled}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <FormLabel>Attachments (Optional)</FormLabel>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="mt-1"
                  disabled={disabled}
                />
              </div>

              {files.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Selected Files:</p>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li 
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center">
                          <span className="text-sm truncate max-w-[300px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({(file.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={disabled}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

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
