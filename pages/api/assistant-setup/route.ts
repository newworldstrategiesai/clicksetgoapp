import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabaseClient";
import { VoiceAIService } from "@/lib/services/voice-ai-service";

export async function POST(request: Request) {
  try {
    const settings = await request.json();

    // Get the user ID from the session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update agent settings in the database
    const { error: agentError } = await supabase
      .from("agents")
      .upsert({
        user_id: session.user.id,
        company_name: settings.businessName,
        company_description: settings.description,
        role: settings.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (agentError) throw agentError;

    // If appointments are enabled, update appointment settings
    if (settings.allowAppointments) {
      const { error: appointmentError } = await supabase
        .from("appointment_settings")
        .upsert({
          user_id: session.user.id,
          default_duration: settings.defaultDuration,
          break_time: settings.breakTime,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (appointmentError) throw appointmentError;
    }

    // Configure AI assistant with Vapi
    await VoiceAIService.setConfig({
      defaultGreeting: `Hello, you've reached ${settings.businessName}. How can I assist you today?`,
      useCustomVoice: true,
      maxRecordingDuration: 300,
      transcribeRecordings: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving assistant settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

