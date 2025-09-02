import React, { useRef, useState, useEffect } from 'react';
import '../css/NewChatBot.css';

const presetReplies = () => {
  // Generate 1-3 sentences with varying lengths (iMessage-like cadence)
  const wordBank = [
    'insights','sensors','traffic','equipment','utilization','occupancy','real-time','analytics','gym','dashboard',
    'members','patterns','efficiency','capacity','smart','alerts','forecast','schedule','optimize','peak','quiet',
    'flow','trends','daily','weekly','monthly','overview','live','status','summary','details','report','usage'
  ];
  const sentences = [];
  const sentenceCount = 1 + Math.floor(Math.random() * 3);
  for (let s = 0; s < sentenceCount; s++) {
    const len = 5 + Math.floor(Math.random() * 16); // 5..20 words
    const words = Array.from({ length: len }, () => wordBank[Math.floor(Math.random() * wordBank.length)]);
    const sentence = words.join(' ');
    sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
  }
  return sentences.join(' ');
};

function NewChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), from: 'me', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    setThinking(true);
    const delay = 500 + Math.floor(Math.random() * 1000); // 0.5s–1.5s
    await new Promise((r) => setTimeout(r, delay));

    const reply = presetReplies();
    setThinking(false);
    setMessages((m) => [...m, { id: Date.now() + 1, from: 'bot', text: reply }]);
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newMsgs = files.map((f, idx) => {
      const url = URL.createObjectURL(f);
      return { id: Date.now() + idx, from: 'me', fileName: f.name, fileUrl: url, fileType: f.type };
    });
    setMessages((m) => [...m, ...newMsgs]);
    setThinking(true);
    const delay = 500 + Math.floor(Math.random() * 1000);
    await new Promise((r) => setTimeout(r, delay));
    const reply = presetReplies();
    setThinking(false);
    setMessages((m) => [...m, { id: Date.now() + 999, from: 'bot', text: reply }]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section className="nc-wrapper">
      <div className="nc-panel">
        <div className="nc-header">
          <h2>OnSight Assistant</h2>
        </div>
        <div className="nc-body" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`nc-row ${msg.from === 'me' ? 'from-me' : 'from-bot'}`}>
              {msg.fileUrl ? (
                <div className="nc-bubble"><a href={msg.fileUrl} target="_blank" rel="noreferrer">{msg.fileName}</a></div>
              ) : (
                <div className="nc-bubble">{msg.text}</div>
              )}
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
        </div>
        <form className="nc-input" onSubmit={send}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <div className="nc-icons">
            <button type="button" className="plain-icon attach" aria-label="Attach file" onClick={handleAttachClick}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.44 11.05L12 20.5a6 6 0 11-8.49-8.49l10.6-10.6a4 4 0 115.66 5.66L7.05 20.5" />
              </svg>
            </button>
            <button type="submit" className="plain-icon send" aria-label="Send message">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l18-7-7 18-2-7-7-2z" />
              </svg>
            </button>
          </div>
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} multiple onChange={handleFilesSelected} />
        </form>
      </div>
    </section>
  );
}

export default NewChatBot;


