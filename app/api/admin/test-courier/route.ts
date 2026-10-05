import { NextRequest, NextResponse } from "next/server";
import { verifyAdminServerSide } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAdminServerSide(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error || "Unauthorized" }, { status: authCheck.status || 401 });
    }
    const { provider, apiKey, secretKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API Key is missing." });
    }

    if (provider === "steadfast") {
      const res = await fetch("https://portal.steadfast.com.bd/api/v1/get_balance", {
        method: "GET",
        headers: {
          "Api-Key": apiKey,
          "Secret-Key": secretKey || "",
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.status === 200 || data.current_balance !== undefined) {
          return NextResponse.json({ success: true, message: `Steadfast balance checked successfully: ৳${data.current_balance || 0}` });
        } else {
          return NextResponse.json({ success: false, error: data.message || "Steadfast validation failed. Please check keys." });
        }
      } else {
        return NextResponse.json({ success: false, error: `Steadfast returned status ${res.status}` });
      }
    } else if (provider === "redx") {
      // Fetching sample delivery areas from RedX sandbox or live to verify API Token
      const res = await fetch("https://api.redx.com.bd/v1/areas", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        return NextResponse.json({ success: true, message: "RedX B2B Parcel API connection successful!" });
      } else {
        return NextResponse.json({ success: false, error: `RedX validation failed with status ${res.status}. Please check token.` });
      }
    }

    return NextResponse.json({ success: false, error: "Unsupported provider." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to contact courier endpoint" });
  }
}
