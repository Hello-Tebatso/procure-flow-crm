
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductItem from "./ProductItem";
import { useToast } from "@/hooks/use-toast";
import { ProductFormValues } from "./validationSchema";

interface ProductListProps {
  products: ProductFormValues[];
  setProducts: React.Dispatch<React.SetStateAction<ProductFormValues[]>>;
  disabled?: boolean;
}

const ProductList = ({ products, setProducts, disabled = false }: ProductListProps) => {
  const { toast } = useToast();

  const addProduct = () => {
    // Fix: Ensure new products have required fields properly initialized
    const newProduct: ProductFormValues = {
      description: '',
      qtyRequested: 1
    };
    setProducts([...products, newProduct]);
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

  return (
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
        <ProductItem
          key={index}
          product={product}
          index={index}
          canRemove={products.length > 1}
          onRemove={removeProduct}
          onChange={updateProduct}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default ProductList;
