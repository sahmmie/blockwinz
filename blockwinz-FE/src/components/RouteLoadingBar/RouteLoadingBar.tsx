import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar';

const RouteLoadingBar = () => {
  const loadingBarRef = useRef<LoadingBarRef>(null);
  const location = useLocation();
  const [loadingDone, setLoadingDone] = useState(false);

  // Start loading bar on route change
  useEffect(() => {
    setLoadingDone(false);
    if (loadingBarRef.current) {
      loadingBarRef.current.continuousStart();
    }
    const timeout = setTimeout(() => {
      setLoadingDone(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, [location]);

  // Complete loading bar after loadingDone
  useEffect(() => {
    if (loadingDone && loadingBarRef.current) {
      loadingBarRef.current.complete();
    }
  }, [loadingDone]);

  return (
    <LoadingBar
      color="#00DD25"
      ref={loadingBarRef}
      height={3}
      shadow={true}
    />
  );
};

export default RouteLoadingBar; 