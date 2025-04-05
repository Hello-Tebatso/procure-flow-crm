
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

const adminFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const userFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["buyer", "client"]),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;
type UserFormValues = z.infer<typeof userFormSchema>;

const LoginPage = () => {
  const { user, login, loginAsBuyerOrClient, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole | "admin">("client");

  const adminForm = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      role: "client",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onSubmitAdmin = async (data: AdminFormValues) => {
    setIsSubmitting(true);
    const success = await login(data.email, data.password);
    
    if (!success) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  const onSubmitUser = async (data: UserFormValues) => {
    setIsSubmitting(true);
    
    try {
      const success = await loginAsBuyerOrClient(data.email, data.role as UserRole);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: `Welcome, ${data.email.split('@')[0]}!`,
        });
        
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update role when tab changes
  useEffect(() => {
    if (activeTab === "buyer" || activeTab === "client") {
      userForm.setValue("role", activeTab);
    }
  }, [activeTab, userForm]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-procurement-primary" />
      </div>
    );
  }

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <img
              src="https://static.wixstatic.com/media/bda159_4c1aeb4ff1664028a8d67ea7ce0ac8fd~mv2.png"
              alt="MGP Logo"
              className="h-16 w-16"
            />
            <h1 className="ml-3 text-2xl font-bold text-procurement-primary">
              MGP Procurement
            </h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Login</CardTitle>
            <CardDescription>
              Access your procurement management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="client">Client</TabsTrigger>
                <TabsTrigger value="buyer">Buyer</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              {/* Client and Buyer Login Form */}
              <TabsContent value="client">
                <Form {...userForm}>
                  <form
                    onSubmit={userForm.handleSubmit(onSubmitUser)}
                    className="space-y-4"
                  >
                    <FormField
                      control={userForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <input type="hidden" {...userForm.register("role")} value="client" />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      {isSubmitting ? "Logging in..." : "Login as Client"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="buyer">
                <Form {...userForm}>
                  <form
                    onSubmit={userForm.handleSubmit(onSubmitUser)}
                    className="space-y-4"
                  >
                    <FormField
                      control={userForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <input type="hidden" {...userForm.register("role")} value="buyer" />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      {isSubmitting ? "Logging in..." : "Login as Buyer"}
                    </Button>
                    <p className="text-sm text-amber-600">
                      Note: Buyers must be pre-approved by an admin to login
                    </p>
                  </form>
                </Form>
              </TabsContent>

              {/* Admin Login Form */}
              <TabsContent value="admin">
                <Form {...adminForm}>
                  <form
                    onSubmit={adminForm.handleSubmit(onSubmitAdmin)}
                    className="space-y-4"
                  >
                    <FormField
                      control={adminForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={adminForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      {isSubmitting ? "Logging in..." : "Login as Admin"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                For testing, use these emails:
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Admin: admin@example.com (with any password)</p>
                <p>Buyer: gabriel@example.com, bernado@example.com, or magreth@example.com</p>
                <p>Client: client@example.com or any new email</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
