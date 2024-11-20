import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input data
interface EmailRequest {
  userId: string; // User ID
  scheduledFor: string; // Scheduled date and time
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailRequest: EmailRequest = await req.json();
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <img src="https://your-dara-logo-url.com/logo.png" alt="Dara Logo" style="width: 150px;"/>
        <h2 style="color: #4A90E2;">Session Scheduled!</h2>
        <p style="font-size: 16px;">Dear User,</p>
        <p style="font-size: 16px;">Your session with Dara has been successfully scheduled for <strong>${emailRequest.scheduledFor}</strong>.</p>
        <p style="font-size: 16px;">We encourage you to prepare for your session and look forward to seeing you!</p>
        <a href="https://your-website.com" style="background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Dara</a>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dara <noreply@yourdomain.com>",
        to: [emailRequest.userId],
        subject: "Your Session with Dara is Scheduled!",
        html: emailContent,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      const error = await res.text();
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error: any) {
    console.error("Error in send-schedule-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);