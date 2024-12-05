import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: "Phone number and code are required" },
        { status: 400 }
      );
    }

    // Get the stored verification code from the cookie using the cookies() function
    const cookieStore = await cookies();
    const storedCode = cookieStore.get("verificationCode")?.value;

    if (code !== storedCode) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // In a real app, update the user's verified phone number in the database
    const response = NextResponse.json({ success: true });
    
    // Delete the verification code cookie
    response.cookies.delete("verificationCode");

    return response;
  } catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
