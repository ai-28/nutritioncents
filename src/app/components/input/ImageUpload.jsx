'use client';

import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, X, Upload, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Compress image to target size (in bytes)
async function compressImage(file, targetSizeBytes) {
  return new Promise((resolve, reject) => {
    // If file is already smaller than target, return as-is
    if (file.size <= targetSizeBytes) {
      console.log(`Image already small enough: ${(file.size / 1024).toFixed(2)}KB`);
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const originalWidth = width;
        const originalHeight = height;
        
        // Calculate initial dimensions (max 1920px for quality)
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Use high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw image with high quality
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels to reach target size
        let quality = 0.9;
        let attempts = 0;
        const maxAttempts = 15;
        
        const tryCompress = () => {
          canvas.toBlob(
            (compressedBlob) => {
              if (!compressedBlob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              // If we're under target size or at minimum quality, we're done
              if (compressedBlob.size <= targetSizeBytes || quality <= 0.1 || attempts >= maxAttempts) {
                const compressionRatio = ((1 - compressedBlob.size / file.size) * 100).toFixed(1);
                console.log(`Image compressed: ${(file.size / 1024).toFixed(2)}KB -> ${(compressedBlob.size / 1024).toFixed(2)}KB (${compressionRatio}% reduction, quality: ${quality.toFixed(2)}, size: ${width}x${height})`);
                resolve(compressedBlob);
                return;
              }
              
              // If still too large, reduce quality and/or dimensions
              if (compressedBlob.size > targetSizeBytes) {
                attempts++;
                if (quality > 0.4) {
                  // Reduce quality first (faster)
                  quality -= 0.1;
                } else if (width > 640 || height > 640) {
                  // Then reduce dimensions
                  width = Math.floor(width * 0.85);
                  height = Math.floor(height * 0.85);
                  canvas.width = width;
                  canvas.height = height;
                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = 'high';
                  ctx.drawImage(img, 0, 0, width, height);
                  quality = 0.7; // Reset quality when resizing
                } else {
                  // Last resort: reduce quality further
                  quality = Math.max(0.1, quality - 0.05);
                }
                tryCompress();
              } else {
                resolve(compressedBlob);
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        tryCompress();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ onImageUpload, disabled, analyzing }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  // Process captured image (from camera or file)
  const processImage = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image size must be less than 20MB');
      return;
    }

    setUploading(true);
    
    try {
      // Compress image to 500KB before sending
      toast.info('Compressing image...');
      const compressedImage = await compressImage(file, 500 * 1024); // 500KB target
      
      // Convert compressed blob to base64 for preview and upload
      const compressedBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(compressedImage);
      });

      // Set preview
      setPreview(compressedBase64);

      // Upload compressed image
      if (onImageUpload) {
        await onImageUpload(compressedBase64);
      }
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Failed to process image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImage(file);
  };

  const handleCameraFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowCamera(false);
    await processImage(file);
  };

  // Start camera with live preview
  const startCamera = async () => {
    // Open dialog first to show loading state
    setShowCamera(true);
    
    // Always try web camera first for live preview
    try {
      console.log('Requesting camera access...');
      
      // Check if getUserMedia is available
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
      
      // Video stream will be set up in useEffect when both showCamera and cameraStream are ready
    } catch (error) {
      console.error('Web camera error:', error);
      setShowCamera(false); // Close dialog if camera fails
      
      // Fallback to native camera input if web camera fails
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast.warning('Camera permission denied. Using native camera...');
        // Try native camera as fallback
        setTimeout(() => {
          cameraInputRef.current?.click();
        }, 500);
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        toast.warning('No camera found. Using native camera input...');
        // Try native camera as fallback
        cameraInputRef.current?.click();
      } else {
        toast.warning('Web camera unavailable. Using native camera...');
        // Try native camera as fallback
        cameraInputRef.current?.click();
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('Failed to capture photo');
        return;
      }
      
      // Stop camera
      stopCamera();
      
      // Create a File object from blob
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      
      // Process the captured image
      await processImage(file);
    }, 'image/jpeg', 0.95);
  };

  // Handle video stream when camera is ready
  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      console.log('Setting up video stream in useEffect');
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [showCamera, cameraStream]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      {/* Mobile native camera input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      {/* Hidden canvas for capturing video frames */}
      <canvas ref={canvasRef} className="hidden" />
      
      {!preview ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={startCamera}
            disabled={disabled || uploading}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Food preview"
            className="w-full max-h-96 object-contain rounded-lg bg-muted"
          />
          {analyzing && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center backdrop-blur-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-3"></div>
              <p className="text-white font-medium">Analyzing food image...</p>
              <p className="text-white/80 text-sm mt-1">Extracting nutrition information</p>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={analyzing}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Camera Dialog with Live Preview */}
      <Dialog open={showCamera} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="sm:max-w-[95vw] max-w-[95vw] p-0 gap-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>Take Food Photo</DialogTitle>
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
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 p-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={stopCamera}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="rounded-full w-16 h-16 bg-white hover:bg-white/90 shadow-lg"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-gray-800"></div>
                </Button>
                <div className="w-16"></div> {/* Spacer for centering */}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
