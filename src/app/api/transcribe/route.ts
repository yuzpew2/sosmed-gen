import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const BASE_URL = process.env.TRANSCRIBE_API_BASE || 'https://api-transcribe.yuslabs.xyz';

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }
    return parsed.searchParams.get('v');
  } catch {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:&|$)/);
    return match ? match[1] : null;
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 },
    );
  }
  try {
    const { videoUrl, promptId } = await request.json();
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }
    const res = await fetch(`${BASE_URL}/api/process-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl, videoId, promptId }),
    });

    if (!res.ok) {
      throw new Error('Failed to start transcription');
    }

    const data = await res.json();
    return NextResponse.json({ taskId: data.taskId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to start transcription' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 },
    );
  }
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE_URL}/api/result/${taskId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch transcription result');
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch transcription result' }, { status: 500 });
  }
}

