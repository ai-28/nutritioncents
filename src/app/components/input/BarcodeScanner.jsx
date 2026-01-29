'use client';

import { useState, useRef, useEffect } from 'react';
import { Barcode, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function BarcodeScanner({ onBarcodeScanned, disabled }) {
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Failed to access camera. Please enter barcode manually.');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleManualInput = async () => {
    if (!barcode.trim()) {
      toast.error('Please enter a barcode');
      return;
    }

    if (onBarcodeScanned) {
      await onBarcodeScanned(barcode);
    }
  };

  // Note: For actual barcode scanning, you'd need a library like html5-qrcode
  // This is a simplified version that shows the camera and allows manual input

  return (
    <div className="space-y-4">
      {scanning ? (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            onClick={stopScanning}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          >
            Stop Scanning
          </Button>
          <p className="text-sm text-center text-muted-foreground mt-2">
            Point camera at barcode (Manual entry available below)
          </p>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={startScanning}
          disabled={disabled}
          className="w-full"
        >
          <Camera className="w-4 h-4 mr-2" />
          Start Barcode Scanner
        </Button>
      )}

      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Or enter barcode manually"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          disabled={disabled}
        />
        <Button
          type="button"
          onClick={handleManualInput}
          disabled={disabled || !barcode.trim()}
          className="w-full"
        >
          <Barcode className="w-4 h-4 mr-2" />
          Lookup Barcode
        </Button>
      </div>
    </div>
  );
}
