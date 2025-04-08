
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./validationSchema";

interface RequestFormFieldsProps {
  form: UseFormReturn<FormValues>;
  disabled?: boolean;
}

const RequestFormFields = ({ form, disabled = false }: RequestFormFieldsProps) => {
  return (
    <>
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
    </>
  );
};

export default RequestFormFields;
