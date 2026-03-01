import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables not configured");
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: "Calificación inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    const userName = profile?.full_name || "Sin nombre";
    const userEmail = user.email || "Sin correo";
    const timestamp = new Date().toLocaleString("es-ES", { timeZone: "America/Mexico_City" });
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

    // Save feedback to database first
    const { error: insertError } = await supabase.from("feedback").insert({
      user_id: user.id,
      user_name: userName,
      user_email: userEmail,
      rating,
      comment: comment || "",
    });

    if (insertError) {
      console.error("Error saving feedback:", insertError);
      throw new Error("Error al guardar la opinión");
    }

    // Send email via Resend (non-blocking — DB save already succeeded)
    const RESEND_API_KEY = Deno.env.get("ENVIO_CALIFICACIONES");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");

    if (RESEND_API_KEY && ADMIN_EMAIL) {
      try {
        const htmlContent = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827; font-size: 22px; margin: 0 0 24px 0; text-align: center;">
              Nueva opinión recibida en ScreenMentor
            </h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 15px; color: #374151;">
              <tr>
                <td style="padding: 10px 0; font-weight: 600; width: 140px; vertical-align: top;">Usuario:</td>
                <td style="padding: 10px 0;">${userName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Correo:</td>
                <td style="padding: 10px 0;">${userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Calificación:</td>
                <td style="padding: 10px 0;">
                  <span style="font-size: 22px; color: #f59e0b; letter-spacing: 2px;">${stars}</span>
                  <span style="color: #6b7280; margin-left: 8px;">(${rating}/5)</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Comentario:</td>
                <td style="padding: 10px 0;">${comment?.trim() ? comment.trim() : "<em style='color:#9ca3af;'>Sin comentario</em>"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Fecha y hora:</td>
                <td style="padding: 10px 0;">${timestamp}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 12px;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
              Este correo fue enviado automáticamente por ScreenMentor.
            </p>
          </div>
        `;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "ScreenMentor <onboarding@resend.dev>",
            to: [ADMIN_EMAIL],
            subject: "Nueva calificación recibida en ScreenMentor",
            html: htmlContent,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          console.error("Resend error:", res.status, errBody);
        } else {
          console.log("Email sent successfully");
        }
      } catch (emailErr) {
        console.error("Error sending email:", emailErr);
      }
    } else {
      console.warn("ENVIO_CALIFICACIONES or ADMIN_EMAIL not configured, skipping email");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Opinión enviada correctamente" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-feedback error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});