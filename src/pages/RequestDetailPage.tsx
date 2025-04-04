
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import RequestDetails from "@/components/requests/RequestDetails";
import { useProcurement } from "@/contexts/ProcurementContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const RequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequestById } = useProcurement();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadRequest = () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const foundRequest = getRequestById(id);
    
    if (foundRequest) {
      setRequest(foundRequest);
    } else {
      setNotFound(true);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadRequest();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading request details...</p>
        </div>
      </MainLayout>
    );
  }

  if (notFound) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-bold">Request Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The requested procurement request could not be found
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="flex items-center text-muted-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <RequestDetails request={request} onUpdate={loadRequest} />
      </div>
    </MainLayout>
  );
};

export default RequestDetailPage;
