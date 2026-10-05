import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { verifyAdminServerSide } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAdminServerSide(req);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error || 'Unauthorized: Admin privileges required to generate AI content.' },
        { status: authCheck.status || 401 }
      );
    }

    const { prompt, productName, category, apiKey } = await req.json();

    const activeApiKey = apiKey || process.env.GEMINI_API_KEY;

    if (!activeApiKey) {
      return NextResponse.json(
        { error: 'Gemini API Key missing. Please set GEMINI_API_KEY in .env or config.' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: activeApiKey });

    const finalPrompt = prompt || `Write a compelling, professional e-commerce product description in English for product: "${productName}" in category "${category}". Format as clean JSON with key "descriptionEn".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
    });

    return NextResponse.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error('Gemini API generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content with Gemini AI' },
      { status: 500 }
    );
  }
}
