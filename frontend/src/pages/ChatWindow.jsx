import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getChatList, getChatMessages, sendChatMessage, getProjectDetails, updateMessageStatus, deleteMessage, editMessage, getAllProjects, getProjects } from '../utils/api';
import './ChatWindow.css';

const ChatWindow = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [chatList, setChatList] = useState([]);
  const [filteredChatList, setFilteredChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [projectDetails, setProjectDetails] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const messagesEndRef = useRef(null);
  const { user, loading } = useSelector((state) => state.auth);

  if (!loading && !user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        // Try to fetch from admin projects first
        let projects = await getAllProjects();
        let project = projects.find(p => p._id === projectId);
        if (!project && user.role === 'Project Manager') {
          // If not found and user is PM, fetch PM projects
          projects = await getProjects(user.username);
          project = projects.find(p => p._id === projectId);
        }
        setProjectDetails(project);
      } catch (error) {
        console.error('Failed to fetch project details');
      }
    };
    fetchProjectDetails();
  }, [projectId, user]);

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const data = await getChatList(projectId, user.username);
        setChatList(data);
        setFilteredChatList(data);
        if (data.length > 0 && !selectedChat) {
          setSelectedChat(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch chat list');
      }
    };
    fetchChatList();
  }, [projectId, user.username]);

  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          let chatId = selectedChat.id;
          if (selectedChat.type === 'individual') {
            // For individual chats, extract the username from the id
            chatId = selectedChat.id.replace('individual_', '');
          }
          const data = await getChatMessages(projectId, selectedChat.type, chatId, user.username);
          // Mark messages as read if not sent by current user
          const updatedMessages = await Promise.all(data.map(async (msg) => {
            if (msg.sender !== user.username && msg.status !== 'read') {
              try {
                await updateMessageStatus(msg._id, 'read');
                return { ...msg, status: 'read' };
              } catch (error) {
                console.error('Failed to update message status:', error);
              }
            }
            return msg;
          }));
          setMessages(updatedMessages);
        } catch (error) {
          console.error('Failed to fetch messages');
        }
      };
      fetchMessages();
    }
  }, [projectId, selectedChat, user.username]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedChat) {
        const fetchMessages = async () => {
          try {
            let chatId = selectedChat.id;
            if (selectedChat.type === 'individual') {
              // For individual chats, extract the username from the id
              chatId = selectedChat.id.replace('individual_', '');
            }
            const data = await getChatMessages(projectId, selectedChat.type, chatId, user.username);
            // Mark messages as read if not sent by current user
            const updatedMessages = await Promise.all(data.map(async (msg) => {
              if (msg.sender !== user.username && msg.status !== 'read') {
                try {
                  await updateMessageStatus(msg._id, 'read');
                  return { ...msg, status: 'read' };
                } catch (error) {
                  console.error('Failed to update message status:', error);
                }
              }
              return msg;
            }));
            setMessages(updatedMessages);
          } catch (error) {
            console.error('Failed to fetch messages');
          }
        };
        fetchMessages();
      }
    }, 2000); // Poll every 2 seconds for real-time updates

    return () => clearInterval(interval);
  }, [projectId, selectedChat, user.username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const filtered = chatList.filter(chat =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChatList(filtered);
  }, [searchTerm, chatList]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedChat) return;
    try {
      let chatId = selectedChat.id;
      if (selectedChat.type === 'individual') {
        // For individual chats, extract the username from the id
        chatId = selectedChat.id.replace('individual_', '');
      }
      const messageData = await sendChatMessage(projectId, selectedChat.type, chatId, user.username, newMessage);
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId, user.username);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (error) {
      console.error('Failed to delete message');
    }
  };

  const handleEditMessage = async (messageId, newMessage) => {
    try {
      const updatedMessage = await editMessage(messageId, user.username, newMessage);
      setMessages(prev => prev.map(msg => msg._id === messageId ? updatedMessage : msg));
      setEditingMessage(null);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to edit message');
    }
  };

  const toggleDropdown = (messageId) => {
    setOpenDropdown(openDropdown === messageId ? null : messageId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-window">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>{projectDetails ? projectDetails.name : 'Project Chats'}</h2>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="chat-list">
          {filteredChatList.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="chat-name">{chat.name}</div>
              <div className="chat-type">{chat.type}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <h2>{selectedChat.name}</h2>
                  {selectedChat.type === 'group' && projectDetails && (
                    <p>Members: {selectedChat.participants.join(', ')}</p>
                  )}
                </div>
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease, transform 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
                  onClick={() => navigate(`/cards/${projectId}`)}
                >
                  Cards
                </button>
              </div>
            </div>
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender === user.username ? 'own' : ''}`}>
                  {selectedChat.type !== 'individual' && <strong>{msg.sender}:</strong>} {msg.message}
                  {msg.sender === user.username && (
                    <div className="message-actions">
                      <button className="dropdown-arrow" onClick={() => toggleDropdown(msg._id)}>▼</button>
                      {openDropdown === msg._id && (
                        <div className="dropdown-menu">
                          <button onClick={() => { handleDeleteMessage(msg._id); setOpenDropdown(null); }}>Delete</button>
                          <button onClick={() => { setEditingMessage(msg._id); setNewMessage(msg.message); setOpenDropdown(null); }}>Edit</button>
                        </div>
                      )}
                      <span className={`status-tick ${msg.status}`}>
                        {msg.status === 'sent' ? '✓' : msg.status === 'delivered' ? '✓✓' : msg.status === 'read' ? '✓✓' : ''}
                      </span>
                    </div>
                  )}
                  <br />
                  <small>{new Date(msg.timestamp).toLocaleString()}</small>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input">
              {editingMessage ? (
                <>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEditMessage(editingMessage, newMessage)}
                    placeholder="Edit your message..."
                  />
                  <button onClick={() => handleEditMessage(editingMessage, newMessage)}>Save</button>
                  <button onClick={() => { setEditingMessage(null); setNewMessage(''); }}>Cancel</button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                  />
                  <button onClick={handleSendMessage}>Send</button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
