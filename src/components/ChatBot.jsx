import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ChatBot.css';

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
    }
  }, [navigate]);

  useState(() => {
    console.log('Updated memoryMatrix:', memoryMatrix);
  }, [memoryMatrix]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <h1>Welcome, {displayName || 'User'}</h1>
          <button onClick={back} className="back-button">
            Return To Dashboard
          </button>
          <button onClick={downloadCSV} className="download-csv-button">
            Download CSV
          </button>
        </div>
      </div>

      <button onClick={clearChat} className="clear-chat-button">
        Clear Chat
      </button>

      <div className="chat-body">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender === 'user' ? 'userMessage' : 'botMessage'}>
              <strong>{msg.sender === 'user' ? 'You' : 'Bot'}: </strong>
              {msg.sender === 'bot' ? (
                typeof msg.text === 'string'
                  ? msg.text.split(/(?<=[.?!])\s+/).map((sentence, i) => <div key={i}>{sentence}</div>)
                  : <div>{JSON.stringify(msg.text)}</div>
              ) : (
                msg.text
              )}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />

        {/* Message input and send button */}
        <form onSubmit={handleMessageSubmit} className="chat-form">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="chat-input"
          />
          <button type="submit" className="send-button">Send</button>
        </form>
      </div>
    </div>
  );
}

export default ChatBot;