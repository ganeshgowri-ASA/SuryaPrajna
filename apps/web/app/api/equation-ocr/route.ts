import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Extract base64 data from data URL
    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    // Try MathPix first (premium, if API key available)
    const mathpixKey = process.env.MATHPIX_APP_KEY;
    const mathpixId = process.env.MATHPIX_APP_ID;

    if (mathpixKey && mathpixId) {
      try {
        const mathpixRes = await fetch("https://api.mathpix.com/v3/text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            app_id: mathpixId,
            app_key: mathpixKey,
          },
          body: JSON.stringify({
            src: `data:image/png;base64,${base64Data}`,
            formats: ["latex_styled"],
            data_options: { include_asciimath: false },
          }),
        });
        const mathpixData = await mathpixRes.json();
        if (mathpixData.latex_styled) {
          return NextResponse.json({
            latex: mathpixData.latex_styled,
            confidence: mathpixData.confidence || 0.9,
            provider: "mathpix",
          });
        }
      } catch {
        // Fall through to SimpleTex
      }
    }

    // Try SimpleTex (free tier)
    const simpletexKey = process.env.SIMPLETEX_API_KEY;
    if (simpletexKey) {
      try {
        const formData = new FormData();
        const blob = new Blob([Buffer.from(base64Data, "base64")], { type: "image/png" });
        formData.append("file", blob, "equation.png");

        const stRes = await fetch("https://server.simpletex.cn/api/latex_ocr", {
          method: "POST",
          headers: { token: simpletexKey },
          body: formData,
        });
        const stData = await stRes.json();
        if (stData.res?.latex) {
          return NextResponse.json({
            latex: stData.res.latex,
            confidence: stData.res.conf || 0.8,
            provider: "simpletex",
          });
        }
      } catch {
        // Fall through to demo mode
      }
    }

    // Demo mode: return placeholder when no API keys configured
    return NextResponse.json({
      latex: "E = mc^2",
      confidence: 0.0,
      provider: "demo",
      message: "No OCR API keys configured. Set MATHPIX_APP_KEY/MATHPIX_APP_ID or SIMPLETEX_API_KEY in .env for real OCR. Showing demo output.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "OCR processing failed" },
      { status: 500 }
    );
  }
}
