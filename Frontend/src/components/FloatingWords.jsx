import { useState, useEffect } from "react";

export default function FloatingWords({ words }) {
  const [floatingWords, setFloatingWords] = useState([]);

  useEffect(() => {
    // timeout to avoid synchronous setState during render
    const timeout = setTimeout(() => {
      const fw = words.map((word) => ({
        text: word,
        left: Math.random() * 90, // vw, leaving 10% margin
        top: Math.random() * 90, // vh
        size: 12 + Math.random() * 24, // px
        speed: 5 + Math.random() * 10, // seconds
        rotate: Math.random() * 360, // deg
        opacity: 0.2 + Math.random() * 0.3,
      }));
      setFloatingWords(fw);
    }, 0);

    return () => clearTimeout(timeout);
  }, [words]);

  return (
    <div className="floating-container">
      {floatingWords.map(
        ({ id, text, trait, left, top, size, speed, rotate }) => (
          <div
            key={id}
            className={`floating-word ${trait}`}
            style={{
              left: `${left}vw`,
              top: `${top}vh`,
              fontSize: `${size}px`,
              animationDuration: `${speed}s, ${speed}s, ${speed}s`,
              transform: `rotate(${rotate}deg)`,
            }}
          >
            {text}
          </div>
        )
      )}
    </div>
  );
}
