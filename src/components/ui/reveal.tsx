import React, { JSX } from "react";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
}

const Reveal: React.FC<RevealProps> = ({ as: Tag = "div", delay = 0, className = "", children, ...rest }) => {
  const ref = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    const node = ref.current as Element | null;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style: React.CSSProperties = delay ? { transitionDelay: `${delay}ms` } : {};

  return (
    // @ts-ignore - Tag as dynamic element
    <Tag ref={ref} className={`reveal-up ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
};

export default Reveal;