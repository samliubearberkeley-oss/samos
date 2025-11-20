import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Send, Plus, LogOut } from 'lucide-react';
import { useAuth, useUser, SignInButton, SignUpButton, SignedIn, SignedOut } from '@insforge/react';
import { createClient } from '@insforge/sdk';
import ReactMarkdown from 'react-markdown';

export const ChatApp = () => {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const [conversations, setConversations] = useState([
    { id: '1', title: 'New Chat', messages: [{ role: 'assistant', content: '👋 Hello! I\'m ChatGPT. How can I help you today?' }] }
  ]);
  const [currentConversationId, setCurrentConversationId] = useState('1');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredConversationId, setHoveredConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId) || conversations[0];
  const messages = currentConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations from database when user signs in
  useEffect(() => {
    const loadConversations = async () => {
      if (!isSignedIn || !user || !isLoaded) return;

      try {
        const client = createClient({
          baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL || 'https://nsir3ccz.us-east.insforge.app',
          anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || ''
        });

        // Load conversations
        const { data: conversationsData, error: convError } = await client.database
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(100);

        if (convError) {
          console.error('Error loading conversations:', convError);
          return;
        }

        if (conversationsData && conversationsData.length > 0) {
          // Load messages for each conversation
          const conversationsWithMessages = await Promise.all(
            conversationsData.map(async (conv) => {
              const { data: messagesData, error: msgError } = await client.database
                .from('messages')
                .select('*')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: true })
                .limit(1000);

              if (msgError) {
                console.error('Error loading messages:', msgError);
                return {
                  id: conv.id,
                  title: conv.title,
                  messages: [{ role: 'assistant', content: '👋 Hello! I\'m ChatGPT. How can I help you today?' }]
                };
              }

              return {
                id: conv.id,
                title: conv.title,
                messages: messagesData && messagesData.length > 0
                  ? messagesData.map(msg => ({ role: msg.role, content: msg.content }))
                  : [{ role: 'assistant', content: '👋 Hello! I\'m ChatGPT. How can I help you today?' }]
              };
            })
          );

          setConversations(conversationsWithMessages);
          if (conversationsWithMessages.length > 0) {
            setCurrentConversationId(conversationsWithMessages[0].id);
          } else {
            // Create default conversation if none exist
            const defaultId = Date.now().toString();
            const defaultConversation = {
              id: defaultId,
              title: 'New Chat',
              messages: [{ role: 'assistant', content: '👋 Hello! I\'m ChatGPT. How can I help you today?' }]
            };
            setConversations([defaultConversation]);
            setCurrentConversationId(defaultId);
          }
        } else {
          // Create default conversation if none exist
          const defaultId = Date.now().toString();
          const defaultConversation = {
            id: defaultId,
            title: 'New Chat',
            messages: [{ role: 'assistant', content: '👋 Hello! I\'m ChatGPT. How can I help you today?' }]
          };
          setConversations([defaultConversation]);
          setCurrentConversationId(defaultId);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        // Create default conversation on error
        const defaultId = Date.now().toString();
        const defaultConversation = {
          id: defaultId,
          title: 'New Chat',
          messages: [{ role: 'assistant', content: '👋 Hello! I\'m ChatGPT. How can I help you today?' }]
        };
        setConversations([defaultConversation]);
        setCurrentConversationId(defaultId);
      }
    };

    loadConversations();
  }, [isSignedIn, user, isLoaded]);

  const handleDeleteMessage = async (index) => {
    if (!isSignedIn || !user) return;

    const messageToDelete = messages[index];
    if (!messageToDelete) return;

    // Delete from database
    try {
      const client = createClient({
        baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL || 'https://nsir3ccz.us-east.insforge.app',
        anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || ''
      });

      // Find and delete the message from database
      const { data: messagesData } = await client.database
        .from('messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true });

      if (messagesData && messagesData[index]) {
        await client.database
          .from('messages')
          .delete()
          .eq('id', messagesData[index].id);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }

    // Update local state
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId 
        ? { ...conv, messages: conv.messages.filter((_, i) => i !== index) }
        : conv
    ));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: [{ role: 'assistant', content: '👋 Hello! I\'m ChatGPT. How can I help you today?' }] }
          : conv
      ));
    }
  };

  const handleNewConversation = async () => {
    if (!isSignedIn || !user) return;
    
    const newId = Date.now().toString();
    const newConversation = {
      id: newId,
      title: 'New Chat',
      messages: [{ role: 'assistant', content: '👋 Hello! I\'m ChatGPT. How can I help you today?' }]
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newId);

    // Save conversation to database
    try {
      const client = createClient({
        baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL || 'https://nsir3ccz.us-east.insforge.app',
        anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || ''
      });

      await client.database.from('conversations').insert([{
        id: newId,
        user_id: user.id,
        title: 'New Chat'
      }]);
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (conversations.length === 1) {
      alert('Cannot delete the last conversation');
      return;
    }
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      // Delete from database
      try {
        const client = createClient({
          baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL || 'https://nsir3ccz.us-east.insforge.app',
          anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || ''
        });

        // Delete messages first (CASCADE should handle this, but explicit delete is safer)
        await client.database
          .from('messages')
          .delete()
          .eq('conversation_id', conversationId);

        // Delete conversation
        await client.database
          .from('conversations')
          .delete()
          .eq('id', conversationId);
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (conversationId === currentConversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        setCurrentConversationId(remaining[0]?.id || '1');
      }
    }
  };

  const handleSelectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
  };

  const updateConversationTitle = (conversationId, title) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, title } : conv
    ));
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        if (signOut) {
          await signOut();
        } else {
          // Fallback: use SDK to sign out
          const client = createClient({
            baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL || 'https://nsir3ccz.us-east.insforge.app',
            anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || ''
          });
          await client.auth.signOut();
          // Reload page to clear state
          window.location.reload();
        }
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading || !isSignedIn || !user) return;

    const currentMessage = inputMessage.trim();
    const userMessage = { role: 'user', content: currentMessage };
    
    // Update conversation with user message
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId 
        ? { ...conv, messages: [...conv.messages, userMessage] }
        : conv
    ));
    
    // Update title if it's the first user message
    if (messages.length === 1) {
      const title = currentMessage.length > 30 ? currentMessage.substring(0, 30) + '...' : currentMessage;
      updateConversationTitle(currentConversationId, title);
    }
    
    setInputMessage('');
    setIsLoading(true);

    const client = createClient({
      baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL || 'https://nsir3ccz.us-east.insforge.app',
      anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || ''
    });

    try {
      // Save user message to database
      const userMessageId = `${Date.now()}-user`;
      await client.database.from('messages').insert([{
        id: userMessageId,
        conversation_id: currentConversationId,
        role: 'user',
        content: currentMessage
      }]);

      // Ensure conversation exists in database
      const { data: existingConv } = await client.database
        .from('conversations')
        .select('id')
        .eq('id', currentConversationId)
        .single();
      
      if (!existingConv) {
        await client.database.from('conversations').insert([{
          id: currentConversationId,
          user_id: user.id,
          title: messages.length === 1 ? (currentMessage.length > 30 ? currentMessage.substring(0, 30) + '...' : currentMessage) : 'New Chat'
        }]);
      } else if (messages.length === 1) {
        // Update conversation title
        const title = currentMessage.length > 30 ? currentMessage.substring(0, 30) + '...' : currentMessage;
        await client.database
          .from('conversations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', currentConversationId);
      }

      const completion = await client.ai.chat.completions.create({
        model: 'openai/gpt-4o',
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: currentMessage }
        ],
        temperature: 0.7,
        stream: false
      });

      const assistantMessage = {
        role: 'assistant',
        content: completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.'
      };
      
      // Save assistant message to database
      const assistantMessageId = `${Date.now()}-assistant`;
      await client.database.from('messages').insert([{
        id: assistantMessageId,
        conversation_id: currentConversationId,
        role: 'assistant',
        content: assistantMessage.content
      }]);

      // Update conversation with assistant message
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: [...conv.messages, assistantMessage] }
          : conv
      ));

      // Update conversation updated_at
      await client.database
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversationId);
    } catch (error) {
      console.error('AI Error:', error);
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: [...conv.messages, {
              role: 'assistant',
              content: 'Sorry, an error occurred. Please try again later.'
            }] }
          : conv
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full text-sm font-sans">
      {/* Sidebar */}
      <div 
        className={`bg-[#e8e8e8] border-r border-[#b4b4b4] flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-12' : 'w-64'
        }`}
      >
        {!sidebarCollapsed && (
          <>
            <div className="p-3 border-b border-[#b4b4b4]">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-gray-700">ChatGPT</div>
                <button
                  onClick={handleNewConversation}
                  className="p-1.5 rounded hover:bg-[#d4d4d4] transition-colors"
                  title="New Chat"
                >
                  <Plus size={16} className="text-gray-700" />
                </button>
              </div>
              <SignedIn>
                <div className="px-3 py-1.5 text-white rounded text-xs mb-2" style={{ background: 'linear-gradient(to bottom, #3875d7 0%, #2a5db0 100%)', border: '1px solid #1e4a8a' }}>
                  {user?.email || 'User'}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-3 py-1.5 text-xs font-bold cursor-pointer hover:bg-[#ff5f57] hover:text-white rounded transition-colors flex items-center justify-center gap-1 border border-[#b4b4b4]"
                  style={{ color: '#0050cd' }}
                  title="Sign out"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </SignedIn>
              <SignedOut>
                <div className="px-3 py-1.5 bg-[#c8c8c8] text-gray-700 rounded text-xs border border-[#b4b4b4]">
                  Not signed in
                </div>
              </SignedOut>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`mb-2 p-2 rounded cursor-pointer group relative ${
                    currentConversationId === conv.id
                      ? 'bg-[#3875d7] text-white'
                      : 'hover:bg-[#d4d4d4] text-gray-700'
                  }`}
                  onClick={() => handleSelectConversation(conv.id)}
                  onMouseEnter={() => setHoveredConversationId(conv.id)}
                  onMouseLeave={() => setHoveredConversationId(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 truncate text-xs font-medium pr-6">
                      {conv.title}
                    </div>
                    {hoveredConversationId === conv.id && (
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#ff5f57] hover:text-white transition-colors"
                        title="Delete conversation"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 border-t border-[#b4b4b4] hover:bg-[#d4d4d4] transition-colors flex items-center justify-center"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={16} className="text-gray-700" />
          ) : (
            <ChevronLeft size={16} className="text-gray-700" />
          )}
        </button>
      </div>
      <div className="flex-1 flex flex-col bg-white">
        <div className="h-8 border-b border-[#b4b4b4] flex items-center justify-between px-3" style={{ background: 'linear-gradient(to bottom, #f6f6f6 0%, #e0e0e0 100%)' }}>
          <span className="font-bold text-gray-700">ChatGPT</span>
          <SignedOut>
            <div className="flex gap-2">
              <SignInButton>
                <span className="text-xs font-bold cursor-pointer hover:bg-[#3875d7] hover:text-white px-2 py-1 rounded" style={{ color: '#0050cd' }}>Sign In</span>
              </SignInButton>
              <SignUpButton>
                <span className="text-xs font-bold cursor-pointer hover:bg-[#3875d7] hover:text-white px-2 py-1 rounded" style={{ color: '#0050cd' }}>Sign Up</span>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs font-bold cursor-pointer hover:bg-[#ff5f57] hover:text-white px-2 py-1 rounded transition-colors"
                  style={{ color: '#0050cd' }}
                  title="Clear all messages"
                >
                  Clear All
                </button>
              )}
              <span className="text-xs font-bold text-gray-700">{user?.email || 'Signed in'}</span>
              <button
                onClick={handleSignOut}
                className="text-xs font-bold cursor-pointer hover:bg-[#ff5f57] hover:text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                style={{ color: '#0050cd' }}
                title="Sign out"
              >
                <LogOut size={12} />
                Sign Out
              </button>
            </div>
          </SignedIn>
        </div>
        <div className="flex-1 p-6 overflow-y-auto" style={{ background: 'repeating-linear-gradient(to right, #f5f5f5, #f5f5f5 2px, #ffffff 2px, #ffffff 4px)' }}>
          {!isLoaded ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : !isSignedIn ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-gray-600 text-center">Please sign in to use ChatGPT</p>
              <div className="flex gap-2">
                <SignInButton>
                  <button className="px-4 py-2 text-white rounded hover:brightness-90 shadow-sm" style={{ background: 'linear-gradient(to bottom, #3875d7 0%, #2a5db0 100%)', border: '1px solid #1e4a8a' }}>
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="px-4 py-2 text-white rounded hover:brightness-90 shadow-sm" style={{ background: 'linear-gradient(to bottom, #3875d7 0%, #2a5db0 100%)', border: '1px solid #1e4a8a' }}>
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                  onMouseEnter={() => setHoveredMessageIndex(idx)}
                  onMouseLeave={() => setHoveredMessageIndex(null)}
                >
                  <div className="relative">
                    <div
                      className={`rounded-2xl px-3 py-2 shadow-sm ${
                        msg.role === 'user'
                          ? 'text-white rounded-tr-none'
                          : 'bg-white border border-[#b4b4b4] rounded-tl-none max-w-[90%]'
                      }`}
                      style={{ 
                        ...(msg.role === 'user' ? { 
                          background: 'linear-gradient(to bottom, #3875d7 0%, #2a5db0 100%)', 
                          border: '1px solid #1e4a8a',
                          display: 'inline-block'
                        } : {
                          display: 'inline-block',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          maxWidth: '90%'
                        })
                      }}
                    >
                      <div className="text-sm" style={{ 
                        color: msg.role === 'user' ? 'white' : '#1f2937', 
                        whiteSpace: msg.role === 'user' ? 'pre' : 'pre-wrap',
                        wordBreak: msg.role === 'user' ? 'keep-all' : 'break-word',
                        overflowWrap: msg.role === 'user' ? 'normal' : 'break-word'
                      }}>
                        {msg.role === 'user' ? (
                          <span>{msg.content}</span>
                        ) : (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p style={{ marginBottom: '0.25rem', marginTop: 0, lineHeight: '1.4', display: 'inline' }} className="last:mb-0">{children}</p>,
                            code: ({ inline, children, ...props }) => {
                              if (inline) {
                                return (
                                  <code 
                                    style={{ 
                                      padding: '0.125rem 0.25rem',
                                      borderRadius: '0.25rem',
                                      fontSize: '0.75rem',
                                      fontFamily: 'monospace',
                                      backgroundColor: msg.role === 'user' ? 'rgba(0,0,0,0.2)' : '#f1f5f9',
                                      color: msg.role === 'user' ? '#e0e7ff' : '#1e293b'
                                    }}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }
                              return (
                                <code 
                                  style={{ 
                                    display: 'block',
                                    padding: '0.5rem',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem',
                                    fontFamily: 'monospace',
                                    overflowX: 'auto',
                                    backgroundColor: msg.role === 'user' ? 'rgba(0,0,0,0.2)' : '#f1f5f9',
                                    color: msg.role === 'user' ? '#e0e7ff' : '#1e293b',
                                    marginBottom: '0.5rem'
                                  }}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                            pre: ({ children }) => (
                              <pre style={{ marginBottom: '0.5rem', marginTop: 0, borderRadius: '0.25rem', overflowX: 'auto' }}>{children}</pre>
                            ),
                            ul: ({ children }) => <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '0.5rem', marginTop: 0 }}>{children}</ul>,
                            ol: ({ children }) => <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5rem', marginBottom: '0.5rem', marginTop: 0 }}>{children}</ol>,
                            li: ({ children }) => <li style={{ marginBottom: '0.25rem' }}>{children}</li>,
                            h1: ({ children }) => <h1 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: 0 }}>{children}</h1>,
                            h2: ({ children }) => <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: 0 }}>{children}</h2>,
                            h3: ({ children }) => <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: 0 }}>{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote style={{ 
                                borderLeft: `2px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.3)' : '#d1d5db'}`,
                                paddingLeft: '0.75rem',
                                fontStyle: 'italic',
                                margin: '0.5rem 0'
                              }}>
                                {children}
                              </blockquote>
                            ),
                            a: ({ children, href }) => (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ 
                                  textDecoration: 'underline',
                                  color: msg.role === 'user' ? '#a3c2ff' : '#3875d7'
                                }}
                                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.target.style.opacity = '1'}
                              >
                                {children}
                              </a>
                            ),
                            strong: ({ children }) => <strong style={{ fontWeight: 'bold' }}>{children}</strong>,
                            em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                            hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.3)' : '#d1d5db'}`, margin: '0.75rem 0' }} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                        )}
                      </div>
                    </div>
                    {hoveredMessageIndex === idx && idx > 0 && (
                      <button
                        onClick={() => handleDeleteMessage(idx)}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-sm flex items-center justify-center hover:brightness-90 transition-colors"
                        title="Delete message"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="bg-white border border-[#b4b4b4] rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
                    <span className="text-gray-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <SignedIn>
          <div className="border-t border-[#b4b4b4] p-4 flex gap-3" style={{ background: '#f6f6f6' }}>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 border border-[#b4b4b4] rounded focus:outline-none focus:ring-2 shadow-sm placeholder:text-gray-400"
              style={{ 
                background: 'white', 
                color: '#1f2937',
                caretColor: '#3875d7'
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading}
              className="px-5 py-2.5 text-white rounded shadow-sm hover:brightness-90 disabled:bg-[#c8c8c8] disabled:cursor-not-allowed flex items-center gap-2"
              style={{ background: !inputMessage.trim() || isLoading ? '#c8c8c8' : 'linear-gradient(to bottom, #3875d7 0%, #2a5db0 100%)', border: !inputMessage.trim() || isLoading ? '1px solid #b4b4b4' : '1px solid #1e4a8a' }}
            >
              <Send size={16} />
            </button>
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

