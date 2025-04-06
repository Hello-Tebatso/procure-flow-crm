
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import NewRequestForm from "@/components/requests/NewRequestForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const NewRequestPage = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Only client and admin can create requests, not buyers
  if (!user || (user.role !== "client" && user.role !== "admin")) {
    return <Navigate to="/dashboard" />;
  }
  
  // Check Supabase authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setAuthError("You must be authenticated with Supabase to create requests. Please use the admin login.");
      } else {
        setAuthError(null);
      }
    };
    
    checkAuth();
  }, []);
  
  // Load clients for admin users
  useEffect(() => {
    if (user?.role === "admin") {
      const loadClients = async () => {
        setIsLoading(true);
        try {
          // Try to fetch clients from the user_profiles table
          const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("role", "client");
            
          if (error) {
            console.warn("Using mock clients because user_profiles table doesn't exist:", error.message);
            // Use mock clients if the table doesn't exist
            setClients([
              { id: "754e86c9-afed-45e6-bcae-f2799beb9060", name: "MGP Investments", email: "client@example.com", role: "client" },
              { id: "855e86c9-afed-45e6-bcae-f2799beb9061", name: "African Investments Ltd", email: "african@example.com", role: "client" },
              { id: "956e86c9-afed-45e6-bcae-f2799beb9062", name: "Global Capital Group", email: "global@example.com", role: "client" }
            ]);
          } else if (data) {
            // Map the database results to our User model
            setClients(data.map((profile: any) => ({
              id: profile.id,
              name: profile.name || profile.username,
              email: profile.email,
              role: profile.role
            })));
          }
        } catch (error) {
          console.error("Error loading clients:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadClients();
    }
  }, [user?.role]);
  
  // For clients, they create requests for themselves
  // For admins, they select a client to create a request for
  const clientId = user?.role === "client" ? user.id : selectedClientId;
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Create New Request
          </h2>
          <p className="text-muted-foreground">
            Submit a new procurement request
          </p>
        </div>
        
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        
        {user?.role === "admin" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select 
                    value={selectedClientId || ""} 
                    onValueChange={setSelectedClientId}
                    disabled={isLoading || clients.length === 0}
                  >
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <NewRequestForm clientId={clientId} disabled={!!authError} />
      </div>
    </MainLayout>
  );
};

export default NewRequestPage;
