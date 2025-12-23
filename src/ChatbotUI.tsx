import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, MoreVertical, Send, Sparkles, Loader2, Paperclip, Link as LinkIcon, Bell, Check, TrendingUp, Zap, Trophy, Target, Star, Award, ChevronRight, ChevronDown, Settings, History, HelpCircle, Download, Trash2, Info } from 'lucide-react';

type QuickAction = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

type TaskCategory = {
  id: string;
  title: string;
  items: TaskItem[];
};

type TaskItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type SelectedTask = {
  category: string;
  item: TaskItem;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
};

type Attachment = {
  id: string;
  type: 'file' | 'link';
  name: string;
  url?: string;
  size?: number;
};

type ReminderOption = {
  id: string;
  label: string;
  icon: string;
};

type ActiveReminder = {
  id: string;
  messageId: string;
  label: string;
  timestamp: Date;
};

type EfficiencyMetrics = {
  tasksCompleted: number;
  timesSaved: number; // in minutes
  efficiencyScore: number; // percentage
  streak: number;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
};

const quickActions: QuickAction[] = [{
  id: 'guidance',
  title: 'Guidance',
  description: 'Give me guidance to complete a task',
  icon: <Sparkles className="w-5 h-5" />
}, {
  id: 'summary',
  title: 'Summary',
  description: 'Summarize this content',
  icon: <Sparkles className="w-5 h-5" />
}, {
  id: 'overview',
  title: 'Overview',
  description: 'Show me my risk overview',
  icon: <Sparkles className="w-5 h-5" />
}, {
  id: 'reminders',
  title: 'Manage Reminders',
  description: 'view and mangage active reminders',
  icon: <Bell className="w-5 h-5" />
}];

const taskCategories: TaskCategory[] = [{
  id: 'want',
  title: 'I WANT TO',
  items: [{
    id: 'ask',
    label: 'Ask',
    icon: '💬'
  }, {
    id: 'search',
    label: 'Search',
    icon: '🔍'
  }, {
    id: 'explain',
    label: 'Explain',
    icon: '💡'
  }, {
    id: 'analyze',
    label: 'Analyze',
    icon: '📈'
  }, {
    id: 'summarize',
    label: 'Summarize',
    icon: '📝'
  }, {
    id: 'research',
    label: 'Research',
    icon: '🔬'
  }]
}, {
  id: 'use',
  title: 'USE MY',
  items: [{
    id: 'slack',
    label: 'Slack',
    icon: '💬'
  }, {
    id: 'gmail',
    label: 'Gmail',
    icon: '📧'
  }, {
    id: 'salesforce',
    label: 'Salesforce',
    icon: '☁️'
  }, {
    id: 'drive',
    label: 'Drive',
    icon: '📁'
  }, {
    id: 'tabs',
    label: 'Browser Tabs',
    icon: '🌐'
  }, {
    id: 'calendar',
    label: 'Calendar',
    icon: '📅'
  }]
}, {
  id: 'make',
  title: 'MAKE A',
  items: [{
    id: 'doc',
    label: 'Doc',
    icon: '📄'
  }, {
    id: 'table',
    label: 'Table',
    icon: '📊'
  }, {
    id: 'powerpoint',
    label: 'PowerPoint',
    icon: '📽️'
  }, {
    id: 'sheet',
    label: 'Sheet',
    icon: '📈'
  }, {
    id: 'image',
    label: 'Image',
    icon: '🖼️'
  }, {
    id: 'wordfile',
    label: 'Word File',
    icon: '📝'
  }]
}];

const reminderOptions: ReminderOption[] = [{
  id: 'tomorrow',
  label: 'Remind me tomorrow',
  icon: '📅'
}, {
  id: '1hour',
  label: 'Remind me in 1 hour',
  icon: '⏰'
}, {
  id: 'followup',
  label: 'Set a follow-up task',
  icon: '✅'
}, {
  id: 'nextweek',
  label: 'Remind me next week',
  icon: '📆'
}, {
  id: 'custom',
  label: 'Custom reminder',
  icon: '⚙️'
}];

const initialAchievements: Achievement[] = [{
  id: 'first-task',
  title: 'Getting Started',
  description: 'Complete your first task',
  icon: '🎯',
  progress: 0,
  maxProgress: 1
}, {
  id: 'efficiency-master',
  title: 'Efficiency Master',
  description: 'Reach 80% efficiency score',
  icon: '⚡',
  progress: 0,
  maxProgress: 80
}, {
  id: 'time-saver',
  title: 'Time Saver',
  description: 'Save 60 minutes',
  icon: '⏱️',
  progress: 0,
  maxProgress: 60
}, {
  id: 'task-warrior',
  title: 'Task Warrior',
  description: 'Complete 10 tasks',
  icon: '🏆',
  progress: 0,
  maxProgress: 10
}, {
  id: 'streak-champion',
  title: 'Streak Champion',
  description: 'Maintain a 7-day streak',
  icon: '🔥',
  progress: 0,
  maxProgress: 7
}];

// Simulated AI response function
const generateAIResponse = (task: string): Promise<string> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const responses: Record<string, string> = {
        'search gmail': "I've searched your Gmail and found 47 unread messages. The most recent are from your team about the Q4 project updates. Would you like me to summarize them?",
        'analyze salesforce': "I've analyzed your Salesforce data. You have 23 active opportunities worth $450K in total pipeline. 5 deals are closing this week. Would you like a detailed breakdown?",
        'summarize slack': "I've reviewed your Slack messages from the past 24 hours. Key highlights: Team standup completed, design review scheduled for Thursday, and 3 urgent questions requiring your response.",
        'search drive': "I found 156 documents in your Google Drive. Recent activity includes 12 files shared with you today. Would you like me to organize them by project?",
        'explain notion': "Your Notion workspace has 8 active projects. The 'Product Launch' page was updated 2 hours ago with new timelines. I can walk you through the changes."
      };

      // Match against known patterns
      const lowerTask = task.toLowerCase();
      for (const [key, response] of Object.entries(responses)) {
        if (lowerTask.includes(key)) {
          resolve(response);
          return;
        }
      }

      // Default intelligent response
      resolve(`I've completed your task: "${task}". The results show positive outcomes across all metrics. Would you like me to provide more detailed analysis or take any follow-up actions?`);
    }, 1500);
  });
};

// Helper function to get performance tier (kept for future use)
// const getPerformanceTier = (score: number): {
//   emoji: string;
//   message: string;
//   color: string;
// } => {
//   if (score >= 90) return {
//     emoji: '🔥',
//     message: "You're on fire!",
//     color: 'from-rose-500 via-orange-500 to-amber-500'
//   };
//   if (score >= 75) return {
//     emoji: '⚡',
//     message: 'Crushing it!',
//     color: 'from-purple-500 via-pink-500 to-rose-500'
//   };
//   if (score >= 60) return {
//     emoji: '✨',
//     message: 'Great progress!',
//     color: 'from-blue-500 via-cyan-500 to-teal-500'
//   };
//   if (score >= 40) return {
//     emoji: '💪',
//     message: 'Keep going!',
//     color: 'from-green-500 via-emerald-500 to-teal-500'
//   };
//   return {
//     emoji: '🌱',
//     message: 'Just getting started!',
//     color: 'from-indigo-500 via-purple-500 to-pink-500'
//   };
// };

// @component: ChatbotUI
export const ChatbotUI = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<SelectedTask[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTaskBuilder, setShowTaskBuilder] = useState(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [placeholderText, setPlaceholderText] = useState('Ask me anything...');
  const [activeReminders, setActiveReminders] = useState<ActiveReminder[]>([]);
  const [reminderConfirmations, setReminderConfirmations] = useState<{
    [messageId: string]: boolean;
  }>({});
  const [showRemindersManager, setShowRemindersManager] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[][]>([]);

  // Gamification states
  const [metrics, setMetrics] = useState<EfficiencyMetrics>({
    tasksCompleted: 12,
    timesSaved: 47,
    efficiencyScore: 78,
    streak: 3
  });
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [showMetricCelebration, setShowMetricCelebration] = useState(false);
  const [isAchievementsCollapsed, setIsAchievementsCollapsed] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Update achievements based on metrics
  useEffect(() => {
    setAchievements(prev => prev.map(achievement => {
      const updated = {
        ...achievement
      };
      if (achievement.id === 'first-task' && metrics.tasksCompleted >= 1) {
        updated.progress = metrics.tasksCompleted >= 1 ? 1 : 0;
        if (!updated.unlockedAt && metrics.tasksCompleted >= 1) {
          updated.unlockedAt = new Date();
        }
      }
      if (achievement.id === 'efficiency-master') {
        updated.progress = metrics.efficiencyScore;
        if (!updated.unlockedAt && metrics.efficiencyScore >= 80) {
          updated.unlockedAt = new Date();
        }
      }
      if (achievement.id === 'time-saver') {
        updated.progress = metrics.timesSaved;
        if (!updated.unlockedAt && metrics.timesSaved >= 60) {
          updated.unlockedAt = new Date();
        }
      }
      if (achievement.id === 'task-warrior') {
        updated.progress = metrics.tasksCompleted;
        if (!updated.unlockedAt && metrics.tasksCompleted >= 10) {
          updated.unlockedAt = new Date();
        }
      }
      if (achievement.id === 'streak-champion') {
        updated.progress = metrics.streak;
        if (!updated.unlockedAt && metrics.streak >= 7) {
          updated.unlockedAt = new Date();
        }
      }
      return updated;
    }));
  }, [metrics]);

  const handleTaskClick = (categoryId: string, item: TaskItem) => {
    const existingIndex = selectedTasks.findIndex(task => task.category === categoryId);
    if (existingIndex >= 0) {
      const newSelections = [...selectedTasks];
      newSelections[existingIndex] = {
        category: categoryId,
        item
      };
      setSelectedTasks(newSelections);
    } else {
      setSelectedTasks([...selectedTasks, {
        category: categoryId,
        item
      }]);
    }
  };

  const removeTask = (categoryId: string) => {
    setSelectedTasks(selectedTasks.filter(task => task.category !== categoryId));
  };

  const buildTaskString = () => {
    if (selectedTasks.length === 0) return '';
    const taskParts = selectedTasks.map(task => task.item.label);
    return taskParts.join(' ');
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue;
    const taskString = buildTaskString();

    // Combine task string and input value
    const finalMessage = taskString ? textToSend ? `${taskString}: ${textToSend}` : taskString : textToSend;
    if (!finalMessage.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalMessage,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedTasks([]);
    setAttachments([]);
    setShowTaskBuilder(false);
    setIsProcessing(true);
    setPlaceholderText('Type your message...');

    // Generate AI response
    try {
      const aiResponse = await generateAIResponse(finalMessage);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update metrics after successful task completion
      setMetrics(prev => ({
        tasksCompleted: prev.tasksCompleted + 1,
        timesSaved: prev.timesSaved + Math.floor(Math.random() * 5) + 2, // Random 2-7 min saved
        efficiencyScore: Math.min(100, prev.efficiencyScore + Math.floor(Math.random() * 3) + 1),
        streak: prev.streak
      }));

      // Show celebration animation
      setShowMetricCelebration(true);
      setTimeout(() => setShowMetricCelebration(false), 2000);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.id === 'reminders') {
      setShowRemindersManager(true);
      return;
    }
    if (action.id === 'guidance') {
      setPlaceholderText('Give me guidance to complete...');
      setInputValue('');
    } else if (action.id === 'ask') {
      setPlaceholderText('Ask me anything...');
      setInputValue('');
    } else if (action.id === 'summary') {
      setPlaceholderText('Summarize this content...');
      setInputValue('');
    } else if (action.id === 'overview') {
      setPlaceholderText('Show me my risk overview...');
      setInputValue('');
    } else {
      const actionText = action.description || action.title;
      setInputValue(actionText);
      setPlaceholderText('Type your message...');
    }

    // Focus the input field after setting the value
    setTimeout(() => {
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      inputElement?.focus();
    }, 100);
  };

  const isTaskItemSelected = (categoryId: string, itemId: string) => {
    return selectedTasks.some(task => task.category === categoryId && task.item.id === itemId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsChatbotOpen(false);
  };

  const handleReopen = () => {
    setIsChatbotOpen(true);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleGoHome = () => {
    setMessages([]);
    setShowTaskBuilder(true);
    setSelectedTasks([]);
    setInputValue('');
    setAttachments([]);
    setShowLinkInput(false);
    setLinkInput('');
    setShowRemindersManager(false);
    setShowAchievements(false);
    setShowChatHistory(false);
    setShowSettings(false);
    setShowHelp(false);
    setShowAbout(false);
    setShowMenu(false);
    setIsAchievementsCollapsed(true);
    
    // Scroll to top of the main content area
    setTimeout(() => {
      const mainContent = document.querySelector('.flex-1.overflow-y-auto');
      if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleClearChat = () => {
    if (messages.length > 0) {
      // Save current conversation to history before clearing
      setChatHistory(prev => [...prev, [...messages]]);
    }
    setMessages([]);
    setShowTaskBuilder(true);
    setSelectedTasks([]);
    setInputValue('');
    setAttachments([]);
    setShowMenu(false);
  };

  const handleExportData = () => {
    const dataToExport = {
      messages,
      metrics,
      achievements,
      activeReminders,
      chatHistory,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grace-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      type: 'file',
      name: file.name,
      size: file.size
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleAddLink = () => {
    if (!linkInput.trim()) return;
    const newLink: Attachment = {
      id: Date.now().toString() + Math.random(),
      type: 'link',
      name: linkInput,
      url: linkInput
    };
    setAttachments([...attachments, newLink]);
    setLinkInput('');
    setShowLinkInput(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleReminderClick = (messageId: string, option: ReminderOption) => {
    const newReminder: ActiveReminder = {
      id: Date.now().toString() + Math.random(),
      messageId,
      label: option.label,
      timestamp: new Date()
    };
    setActiveReminders([...activeReminders, newReminder]);
    setReminderConfirmations({
      ...reminderConfirmations,
      [messageId]: true
    });

    // Auto-hide confirmation after 3 seconds
    setTimeout(() => {
      setReminderConfirmations(prev => {
        const updated = {
          ...prev
        };
        delete updated[messageId];
        return updated;
      });
    }, 3000);
  };

  const removeReminder = (reminderId: string) => {
    setActiveReminders(activeReminders.filter(r => r.id !== reminderId));
  };

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);

  // @return
  return (
    <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center p-2 sm:p-4">
      <AnimatePresence mode="wait">
        {isChatbotOpen ? (
          <motion.div
            key="chatbot"
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              transition: {
                duration: 0.2
              }
            }}
            className={`bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-slate-200/50 flex flex-col overflow-hidden transition-all duration-300 ${isExpanded ? 'w-full h-full max-w-none' : 'w-full max-w-2xl h-[95vh] sm:h-[90vh]'}`}
          >
            {/* Header */}
            <div className="relative z-50 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
              <button
                onClick={handleGoHome}
                className="text-2xl sm:text-3xl font-bold text-slate-900 hover:text-slate-700 transition-colors duration-200 cursor-pointer"
                aria-label="Go to home screen"
              >
                GRaCe
              </button>
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Achievements Badge */}
                {unlockedAchievements.length > 0 && (
                  <motion.button
                    initial={{
                      scale: 0
                    }}
                    animate={{
                      scale: 1
                    }}
                    onClick={() => setShowAchievements(true)}
                    className="relative p-2 hover:bg-amber-500/10 backdrop-blur-sm rounded-xl transition-all duration-300 border border-amber-200/30"
                    title="View achievements"
                  >
                    <Trophy className="w-5 h-5 text-amber-600" />
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-white/50">
                      {unlockedAchievements.length}
                    </span>
                  </motion.button>
                )}

                {/* Reminder Badge */}
                {activeReminders.length > 0 && (
                  <motion.button
                    initial={{
                      scale: 0
                    }}
                    animate={{
                      scale: 1
                    }}
                    onClick={() => setShowRemindersManager(true)}
                    className="relative p-2 hover:bg-slate-100 backdrop-blur-sm rounded-xl transition-all duration-200 border border-slate-200/60"
                    title="View reminders"
                  >
                    <Bell className="w-5 h-5 text-slate-600" />
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-500 to-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-white/50">
                      {activeReminders.length}
                    </span>
                  </motion.button>
                )}
                <div className="relative z-[100]" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 hover:bg-white/40 backdrop-blur-sm rounded-xl transition-all duration-300 relative z-[100]"
                    aria-label="Menu"
                  >
                    <MoreVertical className="w-5 h-5 text-slate-700" />
                  </button>

                  {/* Dropdown Menu - Render outside overflow container using portal */}
                  {showMenu && createPortal(
                    <AnimatePresence>
                      <motion.div
                        initial={{
                          opacity: 0,
                          scale: 0.95,
                          y: -10
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.95,
                          y: -10
                        }}
                        className="fixed w-48 sm:w-56 bg-white/95 backdrop-blur-xl rounded-lg sm:rounded-xl shadow-2xl border border-white/30 overflow-hidden z-[9999]"
                        style={{
                          top: menuRef.current ? menuRef.current.getBoundingClientRect().bottom + 8 : 0,
                          right: menuRef.current ? window.innerWidth - menuRef.current.getBoundingClientRect().right : 0
                        }}
                      >
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              setShowChatHistory(true);
                            }}
                            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-left hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <History className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">Chat History</span>
                          </button>
                          <button
                            onClick={handleExportData}
                            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-left hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <Download className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">Export Data</span>
                          </button>
                          <button
                            onClick={handleClearChat}
                            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-left hover:bg-red-50/50 transition-colors text-slate-700"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-red-600">Clear Chat</span>
                          </button>
                          <div className="border-t border-slate-200/50 my-1"></div>
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              setShowSettings(true);
                            }}
                            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-left hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <Settings className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">Settings</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              setShowHelp(true);
                            }}
                            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-left hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <HelpCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">Help & Support</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              setShowAbout(true);
                            }}
                            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-left hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <Info className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">About GRaCe</span>
                          </button>
                        </div>
                      </motion.div>
                    </AnimatePresence>,
                    document.body
                  )}
                </div>
                <button
                  onClick={handleExpand}
                  className="p-2 hover:bg-white/40 backdrop-blur-sm rounded-xl transition-all duration-300"
                  aria-label={isExpanded ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  <Maximize2 className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-red-500/10 backdrop-blur-sm rounded-xl transition-all duration-300 group border border-transparent hover:border-red-200/50"
                  aria-label="Close chatbot"
                >
                  <X className="w-5 h-5 text-slate-700 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-8">
              {showChatHistory ? (
                // Chat History View
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Chat History</h2>
                    <button
                      onClick={() => setShowChatHistory(false)}
                      className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 font-medium px-3 sm:px-4 py-1.5 sm:py-2 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-all duration-200"
                    >
                      Back to chat
                    </button>
                  </div>

                  {chatHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 text-lg">No chat history</p>
                      <p className="text-slate-400 text-sm mt-2">
                        Previous conversations will appear here after you clear a chat
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.map((conversation, index) => (
                        <motion.div
                          key={index}
                          initial={{
                            opacity: 0,
                            x: -20
                          }}
                          animate={{
                            opacity: 1,
                            x: 0
                          }}
                          transition={{
                            delay: index * 0.05
                          }}
                          className="p-4 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-slate-700">
                              Conversation {chatHistory.length - index}
                            </p>
                            <p className="text-xs text-slate-500">
                              {conversation[0]?.timestamp.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {conversation.slice(0, 2).map((msg) => (
                              <p key={msg.id} className="text-xs text-slate-600 truncate">
                                <span className="font-medium">{msg.role === 'user' ? 'You' : 'GRaCe'}:</span> {msg.content.substring(0, 100)}...
                              </p>
                            ))}
                          </div>
                          <p className="text-xs text-slate-400 mt-2">
                            {conversation.length} messages
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : showSettings ? (
                // Settings View
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h2>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 font-medium px-3 sm:px-4 py-1.5 sm:py-2 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-all duration-200"
                    >
                      Back to chat
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="p-5 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm text-slate-700">Reminder notifications</span>
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-slate-600 rounded focus:ring-slate-500" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm text-slate-700">Achievement notifications</span>
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-slate-600 rounded focus:ring-slate-500" />
                        </label>
                      </div>
                    </div>

                    <div className="p-5 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Appearance</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm text-slate-700">Animations</span>
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-slate-600 rounded focus:ring-slate-500" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm text-slate-700">Compact mode</span>
                          <input type="checkbox" className="w-4 h-4 text-slate-600 rounded focus:ring-slate-500" />
                        </label>
                      </div>
                    </div>

                    <div className="p-5 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Data</h3>
                      <div className="space-y-3">
                        <button
                          onClick={handleExportData}
                          className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
                        >
                          Export All Data
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
                              setChatHistory([]);
                            }
                          }}
                          className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 text-sm font-medium rounded-lg transition-all duration-300 border border-red-300/50"
                        >
                          Clear All History
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : showHelp ? (
                // Help & Support View
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Help & Support</h2>
                    <button
                      onClick={() => setShowHelp(false)}
                      className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 font-medium px-3 sm:px-4 py-1.5 sm:py-2 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-all duration-200"
                    >
                      Back to chat
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="p-5 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-slate-600" />
                        Getting Started
                      </h3>
                      <p className="text-sm text-slate-600 mb-3">
                        GRaCe is your AI assistant designed to help you complete tasks efficiently. Here's how to get started:
                      </p>
                      <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                        <li>Use the task builder to create complex tasks by selecting actions</li>
                        <li>Attach files or links to provide context</li>
                        <li>Set reminders from AI responses to track important tasks</li>
                        <li>Track your progress with achievements and metrics</li>
                      </ul>
                    </div>

                    <div className="p-5 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Common Questions</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900 mb-1">How do I build a task?</p>
                          <p className="text-sm text-slate-600">Select items from the "I WANT TO", "USE MY", and "MAKE A" categories to build your task, then add context in the input field.</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 mb-1">Can I save my conversations?</p>
                          <p className="text-sm text-slate-600">Yes! Use the menu to export your data or view chat history. Conversations are saved when you clear a chat.</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 mb-1">How do achievements work?</p>
                          <p className="text-sm text-slate-600">Achievements unlock as you complete tasks and reach milestones. Track your progress in the Achievements section.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Need More Help?</h3>
                      <p className="text-sm text-slate-600 mb-3">
                        If you need additional assistance, please contact our support team.
                      </p>
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-all duration-200">
                        Contact Support
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : showAbout ? (
                // About View
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">About GRaCe</h2>
                    <button
                      onClick={() => setShowAbout(false)}
                      className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 font-medium px-3 sm:px-4 py-1.5 sm:py-2 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-all duration-200"
                    >
                      Back to chat
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <div className="text-6xl font-bold text-slate-900 mb-4">
                        GRaCe
                      </div>
                      <p className="text-lg text-slate-600 mb-2">Your AI Assistant</p>
                      <p className="text-sm text-slate-500">Version 1.0.0</p>
                    </div>

                    <div className="p-5 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">What is GRaCe?</h3>
                      <p className="text-sm text-slate-600">
                        GRaCe is an intelligent AI assistant designed to help you complete tasks efficiently. 
                        With features like task building, reminders, achievements, and seamless integrations, 
                        GRaCe makes your workflow smoother and more productive.
                      </p>
                    </div>

                    <div className="p-5 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Features</h3>
                      <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                        <li>Intelligent task building and execution</li>
                        <li>File and link attachments</li>
                        <li>Reminder management</li>
                        <li>Achievement tracking and gamification</li>
                        <li>Efficiency metrics and analytics</li>
                        <li>Chat history and data export</li>
                      </ul>
                    </div>

                    <div className="p-5 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Built With</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">React</span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">TypeScript</span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">Framer Motion</span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">Tailwind CSS</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : showAchievements ? (
                // Achievements View
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Achievements</h2>
                      <p className="text-slate-600 text-sm mt-1">
                        {unlockedAchievements.length} of {achievements.length} unlocked
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAchievements(false)}
                      className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 font-medium px-3 sm:px-4 py-1.5 sm:py-2 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-all duration-200"
                    >
                      Back to chat
                    </button>
                  </div>

                  <div className="space-y-4">
                    {achievements.map((achievement, index) => {
                      const isUnlocked = !!achievement.unlockedAt;
                      const progress = achievement.progress || 0;
                      const maxProgress = achievement.maxProgress || 100;
                      const progressPercent = progress / maxProgress * 100;
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{
                            opacity: 0,
                            x: -20
                          }}
                          animate={{
                            opacity: 1,
                            x: 0
                          }}
                          transition={{
                            delay: index * 0.05
                          }}
                          className={`p-5 rounded-2xl backdrop-blur-md border-2 transition-all duration-300 ${isUnlocked ? 'bg-gradient-to-br from-amber-400/20 via-yellow-400/20 to-orange-400/20 border-amber-300/50 shadow-xl shadow-amber-500/10' : 'bg-white/40 border-white/30 shadow-lg'}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`text-4xl transition-all duration-300 ${isUnlocked ? 'animate-bounce drop-shadow-lg' : 'grayscale opacity-40'}`}>
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className={`font-bold text-lg ${isUnlocked ? 'bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent' : 'text-slate-600'}`}>
                                    {achievement.title}
                                  </h3>
                                  <p className={`text-sm ${isUnlocked ? 'text-amber-700/80' : 'text-slate-500'}`}>
                                    {achievement.description}
                                  </p>
                                </div>
                                {isUnlocked && (
                                  <motion.div
                                    initial={{
                                      scale: 0,
                                      rotate: -180
                                    }}
                                    animate={{
                                      scale: 1,
                                      rotate: 0
                                    }}
                                    transition={{
                                      type: 'spring',
                                      stiffness: 200
                                    }}
                                  >
                                    <Award className="w-6 h-6 text-amber-600 drop-shadow-md" />
                                  </motion.div>
                                )}
                              </div>

                              {/* Progress Bar */}
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className={isUnlocked ? 'text-amber-700 font-medium' : 'text-slate-500'}>
                                    Progress
                                  </span>
                                  <span className={isUnlocked ? 'text-amber-700 font-bold' : 'text-slate-500'}>
                                    {progress} / {maxProgress}
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-white/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/30">
                                  <motion.div
                                    initial={{
                                      width: 0
                                    }}
                                    animate={{
                                      width: `${progressPercent}%`
                                    }}
                                    transition={{
                                      duration: 0.8,
                                      delay: index * 0.1
                                    }}
                                    className={`h-full rounded-full ${isUnlocked ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 shadow-lg shadow-amber-500/50' : 'bg-slate-400'}`}
                                  />
                                </div>
                              </div>

                              {isUnlocked && achievement.unlockedAt && (
                                <p className="text-xs text-amber-600 mt-2 font-medium">
                                  Unlocked {achievement.unlockedAt.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : showRemindersManager ? (
                // Reminders Manager View
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Manage Reminders</h2>
                    <button
                      onClick={() => setShowRemindersManager(false)}
                      className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 font-medium px-3 sm:px-4 py-1.5 sm:py-2 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-all duration-200"
                    >
                      Back to chat
                    </button>
                  </div>

                  {activeReminders.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 text-lg">No active reminders</p>
                      <p className="text-slate-400 text-sm mt-2">
                        Set reminders from AI responses to keep track of important tasks
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeReminders.map((reminder, index) => (
                        <motion.div
                          key={reminder.id}
                          initial={{
                            opacity: 0,
                            x: -20
                          }}
                          animate={{
                            opacity: 1,
                            x: 0
                          }}
                          transition={{
                            delay: index * 0.05
                          }}
                          className="flex items-center gap-4 p-4 bg-blue-500/10 backdrop-blur-md border border-blue-300/50 rounded-xl hover:shadow-xl hover:bg-blue-500/20 transition-all duration-300"
                        >
                          <Bell className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{reminder.label}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Set {reminder.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => removeReminder(reminder.id)}
                            className="p-2 hover:bg-red-500/20 backdrop-blur-sm rounded-lg transition-all duration-300 group border border-transparent hover:border-red-300/50"
                          >
                            <X className="w-4 h-4 text-slate-500 group-hover:text-red-600 transition-colors" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : messages.length === 0 ? (
                <>
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 20
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: 0.1
                    }}
                  >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">Billie,</h2>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-6 sm:mb-8">How can I help?</h3>
                  </motion.div>

                  {/* Gamification Metrics Tile */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 30,
                      scale: 0.9
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1
                    }}
                    transition={{
                      delay: 0.15,
                      type: 'spring',
                      stiffness: 200
                    }}
                          className="relative mb-8 p-5 rounded-xl bg-slate-50/60 backdrop-blur-sm border border-slate-200/60 shadow-sm overflow-hidden"
                  >
                    {/* Celebration overlay */}
                    <AnimatePresence>
                      {showMetricCelebration && (
                        <motion.div
                          initial={{
                            opacity: 0
                          }}
                          animate={{
                            opacity: 1
                          }}
                          exit={{
                            opacity: 0
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-slate-200/30 backdrop-blur-sm z-10"
                        >
                          <motion.div
                            initial={{
                              scale: 0,
                              rotate: -180
                            }}
                            animate={{
                              scale: 1.5,
                              rotate: 0
                            }}
                            exit={{
                              scale: 0,
                              rotate: 180
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 200
                            }}
                          >
                            <Sparkles className="w-12 h-12 text-slate-600" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={() => setIsAchievementsCollapsed(!isAchievementsCollapsed)}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                          <Trophy className="w-5 h-5 text-slate-600" />
                          <h3 className="text-slate-900 text-lg font-bold">
                            Achievements
                          </h3>
                          <motion.div
                            animate={{
                              rotate: isAchievementsCollapsed ? 0 : 180
                            }}
                            transition={{
                              duration: 0.2
                            }}
                          >
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                          </motion.div>
                        </button>

                        {!isAchievementsCollapsed && (
                          <button
                            onClick={() => setShowAchievements(true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white/60 hover:bg-slate-50 backdrop-blur-sm rounded-lg border border-slate-200/60 transition-all duration-200 group"
                          >
                            <span className="text-slate-700 text-xs font-medium">View All</span>
                            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}
                      </div>

                      {/* Compact metrics grid */}
                      <AnimatePresence>
                        {!isAchievementsCollapsed && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              height: 0
                            }}
                            animate={{
                              opacity: 1,
                              height: 'auto'
                            }}
                            exit={{
                              opacity: 0,
                              height: 0
                            }}
                            transition={{
                              duration: 0.3
                            }}
                          >
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2">
                              <motion.div
                                whileHover={{
                                  scale: 1.02
                                }}
                                className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Target className="w-4 h-4 text-slate-600" />
                                  <p className="text-slate-700 text-xs font-medium">Tasks</p>
                                </div>
                                <motion.p
                                  key={metrics.tasksCompleted}
                                  initial={{
                                    scale: 1.5,
                                    opacity: 0
                                  }}
                                  animate={{
                                    scale: 1,
                                    opacity: 1
                                  }}
                                  className="text-slate-900 text-2xl font-bold"
                                >
                                  {metrics.tasksCompleted}
                                </motion.p>
                              </motion.div>

                              <motion.div
                                whileHover={{
                                  scale: 1.02
                                }}
                                className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Zap className="w-4 h-4 text-slate-600" />
                                  <p className="text-slate-700 text-xs font-medium">Saved</p>
                                </div>
                                <motion.p
                                  key={metrics.timesSaved}
                                  initial={{
                                    scale: 1.5,
                                    opacity: 0
                                  }}
                                  animate={{
                                    scale: 1,
                                    opacity: 1
                                  }}
                                  className="text-slate-900 text-2xl font-bold"
                                >
                                  {metrics.timesSaved}
                                  <span className="text-sm ml-0.5">m</span>
                                </motion.p>
                              </motion.div>

                              <motion.div
                                whileHover={{
                                  scale: 1.02
                                }}
                                className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <TrendingUp className="w-4 h-4 text-slate-600" />
                                  <p className="text-slate-700 text-xs font-medium">Score</p>
                                </div>
                                <motion.p
                                  key={metrics.efficiencyScore}
                                  initial={{
                                    scale: 1.5,
                                    opacity: 0
                                  }}
                                  animate={{
                                    scale: 1,
                                    opacity: 1
                                  }}
                                  className="text-slate-900 text-2xl font-bold"
                                >
                                  {metrics.efficiencyScore}
                                  <span className="text-sm">%</span>
                                </motion.p>
                              </motion.div>

                              <motion.div
                                whileHover={{
                                  scale: 1.02
                                }}
                                className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Star className="w-4 h-4 text-slate-600" />
                                  <p className="text-slate-700 text-xs font-medium">Streak</p>
                                </div>
                                <motion.p
                                  key={metrics.streak}
                                  initial={{
                                    scale: 1.5,
                                    opacity: 0
                                  }}
                                  animate={{
                                    scale: 1,
                                    opacity: 1
                                  }}
                                  className="text-slate-900 text-2xl font-bold"
                                >
                                  {metrics.streak}
                                  <span className="text-sm ml-0.5">d</span>
                                </motion.p>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Quick Actions */}
                  <div className="space-y-3 mb-8">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.id}
                        initial={{
                          opacity: 0,
                          x: -20
                        }}
                        animate={{
                          opacity: 1,
                          x: 0
                        }}
                        transition={{
                          delay: 0.3 + index * 0.05
                        }}
                        onClick={() => handleQuickAction(action)}
                        className="w-full text-left px-4 sm:px-5 py-3 sm:py-3.5 bg-white/60 backdrop-blur-sm hover:bg-slate-50/80 rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-sm border border-slate-200/60 hover:border-slate-300/80 group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="text-slate-600 group-hover:text-slate-700 transition-colors duration-200 flex-shrink-0">
                            {action.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm sm:text-base">{action.title}</p>
                            {action.description && (
                              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 line-clamp-1">{action.description}</p>
                            )}
                          </div>
                          {action.id === 'reminders' && activeReminders.length > 0 && (
                            <span className="bg-gradient-to-br from-orange-500 to-rose-500 text-white text-xs font-bold rounded-full px-2 py-1 shadow-lg border border-white/50">
                              {activeReminders.length}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Build a Task Section */}
                  {showTaskBuilder && (
                    <>
                      {/* Visual Separator */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200/60"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <div className="bg-white/90 px-3 py-1 rounded-full border border-slate-200/60 shadow-sm">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Build a Task</span>
                          </div>
                        </div>
                      </div>

                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 20
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        transition={{
                          delay: 0.6
                        }}
                        className="mb-6 pt-4 bg-slate-50/50 rounded-xl px-5 py-6 -mx-4 border-t border-slate-200/40"
                      >
                        {/* Task Category Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        {taskCategories.map((category, catIndex) => (
                          <div key={category.id} className="space-y-3">
                            <p className="text-xs font-bold text-slate-500 mb-2 sm:mb-3 tracking-wide text-center">
                              {category.title}
                            </p>
                            <div className="space-y-1.5 sm:space-y-2">
                              {category.items.map((item, itemIndex) => {
                                const isSelected = isTaskItemSelected(category.id, item.id);
                                return (
                                  <motion.button
                                    key={item.id}
                                    initial={{
                                      opacity: 0,
                                      scale: 0.9
                                    }}
                                    animate={{
                                      opacity: 1,
                                      scale: 1
                                    }}
                                    transition={{
                                      delay: 0.7 + catIndex * 0.1 + itemIndex * 0.02
                                    }}
                                    onClick={() => handleTaskClick(category.id, item)}
                                    className={`w-full flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 group ${isSelected ? 'bg-slate-800 border-slate-800 shadow-sm border-2 text-white' : 'bg-white/70 border border-slate-200/60 hover:border-slate-300/70 hover:bg-slate-50/80 hover:shadow-sm'}`}
                                  >
                                    <span className={`text-base sm:text-lg transition-transform duration-300 flex-shrink-0 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                                      {item.icon}
                                    </span>
                                    <span className={`text-xs sm:text-sm font-medium text-left ${isSelected ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                      {item.label}
                                    </span>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Task Builder Orange Box */}
                      <AnimatePresence>
                        {selectedTasks.length > 0 && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              height: 0
                            }}
                            animate={{
                              opacity: 1,
                              height: 'auto'
                            }}
                            exit={{
                              opacity: 0,
                              height: 0
                            }}
                            className="p-3 sm:p-5 bg-slate-50/70 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/60 shadow-sm"
                          >
                            {/* Selected Tasks Display */}
                            <div className="flex items-center gap-2 flex-wrap mb-3 sm:mb-4">
                              <span className="text-xs sm:text-sm font-semibold text-slate-700">Your Task:</span>
                              {selectedTasks.map(task => (
                                <motion.div
                                  key={task.category}
                                  initial={{
                                    opacity: 0,
                                    scale: 0.8
                                  }}
                                  animate={{
                                    opacity: 1,
                                    scale: 1
                                  }}
                                  exit={{
                                    opacity: 0,
                                    scale: 0.8
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/60"
                                >
                                  <span className="text-base">{task.item.icon}</span>
                                  <span className="text-sm font-medium text-slate-700">
                                    {task.item.label}
                                  </span>
                                  <button
                                    onClick={() => removeTask(task.category)}
                                    className="ml-1 p-0.5 hover:bg-red-500/20 rounded transition-all duration-300"
                                  >
                                    <X className="w-3.5 h-3.5 text-red-600" />
                                  </button>
                                </motion.div>
                              ))}
                            </div>

                            <p className="text-xs text-slate-600 mb-4 font-medium">
                              Building: "{buildTaskString()}"
                            </p>

                            {/* Attachments Preview */}
                            <AnimatePresence>
                              {attachments.length > 0 && (
                                <motion.div
                                  initial={{
                                    opacity: 0,
                                    height: 0
                                  }}
                                  animate={{
                                    opacity: 1,
                                    height: 'auto'
                                  }}
                                  exit={{
                                    opacity: 0,
                                    height: 0
                                  }}
                                  className="mb-3 flex flex-wrap gap-2"
                                >
                                  {attachments.map(att => (
                                    <motion.div
                                      key={att.id}
                                      initial={{
                                        opacity: 0,
                                        scale: 0.8
                                      }}
                                      animate={{
                                        opacity: 1,
                                        scale: 1
                                      }}
                                      exit={{
                                        opacity: 0,
                                        scale: 0.8
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 bg-white/70 backdrop-blur-sm rounded-lg text-sm border border-slate-200/60 group"
                                    >
                                      {att.type === 'file' ? (
                                        <>
                                          <Paperclip className="w-4 h-4 text-slate-600" />
                                          <span className="text-slate-700 text-xs max-w-[120px] truncate">
                                            {att.name}
                                          </span>
                                          {att.size && (
                                            <span className="text-xs text-slate-500">
                                              {formatFileSize(att.size)}
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <>
                                          <LinkIcon className="w-4 h-4 text-slate-600" />
                                          <span className="text-slate-700 text-xs max-w-[120px] truncate">
                                            {att.name}
                                          </span>
                                        </>
                                      )}
                                    </motion.div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Link Input */}
                            <AnimatePresence>
                              {showLinkInput && (
                                <motion.div
                                  initial={{
                                    opacity: 0,
                                    height: 0
                                  }}
                                  animate={{
                                    opacity: 1,
                                    height: 'auto'
                                  }}
                                  exit={{
                                    opacity: 0,
                                    height: 0
                                  }}
                                  className="mb-3"
                                >
                                  <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-200/60">
                                    <LinkIcon className="w-4 h-4 text-slate-500" />
                                    <input
                                      type="text"
                                      value={linkInput}
                                      onChange={e => setLinkInput(e.target.value)}
                                      onKeyPress={e => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleAddLink();
                                        }
                                      }}
                                      placeholder="Paste a link..."
                                      className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-500"
                                      autoFocus
                                    />
                                    <button
                                      onClick={handleAddLink}
                                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm"
                                    >
                                      Add
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowLinkInput(false);
                                        setLinkInput('');
                                      }}
                                      className="p-1 hover:bg-slate-200/50 rounded transition-all duration-300"
                                    >
                                      <X className="w-4 h-4 text-slate-500" />
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Unified Input with Attachment Options and Send */}
                            <div className="bg-white/70 backdrop-blur-md rounded-lg sm:rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
                              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3">
                                {/* Hidden file input */}
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  multiple
                                  onChange={handleFileUpload}
                                  className="hidden"
                                  accept="*/*"
                                />

                                {/* Attachment buttons */}
                                <button
                                  onClick={() => fileInputRef.current?.click()}
                                  className="p-1.5 sm:p-2 hover:bg-slate-100 backdrop-blur-sm rounded-lg transition-all duration-200 group flex-shrink-0"
                                  title="Attach file"
                                  disabled={isProcessing}
                                >
                                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-slate-700 transition-colors" />
                                </button>

                                <button
                                  onClick={() => setShowLinkInput(!showLinkInput)}
                                  className="p-1.5 sm:p-2 hover:bg-slate-100 backdrop-blur-sm rounded-lg transition-all duration-200 group flex-shrink-0"
                                  title="Add link"
                                  disabled={isProcessing}
                                >
                                  <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-slate-700 transition-colors" />
                                </button>

                                  <input
                                    type="text"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Add context for your task..."
                                    className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-500 text-sm sm:text-base min-w-0"
                                    disabled={isProcessing}
                                  />

                                  <button
                                    onClick={() => handleSendMessage()}
                                    disabled={isProcessing}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-sm shadow-sm flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                  >
                                    {isProcessing ? (
                                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                    ) : (
                                      <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                                    )}
                                    <span className="hidden sm:inline">Send</span>
                                  </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Messages Display */}
                  <div className="space-y-6">
                    {messages.map((message, index) => (
                      <div key={message.id}>
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 20
                          }}
                          animate={{
                            opacity: 1,
                            y: 0
                          }}
                          transition={{
                            delay: index * 0.1
                          }}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] px-4 py-2.5 rounded-xl border transition-all duration-200 ${message.role === 'user' ? 'bg-slate-800 text-white border-slate-700/50 shadow-sm' : 'bg-white/80 text-slate-900 border-slate-200/60 shadow-sm'}`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>

                            {/* Attachments Display */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {message.attachments.map(att => (
                                  <div
                                    key={att.id}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs backdrop-blur-sm ${message.role === 'user' ? 'bg-slate-700/30 border border-white/30' : 'bg-slate-200/50 border border-slate-300/30'}`}
                                  >
                                    {att.type === 'file' ? (
                                      <>
                                        <Paperclip className="w-3 h-3" />
                                        <span className="flex-1 truncate">{att.name}</span>
                                        {att.size && (
                                          <span className="text-xs opacity-70">
                                            {formatFileSize(att.size)}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <LinkIcon className="w-3 h-3" />
                                        <span className="flex-1 truncate">{att.name}</span>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-slate-500'}`}>
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </motion.div>

                        {/* Reminders Section - Only show for assistant messages */}
                        {message.role === 'assistant' && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: 10
                            }}
                            animate={{
                              opacity: 1,
                              y: 0
                            }}
                            transition={{
                              delay: 0.3
                            }}
                            className="mt-3 ml-2 p-4 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 backdrop-blur-lg rounded-xl border border-blue-300/50 shadow-lg"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Bell className="w-4 h-4 text-blue-700" />
                              <p className="text-xs font-semibold text-blue-900">
                                Set a Reminder
                              </p>
                            </div>

                            {reminderConfirmations[message.id] ? (
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  scale: 0.95
                                }}
                                animate={{
                                  opacity: 1,
                                  scale: 1
                                }}
                                className="flex items-center gap-2 py-2 px-3 bg-green-500/20 backdrop-blur-sm border border-green-400/50 rounded-lg shadow-md"
                              >
                                <Check className="w-4 h-4 text-green-700" />
                                <p className="text-sm font-medium text-green-800">
                                  Reminder set!
                                </p>
                              </motion.div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {reminderOptions.map(option => (
                                  <motion.button
                                    key={option.id}
                                    whileHover={{
                                      scale: 1.05
                                    }}
                                    whileTap={{
                                      scale: 0.95
                                    }}
                                    onClick={() => handleReminderClick(message.id, option)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/60 hover:bg-white/80 backdrop-blur-md border border-blue-300/50 rounded-lg transition-all duration-300 text-sm font-medium text-slate-700 hover:text-blue-700 shadow-md hover:shadow-lg"
                                  >
                                    <span className="text-base">{option.icon}</span>
                                    <span>{option.label}</span>
                                  </motion.button>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    ))}

                    {/* Processing Indicator */}
                    {isProcessing && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 20
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        className="flex justify-start"
                      >
                        <div className="px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/60 flex items-center gap-2 shadow-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                          <p className="text-sm text-slate-700">GRaCe is working on your task...</p>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </>
              )}
            </div>

            {/* Input Footer */}
            {(messages.length > 0 || (messages.length === 0 && selectedTasks.length === 0)) && !showRemindersManager && !showAchievements && !showChatHistory && !showSettings && !showHelp && !showAbout && (
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm">
                {/* Attachments Preview - Home Screen */}
                {messages.length === 0 && attachments.length > 0 && (
                  <AnimatePresence>
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0
                      }}
                      animate={{
                        opacity: 1,
                        height: 'auto'
                      }}
                      exit={{
                        opacity: 0,
                        height: 0
                      }}
                      className="mb-3 flex flex-wrap gap-2"
                    >
                      {attachments.map(att => (
                        <motion.div
                          key={att.id}
                          initial={{
                            opacity: 0,
                            scale: 0.8
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.8
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg text-sm border border-white/40 shadow-md"
                        >
                          {att.type === 'file' ? (
                            <>
                              <Paperclip className="w-4 h-4 text-slate-600" />
                              <span className="text-slate-700 text-xs max-w-[120px] truncate">
                                {att.name}
                              </span>
                              {att.size && (
                                <span className="text-xs text-slate-500">
                                  {formatFileSize(att.size)}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                                          <LinkIcon className="w-4 h-4 text-slate-600" />
                              <span className="text-slate-700 text-xs max-w-[120px] truncate">
                                {att.name}
                              </span>
                            </>
                          )}
                          <button
                            onClick={() => removeAttachment(att.id)}
                            className="ml-1 p-0.5 hover:bg-red-500/20 rounded transition-all duration-300"
                          >
                            <X className="w-3 h-3 text-red-600" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* Link Input - Home Screen */}
                {messages.length === 0 && showLinkInput && (
                  <AnimatePresence>
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0
                      }}
                      animate={{
                        opacity: 1,
                        height: 'auto'
                      }}
                      exit={{
                        opacity: 0,
                        height: 0
                      }}
                      className="mb-3"
                    >
                      <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/40 shadow-md">
                        <LinkIcon className="w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={linkInput}
                          onChange={e => setLinkInput(e.target.value)}
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddLink();
                            }
                          }}
                          placeholder="Paste a link..."
                          className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-500"
                          autoFocus
                        />
                        <button
                          onClick={handleAddLink}
                          className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-medium rounded-lg transition-all duration-300 shadow-md"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowLinkInput(false);
                            setLinkInput('');
                          }}
                          className="p-1 hover:bg-slate-200/50 rounded transition-all duration-300"
                        >
                          <X className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* Main Input */}
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-orange-400/30 focus-within:bg-white transition-all duration-200 border border-slate-200/60 shadow-sm">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="*/*"
                  />

                  {/* Attachment buttons */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 sm:p-2 hover:bg-slate-100 backdrop-blur-sm rounded-lg transition-all duration-200 group flex-shrink-0"
                    title="Attach file"
                    disabled={isProcessing}
                  >
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-slate-700 transition-colors" />
                  </button>

                  <button
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    className="p-1.5 sm:p-2 hover:bg-slate-100 backdrop-blur-sm rounded-lg transition-all duration-200 group flex-shrink-0"
                    title="Add link"
                    disabled={isProcessing}
                  >
                    <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-slate-700 transition-colors" />
                  </button>

                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholderText}
                    className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-500 text-sm sm:text-base min-w-0"
                    disabled={isProcessing}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isProcessing}
                    className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-sm flex-shrink-0"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="reopen"
            initial={{
              opacity: 0,
              scale: 0.8
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.8
            }}
            onClick={handleReopen}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 rounded-full shadow-xl border-2 border-white/30 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 group relative z-50"
            aria-label="Open chatbot"
          >
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:rotate-12 transition-transform" />
            {activeReminders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-orange-500 shadow-sm">
                {activeReminders.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

