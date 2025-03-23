import { createSignal, For } from 'solid-js';
import '../styles/index.scss';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

interface QueryResponse {
  query: string;
  documents: {
    content: string;
    similarity: number;
    id: string;
    isRelevant: boolean;
  }[];
  metadata: {
    totalResults: number;
    relevantResults: number;
    similarityThreshold: number;
    filteredOutResults: number;
  };
  aiResponse?: string;
}

export default function Chat() {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [inputValue, setInputValue] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [isTyping, setIsTyping] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const text = inputValue().trim();
    
    if (!text) return;

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
      const response = await fetch('http://localhost:3000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: text,
          maxResults: 5
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: QueryResponse = await response.json();
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: data.aiResponse || 'I found these relevant documents:\n\n' + 
          data.documents
            .filter(doc => doc.isRelevant)
            .map(doc => `${doc.content} (Similarity: ${(doc.similarity * 100).toFixed(1)}%)`)
            .join('\n\n'),
        isUser: false,
      };
      
      // Add a small delay to simulate typing
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessages([...messages(), aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error while processing your request.',
        isUser: false,
      };
      setMessages([...messages(), errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
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
                {message.text}
              </div>
            </div>
          )}
        </For>
        {isTyping() && (
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
        )}
      </div>
      <form class="chat-input" onSubmit={handleSubmit}>
        <textarea
          value={inputValue()}
          onInput={(e) => setInputValue(e.currentTarget.value)}
          placeholder="Type your message here..."
          disabled={isLoading()}
        />
        <button type="submit" disabled={isLoading() || !inputValue().trim()}>
          {isLoading() ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 