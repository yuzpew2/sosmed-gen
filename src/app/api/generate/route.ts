// src/app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Gemini AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { niche, promptType } = await request.json();

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
    const prompt = `
      Anda adalah pakar media sosial. Tugas anda ialah mencipta satu posting media sosial yang berpotensi viral.

      Topik/Niche: "${niche}"
      Gaya Penulisan: "${promptType}"

      Gunakan maklumat konteks di bawah untuk memastikan posting anda relevan dan terkini:
      ---
      Konteks dari Carian Google:
      ${context}
      ---

      Sila hasilkan posting yang menarik, ringkas, dan sesuai untuk platform seperti Instagram atau Facebook. Sertakan hashtag yang relevan.
    `;

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