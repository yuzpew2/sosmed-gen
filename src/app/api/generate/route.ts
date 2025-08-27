// src/app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

// Inisialisasi Gemini AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  if (!rateLimit(request.method, ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 },
    );
  }
  try {
    const { niche, promptId } = await request.json();

    const supabase = await createClient();
    const { data: promptRecord, error: promptError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .single();
    if (promptError || !promptRecord) {
      throw new Error('Prompt not found');
    }

    const promptType = promptRecord.name;

    // 1. Dapatkan data terkini dari Google Search
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}&q=${encodeURIComponent(niche)}`;
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
        throw new Error('Gagal mendapatkan data dari Google Search.');
    }
    const searchData = await searchResponse.json();

    let context = "Tiada maklumat dijumpai.";
    interface SearchItem {
        snippet: string;
        [key: string]: unknown;
    }

    if (searchData.items && searchData.items.length > 0) {
        // Ambil 3 hasil carian teratas sebagai konteks
        context = searchData.items.slice(0, 3).map((item: SearchItem) => item.snippet).join('\n\n');
    }

    // 2. Bina prompt untuk Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const template = promptRecord.template;
    const prompt = template
      .replace(/\{\{niche\}\}/g, niche)
      .replace(/\{\{promptType\}\}/g, promptType)
      .replace(/\{\{context\}\}/g, context);

    // 3. Hantar permintaan ke Gemini AI
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ post: text });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Berlaku ralat semasa menjana posting.' }, { status: 500 });
  }
}