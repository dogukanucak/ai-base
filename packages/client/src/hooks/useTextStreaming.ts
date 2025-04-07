import { createSignal } from "solid-js";

interface TextStreamingHook {
  streamedText: () => string;
  startStreaming: () => void;
}

export function useTextStreaming(
  fullText: string,
  onComplete: () => void,
  delay = 20,
): TextStreamingHook {
  const [streamedText, setStreamedText] = createSignal("");

  const startStreaming = () => {
    let currentIndex = 0;
    const textLength = fullText.length;

    const streamNextChar = () => {
      if (currentIndex < textLength) {
        setStreamedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(streamNextChar, delay);
      } else {
        onComplete();
      }
    };

    streamNextChar();
  };

  return { streamedText, startStreaming };
}
