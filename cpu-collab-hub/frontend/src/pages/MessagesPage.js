// src/pages/MessagesPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats]           = useState([]);
  const [messages, setMessages]     = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [text, setText]             = useState('');
  const [loadingChats, setLoadingChats]   = useState(true);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [sending, setSending]             = useState(false);
  const bottomRef = useRef(null);
  const BASE = process.env.REACT_APP_API_URL?.replace('/api', '');

  // Load chat list
  const fetchChats = useCallback(async () => {
    try {
      const { data } = await api.get('/messages');
      setChats(data.chats || []);
    } catch { /* silent */ }
    finally { setLoadingChats(false); }
  }, []);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  // If URL has userId, open that chat
  useEffect(() => {
    if (userId) {
      openChatWithUser(userId);
    }
  }, [userId]);

  const openChatWithUser = async (uid) => {
    // Try to get user info from chat list or fetch it
    let chatUser = chats.find(c => c.user._id === uid)?.user;
    if (!chatUser) {
      try {
        const { data } = await api.get(`/users/${uid}`);
        if (data.success) chatUser = data.user;
      } catch { toast.error('User not found'); return; }
    }
    setActiveChat(chatUser);
    loadMessages(uid);
  };

  const loadMessages = async (uid) => {
    setLoadingMsgs(true);
    try {
      const { data } = await api.get(`/messages/${uid}`);
      setMessages(data.messages || []);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoadingMsgs(false); }
  };

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;
    setSending(true);
    try {
      const { data } = await api.post('/messages', { receiverId: activeChat._id, text });
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setText('');
        fetchChats(); // refresh chat list
      }
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-5 h-[calc(100vh-8rem)]">

        {/* ── Sidebar: Chat List ── */}
        <div className={`w-full sm:w-80 flex-shrink-0 card p-0 overflow-hidden flex flex-col ${activeChat ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-display font-bold text-slate-900">Messages</h2>
          </div>

          {loadingChats
            ? <div className="flex-1 flex items-center justify-center"><Spinner /></div>
            : chats.length === 0
              ? <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-slate-600 font-semibold text-sm">No chats yet</p>
                  <p className="text-slate-400 text-xs mt-1">Go to Find Partners to start chatting</p>
                  <button onClick={() => navigate('/find-partners')} className="btn-primary text-xs mt-4 px-4 py-2">Find Partners</button>
                </div>
              : <div className="flex-1 overflow-y-auto">
                  {chats.map(chat => (
                    <button
                      key={chat.user._id}
                      onClick={() => { setActiveChat(chat.user); loadMessages(chat.user._id); navigate(`/messages/${chat.user._id}`); }}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition text-left border-b border-slate-50 ${
                        activeChat?._id === chat.user._id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      {chat.user.profileImage
                        ? <img src={`${BASE}${chat.user.profileImage}`} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                        : <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-bold text-xs shrink-0">
                            {initials(chat.user.name)}
                          </div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{chat.user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{chat.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>
          }
        </div>

        {/* ── Main Chat Window ── */}
        <div className={`flex-1 card p-0 overflow-hidden flex flex-col ${!activeChat ? 'hidden sm:flex' : 'flex'}`}>
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <p className="text-5xl mb-4">💬</p>
              <h3 className="font-display font-bold text-slate-900 text-xl mb-2">Select a conversation</h3>
              <p className="text-slate-500 text-sm mb-6">Choose someone from the list to start chatting, or find new partners.</p>
              <button onClick={() => navigate('/find-partners')} className="btn-primary">Find Partners</button>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
                <button onClick={() => { setActiveChat(null); navigate('/messages'); }} className="sm:hidden text-slate-500 mr-1">←</button>
                {activeChat.profileImage
                  ? <img src={`${BASE}${activeChat.profileImage}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                  : <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-bold text-sm">
                      {initials(activeChat.name)}
                    </div>
                }
                <div>
                  <p className="font-semibold text-slate-800">{activeChat.name}</p>
                  <p className="text-xs text-slate-400">{activeChat.college || 'Student'}</p>
                </div>
                <button onClick={() => navigate(`/profile/${activeChat._id}`)} className="ml-auto text-xs text-indigo-600 hover:underline">View Profile</button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {loadingMsgs
                  ? <Spinner text="Loading messages..." />
                  : messages.length === 0
                    ? <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-3xl mb-2">👋</p>
                        <p className="text-slate-500 text-sm">Say hello to {activeChat.name}!</p>
                      </div>
                    : messages.map((msg, i) => {
                        const isSent = msg.sender._id === currentUser._id || msg.sender === currentUser._id;
                        return (
                          <div key={i} className={`flex ${isSent ? 'justify-end' : 'justify-start'} gap-2`}>
                            {!isSent && (
                              <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-800 shrink-0 self-end">
                                {initials(activeChat.name)}
                              </div>
                            )}
                            <div className="flex flex-col gap-0.5 max-w-xs">
                              <div className={isSent ? 'bubble-sent' : 'bubble-received'}>
                                {msg.text}
                              </div>
                              <span className={`text-xs text-slate-400 ${isSent ? 'text-right' : 'text-left'}`}>
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                }
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex gap-3 p-4 border-t border-slate-100 bg-white">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={`Message ${activeChat.name}...`}
                  className="input flex-1 py-2.5"
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-5 disabled:opacity-40">
                  {sending ? '...' : '➤'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
