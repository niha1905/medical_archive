import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode } from 'lucide-react';
import QrCodeModal from '@/components/modals/qr-code-modal';

const QrCodePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Default user ID and email (would normally come from authentication)
  const userId = 1;
  const userEmail = 'john@example.com';
  
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My QR Code</h2>
          <p className="mt-1 text-sm text-slate-500">Share your medical records securely with healthcare providers</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Access QR Code</CardTitle>
            <CardDescription>
              Generate a QR code that doctors can scan to view your medical records
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
              <QrCode className="h-12 w-12 text-primary" />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setIsModalOpen(true)}
            >
              Generate QR Code
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>QR Code Information</CardTitle>
            <CardDescription>
              Important details about your QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-700">What does the QR code do?</h4>
              <p className="text-sm text-slate-600 mt-1">
                The QR code provides secure, temporary access to your medical records for healthcare professionals.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-700">How long is it valid?</h4>
              <p className="text-sm text-slate-600 mt-1">
                Each QR code is valid for 30 days. You can generate a new one at any time.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-700">Is it secure?</h4>
              <p className="text-sm text-slate-600 mt-1">
                Yes, the QR code contains a unique, encrypted token that only works for authorized users.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <QrCodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        userEmail={userEmail}
      />
    </>
  );
};

export default QrCodePage;
