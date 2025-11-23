import { NextResponse } from "next/server";
import { verifyAuth } from "../../../lib/auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable caching completely
export const fetchCache = 'force-no-store';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Ambil semua settings
export async function GET(request) {
  try {
    // Get all settings using Supabase
    const { data: settings, error } = await supabase
      .from("settings")
      .select("*");

    if (error) {
      console.error("Get settings error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    // Convert to key-value object with description
    const settingsObj = {};
    (settings || []).forEach((setting) => {
      settingsObj[setting.key] = {
        value: setting.value,
        description: setting.description,
      };
    });

    const response = NextResponse.json({
      success: true,
      data: settingsObj,
    });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request) {
  try {
    // Verify authentication
    const authResult = verifyAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Update or create each setting using Supabase upsert
    const updatePromises = Object.entries(body).map(async ([key, data]) => {
      // Handle both object {value, description} and primitive value
      const value =
        typeof data === "object" && data !== null ? data.value : data;
      const description =
        typeof data === "object" && data !== null ? data.description : null;

      // Use upsert with Supabase
      return await supabase
        .from("settings")
        .upsert(
          {
            key,
            value,
            description,
          },
          { onConflict: "key" }
        );
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Settings berhasil diupdate",
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};
