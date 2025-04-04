
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProcurement } from "@/contexts/ProcurementContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { RequestItem } from "@/types";
import { Trash2, Plus } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  rfqNumber: z.string().optional(),
  poNumber: z.string().optional(),
  entity: z.string().optional(),
  description: z.string().optional(),
  placeOfDelivery: z.string().min(1, "Place of delivery is required"),
  expDeliveryDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const NewRequestForm = () => {
  const { user } = useAuth();
  const { createRequest, uploadFile } = useProcurement();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<Partial<RequestItem>[]>([
    { description: "", qtyRequested: 1 }
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rfqNumber: "",
      poNumber: "",
      entity: user?.role === "admin" ? "MGP Investments" : undefined,
      description: "",
      placeOfDelivery: "",
      expDeliveryDate: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const addItem = () => {
    setItems([...items, { description: "", qtyRequested: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Error",
        description: "A request must have at least one item",
        variant: "destructive",
      });
    }
  };

  const updateItem = (index: number, field: keyof RequestItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === "qtyRequested" ? Number(value) : value,
    };
    setItems(updatedItems);
  };

  const onSubmit = async (data: FormValues) => {
    // Validate items
    const invalidItems = items.some(item => !item.description?.trim());
    if (invalidItems) {
      toast({
        title: "Validation Error",
        description: "All items must have a description",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare items with line numbers
      const formattedItems = items.map((item, index) => ({
        ...item,
        line: index + 1,
        qtyRequested: item.qtyRequested || 1,
        qtyDelivered: 0,
        qtyPending: item.qtyRequested || 1,
        id: `temp-${index}` // Temporary ID that will be replaced on server
      })) as RequestItem[];

      // Create the request
      const newRequest = await createRequest({
        ...data,
        items: formattedItems,
      });

      // Upload files if any
      if (files.length > 0) {
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
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Procurement Request</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Admin-only fields */}
            {user?.role === "admin" && (
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
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Request Items Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Request Items</h3>
                <Button 
                  type="button" 
                  onClick={addItem}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <Separator />
              
              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormLabel htmlFor={`item-${index}-description`}>
                        Description
                      </FormLabel>
                      <Textarea
                        id={`item-${index}-description`}
                        value={item.description || ""}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        rows={3}
                        placeholder="Item description"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <FormLabel htmlFor={`item-${index}-qty`}>
                        Quantity Requested
                      </FormLabel>
                      <Input
                        id={`item-${index}-qty`}
                        type="number"
                        min="1"
                        value={item.qtyRequested || 1}
                        onChange={(e) => updateItem(index, "qtyRequested", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
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
                {isSubmitting ? "Creating..." : "Create Request"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NewRequestForm;
