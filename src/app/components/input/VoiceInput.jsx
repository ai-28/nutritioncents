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
      
      // Verify stream is actually active
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks available in stream');
      }
      
      // Check if tracks are enabled and active
      const activeTrack = audioTracks.find(track => track.readyState === 'live' && track.enabled);
      if (!activeTrack) {
        throw new Error('No active audio track found');
      }
      
      console.log('Stream verified:', {
        tracks: audioTracks.length,
        activeTrack: activeTrack.label,
        enabled: activeTrack.enabled,
        readyState: activeTrack.readyState,
        muted: activeTrack.muted
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
      
      console.log('Using MIME type:', mimeType, 'supported:', MediaRecorder.isTypeSupported(mimeType));
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        console.log('ondataavailable fired, data size:', event.data?.size || 0, 'type:', event.data?.type);
        if (event.data) {
          if (event.data.size > 0) {
            console.log('✅ Audio chunk received:', event.data.size, 'bytes');
            audioChunksRef.current.push(event.data);
            console.log('Total chunks now:', audioChunksRef.current.length);
          } else {
            console.warn('⚠️ ondataavailable fired but data size is 0 - this is normal for the first chunk or if recording is very short');
            // Don't push empty chunks - they're not useful
          }
        } else {
          console.error('❌ ondataavailable fired but event.data is null/undefined');
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('MediaRecorder stopped, total chunks:', audioChunksRef.current.length);
        
        // Close audio context if still open (safely)
        if (mediaRecorderRef.current?._audioContext) {
          try {
            if (mediaRecorderRef.current._audioContext.state !== 'closed') {
              await mediaRecorderRef.current._audioContext.close();
            }
          } catch (e) {
            // Ignore if already closed
            console.log('AudioContext close error (ignored):', e);
          }
        }
        
        // Calculate total size
        const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + (chunk.size || 0), 0);
        console.log('Total chunks after stop:', audioChunksRef.current.length, 'total size:', totalSize, 'bytes');
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('Stopped track:', track.kind, 'readyState:', track.readyState);
          });
          streamRef.current = null;
        }

        // Only transcribe if we have actual audio data
        if (audioChunksRef.current.length > 0 && totalSize > 0) {
          console.log('✅ Have audio data, proceeding to transcribe');
          await transcribeAudio();
        } else {
          console.warn('⚠️ MediaRecorder stopped but no audio data collected');
          console.warn('⚠️ Chunks:', audioChunksRef.current.length, 'Total size:', totalSize);
          
          // Check if this was a manual stop (user clicked stop button)
          // If isRecording is false, the user manually stopped, so don't show error here
          // The stopRecording function already handles the error message
          if (!isRecording) {
            console.log('User manually stopped, error already handled in stopRecording');
            return;
          }
          
          // If isRecording is still true, the recorder stopped unexpectedly
          console.error('❌ MediaRecorder stopped unexpectedly!');
          toast.error('Recording stopped unexpectedly. Please try again.');
          setIsRecording(false);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        console.error('Error details:', {
          error: event.error,
          name: event.error?.name,
          message: event.error?.message
        });
        toast.error(`Recording error: ${event.error?.message || 'Unknown error'}. Please try again.`);
        setIsRecording(false);
        
        // Clean up on error
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (mediaRecorderRef.current?._audioContext) {
          try {
            mediaRecorderRef.current._audioContext.close();
          } catch (e) {
            // Ignore
          }
        }
      };

      // Check MediaRecorder state before starting
      // Don't stop a new MediaRecorder - it should always be inactive when created
      if (mediaRecorder.state !== 'inactive') {
        console.error('⚠️ MediaRecorder not in inactive state when created! State:', mediaRecorder.state);
        // This shouldn't happen, but if it does, we can't use this recorder
        throw new Error(`MediaRecorder in unexpected state: ${mediaRecorder.state}`);
      }
      
      // Set up audio level monitoring to verify audio is being captured
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      // Check audio levels periodically
      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        return average;
      };
      
      // Start recording WITH timeslice to ensure data collection
      // Using 500ms timeslice - this triggers ondataavailable every 500ms
      // This ensures we get data even if the recording is short
      try {
        console.log('🚀 About to start MediaRecorder, current state:', mediaRecorder.state);
        console.log('🚀 Stream active:', stream.active, 'tracks:', stream.getTracks().length);
        
        mediaRecorder.start(500);
        console.log('✅ Recording started, MIME type:', mimeType, 'state:', mediaRecorder.state);
        
        // Verify recording actually started
        if (mediaRecorder.state !== 'recording') {
          console.error('❌ MediaRecorder failed to start! State:', mediaRecorder.state);
          throw new Error(`MediaRecorder failed to start. State: ${mediaRecorder.state}`);
        }
        
        // Double-check after a moment
        setTimeout(() => {
          if (mediaRecorder.state !== 'recording') {
            console.error('❌ MediaRecorder stopped immediately after starting! State:', mediaRecorder.state);
          } else {
            console.log('✅ MediaRecorder still recording after 100ms');
          }
        }, 100);
        
        setIsRecording(true);
        setTranscript('');
        
        // Track recording start time
        const recordingStartTime = Date.now();
        let hasReceivedData = false;
        
        // Set up a periodic check to verify we're actually recording and collecting data
        const recordingCheck = setInterval(() => {
          if (mediaRecorder.state === 'recording') {
            const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + (chunk.size || 0), 0);
            const audioLevel = checkAudioLevel();
            const recordingDuration = Date.now() - recordingStartTime;
            console.log('📊 Recording active, chunks:', audioChunksRef.current.length, 'total size:', totalSize, 'bytes', 'audio level:', audioLevel.toFixed(2), 'duration:', recordingDuration, 'ms');
            
            // Track if we've received any data
            if (totalSize > 0) {
              hasReceivedData = true;
            }
            
            // If audio level is 0, warn user
            if (audioLevel < 1 && recordingDuration > 2000) {
              console.warn('⚠️ No audio detected after 2 seconds - check microphone');
            }
            
            // Check if stream is still active
            if (streamRef.current) {
              const tracks = streamRef.current.getAudioTracks();
              tracks.forEach(track => {
                if (track.readyState !== 'live') {
                  console.warn('⚠️ Track not live:', track.label, 'state:', track.readyState);
                }
                if (track.muted) {
                  console.warn('⚠️ Track is muted:', track.label);
                }
              });
            }
          } else {
            console.warn('⚠️ Recording state changed to:', mediaRecorder.state);
            clearInterval(recordingCheck);
            try {
              if (audioContext.state !== 'closed') {
                audioContext.close();
              }
            } catch (e) {
              // Ignore if already closed
            }
          }
        }, 1000);
        
        // Store hasReceivedData flag
        mediaRecorder._hasReceivedData = () => hasReceivedData;
        
        // Store interval ID and audio context for cleanup
        mediaRecorder._checkInterval = recordingCheck;
        mediaRecorder._audioContext = audioContext;
        mediaRecorder._startTime = Date.now();
        
        toast.success('Recording... Speak clearly for at least 2-3 seconds, then click Stop.');
      } catch (startError) {
        console.error('❌ Error starting MediaRecorder:', startError);
        audioContext.close();
        throw startError;
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        console.log('Stopping recording, current state:', mediaRecorderRef.current.state);
        console.log('Chunks collected so far:', audioChunksRef.current.length);
        
        // Clear the recording check interval
        if (mediaRecorderRef.current._checkInterval) {
          clearInterval(mediaRecorderRef.current._checkInterval);
        }
        
        // Close audio context safely
        if (mediaRecorderRef.current._audioContext) {
          try {
            if (mediaRecorderRef.current._audioContext.state !== 'closed') {
              await mediaRecorderRef.current._audioContext.close();
            }
          } catch (e) {
            // Ignore if already closed
            console.log('AudioContext already closed or error closing:', e);
          }
        }
        
        // Check minimum recording duration and data
        const recordingDuration = mediaRecorderRef.current._startTime 
          ? Date.now() - mediaRecorderRef.current._startTime 
          : 0;
        const currentChunks = audioChunksRef.current.length;
        const currentSize = audioChunksRef.current.reduce((sum, chunk) => sum + (chunk.size || 0), 0);
        
        console.log('Recording duration:', recordingDuration, 'ms', 'chunks:', currentChunks, 'size:', currentSize);
        
        // Warn if recording is too short
        if (recordingDuration < 1000) {
          toast.warning('Recording too short. Please record for at least 2-3 seconds.');
          // Don't stop yet, let user continue recording
          return;
        }
        
        if (currentChunks === 0 && currentSize === 0) {
          console.warn('⚠️ No chunks collected yet, waiting for data...');
          // Wait for at least one chunk with data
          let waitCount = 0;
          while (currentSize === 0 && waitCount < 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const newSize = audioChunksRef.current.reduce((sum, chunk) => sum + (chunk.size || 0), 0);
            if (newSize > 0) break;
            waitCount++;
          }
          
          const finalSize = audioChunksRef.current.reduce((sum, chunk) => sum + (chunk.size || 0), 0);
          if (finalSize === 0) {
            toast.error('No audio detected. Please check your microphone and speak clearly.');
            setIsRecording(false);
            return;
          }
        }
        
        // Request any pending data before stopping
        if (mediaRecorderRef.current.state === 'recording') {
          try {
            // Request data explicitly - this should trigger ondataavailable
            mediaRecorderRef.current.requestData();
            console.log('Requested data before stopping');
            
            // Wait for the data to arrive
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('Chunks after requestData:', audioChunksRef.current.length);
          } catch (e) {
            console.warn('Could not request data before stopping:', e);
          }
        }
        
        // Stop the recorder - this will trigger ondataavailable with final data
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        
        // Wait for ondataavailable to fire with final data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if we have any chunks
        const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + (chunk.size || 0), 0);
        console.log('Final check - chunks:', audioChunksRef.current.length, 'total size:', totalSize);
        
        if (audioChunksRef.current.length === 0 || totalSize === 0) {
          console.error('No audio chunks collected!');
          toast.error('No audio was recorded. Please speak for at least 2-3 seconds and try again.');
          return;
        }
        
        toast.success('Processing your speech...');
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
        toast.error('Error stopping recording. Please try again.');
      }
    }
  };

  const transcribeAudio = async () => {
    console.log('Transcribing audio, chunks:', audioChunksRef.current.length);
    
    // Calculate total size of all chunks
    const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + (chunk.size || 0), 0);
    console.log('Total audio data size:', totalSize, 'bytes');
    
    if (audioChunksRef.current.length === 0 || totalSize === 0) {
      console.error('No audio chunks available or all chunks are empty');
      toast.error('No audio recorded. Please check your microphone and try again.');
      setIsTranscribing(false);
      audioChunksRef.current = [];
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
