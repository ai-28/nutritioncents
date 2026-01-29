import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Convert File to Buffer
    const audioBlob = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(audioBlob);

    // Call OpenAI Whisper API
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Create a File-like object for OpenAI
    // Whisper accepts various audio formats: mp3, mp4, mpeg, mpga, m4a, wav, webm
    const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      prompt: 'This is a meal description. Include food names, quantities, units, and preparation methods. Be specific about portions and ingredients.',
      // Using default JSON format for reliable parsing
    });

    // Extract transcript text from response
    const transcriptText = transcription.text || '';

    return NextResponse.json({ 
      transcript: transcriptText 
    });
  } catch (error) {
    console.error('Transcription error:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key is invalid or missing' },
        { status: 500 }
      );
    }
    
    if (error.message?.includes('file')) {
      return NextResponse.json(
        { error: 'Invalid audio file format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
