import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Search, Camera } from 'lucide-react';
import DoctorViewModal from '@/components/modals/doctor-view-modal';
import QRScanner from '@/components/ui/qr-scanner';
import { useToast } from '@/hooks/use-toast';

// Define the PatientData type to match the one in doctor-view-modal.tsx
interface PatientData {
  user: {
    id: number;
    displayName: string;
    username: string;
    email?: string;
  };
  documents: Array<{
    id: number;
    title: string;
    categoryId: number;
    categoryName: string;
    date: string;
    notes?: string;
    fileData: any;
    createdAt: string;
  }>;
}

const DoctorView: React.FC = () => {
  const params = useParams<{ token?: string }>();
  const [location, setLocation] = useLocation();
  // Use the default QR code token if none is provided
  const [qrToken, setQrToken] = useState(params.token || 'patient-qr-code');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();
  
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
  } = useQuery<PatientData>({
    queryKey: ['patientData', qrToken],
    queryFn: async () => {
      try {
        // First check if the server is responding
        const testResponse = await fetch('/api/test');
        if (!testResponse.ok) {
          throw new Error('Server is not responding correctly');
        }
        
        // Now try to fetch the patient data
        const response = await fetch(`/api/qrcode/${qrToken}`);
        
        if (response.status === 404) {
          throw new Error('QR code not found or expired. Please try scanning again or use the default patient code.');
        } else if (response.status === 410) {
          throw new Error('QR code has expired. Please ask the patient to generate a new QR code.');
        } else if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch patient data. Please check your connection and try again.');
        }
        
        return response.json();
      } catch (err) {
        console.error('Error fetching patient data:', err);
        throw err;
      }
    },
    enabled: isModalOpen && !!qrToken,
    retry: 1, // Only retry once to avoid too many failed requests
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
  
  const handleScanQrCode = () => {
    setIsScannerOpen(true);
  };
  
  const handleQrCodeScanned = (data: string) => {
    // Close the scanner
    setIsScannerOpen(false);
    
    // Extract the token from the scanned data
    let token = data;
    
    // If the scanned data is a URL, extract the token from it
    if (data.includes('/doctor/')) {
      const parts = data.split('/doctor/');
      if (parts.length > 1) {
        token = parts[1];
      }
    }
    
    // Set the token and open the modal
    setQrToken(token);
    setLocation(`/doctor/${token}`, { replace: true });
    setIsModalOpen(true);
    
    // Show a success toast
    toast({
      title: 'QR Code Scanned',
      description: 'Successfully scanned patient QR code',
    });
    
    // Refetch the data
    refetch();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 pt-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full shadow-lg mb-4">
            <QrCode className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            MediRec Doctor Portal
          </h1>
          <p className="mt-2 text-slate-600">Scan a QR code to access patient records securely</p>
        </div>
        
        <Card className="border-blue-200 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleQrSubmit} className="space-y-5">
              <div>
                <label htmlFor="qr-token" className="block text-sm font-medium text-blue-700 mb-1 flex items-center">
                  <QrCode className="h-4 w-4 mr-1.5" />
                  QR Code Token
                </label>
                <div className="relative">
                  <Input
                    id="qr-token"
                    type="text"
                    placeholder="Enter QR code token"
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400 shadow-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-blue-600">
                  Enter the token from the patient's QR code or scan it directly
                </p>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
                <span className="px-3 text-xs text-blue-500 bg-white">OR</span>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={handleScanQrCode}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Scan QR Code
                </Button>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                disabled={!qrToken}
              >
                Access Patient Records
              </Button>
            </form>
            
            <div className="mt-8 text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-center text-blue-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Secure Access</span>
              </div>
              <p className="text-xs text-blue-700">
                This portal is for authorized healthcare professionals only.
                All access to patient data is encrypted and logged for security purposes.
              </p>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button 
                variant="ghost" 
                className="text-xs text-slate-500 hover:text-blue-600"
                onClick={() => setLocation('/doctor-dashboard')}
              >
                Return to Doctor Dashboard
              </Button>
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
      
      {/* QR Code Scanner */}
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleQrCodeScanned}
      />
    </div>
  );
};

export default DoctorView;
