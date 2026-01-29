'use client';

import { useState, useRef, useEffect } from 'react';
import { Barcode, Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function BarcodeScanner({ onBarcodeScanned, disabled }) {
  const [showModal, setShowModal] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Handle video stream when camera is ready
  useEffect(() => {
    if (showModal && cameraStream && videoRef.current) {
      console.log('Setting up video stream in useEffect');
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [showModal, cameraStream]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    // Open modal first
    setShowModal(true);
    
    try {
      console.log('Requesting camera access...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Prefer back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      console.log('Camera stream obtained:', stream);
      setCameraStream(stream);
    } catch (error) {
      console.error('Web camera error:', error);
      setShowModal(false);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast.warning('Camera permission denied. Using native camera...');
        setTimeout(() => {
          cameraInputRef.current?.click();
        }, 500);
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        toast.warning('No camera found. Using native camera input...');
        cameraInputRef.current?.click();
      } else {
        toast.warning('Web camera unavailable. Using native camera...');
        cameraInputRef.current?.click();
      }
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    setShowModal(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Camera not ready.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('Failed to capture photo');
        return;
      }
      
      stopCamera();
      await processBarcodeImage(blob);
    }, 'image/jpeg', 0.95);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    await processBarcodeImage(file);
  };

  const handleCameraFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processBarcodeImage(file);
  };

  const processBarcodeImage = async (imageFile) => {
    setProcessing(true);
    
    try {
      // Convert image to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      // Extract barcode from image using OpenAI Vision
      const response = await fetch('/api/nutrition/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: 'Extract the barcode number from this image. Return only the barcode number as a string, no other text.',
          inputType: 'image',
          imageBase64: base64,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract barcode from image');
      }

      const data = await response.json();
      
      // Check if barcode was extracted and returned in response
      if (data.extractedBarcode) {
        const extractedBarcode = data.extractedBarcode;
        setBarcode(extractedBarcode);
        toast.success(`Barcode detected: ${extractedBarcode}`);
        
        // Automatically lookup the barcode (nutrition info already loaded in data.items)
        if (onBarcodeScanned) {
          await onBarcodeScanned(extractedBarcode);
        }
      } else if (data.error) {
        toast.error(data.error);
      } else if (data.items && data.items.length > 0) {
        // If we got nutrition items, the barcode was successfully extracted and looked up
        // Try to get barcode from the first item
        const barcodeFromItem = data.items[0]?.barcode;
        if (barcodeFromItem) {
          setBarcode(barcodeFromItem);
          toast.success(`Barcode detected: ${barcodeFromItem}`);
        }
        
        // Call the callback with the barcode or the first item's barcode
        if (onBarcodeScanned) {
          await onBarcodeScanned(barcodeFromItem || '');
        }
      } else {
        toast.warning('Could not detect barcode in image. Please try again or enter manually.');
      }
    } catch (error) {
      console.error('Barcode extraction error:', error);
      toast.error('Failed to extract barcode from image. Please try again or enter manually.');
    } finally {
      setProcessing(false);
    }
  };

  const handleManualInput = async () => {
    if (!barcode.trim()) {
      toast.error('Please enter a barcode');
      return;
    }

    if (onBarcodeScanned) {
      await onBarcodeScanned(barcode.trim());
    }
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        onClick={startCamera}
        disabled={disabled || processing}
        className="w-full"
      >
        <Camera className="w-4 h-4 mr-2" />
        Start Barcode Scanner
      </Button>

      {/* Manual Input Section */}
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Or enter barcode manually"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          disabled={disabled || processing}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleManualInput();
            }
          }}
        />
        <Button
          type="button"
          onClick={handleManualInput}
          disabled={disabled || processing || !barcode.trim()}
          className="w-full"
        >
          <Barcode className="w-4 h-4 mr-2" />
          Lookup Barcode
        </Button>
      </div>

      {/* Camera Dialog with Live Preview */}
      <Dialog open={showModal} onOpenChange={(open) => {
        if (!open) {
          stopCamera();
        }
      }}>
        <DialogContent className="sm:max-w-[95vw] max-w-[95vw] p-0 gap-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>Scan Barcode</DialogTitle>
          </DialogHeader>
          <div className="relative bg-black flex items-center justify-center min-h-[400px]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[70vh] object-contain"
              style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
            />
            {!cameraStream && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}
            {cameraStream && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center p-4">
                <Button
                  type="button"
                  onClick={capturePhoto}
                  disabled={processing}
                  className="rounded-full w-16 h-16 bg-white hover:bg-white/90 shadow-lg"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-gray-800"></div>
                </Button>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="p-4 space-y-2 border-t">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={processing}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraFileSelect}
              className="hidden"
              disabled={processing}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Barcode Image
                </>
              )}
            </Button>
            
            <div className="text-xs text-center text-muted-foreground">
              {cameraStream ? 'Take a photo of the barcode' : 'Upload an image or take a photo to scan barcode'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
