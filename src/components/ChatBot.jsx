import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import '../css/ChatBot.css';
import '../css/NewChatBot.css';

console.log("chatbot reached");
const backendURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

function ChatBot() {
  const gymId = localStorage.getItem('gymId');
  const navigate = useNavigate();
  const displayName = localStorage.getItem('displayName');
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState(() => {
    const savedChat = JSON.parse(localStorage.getItem('chat') || '[]');
    return savedChat;
  });
  const [downloadCsv, setDownloadCsv] = useState('');
  const messagesEndRef = useRef(null);
  const fetchOnceRef = useRef(false);
  const [thinking, setThinking] = useState(false);
  // Tutorial state and refs
  const [showPrompt, setShowPrompt] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipStyle, setTooltipStyle] = useState({ top: 0, left: 0, transformOrigin: 'top-left', placement: 'below' });
  const trashRef = useRef(null);
  const inputRef = useRef(null);
  const downloadRef = useRef(null);
  const sendRef = useRef(null);
  const [memoryMatrix, setMemoryMatrix] = useState(() => {
    const savedMemory = JSON.parse(localStorage.getItem('memoryMatrix') || '[]');
    return savedMemory;
  });
  const maxMemorySize = 50;

  const pullCSV = async () => {
    try {
      const res = await fetch(`${backendURL}/api/csv/agg?gymId=${gymId}`);
      const csvText = await res.text();
      console.log('CSV generated:', csvText);
      setDownloadCsv(csvText);
    } catch (error) {
      console.error('Error fetching CSV:', error);
    }
  };

  const downloadCSV = () => {
    if (!downloadCsv) {
      console.error('No CSV data available to download');
      return;
    }
    const blob = new Blob([downloadCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const curr = new Date();
    const formattedDate = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
    link.href = url;
    link.setAttribute('download', `gym_data_${displayName}_${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchCSV = async () => {
    try {
      const res = await fetch(`${backendURL}/api/csv/feed-agg?gymId=${gymId}&displayName=${displayName}`);
      const data = await res.json();
      const fullCsv = data.csv || '';
      const reply = data.reply || '';
      console.log('Entire CSV:', fullCsv);
      const csvUserMsg = { sender: 'user', text: 'Sending gym sensor data...' };
      const csvBotMsg = { sender: 'bot', text: reply, csv: fullCsv };
      setMessages(prev => [...prev, csvUserMsg, csvBotMsg]);
      setMemoryMatrix(prev => [
        ...prev,
        { role: 'user', content: `CSV data sent: ${csvUserMsg.text}` },
        { role: 'bot', content: `CSV reply: ${reply}\nCSV:\n${fullCsv}` }
      ].slice(-maxMemorySize * 2));
      } catch (err) {
      console.error('Error fetching CSV:', err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error fetching CSV.' }]);
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    const trimmedMessage = userMessage.trim();
    if (!trimmedMessage) return;
    const userMsg = { sender: 'user', text: trimmedMessage };
    setMessages(prev => [...prev, userMsg]);
    setUserMessage('');
    setThinking(true);
    const updatedMemory = [...memoryMatrix, { role: 'user', content: trimmedMessage }].slice(-maxMemorySize * 2);
    const validMemory = updatedMemory
      .filter(msg => msg.role && typeof msg.content === 'string')
      .map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : msg.role,
        content: msg.content
      }));
    const payload = {
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant with memory. Always consider the previous messages in memory to answer the user prompts. Use the information to provide coherent responses.'
        },
        ...validMemory,
        { role: 'user', content: trimmedMessage }
      ]
    };
    try {
      const res = await fetch(`${backendURL}/api/openai/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      let reply = (data.reply || 'No response from chatbot.').trim();
      reply = reply.replace(/<think>.*?<\/think>/s, ''); 
      const botMsg = { sender: 'bot', text: reply };
      setMessages(prev => [...prev, botMsg]);
      setMemoryMatrix(prev => [...prev, { role: 'user', content: trimmedMessage }].slice(-maxMemorySize * 2));
      setMemoryMatrix(prev => [...prev, { role: 'assistant', content: reply }].slice(-maxMemorySize * 2));
      console.log('Updated memoryMatrix:', memoryMatrix);
    } catch (error) {
      console.error('Error fetching bot response:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error communicating with chatbot.' }]);
    }
    setThinking(false);
  };

  const clearChat = () => {
    setMessages([]);
    setMemoryMatrix([]);
    localStorage.removeItem('chat');
    localStorage.removeItem('memoryMatrix');
    console.log('Chat cleared');
  };

  const back = async () => {
    try {
    navigate('/dashboard');
    } catch (error) {
    console.error('Error navigating back to dashboard:', error);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('chat', JSON.stringify(messages));
    localStorage.setItem('memoryMatrix', JSON.stringify(memoryMatrix));
  }, [messages, memoryMatrix]);

  useEffect(() => {
    if (!fetchOnceRef.current) {
      fetchOnceRef.current = true;
      const userEmail = localStorage.getItem('userEmail');
      const gymId = localStorage.getItem('gymId');
      if (!userEmail || !gymId) {
        navigate('/login');
      } else {
        pullCSV();
        fetchCSV();
      }
      /* // Inject sample markdown messages once for preview/testing formatting
      try {
        const injected = localStorage.getItem('chat_md_samples_injected') === '1';
        if (!injected) {
          const samples = [
            { sender: 'bot', text: '# Weekly Staffing Plan\n\n- **Front Desk**: 1–2 staff\n- **Trainers**: 2–4 staff\n- **Maintenance**: 1 staff\n\n> Adjust counts based on peak windows.' },
            { sender: 'bot', text: '## Peak Hours (Mon–Fri, 5 AM–12 PM)\n\n**Front Desk:** 1–2\n\n**Trainers:**\n\n1. Warm-up area\n2. Free weights\n3. Machines (*Lateral Row*, *Leg Press*)\n\n**Maintenance:** early machine checks' },
            { sender: 'bot', text: '### Notes\n\n- Use asterisks for emphasis: *italic*, **bold**, ***bold-italic***.\n- Dashes vs. asterisks render as lists.\n- Inline code: `npm run dev`.\n\n---\n\nTables (GFM):\n\n| Shift | Front Desk | Trainers | Maint |\n|------:|-----------:|---------:|------:|\n| Morning | 1–2 | 2–3 | 1 |\n| Evening | 2–3 | 3–4 | 1 |' },
            { sender: 'bot', text: 'Edge cases: **multiple***asterisks***in***a***row**, punctuation!!!??, and mixed symbols like (e.g., *lists*) should render cleanly.' }
          ];
          setMessages(prev => [...prev, ...samples]);
          localStorage.setItem('chat_md_samples_injected', '1');
        }
      } catch (e) {
        console.error('Failed injecting markdown samples', e);
      }
      */
      const optedOut = localStorage.getItem('chatbot_tour_optout') === '1';
      const completed = localStorage.getItem('chatbot_tour_completed') === '1';
      if (!optedOut && !completed) {
        setShowPrompt(true);
      }
    }
  }, [navigate]);

  useState(() => {
    console.log('Updated memoryMatrix:', memoryMatrix);
  }, [memoryMatrix]);

  // Guided tour configuration
  const tourSteps = [
    { key: 'trash', ref: trashRef, text: 'Clear Chat: remove the current conversation history.' },
    { key: 'input', ref: inputRef, text: 'Type a message here to talk to OnSight Assistant.' },
    { key: 'download', ref: downloadRef, text: 'Download CSV: export recent sensor data.' },
    { key: 'send', ref: sendRef, text: 'Send: submit your message to the assistant.' },
  ];

  // Recalculate highlight position for the active step
  useEffect(() => {
    if (!tourActive) return;
    const step = tourSteps[tourStep];
    const el = step?.ref?.current;
    if (!el) return;
    const recalc = () => {
      const rect = el.getBoundingClientRect();
      const padding = 10;
      setHighlightStyle({
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
      // Tooltip positioning with viewport clamping and flip
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = Math.min(420, viewportWidth - 32);
      const desiredLeft = Math.min(Math.max(16, rect.left), viewportWidth - tooltipWidth - 16);
      const belowTop = rect.bottom + 12;
      const aboveTop = rect.top - 12; // we'll subtract tooltip height in style
      const placeBelow = belowTop + 120 < viewportHeight; // heuristic
      setTooltipStyle({
        top: placeBelow ? belowTop : aboveTop,
        left: desiredLeft,
        transformOrigin: placeBelow ? 'top-left' : 'bottom-left',
        placement: placeBelow ? 'below' : 'above',
      });
    };
    recalc();
    const id = setInterval(recalc, 250);
    return () => clearInterval(id);
  }, [tourActive, tourStep]);

  const startTour = () => {
    setShowPrompt(false);
    setTourActive(true);
    setTourStep(0);
  };
  const skipTour = () => {
    setShowPrompt(false);
    setTourActive(false);
  };
  const dontShowAgain = () => {
    localStorage.setItem('chatbot_tour_optout', '1');
    skipTour();
  };
  const nextStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      localStorage.setItem('chatbot_tour_completed', '1');
      setTourActive(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <h1>Welcome, {displayName || 'User'}</h1>
          <button onClick={back} className="back-button">
            Return To Dashboard
          </button>
        </div>
      </div>

      {/* New chat appearance below */}
      <section className="nc-wrapper">
        <div className="nc-panel">
          <div className="nc-body">
            {messages.map((msg, index) => (
              <div key={index} className={`nc-row ${msg.sender === 'user' ? 'from-me' : 'from-bot'}`}>
                <div className="nc-bubble">
                  {msg.sender === 'bot' && typeof msg.text === 'string' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="nc-row from-bot">
                <div className="nc-bubble thinking">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="nc-input" onSubmit={handleMessageSubmit}>
            {/* Left-side actions (trash = clear) */}
            <button ref={trashRef} type="button" className="plain-icon" aria-label="Clear chat" onClick={clearChat}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
              </svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <div className="nc-icons">
              {/* Download CSV */}
              <button ref={downloadRef} type="button" className="plain-icon" aria-label="Download CSV" onClick={downloadCSV}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 21h14" />
                </svg>
              </button>
              <button ref={sendRef} type="submit" className="plain-icon send" aria-label="Send message">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l18-7-7 18-2-7-7-2z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </section>
      {showPrompt && !tourActive && (
        <div className="tour-prompt" role="dialog" aria-modal="false">
          <h3>Welcome to OnSight Assistant</h3>
          <p>Would you like a quick tour of the chat controls?</p>
          <div className="tour-actions">
            <button className="tour-btn primary" onClick={startTour}>Start tour</button>
            <button className="tour-btn" onClick={skipTour}>Skip for now</button>
            <button className="tour-btn subtle" onClick={dontShowAgain}>Don't show again</button>
          </div>
        </div>
      )}
      {tourActive && (
        <div className="tour-overlay" role="dialog" aria-modal="true">
          <div className="tour-backdrop" />
          <div
            className="tour-highlight"
            style={{ top: highlightStyle.top, left: highlightStyle.left, width: highlightStyle.width, height: highlightStyle.height }}
          />
          <div
            className={`tour-tooltip ${tooltipStyle.placement === 'above' ? 'above' : 'below'}`}
            style={{ top: tooltipStyle.top, left: tooltipStyle.left }}
          >
            <div className="tour-text">{tourSteps[tourStep]?.text}</div>
            <div className="tour-actions">
              <button className="tour-btn" onClick={skipTour}>Skip</button>
              <button className="tour-btn primary" onClick={nextStep}>{tourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBot;