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

    // Log file info for debugging
    console.log('Received audio file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    });

    // Check file size
    const fileSize = audioFile.size || 0;
    console.log('Received audio file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: fileSize,
    });

    if (fileSize === 0) {
      return NextResponse.json(
        { error: 'Empty audio file received' },
        { status: 400 }
      );
    }

    // Call OpenAI Whisper API
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // OpenAI SDK accepts File, Blob, or Buffer
    // In Next.js API routes, FormData files are already File objects
    // We can use the file directly, but we need to ensure it's in the right format
    // Convert to Buffer first, then create a File with proper metadata
    const audioBlob = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(audioBlob);
    
    console.log('Audio buffer size:', audioBuffer.length, 'bytes');

    // Create a File object from the buffer
    // OpenAI SDK needs a File with name and type
    const fileName = audioFile.name || 'recording.webm';
    const fileType = audioFile.type || 'audio/webm';
    
    // Use File constructor (available in Node.js 18+)
    const file = new File([audioBuffer], fileName, { type: fileType });
    
    console.log('Sending to Whisper API, file:', fileName, 'type:', fileType, 'size:', file.size);

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
