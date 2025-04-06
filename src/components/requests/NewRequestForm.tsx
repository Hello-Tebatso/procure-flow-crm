
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProcurement } from "@/contexts/ProcurementContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
import { AlertCircle, Loader } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  rfqNumber: z.string().optional(),
  poNumber: z.string().optional(),
  entity: z.string().min(1, "Entity is required"),
  description: z.string().min(1, "Description is required"),
  placeOfDelivery: z.string().min(1, "Place of delivery is required"),
  placeOfArrival: z.string().optional(),
  qtyRequested: z.coerce.number().positive("Quantity must be greater than 0"),
  expDeliveryDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewRequestFormProps {
  clientId: string | null;
}

const NewRequestForm = ({ clientId }: NewRequestFormProps) => {
  const { createRequest, uploadFile } = useProcurement();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rfqNumber: "",
      poNumber: "",
      entity: "MGP Investments",
      description: "",
      placeOfDelivery: "",
      placeOfArrival: "",
      qtyRequested: 1,
      expDeliveryDate: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
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

    setIsSubmitting(true);
    try {
      // Format the data for insertion
      const dbRequest = {
        rfq_number: data.rfqNumber || "",
        po_number: data.poNumber || "",
        entity: data.entity,
        description: data.description,
        place_of_delivery: data.placeOfDelivery,
        place_of_arrival: data.placeOfArrival || "",
        exp_delivery_date: data.expDeliveryDate || null,
        qty_requested: data.qtyRequested,
        qty_delivered: 0,
        qty_pending: data.qtyRequested,
        stage: "New Request", 
        status: "pending",
        client_id: clientId,
        is_public: true
      };
      
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
          qtyDelivered: 0,
          qtyPending: data.qtyRequested,
          clientId: clientId,
        });
      } else {
        // Table exists, insert directly to database
        console.log("Adding request directly to database");
        
        const { data: insertData, error } = await supabase
          .from("procurement_requests")
          .insert(dbRequest)
          .select()
          .single();
        
        if (error) throw error;
        
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
                      <Input placeholder="Optional" {...field} />
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
                      <Input placeholder="Optional" {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="qtyRequested"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity Requested</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
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
                    <Textarea rows={3} {...field} />
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
                      <Input {...field} />
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
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expDeliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Delivery Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div>
                <FormLabel>Attachments (Optional)</FormLabel>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="mt-1"
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
