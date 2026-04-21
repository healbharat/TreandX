'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, PlusCircle, MoreHorizontal, ChevronLeft, Image as ImageIcon, Video, Mic, Send, Smile, User, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import BottomNav from '@/components/BottomNav';

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/chat/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(data);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchConversations();
  }, [token]);

  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        const { data } = await axios.get(`http://localhost:3001/chat/messages/${activeChat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(data);
      };
      fetchMessages();
    }
  }, [activeChat, token]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMsg = (msg: any) => {
      if (activeChat && msg.conversationId === activeChat._id) {
        setMessages(prev => [...prev, msg]);
      }
      // Update conversations last message
      setConversations(prev => prev.map(c => 
        c._id === msg.conversationId ? { ...c, lastMessage: msg, updatedAt: new Date() } : c
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    };

    socket.on('newMessage', handleNewMsg);
    return () => { socket.off('newMessage', handleNewMsg); };
  }, [socket, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const msg = newMessage;
      setNewMessage('');
      await axios.post('http://localhost:3001/chat/message', {
        conversationId: activeChat._id,
        text: msg,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Send failed', err);
    }
  };

  return (
    <div className="h-screen bg-[#080808] text-white flex overflow-hidden">
      {/* Conversations List */}
      <div className={`w-full sm:w-[350px] border-r border-white/5 flex flex-col ${activeChat ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <h2 className="text-xl font-black italic uppercase tracking-tighter">Signals</h2>
           <button className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all">
              <PlusCircle size={20} />
           </button>
        </div>
        
        <div className="p-4 px-6">
           <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Find frequency..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold focus:outline-none focus:border-primary/50 transition-all"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
           {loading ? (
              <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
           ) : conversations.map((conv) => {
              const otherUser = conv.members.find((m: any) => m._id !== user?._id);
              return (
                <button 
                  key={conv._id}
                  onClick={() => setActiveChat(conv)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-[24px] transition-all group ${activeChat?._id === conv._id ? 'bg-primary/10' : 'hover:bg-white/5'}`}
                >
                   <div className="w-12 h-12 rounded-[18px] overflow-hidden relative border border-white/10">
                      <img src={conv.isGroup ? (conv.groupImage || '/group.png') : otherUser?.profileImage} alt="" className="w-full h-full object-cover" />
                      {!conv.isGroup && <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0c0c0c]" />}
                   </div>
                   <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-0.5">
                         <span className="text-xs font-black uppercase tracking-tighter">{conv.isGroup ? conv.groupName : otherUser?.name}</span>
                         <span className="text-[8px] font-bold text-white/20">{conv.lastMessage ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false }) : ''}</span>
                      </div>
                      <p className="text-[10px] font-medium text-white/40 truncate italic max-w-[150px]">
                         {conv.lastMessage?.text || 'Broadcast connection established.'}
                      </p>
                   </div>
                </button>
              );
           })}
        </div>
      </div>

      {/* Active Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#0c0c0c] ${!activeChat ? 'hidden sm:flex items-center justify-center' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <header className="p-5 px-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-3xl">
               <div className="flex items-center space-x-4">
                  <button onClick={() => setActiveChat(null)} className="sm:hidden p-2 bg-white/5 rounded-xl">
                     <ChevronLeft size={20} />
                  </button>
                  <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                        <img 
                          src={activeChat.isGroup ? (activeChat.groupImage || '/group.png') : activeChat.members.find((m: any) => m._id !== user?._id)?.profileImage} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                     </div>
                     <div>
                        <h4 className="text-xs font-black uppercase tracking-widest">{activeChat.isGroup ? activeChat.groupName : activeChat.members.find((m: any) => m._id !== user?._id)?.name}</h4>
                        <p className="text-[8px] font-black text-green-500 uppercase tracking-widest opacity-80 animate-pulse">Sync active</p>
                     </div>
                  </div>
               </div>
               <button className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                  <MoreHorizontal size={20} />
               </button>
            </header>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
               {messages.map((msg, i) => {
                  const isMe = msg.senderId._id === user?._id;
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-3xl text-sm font-medium leading-relaxed ${isMe ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20' : 'bg-white/5 text-white/80 rounded-tl-none border border-white/10'}`}>
                             {msg.text}
                             {msg.mediaUrl && (
                                <div className="mt-2 rounded-2xl overflow-hidden border border-white/10">
                                   <img src={msg.mediaUrl} alt="" className="max-w-full" />
                                </div>
                             )}
                          </div>
                          <div className="flex items-center space-x-2 mt-2 opacity-30">
                             <span className="text-[9px] font-black uppercase tracking-widest">{formatDistanceToNow(new Date(msg.createdAt))}</span>
                             {isMe && <CheckCheck size={10} className="text-primary" />}
                          </div>
                       </div>
                    </div>
                  );
               })}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-8 pt-4">
               <form onSubmit={sendMessage} className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-[32px] p-2 pl-4 flex-1 group focus-within:border-primary/40 focus-within:bg-white/10 transition-all">
                  <div className="flex items-center space-x-2">
                     <button type="button" className="p-3 text-white/20 hover:text-primary transition-colors"><ImageIcon size={20} /></button>
                     <button type="button" className="p-3 text-white/20 hover:text-primary transition-colors"><Mic size={20} /></button>
                  </div>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Inbound message matrix..." 
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-white/10"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-4 bg-primary text-white rounded-3xl shadow-lg shadow-primary/20 disabled:scale-95 disabled:grayscale transition-all active:scale-90"
                   >
                     <Send size={20} />
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="text-center space-y-6 opacity-20">
             <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto border border-white/10">
                <MessageCircle size={48} strokeWidth={1} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Void link identified. Select signal.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
