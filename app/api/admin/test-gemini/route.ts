import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { verifyAdminServerSide } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAdminServerSide(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error || "Unauthorized" }, { status: authCheck.status || 401 });
    }
    const { apiKey } = await req.json();
    let finalApiKey = apiKey;

    // Fallback to Firestore if no key was passed
    if (!finalApiKey && db) {
      const docRef = doc(db, 'site_settings', 'env_credentials');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        finalApiKey = docSnap.data().GEMINI_API_KEY;
      }
    }

    if (!finalApiKey) {
      return NextResponse.json({ success: false, error: "API Key is missing." });
    }

    const ai = new GoogleGenAI({ apiKey: finalApiKey });
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say hello and confirm you are online in under 10 words.",
      });
    } catch {
      response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: "Say hello and confirm you are online in under 10 words.",
      });
    }

    return NextResponse.json({ success: true, text: response.text });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to generate content from Gemini AI" });
  }
}
