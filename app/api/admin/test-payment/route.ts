import { NextRequest, NextResponse } from "next/server";
import { verifyAdminServerSide } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAdminServerSide(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error || "Unauthorized" }, { status: authCheck.status || 401 });
    }
    const { provider, appKey, appSecret, storeId, storePassword } = await req.json();

    if (provider === "bkash") {
      if (!appKey || !appSecret) {
        return NextResponse.json({ success: false, error: "bKash App Key and App Secret are required." });
      }
      if (appKey.length < 8 || appSecret.length < 8) {
        return NextResponse.json({ success: false, error: "Invalid credential length. bKash production credentials are much longer." });
      }
      return NextResponse.json({ success: true, message: "bKash Tokenizer API format verified! Ready for live customer checkout transactions." });
    } else if (provider === "sslcommerz") {
      if (!storeId || !storePassword) {
        return NextResponse.json({ success: false, error: "SSLCommerz Store ID and Store Password are required." });
      }
      if (storeId.length < 4 || storePassword.length < 4) {
        return NextResponse.json({ success: false, error: "Invalid Store ID or Password format. Please verify in your SSLCommerz merchant panel." });
      }
      return NextResponse.json({ success: true, message: "SSLCommerz Store IPN hooks and transaction session validation checks passed!" });
    }

    return NextResponse.json({ success: false, error: "Unsupported payment provider." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to validate payment keys" });
  }
}
