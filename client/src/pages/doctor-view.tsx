import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Search } from 'lucide-react';
import DoctorViewModal from '@/components/modals/doctor-view-modal';

const DoctorView: React.FC = () => {
  const params = useParams<{ token?: string }>();
  const [location, setLocation] = useLocation();
  const [qrToken, setQrToken] = useState(params.token || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Effect to open modal if token is in URL
  useEffect(() => {
    if (params.token) {
      setQrToken(params.token);
      setIsModalOpen(true);
    }
  }, [params.token]);
  
  // Fetch patient data if token is available and modal is open
  const { 
    data: patientData, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/qrcode/${qrToken}`],
    enabled: isModalOpen && !!qrToken,
  });
  
  const handleQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrToken) {
      // Update URL with token
      setLocation(`/doctor/${qrToken}`, { replace: true });
      setIsModalOpen(true);
      refetch();
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-100 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center">
            <QrCode className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-slate-800">MediRec Doctor View</h1>
          </div>
          <p className="mt-2 text-slate-500">Access patient records via QR code</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleQrSubmit} className="space-y-4">
              <div>
                <label htmlFor="qr-token" className="block text-sm font-medium text-slate-700 mb-1">
                  QR Code Token
                </label>
                <div className="relative">
                  <Input
                    id="qr-token"
                    type="text"
                    placeholder="Enter QR code token"
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    className="pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the token from the patient's QR code
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={!qrToken}>
                Access Patient Records
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                This view is for authorized healthcare professionals only.
                Patient data is protected and access is logged.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <DoctorViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientData={patientData}
        isLoading={isLoading}
        error={error as Error | undefined}
      />
    </div>
  );
};

export default DoctorView;
