import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

const Home: React.FC = () => {
  const [_, setLocation] = useLocation();
  
  // Redirect to documents page
  useEffect(() => {
    setLocation('/documents');
  }, [setLocation]);
  
  return (
    <div className="flex items-center justify-center h-full">
      <p>Redirecting to documents...</p>
    </div>
  );
};

export default Home;
