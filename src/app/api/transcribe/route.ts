import { NextResponse } from 'next/server';

const BASE_URL = process.env.TRANSCRIBE_API_BASE || 'https://api-transcribe.yuslabs.xyz';

export async function POST(request: Request) {
  try {
    const { videoUrl, videoId } = await request.json();
    const res = await fetch(`${BASE_URL}/api/process-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl, videoId }),
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

