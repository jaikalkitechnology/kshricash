// src/components/ScrollToTopButton.jsx
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return isVisible ? (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 bg-vasu-green text-white p-3 rounded-full shadow-lg hover:bg-vasu-deep transition-colors duration-300"
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  ) : null;
};

export default ScrollToTopButton;
