import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';


const ScrollToTop = ({ scrollRef }: { scrollRef: React.RefObject<HTMLElement> }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, scrollRef]);

  return null;
};

export default ScrollToTop;
