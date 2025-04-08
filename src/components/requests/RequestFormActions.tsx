
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RequestFormActionsProps {
  isSubmitting: boolean;
}

const RequestFormActions = ({ isSubmitting }: RequestFormActionsProps) => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default RequestFormActions;
