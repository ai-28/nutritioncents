'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function VoiceInput({ onTranscript, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Request permission on component mount for seamless UX
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissionGranted(true);
      } catch (error) {
        console.log('Permission not granted yet:', error);
        setPermissionGranted(false);
      }
    };
    requestPermission();
  }, []);

  const startRecording = async () => {
    // Request permission if not granted
    if (!permissionGranted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissionGranted(true);
      } catch (error) {
        toast.error('Microphone permission is required for voice input.');
        return;
      }
    }

    try {
      // Get audio stream with optimal settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        }
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      // Determine best MIME type for browser
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
        }
      }
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log('Audio chunk received:', event.data.size, 'bytes');
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('MediaRecorder stopped, total chunks:', audioChunksRef.current.length);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Small delay to ensure all data is available
        await new Promise(resolve => setTimeout(resolve, 100));

        // Transcribe audio
        await transcribeAudio();
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast.error('Recording error occurred. Please try again.');
        setIsRecording(false);
      };

      // Check MediaRecorder state before starting
      if (mediaRecorder.state !== 'inactive') {
        console.warn('MediaRecorder not in inactive state:', mediaRecorder.state);
        mediaRecorder.stop();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Start recording
      // Use timeslice to collect data periodically (every 1 second)
      // This ensures we capture data even if recording stops unexpectedly
      mediaRecorder.start(1000);
      setIsRecording(true);
      setTranscript('');
      console.log('Recording started, MIME type:', mimeType, 'state:', mediaRecorder.state);
      toast.success('Recording... Speak your meal description. Click Stop when finished.');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        console.log('Stopping recording, chunks collected:', audioChunksRef.current.length);
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        
        // Ensure we have chunks before showing processing message
        if (audioChunksRef.current.length > 0) {
          toast.success('Processing your speech...');
        } else {
          toast.warning('No audio data recorded. Please try again.');
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
        toast.error('Error stopping recording. Please try again.');
      }
    }
  };

  const transcribeAudio = async () => {
    console.log('Transcribing audio, chunks:', audioChunksRef.current.length);
    
    if (audioChunksRef.current.length === 0) {
      console.error('No audio chunks available');
      toast.error('No audio recorded. Please try again.');
      return;
    }

    setIsTranscribing(true);

    try {
      // Combine audio chunks into a single blob
      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mimeType
      });
      
      console.log('Audio blob created:', audioBlob.size, 'bytes, type:', mimeType);
      
      // Validate blob size (Whisper has a 25MB limit)
      if (audioBlob.size === 0) {
        toast.error('No audio data recorded. Please try again.');
        setIsTranscribing(false);
        audioChunksRef.current = [];
        return;
      }
      
      if (audioBlob.size > 25 * 1024 * 1024) {
        toast.error('Audio file is too large. Please record a shorter message.');
        setIsTranscribing(false);
        audioChunksRef.current = [];
        return;
      }
      
      // Create FormData
      const formData = new FormData();
      const fileName = mimeType.includes('webm') ? 'recording.webm' : 'recording.mp4';
      formData.append('audio', audioBlob, fileName);
      
      console.log('Sending audio to transcription API...');

      // Send to Whisper API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Transcription failed');
      }

      const data = await response.json();
      const transcribedText = data.transcript?.trim() || '';

      if (!transcribedText) {
        toast.warning('No speech detected in the recording.');
        setIsTranscribing(false);
        audioChunksRef.current = [];
        return;
      }

      setTranscript(transcribedText);
      
      // Call callback to update parent component (e.g., textarea in meal add page)
      if (onTranscript) {
        onTranscript(transcribedText);
      }

      toast.success('Transcription complete!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error(error.message || 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
      audioChunksRef.current = [];
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && isRecording) {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [isRecording]);

  // Check browser support
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return (
      <Button variant="outline" disabled>
        <MicOff className="w-4 h-4 mr-2" />
        Voice not supported
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={isRecording ? 'destructive' : 'outline'}
        onClick={toggleRecording}
        disabled={disabled || isTranscribing}
        className="w-full"
      >
        {isTranscribing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Transcribing...
          </>
        ) : isRecording ? (
          <>
            <MicOff className="w-4 h-4 mr-2" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Start Voice Input
          </>
        )}
      </Button>
      
      {isRecording && (
        <div className="text-sm text-muted-foreground text-center animate-pulse">
          🎤 Recording... Speak your full meal description
        </div>
      )}

      {isTranscribing && (
        <div className="text-sm text-muted-foreground text-center">
          ⏳ Processing your speech with AI...
        </div>
      )}
      
      {/* Show transcript preview (main transcript will appear in textarea via onTranscript callback) */}
      {transcript && !isRecording && !isTranscribing && (
        <div className="text-sm p-3 bg-muted rounded border">
          <div className="font-medium mb-1">Transcript Preview:</div>
          <div className="text-muted-foreground">{transcript}</div>
        </div>
      )}
    </div>
  );
}
