import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ChatBot.css';

console.log("chatbot reached");
const backendURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

function ChatBot() {
  const gymId = localStorage.getItem('gymId');
  const gymName = localStorage.getItem('gymName');
  const userEmail = localStorage.getItem('userEmail');
  const loginTimestamp = localStorage.getItem('loginTimestamp');
  const gymAffiliated = localStorage.getItem('gymAffiliated');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const displayName = localStorage.getItem('displayName');
  const [userMessage, setUserMessage] = useState('');
  const [botReply, setBotReply] = useState(''); 
  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem('chat');
    return savedChat ? JSON.parse(savedChat) : [];
  });
  const [csv, setCsv] = useState('');

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const gymId = localStorage.getItem('gymId');
    if (!userEmail || !gymId) {
      navigate('/login');
    } else {
      const displayName = localStorage.getItem('displayName');
      setUser({ email: userEmail, displayName });
    }
  }, [navigate]);

  const back = async () => {
    try {
    navigate('/dashboard');
    } catch (error) {
    console.error('Error navigating back to dashboard:', error);
    }
  }

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;  
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    try {
      const res = await fetch(`${backendURL}/api/nvidia/nl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      let reply = data.reply || 'No response from chatbot.';
      reply = reply.replace(/<think>.*?<\/think>/s, ''); 
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
      setUserMessage('');
    } catch (error) {
      console.error('Error fetching bot response:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error communicating with chatbot.' }]);
    }
  };

  const messagesEndRef = useRef(null);

  const pullCSV = async () => {
    try {
      const res = await fetch(`${backendURL}/api/csv/generate?gymId=${gymId}`);
      const csvText = await res.text();
      console.log('CSV generated:', csvText);
      setCsv(csvText);
    } catch (error) {
      console.error('Error fetching CSV:', error);
    }
  };

  const downloadCSV = () => {
    if (!csv) {
      console.error('No CSV data available to download');
      return;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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

  const feedCSV = async () => {
    try {
      const res = await fetch(`${backendURL}/api/csv/feed?gymId=${gymId}&displayName=${displayName}`);
      const data = await res.json();
      let reply = data.reply;
      reply = reply.replace(/<think>.*?<\/think>/s, ''); 
      reply = reply.replace(/^\/?think:?\s*/i, '');
      reply = reply.trim();
      setMessages(prev => [...prev, { sender: 'bot', text: reply}]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error analyzing CSV.' }]);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chat');
    console.log('Chat cleared');
  };

  useEffect(() => {
    localStorage.setItem('chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    console.log('fetching and feeding csv');
    if (user) {
      pullCSV();
      feedCSV();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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