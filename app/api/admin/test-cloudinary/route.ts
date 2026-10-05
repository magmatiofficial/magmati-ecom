import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { verifyAdminServerSide } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAdminServerSide(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error || "Unauthorized" }, { status: authCheck.status || 401 });
    }
    const body = await req.json();
    let cloudName = body.cloudName;
    let apiKey = body.apiKey;
    let apiSecret = body.apiSecret;

    // Fallback to Firestore if not provided
    if ((!cloudName || !apiKey || !apiSecret) && db) {
      const docRef = doc(db, 'site_settings', 'env_credentials');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        cloudName = cloudName || data.CLOUDINARY_CLOUD_NAME;
        apiKey = apiKey || data.CLOUDINARY_API_KEY;
        apiSecret = apiSecret || data.CLOUDINARY_API_SECRET;
      }
    }

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ success: false, error: "Cloudinary credentials missing." });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    const result = await cloudinary.api.ping();
    return NextResponse.json({ success: true, status: result.status || "ok" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to connect to Cloudinary" });
  }
}
