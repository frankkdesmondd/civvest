import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiSend } from 'react-icons/fi';

interface Message {
  id: string;
  content: string;
  senderRole: string;
  createdAt: string;
  sender: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  amount: number;
  status: string;
  investment: {
    title: string;
  };
}

interface ChatModalProps {
  application: Application;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ application, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`https://civvest-backend.onrender.com/api/messages/${application.id}`, {
        withCredentials: true
      });
      setMessages(res.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      await axios.post('https://civvest-backend.onrender.com/api/messages', {
        applicationId: application.id,
        content: newMessage
      }, { withCredentials: true });
      
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-lg">{application.firstName} {application.lastName}</h3>
            <p className="text-sm text-gray-600">{application.investment.title} - ${application.amount.toFixed(2)}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-full transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.senderRole === user?.role ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                  msg.senderRole === user?.role 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-800 border'
                }`}>
                  <p className="text-xs font-semibold mb-1 opacity-75">
                    {msg.sender.firstName} {msg.sender.lastName} ({msg.senderRole})
                  </p>
                  <p className="wrap-break-words">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiSend />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
