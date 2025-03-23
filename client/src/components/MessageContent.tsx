import { createSignal } from 'solid-js';
import { Message } from '../types/chat';
import { useTextStreaming } from '../hooks/useTextStreaming';

interface MessageContentProps {
  message: Message;
  onStreamComplete: (messageId: number) => void;
}

export function MessageContent(props: MessageContentProps) {
  const [isComplete, setIsComplete] = createSignal(!props.message.isStreaming);
  
  const { streamedText, startStreaming } = useTextStreaming(
    props.message.text,
    () => {
      setIsComplete(true);
      props.onStreamComplete(props.message.id);
    }
  );

  if (props.message.isStreaming && !isComplete()) {
    startStreaming();
    return <>{streamedText()}</>;
  }

  return <>{props.message.text}</>;
} 