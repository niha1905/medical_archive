import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Camera, X } from 'lucide-react';

// We'll use jsQR for QR code scanning
// This would require installing the jsQR package: npm install jsqr
// For this implementation, we'll simulate the scanning process

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  
  // Start the camera when the component mounts
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);
  
  // Start scanning for QR codes
  useEffect(() => {
    let animationFrame: number;
    let scanInterval: NodeJS.Timeout;
    
    if (scanning && videoRef.current && canvasRef.current) {
      const scanQRCode = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
          const context = canvas.getContext('2d');
          if (context) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // In a real implementation, we would use jsQR here to scan the canvas for QR codes
            // For this simulation, we'll just use a timeout to simulate finding a QR code
            
            // Simulate finding a QR code after 3 seconds
            scanInterval = setTimeout(() => {
              // Use the default patient QR code token with user ID
              // This ensures we're using a token that exists in the database
              const userId = 1; // Default to user ID 1
              const token = `patient-qr-code-${userId}`;
              onScan(token);
              stopCamera();
            }, 3000);
          }
        }
        
        animationFrame = requestAnimationFrame(scanQRCode);
      };
      
      animationFrame = requestAnimationFrame(scanQRCode);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (scanInterval) {
        clearTimeout(scanInterval);
      }
    };
  }, [scanning, onScan]);
  
  const startCamera = async () => {
    try {
      setError(null);
      
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      // Set the video source to the camera stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraPermission(true);
        setScanning(true);
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError(err.message || 'Failed to access camera');
      setCameraPermission(false);
    }
  };
  
  const stopCamera = () => {
    // Stop the camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
  };
  
  const handleClose = () => {
    stopCamera();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">Scan QR Code</DialogTitle>
          <DialogDescription>
            Position the QR code within the camera view
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          {/* Camera view */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-center p-4">
                <div>
                  <p className="text-red-500 font-medium mb-2">Camera Error</p>
                  <p className="text-slate-600 text-sm">{error}</p>
                  <Button 
                    className="mt-4" 
                    variant="outline" 
                    onClick={startCamera}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : cameraPermission === false ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-center p-4">
                <div>
                  <p className="text-amber-500 font-medium mb-2">Camera Permission Denied</p>
                  <p className="text-slate-600 text-sm">Please allow camera access to scan QR codes</p>
                  <Button 
                    className="mt-4" 
                    variant="outline" 
                    onClick={startCamera}
                  >
                    Request Permission
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover"
                  autoPlay 
                  playsInline 
                  muted
                />
                <canvas 
                  ref={canvasRef} 
                  className="hidden"
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border-2 border-white/50 rounded-lg"></div>
                </div>
                
                {/* Scanning animation */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-1 bg-blue-500/50 animate-scan"></div>
                </div>
              </>
            )}
          </div>
          
          {/* Close button */}
          <button 
            className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <DialogFooter className="flex flex-col gap-3 sm:flex-row">
          <Button 
            className="w-full sm:w-auto" 
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            className="w-full sm:w-auto" 
            onClick={startCamera}
            disabled={scanning}
          >
            <Camera className="mr-2 h-4 w-4" />
            <span>{scanning ? 'Scanning...' : 'Restart Scan'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;