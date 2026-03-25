import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { User, Story } from '../types';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface Props {
  user: User | null;
  stories: Story[];
}

export default function Chatbot({ user, stories }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello ${user?.fullName || 'there'}! I'm your StorySasa assistant. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);

  const suggestions = user?.role === 'REPORTER' 
    ? ['How to submit a story?', 'Improve my report', 'What is impact score?']
    : ['Show urgent reports', 'Trending issues', 'Filter by location'];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Mock AI Response logic
    setTimeout(() => {
      let botResponse = "I'm processing your request. As a prototype, I can help you navigate the platform.";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('submit')) {
        botResponse = "To submit a story, click the 'Submit Story' button in your dashboard. Make sure to include location and category for better AI analysis!";
      } else if (lowerText.includes('urgent')) {
        const urgentCount = stories.filter(s => s.impactScore > 80).length;
        botResponse = `I found ${urgentCount} high-impact reports that might need immediate attention. You can find them in your feed sorted by Impact Score.`;
      } else if (lowerText.includes('trending')) {
        const categories = stories.reduce((acc, s) => {
          acc[s.category] = (acc[s.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const top = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
        botResponse = `Currently, ${top ? top[0] : 'various'} issues are trending in the community.`;
      } else if (lowerText.includes('score')) {
        botResponse = "The Impact Score (1-100) is calculated by our AI based on Urgency, Reach, and Community Relevance. High scores indicate stories that need immediate institutional attention.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-brand-primary/5 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand-primary p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">StorySasa AI</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/60 uppercase tracking-widest font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-brand-bg/30">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-brand-accent text-white rounded-tr-none' 
                      : 'bg-white text-brand-primary rounded-tl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="p-4 bg-white border-t border-brand-primary/5">
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="px-3 py-1.5 bg-brand-bg text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-brand-primary hover:text-white transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-brand-primary/5 flex gap-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 bg-brand-bg border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend(input)}
              />
              <button 
                onClick={() => handleSend(input)}
                className="p-2 bg-brand-primary text-white rounded-xl hover:bg-brand-accent transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-brand-primary text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-brand-accent transition-colors"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
      </motion.button>
    </div>
  );
}
