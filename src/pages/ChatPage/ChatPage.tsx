import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../../supabaseClient';
import styles from './ChatPage.module.css';
import { 
  Plus, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Lightbulb,
  Send,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ChevronLeft,
  MoreVertical,
  Clock,
  Download,
  Share2,
  Star
} from 'lucide-react';

const MODEL_CONFIG = {
  name: 'deepseek/deepseek-v3.2',
  context: 'business-consultant',
  temperature: 0.7,
  max_tokens: 2000
};

const BUSINESS_TOPICS = [
  {
    title: "Стартап",
    icon: <Sparkles size={20} />,
    color: "linear-gradient(135deg, #8B5CF6, #EC4899)",
    questions: [
      "Как привлечь инвесторов для стартапа?",
      "Составь бизнес-план для SaaS продукта",
      "Как провести MVP тестирование?"
    ]
  },
  {
    title: "Маркетинг",
    icon: <Target size={20} />,
    color: "linear-gradient(135deg, #3B82F6, #06B6D4)",
    questions: [
      "Разработай стратегию продвижения в соцсетях",
      "Как увеличить конверсию на сайте?",
      "Создай план контент-маркетинга"
    ]
  },
  {
    title: "Финансы",
    icon: <TrendingUp size={20} />,
    color: "linear-gradient(135deg, #10B981, #84CC16)",
    questions: [
      "Как оптимизировать финансовые потоки?",
      "Рассчитай точки безубыточности",
      "Составь финансовую модель"
    ]
  },
  {
    title: "Стратегия",
    icon: <Brain size={20} />,
    color: "linear-gradient(135deg, #F59E0B, #EF4444)",
    questions: [
      "Проведи SWOT анализ для моего бизнеса",
      "Как выйти на новые рынки?",
      "Разработай стратегию масштабирования"
    ]
  }
];

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
  chat_id: string;
  feedback?: 'positive' | 'negative';
}

const askGPT = async (prompt: string, context: string = '') => {
  try {
    const systemPrompt = `Ты опытный бизнес-консультант. Используй Markdown для форматирования: выделяй важные мысли **жирным**, используй заголовки (###) для разделения тем, и списки для перечислений. ${context}`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Business AI Coach'
      },
      body: JSON.stringify({
        model: MODEL_CONFIG.name,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: MODEL_CONFIG.temperature,
        max_tokens: MODEL_CONFIG.max_tokens
      }),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.choices[0]?.message?.content || 'Не удалось получить ответ';
  } catch (error) {
    console.error('GPT Error:', error);
    return 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.';
  }
};

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatTitle, setChatTitle] = useState('Новый чат');
  const [isTyping, setIsTyping] = useState(false);
  const [showTopicMenu, setShowTopicMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        setHasNewMessages(!isAtBottom);
      }
    };

    const chatMessages = containerRef.current;
    if (chatMessages) {
      chatMessages.addEventListener('scroll', handleScroll);
      return () => chatMessages.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const loadChatData = async () => {
      if (!id) {
        createNewChat();
        return;
      }
      try {
        const { data: chatData } = await supabase
          .from('chats')
          .select('*')
          .eq('id', id)
          .single();

        if (chatData) setChatTitle(chatData.title || 'Безымянный чат');

        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', id)
          .order('created_at', { ascending: true });

        setMessages(messagesData || []);
      } catch (error) {
        console.error('Error loading chat:', error);
      }
    };
    loadChatData();
  }, [id]);

  const createNewChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    const { data, error } = await supabase
      .from('chats')
      .insert({ user_id: user.id, title: 'Новый бизнес-чат' })
      .select()
      .single();

    if (error) return;
    navigate(`/chat/${data.id}`);
  };

  const updateChatTitle = async (newTitle: string) => {
    if (!id) return;
    const { error } = await supabase.from('chats').update({ title: newTitle }).eq('id', id);
    if (!error) setChatTitle(newTitle);
  };

  const handleSend = async () => {
    if (!message.trim() || !id || loading) return;
    const userMessage = message;
    setMessage('');
    setLoading(true);

    try {
      const { data: userMsg } = await supabase
        .from('messages')
        .insert({ chat_id: id, content: userMessage, role: 'user' })
        .select().single();

      if (userMsg) {
        setMessages(prev => [...prev, userMsg]);
        if (messages.length === 0) {
          const firstWords = userMessage.split(' ').slice(0, 4).join(' ');
          updateChatTitle(firstWords.length > 3 ? firstWords : 'Бизнес-консультация');
        }

        const context = messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
        setIsTyping(true);
        const gptReplyText = await askGPT(userMessage, context);
        setIsTyping(false);

        const { data: gptMsg } = await supabase
          .from('messages')
          .insert({ chat_id: id, content: gptReplyText, role: 'assistant' })
          .select().single();

        if (gptMsg) setMessages(prev => [...prev, gptMsg]);
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      
      if (!isListening) {
        recognition.start();
        setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessage(prev => prev + transcript);
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
      }
    } else {
      alert('Голосовой ввод не поддерживается');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Можно добавить уведомление о копировании
  };

  const sendFeedback = async (messageId: string, type: 'positive' | 'negative') => {
    const { error } = await supabase
      .from('messages')
      .update({ feedback: type })
      .eq('id', messageId);

    if (!error) {
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, feedback: type } : msg));
    }
  };

  const regenerateResponse = async (lastUserMessage: Message) => {
    if (!id) return;
    setLoading(true);
    try {
      const lastGptMessage = messages[messages.length - 1];
      if (lastGptMessage.role === 'assistant') {
        await supabase.from('messages').delete().eq('id', lastGptMessage.id);
        setMessages(prev => prev.slice(0, -1));
      }
      setMessage(lastUserMessage.content);
      await handleSend();
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasNewMessages(false);
  };

  const handleTopicSelect = (question: string) => {
    setMessage(question);
    setTimeout(() => inputRef.current?.focus(), 100);
    setShowTopicMenu(false);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  const exportChat = () => {
    const chatContent = messages.map(msg => `${msg.role === 'user' ? 'Вы' : 'Ассистент'}: ${msg.content}`).join('\n\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chatTitle}.txt`;
    a.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.ambientBackground}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={() => navigate('/')}>
            <ChevronLeft size={24} />
          </button>
          
          <div className={styles.chatInfo}>
            <div className={styles.chatIcon}>
              <Brain size={18} />
            </div>
            <div className={styles.chatDetails}>
              <input
                type="text"
                value={chatTitle}
                onChange={(e) => updateChatTitle(e.target.value)}
                className={styles.chatTitleInput}
                placeholder="Название чата"
              />
              <div className={styles.chatMeta}>
                <Clock size={12} />
                <span className={styles.chatStats}>{messages.length} сообщений</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button 
            className={`${styles.actionButton} ${showTopicMenu ? styles.active : ''}`}
            onClick={() => setShowTopicMenu(!showTopicMenu)}
          >
            <Sparkles size={18} />
          </button>
          
          <button className={styles.actionButton} onClick={exportChat}>
            <Download size={18} />
          </button>
          
          <button 
            className={`${styles.actionButton} ${showSettingsMenu ? styles.active : ''}`}
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          >
            <MoreVertical size={18} />
          </button>
        </div>

        {showTopicMenu && (
          <div className={styles.topicsDropdown}>
            <div className={styles.dropdownHeader}>
              <h3>Быстрый старт</h3>
              <button onClick={() => setShowTopicMenu(false)}>×</button>
            </div>
            <div className={styles.topicList}>
              {BUSINESS_TOPICS.map((topic, index) => (
                <div key={index} className={styles.topicDropdownItem}>
                  <div className={styles.topicIcon} style={{ background: topic.color }}>
                    {topic.icon}
                  </div>
                  <div className={styles.topicContent}>
                    <h4>{topic.title}</h4>
                    <div className={styles.topicQuestions}>
                      {topic.questions.map((q, qIndex) => (
                        <button
                          key={qIndex}
                          className={styles.questionOption}
                          onClick={() => handleTopicSelect(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showSettingsMenu && (
          <div className={styles.settingsMenu}>
            <button className={styles.menuItem} onClick={createNewChat}>
              <Plus size={16} /> Новый чат
            </button>
            <button className={styles.menuItem} onClick={exportChat}>
              <Download size={16} /> Экспорт чата
            </button>
            <button className={styles.menuItem}>
              <Share2 size={16} /> Поделиться
            </button>
            <button className={styles.menuItem}>
              <Star size={16} /> Избранное
            </button>
          </div>
        )}
      </header>

      <main className={styles.mainContent}>
        <div className={styles.chatContainer} ref={containerRef}>
          {messages.length === 0 ? (
            <div className={styles.welcomeSection}>
              <div className={styles.welcomeCard}>
                
                
                <div className={styles.suggestions}>
                  <h3>Популярные запросы:</h3>
                  <div className={styles.suggestionGrid}>
                    {BUSINESS_TOPICS.flatMap(topic => topic.questions.slice(0, 2)).map((question, index) => (
                      <button
                        key={index}
                        className={styles.suggestionCard}
                        onClick={() => handleTopicSelect(question)}
                      >
                        <span>{question}</span>
                        <Sparkles size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.chatMessages}>
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`${styles.messageContainer} ${msg.role === 'assistant' ? styles.assistantMessage : styles.userMessage}`}
                >
                  <div className={styles.messageAvatar}>
                    {msg.role === 'assistant' ? (
                      <div className={styles.avatarBot}>
                        <Bot size={16} />
                      </div>
                    ) : (
                      <div className={styles.avatarUser}>
                        <User size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.messageContent}>
                    <div className={styles.messageHeader}>
                      <span className={styles.messageRole}>
                        {msg.role === 'assistant' ? 'AI Ассистент' : 'Вы'}
                      </span>
                      <span className={styles.messageTime}>
                        {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <div className={styles.messageText}>
                      {msg.role === 'assistant' ? (
                        <div className={styles.markdownContent}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : msg.content}
                    </div>

                    {msg.role === 'assistant' && (
                      <div className={styles.messageActions}>
                        <button 
                          className={styles.messageAction}
                          onClick={() => copyToClipboard(msg.content)}
                          title="Копировать"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          className={`${styles.messageAction} ${msg.feedback === 'positive' ? styles.feedbackActive : ''}`}
                          onClick={() => sendFeedback(msg.id, 'positive')}
                          title="Понравилось"
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button 
                          className={`${styles.messageAction} ${msg.feedback === 'negative' ? styles.feedbackActive : ''}`}
                          onClick={() => sendFeedback(msg.id, 'negative')}
                          title="Не понравилось"
                        >
                          <ThumbsDown size={14} />
                        </button>
                        {index === messages.length - 1 && (
                          <button 
                            className={styles.messageAction}
                            onClick={() => regenerateResponse(messages[messages.length - 2])}
                            title="Перегенерировать"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className={styles.typingIndicator}>
                  <div className={styles.typingDots}>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                  </div>
                  <span className={styles.typingText}>AI думает...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {hasNewMessages && messages.length > 3 && (
          <button className={styles.newMessagesIndicator} onClick={scrollToBottom}>
            <span>Новые сообщения ↓</span>
          </button>
        )}

        <div className={styles.inputSection}>
          <div className={styles.inputContainer}>
            <button
              className={`${styles.inputAction} ${isListening ? styles.listening : ''}`}
              onClick={toggleVoiceInput}
              title={isListening ? 'Остановить запись' : 'Голосовой ввод'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <div className={styles.textareaWrapper}>
              <textarea
                ref={inputRef}
                className={styles.chatInput}
                placeholder="Спросите что-нибудь у бизнес-консультанта..."
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
                rows={1}
              />
              {message && (
                <button 
                  className={styles.clearButton}
                  onClick={() => setMessage('')}
                  title="Очистить"
                >
                  ×
                </button>
              )}
            </div>
            
            <button
              className={styles.sendButton}
              onClick={handleSend}
              disabled={!message.trim() || loading}
              title="Отправить"
            >
              {loading ? (
                <div className={styles.spinner}></div>
              ) : (
                <>
                  <Send size={18} />
                  <span className={styles.sendLabel}>Отпр.</span>
                </>
              )}
            </button>
          </div>
          
          <div className={styles.inputHint}>
            <Lightbulb size={12} />
            <span>Нажмите Enter для отправки, Shift+Enter для новой строки</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;