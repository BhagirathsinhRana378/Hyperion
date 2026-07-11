"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * TextType — adapted from ReactBits (reactbits.dev, MIT).
 *
 * Character-by-character typing (and optional deleting/looping) across
 * one or more strings, with a blinking cursor. All original props are
 * kept: as, typingSpeed, initialDelay, pauseDuration, deletingSpeed,
 * loop, showCursor, hideCursorWhileTyping, cursorCharacter,
 * cursorBlinkDuration, textColors, variableSpeed, onSentenceComplete,
 * startOnVisible, reverseMode. Hyperion adaptations:
 *  - the gsap cursor tween is replaced by an equivalent CSS keyframe
 *    (landing-caret-blink), so no gsap dependency
 *  - Tailwind classes instead of the companion CSS file
 */

interface TextTypeProps {
  as?: ElementType;
  className?: string;
  cursorBlinkDuration?: number;
  cursorCharacter?: string | ReactNode;
  cursorClassName?: string;
  deletingSpeed?: number;
  hideCursorWhileTyping?: boolean;
  initialDelay?: number;
  loop?: boolean;
  onSentenceComplete?: (sentence: string, index: number) => void;
  pauseDuration?: number;
  reverseMode?: boolean;
  showCursor?: boolean;
  startOnVisible?: boolean;
  text: string | string[];
  textColors?: string[];
  typingSpeed?: number;
  variableSpeed?: { min: number; max: number };
}

export default function TextType({
  text,
  as: Component = "div",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}: TextTypeProps & React.HTMLAttributes<HTMLElement>) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const containerRef = useRef<HTMLElement>(null);

  const textArray = useMemo(
    () => (Array.isArray(text) ? text : [text]),
    [text]
  );

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) {
      return typingSpeed;
    }
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const getCurrentTextColor = () => {
    if (textColors.length === 0) {
      return "inherit";
    }
    return textColors[currentTextIndex % textColors.length] ?? "inherit";
  };

  useEffect(() => {
    if (!(startOnVisible && containerRef.current)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mirrors the original ReactBits effect contract
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;

    const currentText = textArray[currentTextIndex] ?? "";
    const processedText = reverseMode
      ? currentText.split("").reverse().join("")
      : currentText;

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === "") {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) {
            return;
          }

          if (onSentenceComplete) {
            onSentenceComplete(currentText, currentTextIndex);
          }

          setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
          setCurrentCharIndex(0);
          timeout = setTimeout(() => {
            /* pause between sentences */
          }, pauseDuration);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else if (currentCharIndex < processedText.length) {
        timeout = setTimeout(
          () => {
            setDisplayedText(
              (prev) => prev + (processedText[currentCharIndex] ?? "")
            );
            setCurrentCharIndex((prev) => prev + 1);
          },
          variableSpeed ? getRandomSpeed() : typingSpeed
        );
      } else if (textArray.length >= 1) {
        if (!loop && currentTextIndex === textArray.length - 1) {
          return;
        }
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeout = setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => clearTimeout(timeout);
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    reverseMode,
    variableSpeed,
    getRandomSpeed,
    onSentenceComplete,
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping &&
    (currentCharIndex < (textArray[currentTextIndex] ?? "").length ||
      isDeleting);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `inline-block whitespace-pre-wrap ${className}`,
      ...props,
    },
    <span style={{ color: getCurrentTextColor() }}>{displayedText}</span>,
    showCursor && (
      <span
        className={`landing-caret-blink ml-1 inline-block ${cursorClassName} ${
          shouldHideCursor ? "hidden" : ""
        }`}
        style={
          { "--caret-dur": `${cursorBlinkDuration * 2}s` } as CSSProperties
        }
      >
        {cursorCharacter}
      </span>
    )
  );
}
