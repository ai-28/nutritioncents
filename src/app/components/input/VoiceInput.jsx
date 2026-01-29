'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function VoiceInput({ onTranscript, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef(''); // Store accumulated final transcript

  // Request permission on component mount
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately after getting permission
        setPermissionGranted(true);
      } catch (error) {
        console.log('Permission not granted yet:', error);
        setPermissionGranted(false);
      }
    };
    requestPermission();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        
        // Process new results since last resultIndex
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            // Add to accumulated final transcript
            finalTranscriptRef.current += transcript + ' ';
          } else {
            // Show interim results
            interimTranscript += transcript;
          }
        }

        // Combine final + interim for display
        const fullTranscript = finalTranscriptRef.current + interimTranscript;
        setTranscript(fullTranscript);
        
        // Call callback with full transcript
        if (onTranscript && fullTranscript.trim()) {
          onTranscript(fullTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error, event);
        setIsListening(false);
        
        switch (event.error) {
          case 'no-speech':
            toast.error('No speech detected. Please try again.');
            break;
          case 'not-allowed':
            toast.error('Microphone permission denied. Please allow microphone access.');
            setPermissionGranted(false);
            break;
          case 'aborted':
            // User stopped or navigated away - not an error
            break;
          case 'network':
            toast.error('Network error. Please check your connection.');
            break;
          case 'audio-capture':
            toast.error('No microphone found. Please check your microphone.');
            break;
          case 'service-not-allowed':
            toast.error('Speech recognition service not available.');
            break;
          default:
            toast.error(`Speech recognition error: ${event.error}. Please try again.`);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [onTranscript]);

  const startListening = async () => {
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

    if (!recognitionRef.current) {
      toast.error('Speech recognition not initialized.');
      return;
    }

    if (isListening) {
      return; // Already listening
    }

    try {
      // Reset transcript for new recording
      finalTranscriptRef.current = '';
      setTranscript('');
      
      recognitionRef.current.start();
      toast.success('Listening... Speak now.');
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
      
      if (error.name === 'InvalidStateError') {
        toast.error('Recognition is already running. Please stop first.');
      } else {
        toast.error('Failed to start voice recognition. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        toast.success('Stopped listening.');
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
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
        variant={isListening ? 'destructive' : 'outline'}
        onClick={toggleListening}
        disabled={disabled}
        className="w-full"
      >
        {isListening ? (
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
      
      {/* Show transcript while listening AND after stopping */}
      {transcript && (
        <div className={`text-sm p-3 bg-muted rounded border ${isListening ? 'border-primary' : ''}`}>
          <div className="font-medium mb-1">Transcript:</div>
          <div className={isListening ? 'text-muted-foreground italic' : ''}>
            {transcript || 'Waiting for speech...'}
          </div>
        </div>
      )}
      
      {isListening && !transcript && (
        <div className="text-sm text-muted-foreground text-center animate-pulse">
          🎤 Listening... Speak your meal description
        </div>
      )}
    </div>
  );
}
