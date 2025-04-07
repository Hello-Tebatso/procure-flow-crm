
import * as z from "zod";

export const productSchema = z.object({
  description: z.string().min(1, "Product description is required"),
  qtyRequested: z.coerce.number().positive("Quantity must be greater than 0"),
});

export const formSchema = z.object({
  rfqNumber: z.string().optional(),
  poNumber: z.string().optional(),
  entity: z.string().min(1, "Entity is required"),
  description: z.string().min(1, "Description is required"),
  placeOfDelivery: z.string().min(1, "Place of delivery is required"),
  placeOfArrival: z.string().optional(),
  expDeliveryDate: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
