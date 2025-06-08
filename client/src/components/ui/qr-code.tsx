import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  bgColor?: string;
  fgColor?: string;
  className?: string;
}

const QRCodeComponent = forwardRef<HTMLCanvasElement, QRCodeProps>(({
  value,
  size = 240,
  level = 'M',
  bgColor = '#ffffff',
  fgColor = '#000000',
  className = '',
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Forward the canvas ref to the parent component
  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Always use a valid URL for the QR code
    const qrValue = value && value.trim() !== '' 
      ? value 
      : 'https://example.com/placeholder';
    
    try {
      console.log('Generating QR code for:', qrValue);
      
      // Clear any previous errors
      setError(null);
      
      // Generate the QR code
      QRCode.toCanvas(
        canvasRef.current,
        qrValue,
        {
          width: size,
          margin: 2,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: level,
        },
        (err) => {
          if (err) {
            console.error('Error in QR code callback:', err);
            setError(err.message || 'Failed to generate QR code');
          } else {
            console.log('QR code generated successfully');
          }
        }
      );
    } catch (err: any) {
      console.error('Exception generating QR code:', err);
      setError(err.message || 'Failed to generate QR code');
    }
  }, [value, size, level, bgColor, fgColor]);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className={className}
        width={size}
        height={size}
        style={{ display: error ? 'none' : 'block' }}
      />
      {error && (
        <div 
          className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}
          style={{ width: size, height: size }}
        >
          <div className="text-center p-4">
            <p className="text-red-500 text-sm font-medium">Error</p>
            <p className="text-red-400 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}
    </>
  );
});

QRCodeComponent.displayName = 'QRCodeComponent';

export default QRCodeComponent;

export const downloadQRCode = (canvasElement: HTMLCanvasElement, filename = 'qrcode.png') => {
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvasElement.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
  }
};

export const emailQRCode = async (canvasElement: HTMLCanvasElement, email: string) => {
  try {
    const dataUrl = canvasElement.toDataURL('image/png');
    const subject = encodeURIComponent('Your Medical Records QR Code');
    const body = encodeURIComponent(
      'Here is your QR code for accessing your medical records. Doctors can scan this to view your information.'
    );
    
    // Create mailto link (note: this doesn't actually send the image as an attachment,
    // just opens the mail client. The backend would need to implement actual email sending)
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  } catch (error) {
    console.error('Error preparing QR code for email:', error);
  }
};
