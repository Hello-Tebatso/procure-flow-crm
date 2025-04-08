
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import ProductList from "./ProductList";
import FileUpload from "./FileUpload";
import RequestFormFields from "./RequestFormFields";
import RequestFormActions from "./RequestFormActions";
import { useRequestForm } from "@/hooks/useRequestForm";

interface NewRequestFormProps {
  clientId: string | null;
  disabled?: boolean;
}

const NewRequestForm = ({ clientId, disabled = false }: NewRequestFormProps) => {
  const { user } = useAuth();
  const { 
    form, 
    products, 
    setProducts, 
    files, 
    setFiles, 
    isSubmitting, 
    onSubmit 
  } = useRequestForm(clientId, disabled);

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
            <RequestFormFields form={form} disabled={disabled} />

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

            <RequestFormActions isSubmitting={isSubmitting} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NewRequestForm;
