import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setFadeIn(false);
    };
    const handleComplete = () => {
      setIsLoading(false);
      setFadeIn(true);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <>
      {/* Loading Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-vesoko_primary to-vesoko_primary transition-all duration-700 ease-out"
            style={{
              width: '100%',
              transformOrigin: 'left',
              animation: 'loadingBar 1s ease-out forwards'
            }}
          />
        </div>
      )}
      
      {/* Page Content with Smooth Transition */}
      <div 
        className={`transition-all duration-300 ease-in-out transform ${
          fadeIn ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-2'
        }`}
      >
        {children}
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          0% { 
            width: 0%; 
            transform: scaleX(0);
          }
          50% { 
            width: 60%; 
            transform: scaleX(0.6);
          }
          100% { 
            width: 100%; 
            transform: scaleX(1);
          }
        }
      `}</style>
    </>
  );
};

export default PageTransition;
