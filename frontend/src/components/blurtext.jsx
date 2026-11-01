import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const BlurText = ({ text = '', className = '', animateBy = 'words', delay = 200, direction = 'top' }) => {
  const words = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(ref.current);
      }
    }, { threshold: 0.1 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <p ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap' }}>
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: direction === 'top' ? -50 : 50, filter: 'blur(10px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ delay: idx * (delay / 1000), duration: 0.5 }}
          style={{ display: 'inline-block' }}
        >
          {word}{animateBy === 'words' && idx < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </p>
  );
};

export default BlurText;
