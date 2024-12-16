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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Get sessions starting in the next 15 minutes
    const fifteenMinutesFromNow = new Date(Date.now() + 15 * 60 * 1000);
    const thirtyMinutesFromNow = new Date(Date.now() + 30 * 60 * 1000);

    // First get the scheduled sessions
    const { data: upcomingSessions, error: sessionsError } = await supabase
      .from('scheduled_sessions')
      .select('id, scheduled_for, user_id')
      .gte('scheduled_for', fifteenMinutesFromNow.toISOString())
      .lt('scheduled_for', thirtyMinutesFromNow.toISOString());

    if (sessionsError) {
      throw sessionsError;
    }

    console.log(`Found ${upcomingSessions?.length || 0} sessions to send reminders for`);

    if (!upcomingSessions || upcomingSessions.length === 0) {
      return new Response(JSON.stringify({ message: "No upcoming sessions found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profiles for these sessions
    const userIds = upcomingSessions.map(session => session.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, timezone')
      .in('id', userIds);

    if (profilesError) {
      throw profilesError;
    }

    // Get user emails from auth.users table
    const { data: users, error: usersError } = await supabase
      .auth.admin.listUsers();

    if (usersError) {
      throw usersError;
    }

    const reminderPromises = upcomingSessions.map(async (session) => {
      const profile = profiles?.find(p => p.id === session.user_id);
      const user = users.users.find(u => u.id === session.user_id);
      
      if (!user?.email || !profile) {
        console.error(`No email or profile found for user with session ${session.id}`);
        return;
      }

      const sessionDate = new Date(session.scheduled_for);
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: profile.timezone || 'UTC',
      }).format(sessionDate);

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a365d; margin-bottom: 10px;">Your Session Starts in 15 Minutes!</h1>
            <p style="color: #4a5568; font-size: 18px; margin-bottom: 20px;">
              Get ready for your coaching session with Dara
            </p>
          </div>

          <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #2d3748; margin-bottom: 15px;">Session Details</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              <strong>Date and Time:</strong> ${formattedDate} (${profile.timezone || 'UTC'})<br>
              <strong>Duration:</strong> 60 minutes<br>
              <strong>Type:</strong> One-on-One Coaching Session
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${supabaseUrl}" 
               style="background-color: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Join Session Now
            </a>
          </div>

          <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px;">
            <h3 style="color: #2d3748; margin-bottom: 10px;">Quick Preparation Tips</h3>
            <ul style="color: #4a5568; line-height: 1.6; padding-left: 20px;">
              <li>Find a quiet, private space</li>
              <li>Have a notebook ready for notes</li>
              <li>Test your audio and video</li>
              <li>Take a few deep breaths before we begin</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 14px;">
              We look forward to seeing you soon!
            </p>
          </div>
        </div>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Dara <support@joindara.com>",
          to: [user.email],
          subject: "Your Session with Dara Starts Soon!",
          html: emailContent,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error(`Failed to send reminder email for session ${session.id}:`, error);
        throw new Error(`Failed to send reminder email: ${error}`);
      }

      return res.json();
    });

    await Promise.all(reminderPromises);

    return new Response(JSON.stringify({ 
      message: `Successfully sent ${upcomingSessions.length} reminder emails` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
