import { createSignal, For, Show } from 'solid-js';
import { Message } from '../types/chat';
import { chatService } from '../services/chatService';
import { MessageContent } from './MessageContent';
import '../styles/index.scss';

export default function Chat() {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [inputValue, setInputValue] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [isTyping, setIsTyping] = createSignal(false);

  const handleSubmit = async (e?: Event) => {
    e?.preventDefault();
    const text = inputValue().trim();
    
    if (!text || isLoading()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text,
      isUser: true,
    };
    
    setMessages([...messages(), userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const data = await chatService.sendQuery(text);
      setIsTyping(false);
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: chatService.formatResponse(data),
        isUser: false,
        isStreaming: true
      };
      
      setMessages([...messages(), aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error while processing your request.',
        isUser: false,
      };
      setMessages([...messages(), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStreamComplete = (messageId: number) => {
    const updatedMessages = messages().map(msg => 
      msg.id === messageId ? { ...msg, isStreaming: false } : msg
    );
    setMessages(updatedMessages);
  };

  return (
    <div class="chat-container">
      <div class="chat-messages">
        <For each={messages()}>
          {(message) => (
            <div
              style={{
                'text-align': message.isUser ? 'right' : 'left',
                'margin-bottom': '1rem',
              }}
            >
              <div
                style={{
                  'display': 'inline-block',
                  'background-color': message.isUser ? 'var(--secondary-color)' : 'var(--primary-color)',
                  'color': 'white',
                  'padding': '0.5rem 1rem',
                  'border-radius': '4px',
                  'max-width': '70%',
                  'white-space': 'pre-wrap',
                }}
              >
                <MessageContent 
                  message={message} 
                  onStreamComplete={handleStreamComplete}
                />
              </div>
            </div>
          )}
        </For>
        <Show when={isTyping()}>
          <div style={{ 'text-align': 'left', 'margin-bottom': '1rem' }}>
            <div
              style={{
                'display': 'inline-block',
                'background-color': 'var(--primary-color)',
                'color': 'white',
                'padding': '0.5rem 1rem',
                'border-radius': '4px',
                'font-style': 'italic',
              }}
            >
              typing...
            </div>
          </div>
        </Show>
      </div>
      <form class="chat-input" onSubmit={handleSubmit}>
        <textarea
          value={inputValue()}
          onInput={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
          disabled={isLoading()}
        />
        <button type="submit" disabled={isLoading() || !inputValue().trim()}>
          {isLoading() ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 