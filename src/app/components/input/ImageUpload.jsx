'use client';

import { useState, useRef } from 'react';
import { Image, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
      const img = new Image();
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

export function ImageUpload({ onImageUpload, disabled }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
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
      console.error('Image upload error:', error);
      toast.error('Failed to process image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      
      {!preview ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full"
        >
          {uploading ? (
            'Processing...'
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Food Photo
            </>
          )}
        </Button>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Food preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
