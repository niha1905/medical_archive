import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  bgColor?: string;
  fgColor?: string;
  className?: string;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({
  value,
  size = 240,
  level = 'M',
  bgColor = '#ffffff',
  fgColor = '#000000',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: level,
      },
      (error) => {
        if (error) console.error('Error generating QR code:', error);
      }
    );
  }, [value, size, level, bgColor, fgColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      width={size}
      height={size}
    />
  );
};

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
