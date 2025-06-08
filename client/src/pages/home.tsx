import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

const Home: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Redirect based on user role
  useEffect(() => {
    if (user?.role === 'doctor') {
      setLocation('/doctor-dashboard');
    } else {
      setLocation('/documents');
    }
  }, [setLocation, user]);
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-blue-700">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Home;
