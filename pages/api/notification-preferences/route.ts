import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabaseClient";

export async function POST(request: Request) {
  try {
    const preferences = await request.json();

    // Get the user ID from the session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update notification settings in the database
    const { error } = await supabase
      .from("notification_settings")
      .upsert({
        user_id: session.user.id,
        sms_enabled: preferences.smsEnabled,
        email_enabled: preferences.emailEnabled,
        notification_email: preferences.email,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }
}