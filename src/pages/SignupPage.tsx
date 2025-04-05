
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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

const buyerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(1, "Company is required"),
});

const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(1, "Company is required"),
});

type BuyerFormValues = z.infer<typeof buyerFormSchema>;
type ClientFormValues = z.infer<typeof clientFormSchema>;

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"buyer" | "client">("client");

  const buyerForm = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
    },
  });

  const clientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
    },
  });

  const onSubmitBuyer = (data: BuyerFormValues) => {
    handleSignup(data, "buyer");
  };

  const onSubmitClient = (data: ClientFormValues) => {
    handleSignup(data, "client");
  };

  const handleSignup = (data: BuyerFormValues | ClientFormValues, role: UserRole) => {
    setIsSubmitting(true);
    
    // In a real application, this would be a call to a backend API to create the user
    // For this demo version, we'll just show a success message and redirect to login
    
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Account created",
        description: `Your ${role} account has been created. Please login to continue.`,
        duration: 5000,
      });
      
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <img
              src="/lovable-uploads/0e327c2e-74bc-454a-8543-770c4d91ee88.png"
              alt="MGP Logo"
              className="h-12 w-12"
            />
            <h1 className="ml-3 text-2xl font-bold text-procurement-primary">
              MGP
            </h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Create Account</CardTitle>
            <CardDescription>
              Register for the MGP procurement system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="client">Client</TabsTrigger>
                <TabsTrigger value="buyer">Buyer</TabsTrigger>
              </TabsList>

              {/* Client Signup Form */}
              <TabsContent value="client">
                <Form {...clientForm}>
                  <form
                    onSubmit={clientForm.handleSubmit(onSubmitClient)}
                    className="space-y-4"
                  >
                    <FormField
                      control={clientForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={clientForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={clientForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company" {...field} />
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
                      {isSubmitting ? "Creating Account..." : "Create Client Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Buyer Signup Form */}
              <TabsContent value="buyer">
                <Form {...buyerForm}>
                  <form
                    onSubmit={buyerForm.handleSubmit(onSubmitBuyer)}
                    className="space-y-4"
                  >
                    <FormField
                      control={buyerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={buyerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={buyerForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company" {...field} />
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
                      {isSubmitting ? "Creating Account..." : "Create Buyer Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-procurement-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
