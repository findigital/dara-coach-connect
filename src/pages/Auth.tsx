import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
      <div className="max-w-md w-full space-y-6">
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
                  space: {
                    spaceSmall: '16px',
                    spaceMedium: '24px',
                    spaceLarge: '32px',
                  },
                  fonts: {
                    bodyFontFamily: `'Inter', sans-serif`,
                    buttonFontFamily: `'Inter', sans-serif`,
                    inputFontFamily: `'Inter', sans-serif`,
                    labelFontFamily: `'Inter', sans-serif`,
                  },
                  fontSizes: {
                    baseBodySize: '16px',
                    baseInputSize: '16px',
                    baseLabelSize: '14px',
                    baseButtonSize: '16px',
                  }
                }
              },
              style: {
                button: {
                  padding: '12px 24px',
                  fontWeight: '600',
                },
                anchor: {
                  color: '#1E3D59',
                  fontWeight: '500',
                },
                container: {
                  gap: '24px',
                },
                label: {
                  color: '#4B5563',
                  marginBottom: '8px',
                },
                input: {
                  padding: '12px 16px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                },
                message: {
                  padding: '12px',
                  marginTop: '8px',
                  borderRadius: '8px',
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;