import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReminderEmailData {
  userEmail: string;
  sessionTime: string;
  userName?: string;
}

const sendEmail = async (emailData: {
  to: string;
  subject: string;
  html: string;
}) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Dara <support@joindara.com>",
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return res.json();
};

const generateEmailContent = (formattedDate: string, userName: string = "there") => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1a365d; margin-bottom: 20px;">Session Reminder</h1>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
      Hi ${userName},
    </p>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
      This is a friendly reminder that your coaching session with Dara is scheduled for:
    </p>
    
    <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #2d3748; font-size: 18px; font-weight: bold; text-align: center;">
        ${formattedDate}
      </p>
    </div>
    
    <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin-top: 20px;">
      <h3 style="color: #2d3748; margin-bottom: 10px;">Preparation Tips:</h3>
      <ul style="color: #4a5568; line-height: 1.6;">
        <li>Find a quiet, private space</li>
        <li>Have a notebook ready</li>
        <li>Test your audio and video</li>
        <li>Take a few deep breaths before we begin</li>
      </ul>
    </div>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-top: 20px;">
      We look forward to speaking with you soon!
    </p>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <p style="color: #718096; font-size: 14px;">
        If you need to reschedule, please do so at least 24 hours in advance.
      </p>
    </div>
  </div>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reminderData: ReminderEmailData = await req.json();
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('timezone, first_name')
      .eq('id', (await supabase.auth.admin.getUserById(reminderData.userEmail)).data.user?.id)
      .single();

    const userTimezone = userProfile?.timezone || 'UTC';
    const userName = userProfile?.first_name || "there";
    
    const sessionDate = new Date(reminderData.sessionTime);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: userTimezone,
    }).format(sessionDate);

    const emailContent = generateEmailContent(formattedDate, userName);

    const data = await sendEmail({
      to: reminderData.userEmail,
      subject: "Reminder: Your Coaching Session with Dara",
      html: emailContent,
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-session-reminder function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);