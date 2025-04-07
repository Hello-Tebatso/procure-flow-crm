
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

export interface ProductFormValues {
  description: string;
  qtyRequested: number;
}

interface ProductItemProps {
  product: ProductFormValues;
  index: number;
  canRemove: boolean;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof ProductFormValues, value: any) => void;
  disabled?: boolean;
}

const ProductItem = ({
  product,
  index,
  canRemove,
  onRemove,
  onChange,
  disabled = false
}: ProductItemProps) => {
  return (
    <Card className="border border-muted">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Product {index + 1}</CardTitle>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-8 w-8 p-0 text-red-500"
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 grid gap-4">
        <div>
          <Label htmlFor={`product-${index}-description`}>Product Description</Label>
          <Textarea
            id={`product-${index}-description`}
            value={product.description}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            disabled={disabled}
            className="mt-1"
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor={`product-${index}-qty`}>Quantity</Label>
          <Input
            id={`product-${index}-qty`}
            type="number"
            min="1"
            value={product.qtyRequested}
            onChange={(e) => onChange(index, 'qtyRequested', parseInt(e.target.value) || 1)}
            disabled={disabled}
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductItem;
