"use client";

import { useState, useEffect } from "react";

interface TypewriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenWords?: number;
  backspace?: "all" | "single";
  className?: string;
  cursorClassName?: string;
}

export function Typewriter({
  words,
  typingSpeed = 70,
  deletingSpeed = 40,
  delayBetweenWords = 1800,
  backspace = "all",
  className = "",
  cursorClassName = "text-emerald-400",
}: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const currentWord = words[currentWordIndex % words.length];

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing phase
      if (currentText.length < currentWord.length) {
        timer = setTimeout(() => {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        // Finished typing word, wait before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, delayBetweenWords);
      }
    } else {
      // Deleting phase
      if (backspace === "all") {
        if (currentText.length > 0) {
          timer = setTimeout(() => {
            setCurrentText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        } else {
          // Finished deleting word
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      } else {
        // Single backspace (default behavior)
        if (currentText.length > 0) {
          timer = setTimeout(() => {
            setCurrentText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, delayBetweenWords, backspace]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{currentText}</span>
      <span
        className={`inline-block w-[3px] h-[0.9em] ml-1 bg-current animate-pulse ${cursorClassName}`}
        aria-hidden="true"
      />
    </span>
  );
}
