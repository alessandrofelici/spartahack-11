
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// OpenRouter API - direct call from frontend
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export default function BestPractices() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "SYSTEM ONLINE. MEV SHIELD ASSISTANT READY. QUERY PROTOCOLS?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const callOpenRouterAPI = async (prompt: string): Promise<string> => {
    if (!OPENROUTER_API_KEY) {
      return "ERROR: VITE_OPENROUTER_API_KEY is missing. Please check your .env file.";
    }

    try {
      const response = await axios.post(OPENROUTER_URL, {
        model: 'anthropic/claude-sonnet-4',
        messages: [{ role: 'user', content: prompt }],
      }, {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("OpenRouter API Error:", error);
      return "SYSTEM FAILURE: Unable to connect to neural net. " + (error instanceof Error ? error.message : String(error));
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    // Call OpenRouter API via backend
    const responseText = await callOpenRouterAPI(inputValue);

    const newBotMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newBotMessage]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-emerald-500/30 flex flex-col items-center">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.05),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-4xl h-[100vh] flex flex-col p-4 md:p-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-4 border-b border-emerald-900/30 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white">
              SHIELD <span className="text-emerald-500">ASSISTANT</span>
            </h1>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">
              Automated Guidance System // v2.1
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-500 font-bold">ONLINE</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-gray-900/20 backdrop-blur-sm rounded-none border-x border-t border-gray-800 overflow-hidden flex flex-col relative">
          {/* CRT Scanline Effect Overlay - Optional, keeping it subtle or removing if too distracting */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] opacity-10 z-20"></div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] p-4 text-sm md:text-base border ${message.sender === 'user'
                      ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-100 rounded-bl-xl'
                      : 'bg-gray-800/40 border-gray-700 text-gray-300 rounded-br-xl'
                      }`}
                  >
                    <div className="text-[10px] mb-1 opacity-50 uppercase tracking-wider font-bold">
                      {message.sender === 'user' ? '> USER_ID: 0x...A1' : '> SYSTEM_CORE'}
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed font-light">{message.text}</p>
                    <span className="text-[9px] block mt-2 opacity-40 text-right font-mono">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-800/40 border border-gray-700 p-3 rounded-br-xl flex items-center space-x-2">
                  <span className="text-[10px] text-emerald-500 animate-pulse">{`> COMPUTING_RESPONSE`}</span>
                  <div className="flex space-x-1">
                    <span className="w-1 h-1 bg-emerald-500 animate-bounce"></span>
                    <span className="w-1 h-1 bg-emerald-500 animate-bounce" style={{ animationDelay: '100ms' }}></span>
                    <span className="w-1 h-1 bg-emerald-500 animate-bounce" style={{ animationDelay: '200ms' }}></span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-0 border-t border-emerald-500/30 bg-black relative z-30">
            <form onSubmit={handleSendMessage} className="flex items-center">
              <div className="pl-4 py-4 text-emerald-500 font-bold select-none">{`>`}</div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="EXECUTE COMMAND OR ASK QUESTION..."
                className="flex-1 p-4 bg-transparent border-none focus:ring-0 focus:outline-none text-emerald-100 placeholder-gray-700 font-mono text-sm"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="px-6 py-4 text-xs font-bold bg-emerald-900/20 text-emerald-500 hover:bg-emerald-500 hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-emerald-500 transition-all duration-200 border-l border-emerald-900/30 uppercase tracking-widest"
              >
                SEND
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}