
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Navigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Only admin can access full settings
  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully"
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure your procurement system
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {user.role === "admin" && (
              <>
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={user.email} disabled />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                    disabled 
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {user.role === "admin" && (
            <>
              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="enable-notifications" className="flex-1">
                        Enable email notifications
                      </Label>
                      <Switch id="enable-notifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="enable-sms" className="flex-1">
                        Enable SMS notifications
                      </Label>
                      <Switch id="enable-sms" />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="auto-assign" className="flex-1">
                        Auto-assign requests to buyers
                      </Label>
                      <Switch id="auto-assign" />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSaveSettings}>
                        Save Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>System Defaults</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="default-delivery">Default Delivery Location</Label>
                        <Input id="default-delivery" defaultValue="Cabinda" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="default-entity">Default Entity</Label>
                        <Input id="default-entity" defaultValue="MGP Investments" />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSaveSettings}>
                        Save Defaults
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="notify-new-requests" className="flex-1">
                        Notify on new requests
                      </Label>
                      <Switch id="notify-new-requests" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="notify-status-changes" className="flex-1">
                        Notify on request status changes
                      </Label>
                      <Switch id="notify-status-changes" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="notify-comments" className="flex-1">
                        Notify on new comments
                      </Label>
                      <Switch id="notify-comments" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="notify-files" className="flex-1">
                        Notify on file uploads
                      </Label>
                      <Switch id="notify-files" />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSaveSettings}>
                        Save Notification Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
