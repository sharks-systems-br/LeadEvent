"use client";

import { useEffect, useState } from "react";

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textIndex] ?? "";

  useEffect(() => {
    if (!currentText) return;

    if (!isDeleting && currentIndex >= currentText.length) {
      if (!loop) return;

      const timeout = setTimeout(() => setIsDeleting(true), delay);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayText((value) => value + currentText[currentIndex]);
          setCurrentIndex((value) => value + 1);
          return;
        }

        if (displayText.length > 1) {
          setDisplayText((value) => value.slice(0, -1));
          return;
        }

        setDisplayText("");
        setIsDeleting(false);
        setCurrentIndex(0);
        setTextIndex((value) => (value + 1) % textArray.length);
      },
      isDeleting ? deleteSpeed : speed
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    currentText,
    deleteSpeed,
    delay,
    displayText.length,
    isDeleting,
    loop,
    speed,
    textArray.length,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}
