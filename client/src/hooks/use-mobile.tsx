import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 1024; // lg breakpoint in Tailwind

export function useMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    // Set initial values
    setWindowWidth(window.innerWidth);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Add event listener
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);
    
    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { 
    isMobile, 
    windowWidth,
    isDesktop: !isMobile
  };
}
