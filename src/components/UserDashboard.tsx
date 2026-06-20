/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  UserStats,
  Task,
  Offer,
  Offerwall,
  Withdrawal,
  ReferralTier,
  SupportTicket,
  PaymentMethod,
  ChatMessage,
  BlogArticle
} from '../types';
import {
  LayoutDashboard,
  Gift,
  CheckSquare,
  Users2,
  Trophy,
  Wallet,
  HelpCircle,
  BookOpen,
  Bell,
  MessageSquare,
  User as UserIcon,
  Menu,
  ChevronRight,
  Send,
  Sparkles,
  Activity,
  Search,
  Filter,
  X,
  Copy,
  Check,
  AlertTriangle,
  Info,
  ExternalLink,
  Lock,
  MessageCircle,
  Plus,
  Compass,
  LogOut
} from 'lucide-react';
import HistoryModal, { addPointHistoryLog } from './HistoryModal';

interface UserDashboardProps {
  user: UserStats;
  updateUserCoins: (coins: number) => void;
  tasks: Task[];
  submitTaskProof: (taskId: number, link: string) => void;
  offers: Offer[];
  offerwalls: Offerwall[];
  referralTiers: ReferralTier[];
  tickets: SupportTicket[];
  addSupportTicket: (subject: string, message: string) => void;
  addTicketMessage: (ticketId: string, message: string) => void;
  paymentMethods: PaymentMethod[];
  withdrawals: Withdrawal[];
  addWithdrawal: (method: string, amount: number, pointsCost: number, currency: string) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: string) => void;
  articles: BlogArticle[];
  onToggleAdmin: () => void;
  onLogout?: () => void;
  isAdminUser?: boolean;
  coinsPerUSD?: number;
}

export default function UserDashboard({
  user,
  updateUserCoins,
  tasks,
  submitTaskProof,
  offers,
  offerwalls,
  referralTiers,
  tickets,
  addSupportTicket,
  addTicketMessage,
  paymentMethods,
  withdrawals,
  addWithdrawal,
  chatMessages,
  addChatMessage,
  articles,
  onToggleAdmin,
  onLogout,
  isAdminUser,
  coinsPerUSD = 1000
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'offers' | 'tasks' | 'affiliates' | 'leaderboard' | 'cashout' | 'support' | 'articles'>('dashboard');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // States for interactive UI
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [activeOfferwallIframe, setActiveOfferwallIframe] = useState<any | null>(null);
  const [isSimulatorExpanded, setIsSimulatorExpanded] = useState(false);
  const [postbackDemoOffer, setPostbackDemoOffer] = useState<any>(null);
  const [postbackSuccessMessage, setPostbackSuccessMessage] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [filterLeaderboard, setFilterLeaderboard] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('all-time');
  
  // Task Submission Modal
  const [selectedTaskForProof, setSelectedTaskForProof] = useState<Task | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [proofError, setProofError] = useState('');

  // Support Ticket Modal
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Cashout flow states
  const [cashoutStep, setCashoutStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cashoutAmount, setCashoutAmount] = useState<number>(10);
  const [cashoutDetails, setCashoutDetails] = useState('');
  const [cashoutError, setCashoutError] = useState('');
  const [cashoutSuccessMessage, setCashoutSuccessMessage] = useState('');

  // Chat scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // Handle support ticket creation
  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    addSupportTicket(ticketSubject, ticketMessage);
    setTicketSubject('');
    setTicketMessage('');
    setIsNewTicketModalOpen(false);
  };

  // Handle ticket reply
  const handleTicketReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !selectedTicket) return;
    addTicketMessage(selectedTicket.id, ticketReplyText);
    setTicketReplyText('');
    // Refresh modal ticket
    const updated = tickets.find(t => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  // Handle Task submission
  const handleTaskProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl.trim()) {
      setProofError('Proof link (URL) is required.');
      return;
    }
    if (!proofUrl.startsWith('http://') && !proofUrl.startsWith('https://')) {
      setProofError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    if (selectedTaskForProof) {
      submitTaskProof(selectedTaskForProof.id, proofUrl);
      setSelectedTaskForProof(null);
      setProofUrl('');
      setProofError('');
    }
  };

  // Handle Cashout submission steps
  const handleCashoutContinue = () => {
    if (cashoutStep === 1) {
      if (!selectedPaymentMethod) {
        setCashoutError('Please select a payment method.');
        return;
      }
      setCashoutError('');
      setCashoutStep(2);
    } else if (cashoutStep === 2) {
      // Check coins cost
      const pointsRate = coinsPerUSD; // e.g. coins per $1.00 USD
      const pointsNeeded = cashoutAmount * pointsRate;
      if (user.coins < pointsNeeded) {
        setCashoutError(`Insufficient coins! You need ${pointsNeeded.toLocaleString()} Coins to withdraw $${cashoutAmount.toFixed(2)}.`);
        return;
      }
      setCashoutError('');
      setCashoutStep(3);
    } else if (cashoutStep === 3) {
      if (!cashoutDetails.trim()) {
        setCashoutError('Please enter your withdrawal addresses or account details.');
        return;
      }
      setCashoutError('');
      setCashoutStep(4);
    } else if (cashoutStep === 4) {
      if (!selectedPaymentMethod) return;
      const pointsRate = coinsPerUSD;
      const pointsNeeded = cashoutAmount * pointsRate;
      
      addWithdrawal(
        selectedPaymentMethod.name,
        cashoutAmount,
        pointsNeeded,
        selectedPaymentMethod.currency
      );

      setCashoutSuccessMessage(`Successfully requested withdrawal! Your request of $${cashoutAmount.toFixed(2)} is pending approval.`);
      setCashoutStep(1);
      setSelectedPaymentMethod(null);
      setCashoutAmount(10);
      setCashoutDetails('');
      
      setTimeout(() => {
        setCashoutSuccessMessage('');
      }, 5000);
    }
  };

  // Live Leads Marquee generator
  const getDynamicMarqueeItems = () => {
    const list: { text: string; type: 'add' | 'withdraw'; time: string }[] = [];

    // 1. Add approved tasks (Point Additions)
    tasks
      .filter(t => t.status === 'Approved')
      .slice(0, 5)
      .forEach(t => {
        list.push({
          text: `🎉 Congrats! User completed Task '${t.title}' and scored +${t.rewardCoins.toLocaleString()} Coins!`,
          type: 'add',
          time: 'Active'
        });
      });

    // 2. Add withdrawals
    withdrawals.slice(0, 10).forEach(w => {
      const formattedAmount = w.currency === 'EGP' ? `EGP ${w.amount}` : `$${w.amount.toFixed(2)}`;
      list.push({
        text: `💸 Cashout! ${w.user} requested ${formattedAmount} payout to ${w.method} (${w.status})`,
        type: 'withdraw',
        time: w.date === 'Just now' ? 'Just now' : 'Recent'
      });
    });

    // 3. Fallback seeds to keep the scrolling healthy and highly informative!
    const mocks = [
      { text: 'slowly requested EGP 250 withdrawal to Vodafone Cash', type: 'withdraw' as const, time: 'Approved' },
      { text: 'User_4914 completed survey in MyChips for +280 Pts', type: 'add' as const, time: '1 min ago' },
      { text: 'MikeEarns earned +120 Pts Referral Commission reward', type: 'add' as const, time: '10 mins ago' },
      { text: 'Zayn_00 completed premium trial offer and won +15,000 Pts!', type: 'add' as const, time: '1 hr ago' },
      { text: 'Admin injected custom +5,000 Coins bonus to MikeEarns', type: 'add' as const, time: '2 hrs ago' }
    ];

    return [...list, ...mocks];
  };

  const dynamicMarqueeItems = getDynamicMarqueeItems();

  return (
    <div id="user-dashboard-root" className="min-h-screen bg-[#0f0c29] text-white font-sans flex flex-col overflow-x-hidden relative">
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-600/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/10 backdrop-blur-md border-b border-white/10 px-4 md:px-6 h-16 flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-3">
          <button 
            id="menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 text-gray-400 hover:text-white md:hidden cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <span className="font-extrabold text-white text-base tracking-tighter">P</span>
            </div>
            <span className="text-xl font-bold text-white tracking-wider flex items-center">
              Prize<span className="text-purple-400 font-semibold">Hour</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Switcher Panel Link */}
          {isAdminUser && (
            <button
               onClick={onToggleAdmin}
               className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-500 text-white shadow-lg shadow-pink-500/20 hover:scale-105 transition-all border-none cursor-pointer"
             >
              <Compass className="w-4 h-4" />
              Switch to Admin Panel 🛡️
            </button>
          )}

          {/* Quick Stats: Coins */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-lg">
            <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] text-black font-bold">$</div>
            <span className="text-xs font-bold text-yellow-400">{user.coins.toLocaleString()} Coins</span>
          </div>

          <button className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-pink-550 rounded-full animate-ping"></span>
          </button>

          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-full transition-colors relative cursor-pointer ${isChatOpen ? 'text-pink-400 bg-white/15' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-pink-600 text-[10px] text-white flex items-center justify-center rounded-full font-bold shadow-md shadow-pink-600/30">3</span>
          </button>

          {onLogout && (
            <button 
              onClick={onLogout}
              title="Sign Out"
              className="p-2 text-white/70 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* SCROLLING MARQUEE TICKER (Real-time Point Additions & Withdrawals) */}
      <div className="w-full bg-gradient-to-r from-[#0d0a21]/95 via-[#140f35]/95 to-[#0d0a21]/95 border-b border-white/10 py-2.5 overflow-hidden flex items-center shrink-0 h-10 relative z-30 select-none shadow-lg shadow-[#020010]/30">
        <div className="absolute left-0 top-0 bottom-0 px-4 bg-gradient-to-r from-[#170e30] to-[#120a27] border-r border-[#e23c72]/30 text-pink-400 text-[10px] uppercase font-mono font-black tracking-widest flex items-center shrink-0 z-20 gap-2 shadow-[4px_0_15px_rgba(226,60,114,0.15)]">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_10px_#e23c72] animate-pulse"></span>
          <span>LIVE LEADS</span>
        </div>
        
        {/* Soft edge fade gradient masks */}
        <div className="pointer-events-none absolute left-36 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0d0a21] via-[#0d0a21]/40 to-transparent z-15"></div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0d0a21] to-transparent z-15"></div>

        <div className="flex-grow pl-36 overflow-hidden flex items-center h-full">
          <div className="flex whitespace-nowrap gap-12 animate-scroll-slow cursor-pointer">
            {dynamicMarqueeItems.concat(dynamicMarqueeItems).map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-full pl-1.5 pr-4 py-1 transition-all">
                {item.type === 'add' ? (
                  <span className="text-[#34d399] font-black tracking-wider shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[9px] uppercase border border-emerald-500/20 shadow-[0_2px_8px_rgba(52,211,153,0.08)]">🪙 POINT WIN</span>
                ) : (
                  <span className="text-[#fbbf24] font-black tracking-wider shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-full text-[9px] uppercase border border-amber-500/20 shadow-[0_2px_8px_rgba(251,191,36,0.08)]">💸 CASHOUT</span>
                )}
                <span className="text-white/90 font-medium text-[11px] tracking-wide">{item.text}</span>
                <span className="text-white/30 text-[9px] font-mono shrink-0 font-semibold bg-white/[0.03] px-2 py-0.5 rounded-full">({item.time})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CORE DISPLAY WINDOW */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFTSIDE USER PROFILE + TABS SIDEBAR */}
        <aside 
          id="sidebar-user" 
          className={`${isMobileMenuOpen ? 'flex fixed inset-y-0 left-0 bg-[#0c0a25] w-64 border-r border-white/10 z-50 flex-col justify-between pt-16 shadow-2xl' : 'hidden'} md:flex md:relative md:pt-0 md:bg-white/5 md:backdrop-blur-lg w-64 border-r border-white/10 flex-col justify-between shrink-0 z-10`}
        >
          
          <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
            {/* User Details Box */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-pink-500 to-yellow-500"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-indigo-300 font-bold shadow-lg">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">{user.username}</span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Lvl {user.level}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono tracking-tight">{user.coins.toLocaleString()} Coins</span>
                </div>
              </div>

              {/* Progress to next level */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-mono">
                  <span>Progress to level {user.level + 1}</span>
                  <span className="font-semibold text-purple-400">{user.xpProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#0a091c] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500" 
                    style={{ width: `${user.xpProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Main Tabs List */}
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-3' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-pink-400" />
                Dashboard
              </button>
              
              <button 
                onClick={() => setActiveTab('offers')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'offers' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-3' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <Compass className="w-4 h-4 shrink-0 text-pink-400" />
                Offers
              </button>

              <button 
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'tasks' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-3' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <CheckSquare className="w-4 h-4 shrink-0 text-pink-400" />
                Tasks
              </button>

              <button 
                onClick={() => setActiveTab('affiliates')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'affiliates' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-3' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <Users2 className="w-4 h-4 shrink-0 text-pink-400" />
                Affiliates / Referrals
              </button>

              <button 
                onClick={() => setActiveTab('leaderboard')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'leaderboard' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-3' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <Trophy className="w-4 h-4 shrink-0 text-pink-400" />
                Leaderboard
              </button>

              <button 
                onClick={() => setActiveTab('cashout')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'cashout' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-3' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <Wallet className="w-4 h-4 shrink-0 text-pink-400" />
                Cashout / Withdraw
              </button>

              <button 
                onClick={() => setActiveTab('support')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'support' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-3' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <HelpCircle className="w-4 h-4 shrink-0 text-pink-400" />
                Support Center
              </button>

              <button 
                onClick={() => setActiveTab('articles')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'articles' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-3' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <BookOpen className="w-4 h-4 shrink-0 text-pink-400" />
                Articles / Blog
              </button>
            </nav>
          </div>

          {/* Invitation banner exactly from Screenshot 14 */}
          <div className="p-4 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 text-center grow-0 relative overflow-hidden">
              <span className="text-[9px] font-extrabold uppercase bg-pink-500/30 text-pink-200 px-2 py-0.5 rounded-full border border-pink-500/20 absolute -top-1 -right-2 transform rotate-12">NEW</span>
              <Gift className="w-6 h-6 text-pink-400 mx-auto mb-1" />
              <h4 className="text-xs font-bold text-white mb-0.5">Affiliate Program</h4>
              <p className="text-[10px] text-white/60 leading-tight mb-2">Invite friends to earn points whenever they complete offers.</p>
              <button 
                onClick={() => setActiveTab('affiliates')}
                className="w-full py-1 text-[10px] rounded bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold tracking-wider transition-all cursor-pointer border-none shadow-md shadow-pink-500/10"
              >
                VIEW PROGRAM
              </button>
            </div>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <div className="p-4 border-t border-white/10 shrink-0">
              <button 
                onClick={onLogout}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-red-400 hover:bg-red-500/10 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                LOG OUT
              </button>
            </div>
          )}
        </aside>

        {/* WORKSPACE VIEWS PORTAL */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 z-10">

          {/* TAB HEADER TITLE */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1c1a44]/55 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize tracking-wide flex items-center gap-2">
                {activeTab === 'dashboard' && <LayoutDashboard className="w-6 h-6 text-purple-400" />}
                {activeTab === 'offers' && <Compass className="w-6 h-6 text-indigo-400" />}
                {activeTab === 'tasks' && <CheckSquare className="w-6 h-6 text-emerald-400" />}
                {activeTab === 'affiliates' && <Users2 className="w-6 h-6 text-amber-400" />}
                {activeTab === 'leaderboard' && <Trophy className="w-6 h-6 text-rose-400" />}
                {activeTab === 'cashout' && <Wallet className="w-6 h-6 text-cyan-400" />}
                {activeTab === 'support' && <HelpCircle className="w-6 h-6 text-blue-400" />}
                {activeTab === 'articles' && <BookOpen className="w-6 h-6 text-teal-400" />}
                {activeTab === 'dashboard' ? 'Earning Dashboard' : activeTab}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                {activeTab === 'dashboard' && 'Welcome back! Claim and execute daily sweepstakes and premium sponsor offerings.'}
                {activeTab === 'offers' && 'Filter and start high-paying interactive sponsors to rack up cash points.'}
                {activeTab === 'tasks' && 'Complete manual administration tasks & submit proof URLs to win reward multipliers.'}
                {activeTab === 'affiliates' && 'Grow your personal affiliate empire. Progress tiers to unlock commission bonuses.'}
                {activeTab === 'leaderboard' && 'Compete with regional leaders. The top performers earn huge coin bonuses.'}
                {activeTab === 'cashout' && 'Request rapid payouts directly to your digital wallets or select gift cards.'}
                {activeTab === 'support' && 'Get instant help from our 24/7 dedicated support staff.'}
                {activeTab === 'articles' && 'Keep up to date on platform announcements, strategy write-ups, and game guides.'}
              </p>
            </div>

            {/* Quick Mobile navigation strip */}
            <div className="flex md:hidden items-center gap-1 overflow-x-auto py-1 scrollbar-none shrink-0 border-t border-[#1a1844] mt-1 pt-2">
              {(['dashboard', 'offers', 'tasks', 'affiliates', 'leaderboard', 'cashout', 'support', 'articles'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0 capitalize ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-[#100e2e] text-gray-400'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* 1. DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              
              {/* Highlight Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/60">Coins Balance</span>
                    <h2 className="text-xl font-extrabold text-yellow-400 mt-0.5">{user.coins.toLocaleString()} <span className="text-[10px] uppercase text-white/40 font-mono">Pts</span></h2>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-yellow-400/15 flex items-center justify-center text-yellow-450 border border-yellow-400/20">
                    <span className="font-extrabold text-lg">$</span>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/60">All-Time Earnings</span>
                    <h2 className="text-xl font-extrabold text-white mt-0.5">${user.earningsUSD.toFixed(2)}</h2>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-pink-500/15 flex items-center justify-center text-pink-400 border border-pink-500/20">
                    <span className="font-semibold text-lg">$</span>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/60">Success Rate</span>
                    <h2 className="text-xl font-extrabold text-cyan-400 mt-0.5">{user.successRate}%</h2>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* FEATURED OFFERS SECTION (Screenshot 14) */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">✓</div>
                  <h3 className="text-base font-extrabold text-white tracking-wide">Featured Offers</h3>
                </div>

                {/* Offer cards layout */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {offers.slice(0, 4).map((offer) => (
                    <div 
                      key={offer.id} 
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-col justify-between hover:border-pink-500/40 transition-all hover:translate-y-[-2px] group relative overflow-hidden"
                    >
                      {offer.badgeText && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold bg-pink-500/15 text-pink-300 border border-pink-500/25 rounded">
                          {offer.badgeText}
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-extrabold bg-yellow-400/20 text-yellow-350 border border-yellow-400/20 rounded">
                        ${offer.rewardValue.toFixed(2)}
                      </div>

                      {/* Offer mockup visual logo */}
                      <div className="h-24 w-full bg-white/5 rounded-xl flex flex-col items-center justify-center my-6 text-center border border-white/10 overflow-hidden group">
                        {offer.logoUrl ? (
                          <img 
                            src={offer.logoUrl} 
                            alt={offer.title}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-contain rounded-lg mb-1.5 drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 mb-1">
                            {offer.image === 'Pippit' ? '📱' : '🎮'}
                          </div>
                        )}
                        <span className="text-[10px] text-white/50 font-semibold">{offer.provider}</span>
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-1 mb-0.5">{offer.title}</h4>
                      <p className="text-[9px] text-white/40 mb-3">{offer.provider} Campaign</p>

                      <button 
                        onClick={() => {
                          alert(`Mock Starting Campaign: "${offer.title}". This will direct to task routing.`);
                          updateUserCoins(user.coins + Math.round(offer.rewardValue * coinsPerUSD));
                        }}
                        className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Start <ExternalLink className="w-3 h-3 text-pink-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* PREMIUM OFFERWALLS SECTION (Screenshot 14) */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">👑</div>
                  <h3 className="text-base font-extrabold text-white tracking-wide">Premium Offerwalls</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {offerwalls.map((wall) => (
                    <div 
                      key={wall.id} 
                      className={`p-3 rounded-xl border flex flex-col justify-between min-h-[140px] text-center ${wall.locked ? 'bg-[#100e2e]/55 border-[#201e54]/40 opacity-70' : 'bg-[#121035] border-[#1e1c55] hover:border-purple-500/50 hover:bg-[#151341] transition-all'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">+{wall.bonus}%</span>
                        {wall.locked && <Lock className="w-3.5 h-3.5 text-gray-500" />}
                      </div>

                      <div className="my-2.5 flex items-center justify-center">
                        {wall.logoUrl ? (
                          <img 
                            src={wall.logoUrl} 
                            alt={wall.name} 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-contain rounded-xl bg-slate-950/45 p-1.5 border border-white/5 shadow-inner transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400 text-lg font-extrabold shadow-inner font-mono">
                            {wall.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <h4 className="text-xs font-extrabold text-white">{wall.name}</h4>
                        <p className="text-[9px] text-gray-400 leading-tight mt-1 line-clamp-2 h-6 overflow-hidden">{wall.description}</p>
                      </div>

                      {wall.locked ? (
                        <button disabled className="w-full py-1 text-[10px] rounded bg-gray-800 text-gray-500 font-bold cursor-not-allowed">LOCKED</button>
                      ) : (
                        <button 
                          onClick={() => {
                            setActiveOfferwallIframe(wall);
                            setPostbackDemoOffer(null);
                          }}
                          className="w-full py-1 text-[10px] rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors cursor-pointer"
                        >
                          Open Wall
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 2. OFFERS VIEW */}
          {activeTab === 'offers' && (
            <div className="flex flex-col gap-6">
              
              {/* Filter controls */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex bg-[#0a0820] border border-[#1d1b54] rounded-lg p-1 w-full sm:w-auto">
                  <button className="px-3 py-1 rounded bg-indigo-600 text-white text-xs font-bold leading-none cursor-pointer">All Filters</button>
                  <button className="px-3 py-1 rounded text-gray-400 text-xs font-bold leading-none hover:text-white cursor-pointer mx-1">Surveys</button>
                  <button className="px-3 py-1 rounded text-gray-400 text-xs font-bold leading-none hover:text-white cursor-pointer">App Installs</button>
                </div>
                
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-gray-500" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search offers..." 
                    className="w-full pl-9 pr-4 py-1.5 bg-[#0a0820] text-white border border-[#1d1b54] rounded-lg text-xs placeholder:text-gray-500 focus:outline-none focus:border-purple-500/85" 
                  />
                </div>
              </div>

              {/* Complete layout gallery */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="bg-[#110e2f] border border-[#1c1a44] rounded-xl p-3 flex flex-col justify-between hover:border-purple-500/60 transition-all hover:-translate-y-1 relative">
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 text-[9px] font-bold rounded">
                      {offer.badgeText || 'Global'}
                    </div>

                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold rounded">
                      ${offer.rewardValue.toFixed(2)}
                    </div>

                    <div className="h-20 w-full bg-[#16143c] rounded-lg flex flex-col items-center justify-center my-6 text-center border border-[#201e52] overflow-hidden group">
                      {offer.logoUrl ? (
                        <img 
                          src={offer.logoUrl} 
                          alt={offer.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-contain rounded mb-1.5 drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-xl mb-1">{offer.image === 'Pippit' ? '💡' : '🎮'}</span>
                      )}
                      <span className="text-[10px] text-gray-400 font-mono">{offer.provider}</span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 mb-0.5">{offer.title}</h4>
                      <p className="text-[9px] text-gray-400 mb-3">{offer.provider} Campaign</p>
                    </div>

                    <button 
                      onClick={() => {
                        const earned = Math.round(offer.rewardValue * coinsPerUSD);
                        updateUserCoins(user.coins + earned);
                        addPointHistoryLog(user.username, 'Simulated Offer', `Completed ${offer.title} from ${offer.provider}`, earned);
                        alert(`Successfully completed simulated offer: ${offer.title}. Recieved payout of ${earned.toLocaleString()} Coins!`);
                      }}
                      className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Start Offer <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. TASKS VIEW */}
          {activeTab === 'tasks' && (
            <div className="flex flex-col gap-6">

              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4 flex items-center gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                <p className="text-xs text-gray-300 leading-normal">
                  These tasks are verified manually by administrators. Select any active task below, review instructions, click <strong>"Submit Proof"</strong>, paste a link to your screen, and get rewarded once verified!
                </p>
              </div>

              {/* Tasks List */}
              <div className="flex flex-col gap-3">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-[#100e2e] border border-[#1c1a44] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-[#1a1844] text-purple-300 border border-purple-500/20 rounded">
                          {task.category}
                        </span>
                        
                        {task.status === 'Available' && <span className="text-[10px] font-semibold text-indigo-400">● Available</span>}
                        {task.status === 'Pending Approval' && <span className="text-[10px] font-semibold text-amber-400 animate-pulse">● Pending Approval</span>}
                        {task.status === 'Approved' && <span className="text-[10px] font-semibold text-emerald-400">● Completed & Approved</span>}
                        {task.status === 'Rejected' && <span className="text-[10px] font-semibold text-rose-400">● Rejected</span>}
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1">{task.title}</h4>
                      <p className="text-xs text-gray-400 pr-4 leading-relaxed">{task.instructions}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-[#1c1a44] pt-3 sm:pt-0">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[9px] text-[#070617] font-extrabold">C</div>
                        <span className="text-sm font-bold text-amber-400">+{task.rewardCoins} Coins</span>
                      </div>

                      {task.status === 'Available' && (
                        <button 
                          onClick={() => setSelectedTaskForProof(task)}
                          className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Submit Proof
                        </button>
                      )}

                      {task.status === 'Pending Approval' && (
                        <button disabled className="px-3 py-1.5 rounded bg-gray-800 text-gray-500 text-xs font-bold cursor-not-allowed">
                          Awaiting Review
                        </button>
                      )}

                      {task.status === 'Approved' && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                          <Check className="w-3.5 h-3.5" /> Claimed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. AFFILIATES / REFERRALS VIEW */}
          {activeTab === 'affiliates' && (
            <div className="flex flex-col gap-6">
              
              {/* Referral Link block (Screenshot 7) */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Your Referral Link</h3>
                
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#0a0820] border border-[#1d1b54] p-2.5 rounded-lg text-xs text-gray-200 font-mono select-all truncate">
                    https://prizehour.com/register?ref=r2zYDNRNRc
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('https://prizehour.com/register?ref=r2zYDNRNRc');
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Copied' : 'Copy Link'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 border-t border-[#1c1a44] pt-4 text-center">
                  <div>
                    <span className="text-xs text-gray-400">Successful Referrals</span>
                    <h2 className="text-xl font-extrabold text-white mt-0.5">{user.referralsCount} Users</h2>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Base Commission</span>
                    <h2 className="text-xl font-extrabold text-purple-400 mt-0.5">5.0%</h2>
                  </div>
                </div>
              </div>

              {/* Tier system section (Screenshot 7) */}
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="text-rose-450">🏆</span> Tier System & Rewards
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {referralTiers.map((tier) => (
                    <div 
                      key={tier.tier}
                      className={`p-3 rounded-xl border flex flex-col justify-between text-center min-h-[140px] relative ${user.referralsCount >= tier.reqReferrals ? 'bg-gradient-to-br from-[#1b1542] to-[#121035] border-pink-500 shadow-lg shadow-pink-500/5' : 'bg-[#100e2e] border-[#222055] opacity-60'}`}
                    >
                      {/* Active Status Badge */}
                      {user.referralsCount >= tier.reqReferrals ? (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 text-[8px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                          UNLOCKED
                        </div>
                      ) : (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 text-[8px] font-extrabold uppercase bg-gray-800 text-gray-400 rounded">
                          LOCKED
                        </div>
                      )}

                      {tier.current && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[8px] font-extrabold uppercase bg-pink-500/20 text-pink-300 rounded border border-pink-500/30 animate-pulse">
                          CURRENT
                        </div>
                      )}

                      <div className="mt-6 mb-2">
                        <span className="text-xs text-gray-400 block font-semibold mb-0.5">Tier {tier.tier}</span>
                        <span className="text-[10px] text-indigo-400 font-semibold">{tier.reqReferrals} Referrals required</span>
                        <h4 className="text-lg font-extrabold text-white mt-1">{tier.commission.toFixed(1)}% <span className="text-xs text-gray-400">Comm</span></h4>
                      </div>

                      <div className="mt-1">
                        <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          🎁 {tier.giftText}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. LEADERBOARD VIEW */}
          {activeTab === 'leaderboard' && (
            <div className="flex flex-col gap-6">

              {/* Filter Buttons (Screenshot 6) */}
              <div className="flex justify-center bg-[#100e2e] border border-[#1a1844] rounded-full p-1.5 self-center">
                {(['daily', 'weekly', 'monthly', 'all-time'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterLeaderboard(mode)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all shrink-0 cursor-pointer ${filterLeaderboard === mode ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'text-gray-450 hover:text-white'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Overall platform general statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1">Active Competitors</span>
                  <h2 className="text-2xl font-extrabold text-white">87</h2>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1">All-Time Earnings</span>
                  <h2 className="text-2xl font-extrabold text-green-400">$180.00</h2>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1">Offers Completed</span>
                  <h2 className="text-2xl font-extrabold text-indigo-400">3</h2>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1">Average Earning</span>
                  <h2 className="text-2xl font-extrabold text-white">$180.00</h2>
                </div>
              </div>

              {/* Top performer podium cards (Screenshot 6) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end mt-4">
                
                {/* #2 Test9999 */}
                <div className="bg-[#100e2e]/80 border border-[#201e54] rounded-xl p-5 text-center flex flex-col items-center select-none relative group order-2 sm:order-1">
                  <div className="w-12 h-12 rounded-full border-2 border-indigo-500 bg-indigo-500/15 flex items-center justify-center text-indigo-300 font-bold mb-3 shadow-lg">
                    T9
                  </div>
                  <h3 className="font-bold text-white text-base flex items-center gap-1">
                    Test9999
                  </h3>
                  <p className="text-lg font-extrabold text-indigo-450 mt-1">$1.20</p>
                  <span className="mt-3 inline-block text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">✓ VERIFIED</span>
                </div>

                {/* #1 King Admin */}
                <div className="bg-gradient-to-b from-[#1c144a] to-[#121035] border-2 border-amber-500/80 rounded-2xl p-6 text-center flex flex-col items-center select-none relative shadow-xl shadow-amber-500/5 order-1 sm:order-2 transform sm:scale-105">
                  <div className="absolute -top-3.5 px-3 py-1 text-[9px] font-extrabold tracking-widest text-[#070617] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full border border-amber-300/40 uppercase">
                    👑 #1 KING
                  </div>
                  
                  <div className="w-16 h-16 rounded-full border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center text-amber-500 font-extrabold text-xl mb-3 shadow-lg shadow-amber-500/10 font-mono">
                    AD
                  </div>
                  
                  <h3 className="font-extrabold text-white text-lg">{user.username}</h3>
                  <p className="text-2xl font-black text-amber-400 mt-1">${user.earningsUSD.toFixed(2)}</p>
                  
                  <div className="flex gap-1.5 mt-3 self-center">
                    <span className="text-[9px] font-black uppercase text-[#0d0c1d] bg-gradient-to-r from-purple-400 to-purple-600 px-2 py-0.5 rounded border border-purple-300/20 shadow-md">ADMIN</span>
                    <span className="text-[9px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded border border-indigo-400/20">VIP</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-550/10 px-2 py-0.5 rounded border border-emerald-550/20">VERIFIED</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full mt-4 border-t border-[#1a1844] pt-4 text-center">
                    <div>
                      <span className="text-[9px] text-gray-500 block">LEVEL</span>
                      <span className="text-xs font-bold text-white">{user.level}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block">OFFERS</span>
                      <span className="text-xs font-bold text-white">3</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block">SUCCESS</span>
                      <span className="text-xs font-bold text-white">100%</span>
                    </div>
                  </div>
                </div>

                {/* #3 test1233 */}
                <div className="bg-[#100e2e]/80 border border-[#201e54] rounded-xl p-5 text-center flex flex-col items-center select-none relative group order-3">
                  <div className="w-12 h-12 rounded-full border-2 border-rose-500 bg-rose-500/15 flex items-center justify-center text-rose-300 font-bold mb-3 shadow-lg">
                    T1
                  </div>
                  <h3 className="font-bold text-white text-base">test1233</h3>
                  <p className="text-lg font-extrabold text-[#fc4b6c] mt-1">$0.98</p>
                  <span className="mt-3 inline-block text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">✓ VERIFIED</span>
                </div>

              </div>
            </div>
          )}

          {/* 6. CASHOUT VIEW */}
          {activeTab === 'cashout' && (
            <div className="flex flex-col gap-6">

              {cashoutSuccessMessage && (
                <div role="alert" className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4 flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-xs text-white font-semibold leading-relaxed">{cashoutSuccessMessage}</p>
                </div>
              )}

              {/* Multi-step Earning Withdrawal Center (Screenshot 5) */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-6">
                <h2 className="text-lg font-bold text-white text-center mb-6">Withdraw your Earnings</h2>

                {/* Subtitle Progress bar Steps Indicator */}
                <div className="flex items-center justify-between max-w-md mx-auto mb-8 relative px-4">
                  <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-[#171545] z-0"></div>
                  
                  <div className="z-10 text-center flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 ${cashoutStep >= 1 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#100e2e] border-[#1c1a44] text-gray-500'}`}>1</div>
                    <span className="text-[10px] font-bold uppercase mt-1 text-gray-400">Method</span>
                  </div>

                  <div className="z-10 text-center flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 ${cashoutStep >= 2 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#100e2e] border-[#1c1a44] text-gray-500'}`}>2</div>
                    <span className="text-[10px] font-bold uppercase mt-1 text-gray-400">Amount</span>
                  </div>

                  <div className="z-10 text-center flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 ${cashoutStep >= 3 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#100e2e] border-[#1c1a44] text-gray-500'}`}>3</div>
                    <span className="text-[10px] font-bold uppercase mt-1 text-gray-400">Details</span>
                  </div>

                  <div className="z-10 text-center flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 ${cashoutStep >= 4 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#100e2e] border-[#1c1a44] text-gray-500'}`}>4</div>
                    <span className="text-[10px] font-bold uppercase mt-1 text-gray-400">Confirm</span>
                  </div>
                </div>

                {/* Error Banner inside withdrawal */}
                {cashoutError && (
                  <div className="bg-rose-500/10 border border-rose-500/25 rounded-lg p-3 text-rose-400 text-xs flex items-center gap-2 mb-6">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{cashoutError}</span>
                  </div>
                )}

                {/* STEP 1: METHOD SELECTION */}
                {cashoutStep === 1 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-extrabold text-white">Step 1: Choose Payment Method</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="payment-methods-grid">
                      {paymentMethods.map((method) => (
                        <div 
                          key={method.id}
                          onClick={() => {
                            setSelectedPaymentMethod(method);
                            setCashoutError('');
                          }}
                          className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedPaymentMethod?.id === method.id ? 'bg-[#1c164a] border-purple-500 shadow-md shadow-purple-500/5' : 'bg-[#100e2e] border-[#1c1a44] hover:bg-[#131139]'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-550/15 border border-indigo-500/20 flex items-center justify-center text-sm font-extrabold text-indigo-300 font-mono">
                              {method.logoPlaceholder}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm">{method.name}</h4>
                              <p className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">{method.currency} • {method.type}</p>
                            </div>
                          </div>

                          <div className={`w-4 class-method-radio h-4 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod?.id === method.id ? 'border-purple-500 bg-purple-500' : 'border-gray-600'}`}>
                            {selectedPaymentMethod?.id === method.id && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: AMOUNT SELECTION */}
                {cashoutStep === 2 && selectedPaymentMethod && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-extrabold text-white">Step 2: Withdrawal Amount</h3>
                    <p className="text-xs text-gray-400">Select how much you wish to withdraw to your <strong>{selectedPaymentMethod.name}</strong> account. Current Coins conversion is: <strong>{coinsPerUSD} Coins = $1.00 USD</strong></p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                      {[5, 10, 25, 50, 100].map((val) => {
                        const localCurrencyVal = selectedPaymentMethod.currency === 'EGP' ? val * 16.5 : val;
                        return (
                          <div 
                            key={val}
                            onClick={() => {
                              setCashoutAmount(val);
                              setCashoutError('');
                            }}
                            className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${cashoutAmount === val ? 'bg-[#1c164a] border-purple-500' : 'bg-[#100e2e] border-[#1c1a44]'}`}
                          >
                            <h4 className="text-base font-extrabold text-white">
                              {selectedPaymentMethod.currency === 'EGP' ? `EGP ${localCurrencyVal.toLocaleString()}` : `$${val.toFixed(2)}`}
                            </h4>
                            <p className="text-[10px] text-amber-500 mt-1 font-mono">{(val * coinsPerUSD).toLocaleString()} Coins</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3: DETAILS */}
                {cashoutStep === 3 && selectedPaymentMethod && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-extrabold text-white">Step 3: Transfer Details</h3>
                    <p className="text-xs text-gray-400">Provide required address credentials to route payout.</p>

                    <div className="flex flex-col gap-2 mt-2">
                      <label className="text-xs text-gray-400 font-semibold uppercase font-mono">
                        {selectedPaymentMethod.name} Address / ID / Account Email *
                      </label>
                      <input 
                        type="text"
                        value={cashoutDetails}
                        onChange={(e) => {
                          setCashoutDetails(e.target.value);
                          setCashoutError('');
                        }}
                        placeholder={`e.g. your_account_address@domain.com or hash`}
                        className="w-full bg-[#0a0820] text-white border border-[#222055] focus:border-purple-500 rounded-lg p-3 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: CONFIRM */}
                {cashoutStep === 4 && selectedPaymentMethod && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-extrabold text-white">Step 4: Confirm Withdrawal</h3>
                    
                    <div className="bg-[#100e2e] border border-[#1b1944] rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-semibold uppercase">Provider Method</span>
                        <span className="text-white font-bold">{selectedPaymentMethod.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-[#1b1941] pt-2">
                        <span className="text-gray-400 font-semibold uppercase">Requested Payout</span>
                        <span className="text-white font-bold">
                          {selectedPaymentMethod.currency === 'EGP' ? `EGP ${(cashoutAmount * 16.5).toLocaleString()}` : `$${cashoutAmount.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-[#1b1941] pt-2">
                        <span className="text-gray-400 font-semibold uppercase">Coins Value Cost</span>
                        <span className="text-amber-400 font-bold">{(cashoutAmount * coinsPerUSD).toLocaleString()} Coins</span>
                      </div>
                      <div className="flex flex-col gap-1 text-xs border-t border-[#1b1941] pt-2">
                        <span className="text-gray-400 font-semibold uppercase mb-0.5">Destination</span>
                        <span className="text-gray-200 font-mono break-all">{cashoutDetails}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom step buttons */}
                <div className="flex justify-between items-center mt-8 border-t border-[#1c1a44] pt-4">
                  {cashoutStep > 1 ? (
                    <button 
                      onClick={() => {
                        setCashoutError('');
                        setCashoutStep((cashoutStep - 1) as any);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#141235] border border-[#222055] hover:bg-[#1a1844] text-gray-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Back
                    </button>
                  ) : <div />}

                  <button 
                    onClick={handleCashoutContinue}
                    className="px-5 py-2 rounded-lg bg-teal-550 hover:bg-teal-600 text-black text-xs font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                  >
                    {cashoutStep === 4 ? 'Confirm & Send Request' : 'Continue ➔'}
                  </button>
                </div>
              </div>

              {/* Recent payout lists table */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Your Recent Payout requests</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#201d54] text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                        <th className="pb-2">Transaction ID</th>
                        <th className="pb-2">Method</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Coins Cost</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-gray-300 divide-y divide-[#1e1c54]/30">
                      {withdrawals.slice(0, 5).map((withdraw) => (
                        <tr key={withdraw.id} className="hover:bg-[#151341]/30">
                          <td className="py-2.5 font-mono text-indigo-300">{withdraw.id}</td>
                          <td className="py-2.5">{withdraw.method}</td>
                          <td className="py-2.5 font-bold text-white">
                            {withdraw.currency === 'EGP' ? `EGP ${withdraw.amount.toLocaleString()}` : `$${withdraw.amount.toFixed(2)}`}
                          </td>
                          <td className="py-2.5 text-amber-500 font-mono">{withdraw.pointsCost.toLocaleString()}</td>
                          <td className="py-2.5 text-gray-400">{withdraw.date}</td>
                          <td className="py-2.5 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${withdraw.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : withdraw.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400'}`}>
                              {withdraw.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 7. SUPPORT VIEW */}
          {activeTab === 'support' && (
            <div className="flex flex-col gap-6">

              {/* FAQ banner buttons (Screenshot 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">📞</div>
                  <h4 className="text-xs font-extrabold text-white mb-0.5">Contact Support</h4>
                  <p className="text-[10px] text-gray-400 leading-tight">24/7 Champion team coverage</p>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">❓</div>
                  <h4 className="text-xs font-extrabold text-white mb-0.5">FAQ Answers</h4>
                  <p className="text-[10px] text-gray-400 leading-tight">Instant reference queries</p>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">💰</div>
                  <h4 className="text-xs font-extrabold text-white mb-0.5">Payment Help</h4>
                  <p className="text-[10px] text-gray-400 leading-tight">Fast-track financial issues</p>
                </div>
                <div 
                  onClick={() => setIsNewTicketModalOpen(true)}
                  className="bg-indigo-600 border border-indigo-500 hover:bg-indigo-505 rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-103"
                >
                  <Plus className="w-5 h-5 text-white mb-1" />
                  <h4 className="text-xs font-extrabold text-white">Create Support Ticket</h4>
                </div>
              </div>

              {/* Tickets List Area (Screenshot 4) */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Your Support Tickets</h3>
                  
                  <button 
                    onClick={() => setIsNewTicketModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white" /> New Ticket
                  </button>
                </div>

                {tickets.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center select-none">
                    <div className="w-12 h-12 bg-[#1b194b] text-gray-400 rounded-xl flex items-center justify-center text-lg mb-3">💬</div>
                    <h4 className="text-sm font-bold text-white mb-1">No Support Tickets</h4>
                    <p className="text-xs text-gray-400 max-w-sm leading-normal">You haven't created any support tickets yet. Click the buttons above to submit your first inquiry!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {tickets.map((ticket) => (
                      <div 
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="bg-[#100e2e] border border-[#1e1c58] rounded-xl p-4 flex items-center justify-between hover:border-purple-500/60 transition-all cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-indigo-300 text-xs font-bold">{ticket.id}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${ticket.realStatus === 'Replied' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-500/20 text-amber-300'}`}>
                              {ticket.realStatus}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{ticket.subject}</h4>
                          <span className="text-[10px] text-gray-400 mt-1 block">Created on {ticket.date}</span>
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 8. ARTICLES VIEW */}
          {activeTab === 'articles' && (
            <div className="flex flex-col gap-6">
              
              {/* Latest articles list (Screenshot 3) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <div key={article.id} className="bg-[#121035] border border-[#1e1c55] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-purple-500/50 transition-all">
                    
                    {/* Mock Image top */}
                    <div className="h-44 w-full bg-[#1b1945] flex items-center justify-center relative overflow-hidden text-center select-none border-b border-[#1c1a53]">
                      <img src={article.imageUrl} alt={article.title} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-60" />
                      {article.featured && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-extrabold uppercase bg-amber-500 text-black rounded-full border border-amber-300/30">
                          ⭐️ FEATURED NEWS
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-semibold uppercase mb-2">
                          <span>👤 {article.author}</span>
                          <span>• {article.date}</span>
                          <span>• {article.readTime}</span>
                        </div>

                        <h3 className="font-extrabold text-white text-base leading-tight mb-2 group-hover:text-purple-300 transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                          {article.summary}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#1c1a54]/40 flex items-center justify-between text-xs text-gray-400">
                        <span>👁️ {article.views} views</span>
                        
                        <button 
                          onClick={() => alert(`Simulating Article Reading: "${article.title}"`)}
                          className="font-bold text-indigo-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Read Article ➔
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* RIGHTSIDE LIVE CHAT BOX (Screenshot 14) */}
        {isChatOpen && (
          <aside className="hidden lg:flex w-80 bg-[#090720] border-l border-[#1a1844] flex-col justify-between shrink-0 relative">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>

            {/* Chat header */}
            <div className="p-4 border-b border-[#1a1844] flex items-center justify-between bg-[#0e0c2d]">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span className="inline-block w-2 class-chat-circle h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Chat
                </h3>
                <span className="text-[10px] text-gray-450">129 online • Very Active</span>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Messages box container */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-sans">
              <div className="bg-indigo-950/15 border border-indigo-500/10 rounded-xl p-3 text-[11px] text-indigo-200 leading-relaxed mb-1">
                👋 <strong>Welcome to PrizeHour Live Chat!</strong> Be respectful, coordinate offer guides safely, and have fun earning points!
              </div>

              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex gap-2.5 items-start">
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow ${msg.avatarColor}`}>
                    {msg.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-white">{msg.username}</span>
                      
                      {msg.tag === 'VIP' && (
                        <span className="text-[9px] font-bold uppercase tracking-wide bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-1.5 rounded">
                          VIP
                        </span>
                      )}
                      {msg.tag === 'ADMIN' && (
                        <span className="text-[9px] font-bold uppercase tracking-wide bg-[#e53935] text-white px-1.5 rounded">
                          ADMIN
                        </span>
                      )}
                      {msg.tag === 'PRO' && (
                        <span className="text-[9px] font-bold uppercase tracking-wide bg-purple-500/30 text-purple-300 border border-purple-500/30 px-1.5 rounded">
                          PRO
                        </span>
                      )}
                      {msg.tag === 'MEMBER' && (
                        <span className="text-[9px] font-semibold uppercase tracking-wide bg-indigo-500/20 text-indigo-300 px-1.5 rounded">
                          MBR
                        </span>
                      )}

                      <span className="text-[9px] text-gray-550 font-mono ml-auto">{msg.time}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5 leading-normal pr-1">{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Message input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                addChatMessage(chatInput);
                setChatInput('');
              }}
              className="p-3 border-t border-[#1a1844] bg-[#0c0a25] flex gap-2 items-center"
            >
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 bg-[#121035] border border-[#222055] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/80 placeholder:text-gray-500" 
              />
              <button 
                type="submit"
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-550 text-white shrink-0 cursor-pointer align-middle transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </aside>
        )}

      </div>

      {/* FOOTER GENERAL INFO (Screenshot 2) */}
      <footer className="bg-[#0b0922] border-t border-[#1c1a44]/75 p-6 md:p-8 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
                <span className="font-black text-white text-xs">P</span>
              </div>
              <span className="text-base font-bold text-white tracking-wider">PrizeHour</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-2">
              The ultimate earning platform for champions. Join millions of users making money online every day.
            </p>
            <span className="text-[10px] text-gray-550 block font-mono">© 2026 PrizeHour. All rights reserved.</span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#b5aef7] uppercase tracking-widest mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-xs">
              <button onClick={() => setActiveTab('offers')} className="text-left text-gray-400 hover:text-white transition-colors">Featured Offers</button>
              <button onClick={() => setActiveTab('dashboard')} className="text-left text-gray-400 hover:text-white transition-colors">Watch Videos</button>
              <button onClick={() => setActiveTab('leaderboard')} className="text-left text-gray-400 hover:text-white transition-colors">Leaderboards</button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#b5aef7] uppercase tracking-widest mb-3">Support</h4>
            <div className="flex flex-col gap-2 text-xs">
              <button onClick={() => setActiveTab('support')} className="text-left text-gray-400 hover:text-white transition-colors">Help Center</button>
              <button onClick={() => setActiveTab('support')} className="text-left text-gray-400 hover:text-white transition-colors">FAQ</button>
              <button onClick={() => setActiveTab('support')} className="text-left text-gray-400 hover:text-white transition-colors">Contact Support</button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#b5aef7] uppercase tracking-widest mb-3">Legal</h4>
            <div className="flex flex-col gap-2 text-xs">
              <span className="text-gray-400 hover:text-white cursor-pointer transition-colors block">Terms of Service</span>
              <span className="text-gray-400 hover:text-white cursor-pointer transition-colors block">Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL 1: SUBMIT PROOF OF COMPLETION (Screenshot 8) */}
      {selectedTaskForProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#121035] border border-[#2b2767] rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            
            <button 
              onClick={() => {
                setSelectedTaskForProof(null);
                setProofUrl('');
                setProofError('');
              }}
              className="absolute top-4 right-4 text-gray-450 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-1">
              📸 Submit Proof of Completion
            </h3>
            <p className="text-xs text-gray-400 leading-normal mb-4">Paste link documentation coordinates of your finished task for admin check.</p>

            {/* Task summary header card */}
            <div className="bg-[#100e2e] border border-[#201d54] p-4 rounded-xl text-center mb-5">
              <h4 className="font-bold text-white text-sm">{selectedTaskForProof.title}</h4>
              <span className="text-xs font-bold text-amber-400 inline-block mt-1 font-mono">
                Reward: {selectedTaskForProof.rewardCoins} Coins
              </span>
            </div>

            <form onSubmit={handleTaskProofSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase font-mono">
                  Proof Link (URL) *
                </label>
                <input 
                  type="text"
                  required
                  value={proofUrl}
                  onChange={(e) => {
                    setProofUrl(e.target.value);
                    setProofError('');
                  }}
                  placeholder="https://example.com/your-proof"
                  className="w-full bg-[#0a0820] text-white border border-[#2d2a6a] rounded-xl p-3 text-xs placeholder:text-gray-550 focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-gray-500 italic mt-1">Provide a valid URL showing proof of task completion (screenshot, video, document, etc.)</p>
              </div>

              {proofError && (
                <span className="text-xs text-rose-450">{proofError}</span>
              )}

              {/* Guidelines checklist panel exactly from Screenshot 8 */}
              <div className="bg-[#100e2e]/55 border border-[#252358] rounded-xl p-4">
                <h5 className="text-xs font-extrabold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  📁 Proof Guidelines:
                </h5>
                <ul className="text-[11px] text-gray-350 flex flex-col gap-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Upload your proof to a file sharing service (Google Drive, Dropbox, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Make sure the link is publicly accessible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Include clear evidence of task completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Screenshots should be high quality and readable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-450 font-bold">✗</span>
                    <span className="text-rose-350">Do not submit fake or misleading proof</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-[#1c1a45] pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedTaskForProof(null);
                    setProofUrl('');
                    setProofError('');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#121035] border border-[#242255] hover:bg-[#1a1844] text-gray-350 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-750 text-white text-xs font-bold shadow-lg shadow-purple-600/10 cursor-pointer"
                >
                  Submit Proof
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: NEW SUPPORT TICKET CREATION */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#121035] border border-[#2b2767] rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setIsNewTicketModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-white mb-4">Create New Support Ticket</h3>
            
            <form onSubmit={handleCreateTicketSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-450 uppercase font-mono font-semibold">Subject / Ticket Title *</label>
                <input 
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. PayPal Withdrawal Pending"
                  className="w-full bg-[#0a0820] text-white border border-[#242255] focus:border-indigo-500 rounded-lg p-3 text-xs placeholder:text-gray-550 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-450 uppercase font-mono font-semibold">Message Description *</label>
                <textarea 
                  required
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Provide detailed logs or contexts..."
                  className="w-full bg-[#0a0820] text-white border border-[#242255] focus:border-indigo-500 rounded-lg p-3 text-xs placeholder:text-gray-550 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#1a1841] pt-4">
                <button 
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#141235] border border-[#222055] text-gray-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold cursor-pointer animate-pulse"
                >
                  Post Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW SELECTED TICKET CONVERSATION */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#121035] border border-[#2b2767] rounded-2xl shadow-2xl p-6 relative flex flex-col justify-between max-h-[85vh]">
            
            <div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 text-gray-450 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-indigo-300 font-bold text-xs">{selectedTicket.id}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${selectedTicket.realStatus === 'Replied' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-500/20 text-indigo-300'}`}>
                  {selectedTicket.realStatus}
                </span>
              </div>
              
              <h3 className="text-base font-extrabold text-white mb-4 line-clamp-1 border-b border-[#1b1945] pb-2">
                Subject: {selectedTicket.subject}
              </h3>
            </div>

            {/* Conversational Scroll window */}
            <div className="flex-1 overflow-y-auto my-3 flex flex-col gap-4 pr-1 scrollbar-thin">
              {selectedTicket.messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border max-w-[85%] ${msg.sender === 'user' ? 'bg-[#100e2e] border-[#1d1a4d] self-end' : 'bg-[#1c184c] border-indigo-500/30 self-start'}`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] text-gray-400 mb-1.5 font-semibold">
                    <span className={msg.sender === 'admin' ? 'text-indigo-300 font-bold' : ''}>
                      {msg.sender === 'admin' ? '🛡️ Administrator Support' : msg.senderName}
                    </span>
                    <span className="font-mono">{msg.time}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-normal">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Post reply box */}
            <form onSubmit={handleTicketReplySubmit} className="border-t border-[#1b1945] pt-4 mt-3">
              <div className="flex gap-2">
                <input 
                  type="text"
                  required
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  placeholder="Post reply to support..."
                  className="flex-1 bg-[#0a0820] text-white border border-[#222055] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Send
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        tasks={tasks} 
        withdrawals={withdrawals} 
        currentUser={user.username} 
      />

      {/* DYNAMIC OFFERWALLS IFRAME & POSTBACK SIMULATION SYSTEM */}
      {activeOfferwallIframe && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-300">
          <div className="relative bg-[#07051a] border border-indigo-550/30 rounded-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden shadow-2xl shadow-indigo-500/10">
            
            {/* Top Navigation Bar - Professional and Polished */}
            <div className="p-3 bg-[#0a0721] border-b border-[#1e1c55]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-sans text-left shrink-0">
              <div className="flex items-center gap-3">
                {activeOfferwallIframe.logoUrl ? (
                  <img 
                    src={activeOfferwallIframe.logoUrl} 
                    alt={activeOfferwallIframe.name} 
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-contain rounded-lg bg-black/30 p-1 border border-white/5 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-550/20 flex items-center justify-center text-indigo-400 font-extrabold text-sm shrink-0">
                    {activeOfferwallIframe.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
                    {activeOfferwallIframe.name} Offerwall
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">+{activeOfferwallIframe.bonus}% Bonus</span>
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{activeOfferwallIframe.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Direct Action: Open wall in real new tab immediately to bypass sandstone frame checks */}
                <a 
                  href={activeOfferwallIframe.iframeUrl || `https://example.com/mock-wall`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Open in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-200" />
                </a>

                {/* Toggle simulations / postback testing drawer */}
                <button 
                  onClick={() => setIsSimulatorExpanded(!isSimulatorExpanded)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${isSimulatorExpanded ? 'bg-indigo-650/40 border-indigo-500/50 text-indigo-300 shadow-inner' : 'bg-slate-800/60 border-slate-700/40 text-gray-300 hover:bg-slate-705'}`}
                >
                  <span>🧪 Simulation Tools</span>
                </button>

                {/* Close Button */}
                <button 
                  onClick={() => setActiveOfferwallIframe(null)}
                  className="p-1 px-2.5 bg-rose-605/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg cursor-pointer border border-rose-500/10 transition-colors"
                  title="Close Wall"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split View Container for Frame and Drawer */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              
              {/* Left Column: Pure Direct Native Iframe, NO Overlay, 100% Free space */}
              <div className="flex-1 bg-[#050414] h-full relative">
                <iframe 
                  src={activeOfferwallIframe.iframeUrl || `https://example.com/mock-wall`} 
                  className="w-full h-full border-0 bg-[#050414]"
                  title={activeOfferwallIframe.name}
                  referrerPolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>

              {/* Right Column: Slide-in/Collapsible Live Admin Postback Simulation Engine */}
              {isSimulatorExpanded && (
                <div className="w-full md:w-[350px] p-5 flex flex-col justify-between overflow-y-auto h-full bg-[#090720] border-t md:border-t-0 md:border-l border-[#1e1c55]/40 text-left shrink-0 animate-fade-in">
                  <div className="flex flex-col gap-5">
                    {/* Title */}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm">⚡</span>
                        <h3 className="text-xs font-extrabold text-white tracking-wide uppercase font-sans">Active Postback Simulator</h3>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        Test integration transaction processing! This credits Coin rewards into the mock database simulation table directly.
                      </p>
                    </div>

                    {/* Simulated Success Message banner */}
                    {postbackSuccessMessage && (
                      <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 rounded-xl text-xs flex flex-col gap-1 leading-relaxed">
                        <p className="font-extrabold select-all">{postbackSuccessMessage}</p>
                        <div className="w-full h-1 bg-black/30 rounded mt-1 overflow-hidden">
                          <div className="h-full bg-emerald-500 animate-pulse" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    )}

                    {/* Form fields */}
                    <div className="flex flex-col gap-4">
                      {/* Select demo offer */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider">1. Select Campaign to Complete</label>
                        <select 
                          onChange={(e) => {
                            const found = offers.find(o => o.id === parseInt(e.target.value, 10));
                            setPostbackDemoOffer(found || null);
                          }}
                          className="w-full bg-[#0d0a27] text-white border border-[#211f5e] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                          defaultValue=""
                        >
                          <option value="" disabled>-- Choose a simulation offer --</option>
                          {offers.map((offer) => (
                            <option key={offer.id} value={offer.id}>
                              [{offer.id}] {offer.title} - ${offer.rewardValue} value
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Target User */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider">2. Recipient Username (SUB ID)</label>
                        <input 
                          type="text"
                          className="w-full bg-[#0d0a27] text-gray-350 border border-[#211f5e] rounded-xl px-3 py-1.5 text-xs focus:outline-none font-mono"
                          value={user.username}
                          disabled
                        />
                        <span className="text-[9px] text-gray-500 font-mono tracking-wide">Prefilled from active login session payload.</span>
                      </div>

                      {/* Dynamic Math metrics */}
                      {postbackDemoOffer && (
                        <div className="bg-[#121033] border border-[#1e1c55]/50 p-4 rounded-xl flex flex-col gap-3 font-mono text-xs">
                          <div className="flex justify-between items-center text-white">
                            <span>Campaign Net Payout:</span>
                            <span className="text-emerald-400 font-extrabold">${postbackDemoOffer.rewardValue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-white border-t border-white/5 pt-2">
                            <span>Conversion Rate:</span>
                            <span className="text-indigo-300 font-extrabold">{coinsPerUSD} Coins/$1</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-white/5 pt-2">
                            <span className="text-gray-400 font-bold">REWARD TO CREDIT:</span>
                            <span className="text-amber-400 font-extrabold text-sm font-mono tracking-wider">
                              {Math.round(postbackDemoOffer.rewardValue * coinsPerUSD).toLocaleString()} Coins
                            </span>
                          </div>
                        </div>
                      )}

                      {/* API endpoint format string preview */}
                      <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">HTTP GET Request Preview</span>
                        <p className="text-[9px] font-mono text-indigo-300/80 break-all select-all leading-relaxed">
                          https://prizehour.com/api/postback/{activeOfferwallIframe.name.toLowerCase()}?user={user.username}&payout={postbackDemoOffer ? Math.round(postbackDemoOffer.rewardValue * coinsPerUSD) : 'coins'}&campaign={postbackDemoOffer ? encodeURIComponent(postbackDemoOffer.title) : 'offer_id'}&secret_pb=xyz_post_pwd
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Complete & Credit button */}
                  <div className="pt-6 border-t border-[#1e1c55]/30">
                    <button 
                      onClick={() => {
                        if (!postbackDemoOffer) {
                          alert('Please select a campaign from step 1 first!');
                          return;
                        }
                        
                        const coinsAwarded = Math.round(postbackDemoOffer.rewardValue * coinsPerUSD);
                        updateUserCoins(user.coins + coinsAwarded);
                        
                        // Insert into points history ledger
                        addPointHistoryLog(
                          user.username,
                          'Approved Task',
                          `Completed Campaign: ${postbackDemoOffer.title} via ${activeOfferwallIframe.name} Wall`,
                          coinsAwarded
                        );
                        
                        // Record into global Admin auditable Postbacks logs
                        const newTriggerLog = {
                          id: `PB-${Math.floor(1000 + Math.random() * 9000)}-${Date.now()}`,
                          network: activeOfferwallIframe.name,
                          user: user.username,
                          coins: coinsAwarded,
                          offerName: postbackDemoOffer.title,
                          date: new Date().toLocaleString(),
                          status: 'Success'
                        };
                        
                        try {
                          const existing = localStorage.getItem('prizehour_postback_triggers');
                          const list = existing ? JSON.parse(existing) : [];
                          list.unshift(newTriggerLog);
                          localStorage.setItem('prizehour_postback_triggers', JSON.stringify(list));
                        } catch (e) {
                          console.error(e);
                        }
                        
                        setPostbackSuccessMessage(`🎁 Perfect! Simulation Complete: +${coinsAwarded.toLocaleString()} Coins added to your account! Postback hit URL parameter returned status: [HTTP 200 OK].`);
                        setTimeout(() => {
                          setPostbackSuccessMessage('');
                        }, 6500);
                      }}
                      disabled={!postbackDemoOffer}
                      className={`w-full py-3 rounded-xl text-xs font-bold text-center gap-2 flex items-center justify-center border transition-all cursor-pointer ${postbackDemoOffer ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-550 hover:to-indigo-550 text-white border-purple-500/20 active:scale-95 shadow-lg shadow-purple-500/10' : 'bg-gray-800 text-gray-500 border-gray-700/35 cursor-not-allowed'}`}
                    >
                      Trigger Simulated Postback
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
