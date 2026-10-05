import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { verifyAdminServerSide } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const authCheck = await verifyAdminServerSide(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error || "Unauthorized" }, { status: authCheck.status || 401 });
    }
    if (!db) {
      return NextResponse.json({
        success: false,
        error: "Firebase Firestore DB is not initialized in server runtime."
      }, { status: 500 });
    }

    // Attempt a minimal collection query
    const testQuery = query(collection(db, "products"), limit(1));
    const snapshot = await getDocs(testQuery);
    const latency = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Firestore Database connection active. Documents indexed: ${snapshot.size > 0 ? 'Verified' : 'Ready'}.`,
      latencyMs: latency
    });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to query Firestore database.",
      latencyMs: latency
    }, { status: 500 });
  }
}
