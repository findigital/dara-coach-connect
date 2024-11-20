import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  userId: string;
  scheduledFor: string;
}

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, scheduledFor } = await req.json() as EmailRequest;

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    const userName = profile.full_name || 'there';
    const scheduledDate = new Date(scheduledFor);
    const formattedDate = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const { data: userEmail } = await supabase.auth.admin.getUserById(userId);
    if (!userEmail?.user?.email) {
      throw new Error('User email not found');
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Session with Dara</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1E3D59;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #F7F7F7;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              background-color: #FFE135;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .logo {
              width: 120px;
              margin-bottom: 20px;
            }
            h1 {
              color: #1E3D59;
              margin-bottom: 20px;
              font-size: 24px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #FFE135;
              color: #1E3D59;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://bmmkkdrguescudrymcsl.supabase.co/storage/v1/object/public/assets/dara-logo.png" alt="Dara Logo" class="logo">
            </div>
            <div class="content">
              <h1>Hi ${userName}! 👋</h1>
              <p>Your session with Dara has been scheduled for:</p>
              <p style="font-size: 18px; font-weight: bold; color: #1E3D59;">
                ${formattedDate} at ${formattedTime}
              </p>
              <p>
                I'm looking forward to our conversation and supporting you on your mental health journey.
                Remember, taking time for self-care is an important step towards better well-being.
              </p>
              <p>
                To prepare for our session, you might want to:
              </p>
              <ul>
                <li>Find a quiet, comfortable space</li>
                <li>Take a few deep breaths</li>
                <li>Think about what you'd like to discuss</li>
              </ul>
              <a href="${SUPABASE_URL}" class="button">
                Open Dara
              </a>
              <p style="margin-top: 30px;">
                See you soon!<br>
                Dara 🌟
              </p>
            </div>
            <div class="footer">
              <p>This is an automated message from Dara, your AI mental health companion.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dara <sessions@dara.care>",
        to: [userEmail.user.email],
        subject: "Your Session with Dara is Confirmed! 🌟",
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);