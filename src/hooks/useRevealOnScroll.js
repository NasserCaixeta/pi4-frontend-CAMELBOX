import { useEffect } from 'react';

export default function useRevealOnScroll(selector = '.cb-reveal') {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const elements = Array.from(document.querySelectorAll(selector));
    if (elements.length === 0) return undefined;

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [selector]);
}
