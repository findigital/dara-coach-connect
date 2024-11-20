import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland"
];

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_in");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    zipcode: "",
    timezone: "UTC",
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Update the profile with additional information
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone_number: formData.phoneNumber,
            zipcode: formData.zipcode,
            timezone: formData.timezone,
          })
          .eq('id', data.user.id);

        if (profileError) throw profileError;
      }

      toast.success("Account created successfully! Please check your email to verify your account.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    // Handle email verification and other auth redirects
    const handleAuthRedirect = async () => {
      const access_token = searchParams.get('access_token');
      const refresh_token = searchParams.get('refresh_token');

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          toast.error("Error verifying email. Please try again.");
        } else {
          toast.success("Email verified successfully!");
          navigate("/dashboard");
        }
      }
    };

    handleAuthRedirect();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      } else if (event === "PASSWORD_RECOVERY") {
        toast.info("Please check your email to reset your password.");
      } else if (event === "USER_UPDATED") {
        toast.success("Your profile has been updated successfully!");
      } else if (event === "SIGNED_OUT") {
        toast.info("You have been signed out.");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-6">
        <div className="flex flex-col items-center">
          <img 
            src="/lovable-uploads/a79631f1-6aa3-48c0-9452-5c5358ba1d2f.png" 
            alt="dara logo" 
            className="h-12 w-auto mb-6"
          />
          <div className="flex items-center space-x-2 mb-8">
            {[...Array(8)].map((_, i) => (
              i % 2 === 0 ? (
                <div key={i} className="w-4 h-4 rounded-full bg-dara-yellow" />
              ) : (
                <div key={i} className="text-dara-navy text-2xl font-bold">×</div>
              )
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              variant={view === "sign_in" ? "default" : "outline"}
              onClick={() => setView("sign_in")}
              className="w-32"
            >
              Sign In
            </Button>
            <Button
              variant={view === "sign_up" ? "default" : "outline"}
              onClick={() => setView("sign_up")}
              className="w-32"
            >
              Sign Up
            </Button>
          </div>

          {view === "sign_in" ? (
            <SupabaseAuth 
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#FFE135',
                      brandAccent: '#1E3D59',
                      brandButtonText: "black",
                    },
                    radii: {
                      borderRadiusButton: '9999px',
                      buttonBorderRadius: '9999px',
                      inputBorderRadius: '12px',
                    },
                  }
                },
              }}
              providers={[]}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Password',
                    button_label: 'Sign in',
                    loading_button_label: 'Signing in...',
                    link_text: 'Already have an account? Sign in',
                  },
                },
              }}
            />
          ) : (
            <form onSubmit={handleSignUp} className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipcode">Zipcode</Label>
                  <Input
                    id="zipcode"
                    value={formData.zipcode}
                    onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((timezone) => (
                        <SelectItem key={timezone} value={timezone}>
                          {timezone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full mt-6">
                  Create Account
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;