import React, { useEffect, useRef } from 'react';

const FadeInOnScroll = ({ children }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '20px',
      }
    );

    // Store current ref value in a variable
    const current = elementRef.current;

    if (current) {
      observer.observe(current);
    }

    return () => {
      // Use the stored variable in cleanup
      if (current) {
        observer.unobserve(current);
      }
    };
  }, []);

  return (
    <div ref={elementRef} style={{ opacity: 0 }}>
      {children}
    </div>
  );
};

export default FadeInOnScroll;