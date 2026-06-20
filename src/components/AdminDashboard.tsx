/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserStats,
  Task,
  Offer,
  Offerwall,
  Withdrawal,
  PaymentMethod,
  PostbackConfig,
  SecurityEvent
} from '../types';
import {
  LayoutDashboard,
  Users2,
  Activity,
  CheckSquare,
  Gift,
  Video,
  MonitorPlay,
  Share2,
  Server,
  Wallet,
  Check,
  Shield,
  X,
  Plus,
  Compass,
  Copy,
  Terminal,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Trash2,
  Sliders,
  Settings,
  Bell,
  Lock,
  Smartphone,
  ExternalLink,
  History,
  Sparkles,
  LogOut
} from 'lucide-react';
import HistoryModal, { addPointHistoryLog } from './HistoryModal';

interface AdminDashboardProps {
  user: UserStats;
  tasks: Task[];
  approveTaskProof: (taskId: number) => void;
  rejectTaskProof: (taskId: number) => void;
  withdrawals: Withdrawal[];
  approveWithdrawal: (id: string) => void;
  rejectWithdrawal: (id: string) => void;
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (name: string, currency: string, type: 'Cash Payment' | 'Gift Cards') => void;
  deletePaymentMethod: (id: string) => void;
  postbacks: PostbackConfig[];
  addPostback: (network: string, url: string) => void;
  securityEvents: SecurityEvent[];
  onToggleUser: () => void;
  onLogout?: () => void;
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  offerwalls: Offerwall[];
  setOfferwalls: React.Dispatch<React.SetStateAction<Offerwall[]>>;
  coinsPerUSD: number;
  setCoinsPerUSD: React.Dispatch<React.SetStateAction<number>>;
}

export default function AdminDashboard({
  user,
  tasks,
  approveTaskProof,
  rejectTaskProof,
  withdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  paymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  postbacks,
  addPostback,
  securityEvents,
  onToggleUser,
  onLogout,
  offers,
  setOffers,
  offerwalls,
  setOfferwalls,
  coinsPerUSD,
  setCoinsPerUSD
}: AdminDashboardProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'users' | 'tasks' | 'postbacks' | 'payments' | 'security' | 'networks' | 'history'>('overview');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Local lists search/filter
  const [userSearchText, setUserSearchText] = useState('');
  const [withdrawalSearchText, setWithdrawalSearchText] = useState('');

  // Dynamic user list loaded from localStorage
  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('prizehour_auth_users');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored users in admin', e);
    }
    return [
      {
        username: 'testuser',
        email: 'user@example.com',
        userStats: {
          username: 'testuser',
          email: 'user@example.com',
          level: 3,
          coins: 12500,
          xpProgress: 45,
          earningsUSD: 62.50,
          offersCompleted: 8,
          successRate: 94,
          joinedDate: 'Joined May 2026',
          status: 'Online',
          riskScore: 12,
          riskLevel: 'Low Risk',
          referralsCount: 4,
          banned: false
        }
      }
    ];
  });

  const saveUsersToStorage = (updatedList: any[]) => {
    setRegisteredUsers(updatedList);
    localStorage.setItem('prizehour_auth_users', JSON.stringify(updatedList));
  };

  const handleToggleBanUser = (usernameToToggle: string) => {
    const updated = registeredUsers.map(u => {
      if (u.username.toLowerCase() === usernameToToggle.toLowerCase()) {
        const uStats = u.userStats || {};
        const currentBanned = uStats.banned || false;
        const newStatus = !currentBanned ? 'Banned' : 'Online';
        return {
          ...u,
          userStats: {
            ...uStats,
            status: newStatus,
            banned: !currentBanned
          }
        };
      }
      return u;
    });
    saveUsersToStorage(updated);
  };

  const handleAddCoinsToUser = (usernameToTarget: string) => {
    const amountStr = prompt(`Enter custom bonus coins to inject to ${usernameToTarget}:`, '5000');
    if (!amountStr) return;
    const amountNum = parseInt(amountStr, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid positive number.');
      return;
    }
    const updated = registeredUsers.map(u => {
      if (u.username.toLowerCase() === usernameToTarget.toLowerCase()) {
        const uStats = u.userStats || {};
        const currentCoins = uStats.coins ?? 0;
        return {
          ...u,
          userStats: {
            ...uStats,
            coins: currentCoins + amountNum
          }
        };
      }
      return u;
    });
    saveUsersToStorage(updated);
    addPointHistoryLog(usernameToTarget, 'Admin Bonus', 'Admin custom bonus injection', amountNum);
    alert(`Successfully injected +${amountNum.toLocaleString()} coins to ${usernameToTarget}!`);
  };

  // Dynamic metrics of withdrawals
  const totalApprovedCount = withdrawals.filter(w => w.status === 'Approved').length;
  const totalPendingCount = withdrawals.filter(w => w.status === 'Pending').length;
  const totalRejectedCount = withdrawals.filter(w => w.status === 'Rejected').length;
  const totalRefundedCount = withdrawals.filter(w => w.status === 'Refunded').length;
  const totalWithdrawalsCount = withdrawals.length;

  // Dynamic user statistics
  const totalUsersCount = registeredUsers.length;
  const bannedCount = registeredUsers.filter(u => u.userStats?.banned).length;
  const activeCount = Math.max(1, totalUsersCount - bannedCount); // at least current admin/active tester is online
  const activePercent = totalUsersCount > 0 ? Math.round((activeCount / totalUsersCount) * 100) : 100;

  const vpnSuspectedCount = registeredUsers.filter(u => (u.userStats?.riskScore ?? 0) > 40).length;
  const vpnEventsCount = securityEvents.filter(e => e.type === 'VPN Detect' || e.type === 'Abuse Block').length;

  // Revenue estimation models
  const approvedWithdrawalsSum = withdrawals
    .filter(w => w.status === 'Approved')
    .reduce((sum, w) => sum + w.amount, 0);

  const approvedTasksSumCoins = tasks
    .filter(t => t.status === 'Approved')
    .reduce((sum, t) => sum + t.rewardCoins, 0);

  // Profit calculated dynamically
  const todayProfitVal = (approvedTasksSumCoins * 0.00015) + (approvedWithdrawalsSum * 0.30) + 15.50;
  const monthProfitVal = todayProfitVal * 25.4;

  // Dynamic Live Leads marquee combining current real actions (Approved Tasks and Cashouts)
  const getDynamicMarqueeItems = () => {
    const list: { text: string; time: string }[] = [];

    // 1. Add approved tasks (Point Additions)
    tasks
      .filter(t => t.status === 'Approved')
      .slice(0, 5)
      .forEach(t => {
        list.push({
          text: `A user completed task '${t.title}' for +${t.rewardCoins} Pts!`,
          time: 'Active'
        });
      });

    // 2. Add withdrawals
    withdrawals.slice(0, 10).forEach(w => {
      const formattedAmount = w.currency === 'EGP' ? `EGP ${w.amount}` : `$${w.amount.toFixed(2)}`;
      list.push({
        text: `${w.user} requested ${formattedAmount} payout to ${w.method} (${w.status})`,
        time: w.date === 'Just now' ? 'Just now' : 'Recent'
      });
    });

    // 3. Fallback seeds to keep the scrolling healthy and highly informative!
    const mocks = [
      { text: 'slowly requested EGP 250 withdrawal to Vodafone Cash', time: 'Approved' },
      { text: 'User_4914 completed survey in MyChips for +280 Pts', time: '1 min ago' },
      { text: 'MikeEarns earned +120 Pts Referral Commission reward', time: '10 mins ago' },
      { text: 'Zayn_00 completed premium trial offer and won +15,000 Pts!', time: '1 hr ago' },
      { text: 'Admin injected custom +5,000 Coins bonus to MikeEarns', time: '2 hrs ago' }
    ];

    return [...list, ...mocks];
  };

  const dynamicMarqueeItems = getDynamicMarqueeItems();

  // SVG Donut percentages
  const approvedPct = totalWithdrawalsCount > 0 ? totalApprovedCount / totalWithdrawalsCount : 0.45;
  const pendingPct = totalWithdrawalsCount > 0 ? totalPendingCount / totalWithdrawalsCount : 0.35;
  const rejectedPct = totalWithdrawalsCount > 0 ? totalRejectedCount / totalWithdrawalsCount : 0.12;
  const refundedPct = totalWithdrawalsCount > 0 ? totalRefundedCount / totalWithdrawalsCount : 0.08;

  const totalLength = 251.2;

  // Dynamic Months Registration Trend
  const getMonthsRegistrationStats = () => {
    const counts = [1, 2, 4, 8, 14, 0]; // beautiful progression for Jan-May
    let liveJunCount = 0;
    let liveMayCount = 0;
    let fallbackCount = 0;

    registeredUsers.forEach(u => {
      const dateStr = u.userStats?.joinedDate || '';
      if (dateStr.includes('Jun')) {
        liveJunCount++;
      } else if (dateStr.includes('May')) {
        liveMayCount++;
      } else {
        fallbackCount++;
      }
    });

    counts[4] += liveMayCount;
    counts[5] += liveJunCount + fallbackCount;

    return counts;
  };

  const trendCounts = getMonthsRegistrationStats();
  const maxTrendVal = Math.max(...trendCounts, 1);
  const xPoints = [5, 23, 41, 59, 77, 95];
  const yPoints = trendCounts.map(cnt => 35 - ((cnt / maxTrendVal) * 30));

  const linePath = `M ${xPoints[0]},${yPoints[0]} ` + 
    xPoints.slice(1).map((x, i) => `L ${x},${yPoints[i+1]}`).join(' ');

  const areaPath = `${linePath} L 95,35 L 5,35 Z`;

  // Add Payment Modal states
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [newPayName, setNewPayName] = useState('');
  const [newPayCurrency, setNewPayCurrency] = useState('USD');
  const [newPayType, setNewPayType] = useState<'Cash Payment' | 'Gift Cards'>('Cash Payment');
  const [paymentError, setPaymentError] = useState('');

  // Postback add inputs
  const [isAddPostbackOpen, setIsAddPostbackOpen] = useState(false);
  const [newNetworkName, setNewNetworkName] = useState('');
  const [newPostbackUrl, setNewPostbackUrl] = useState('');
  const [postbackError, setPostbackError] = useState('');

  // Security toggles state
  const [vpnDetection, setVpnDetection] = useState(true);
  const [autoIpBlocking, setAutoIpBlocking] = useState(true);
  const [deviceFingerprinting, setDeviceFingerprinting] = useState(true);

  // IP Block inputs
  const [ipAddressBlockInput, setIpAddressBlockInput] = useState('');
  const [blockedReason, setBlockedReason] = useState('Fraud Activity');
  const [ipBlockDuration, setIpBlockDuration] = useState('24');
  const [blockedIpsList, setBlockedIpsList] = useState<string[]>([]);
  const [currentIpMessage, setCurrentIpMessage] = useState('');

  // A-to-Z User editing modal states
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<any | null>(null);
  const [editCoins, setEditCoins] = useState<number>(0);
  const [editLevel, setEditLevel] = useState<number>(3);
  const [editRiskScore, setEditRiskScore] = useState<number>(10);
  const [editRiskLevel, setEditRiskLevel] = useState<string>('Low Risk');
  const [editReferralsCount, setEditReferralsCount] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<string>('Online');
  const [editUserEmail, setEditUserEmail] = useState<string>('');

  // Featured campaigns creator states
  const [isAddOfferOpen, setIsAddOfferOpen] = useState<boolean>(false);
  const [newOfferTitle, setNewOfferTitle] = useState<string>('');
  const [newOfferValue, setNewOfferValue] = useState<number>(1.50);
  const [newOfferProvider, setNewOfferProvider] = useState<string>('Torox');
  const [newOfferImage, setNewOfferImage] = useState<string>('Pippit');
  const [newOfferLogoUrl, setNewOfferLogoUrl] = useState<string>('');

  // Custom premium offeralls creator states
  const [isAddOfferwallOpen, setIsAddOfferwallOpen] = useState<boolean>(false);
  const [newWallName, setNewWallName] = useState<string>('');
  const [newWallBonus, setNewWallBonus] = useState<number>(10);
  const [newWallDesc, setNewWallDesc] = useState<string>('');
  const [newWallIframe, setNewWallIframe] = useState<string>('');
  const [newWallRating, setNewWallRating] = useState<number>(5);
  const [newWallLogoUrl, setNewWallLogoUrl] = useState<string>('');

  // Exchange rate configuration local state
  const [localCoinsPerUSD, setLocalCoinsPerUSD] = useState<number>(coinsPerUSD);

  // Postback Simulator live logs loaded from localStorage
  const [simulatedPostbackLogs, setSimulatedPostbackLogs] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('prizehour_postback_triggers');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Keep internal state updated with dynamic outer prop rate
  useEffect(() => {
    setLocalCoinsPerUSD(coinsPerUSD);
  }, [coinsPerUSD]);

  // Pull periodic updates for simulated postback trigger logs
  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const stored = localStorage.getItem('prizehour_postback_triggers');
        if (stored) {
          setSimulatedPostbackLogs(JSON.parse(stored));
        }
      } catch (e) {}
    };
    const interval = setInterval(handleStorageUpdate, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveUserEdit = () => {
    if (!selectedUserToEdit) return;
    const updated = registeredUsers.map(u => {
      if (u.username.toLowerCase() === selectedUserToEdit.username.toLowerCase()) {
        const uStats = u.userStats || {};
        return {
          ...u,
          email: editUserEmail,
          userStats: {
            ...uStats,
            email: editUserEmail,
            coins: editCoins,
            level: editLevel,
            riskScore: editRiskScore,
            riskLevel: editRiskLevel,
            referralsCount: editReferralsCount,
            status: editStatus,
            banned: editStatus === 'Banned'
          }
        };
      }
      return u;
    });
    saveUsersToStorage(updated);
    setSelectedUserToEdit(null);
    alert('User profile stats updated successfully!');
  };

  const handleSaveExchangeRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (localCoinsPerUSD <= 0 || isNaN(localCoinsPerUSD)) {
      alert('Please specify a positive integer conversion rate.');
      return;
    }
    setCoinsPerUSD(localCoinsPerUSD);
    alert(`Success: Point exchange rate saved! Current formula matches: ${localCoinsPerUSD} Coins = $1.00 USD`);
  };

  const handleAddFeaturedOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferTitle.trim()) {
      alert('Campaign Title cannot be blank.');
      return;
    }
    const newOffer: Offer = {
      id: Date.now(),
      title: newOfferTitle,
      rewardValue: newOfferValue,
      provider: newOfferProvider,
      image: newOfferImage || 'game_controller',
      country: 'Global',
      badgeText: 'HOT',
      logoUrl: newOfferLogoUrl || 'https://img.icons8.com/color/96/game-controller.png'
    };
    setOffers(prev => [newOffer, ...prev]);
    setIsAddOfferOpen(false);
    setNewOfferTitle('');
    setNewOfferValue(1.50);
    setNewOfferLogoUrl('');
    alert('Dynamic featured campaign listed successfully!');
  };

  const handleDeleteFeaturedOffer = (id: number) => {
    if (confirm('Are you absolutely sure you want to remove this campaign?')) {
      setOffers(prev => prev.filter(o => o.id !== id));
    }
  };

  const handleAddOfferwall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWallName.trim()) {
      alert('Offerwall name is required.');
      return;
    }
    const newWall: any = {
      id: `wall-${Date.now()}`,
      name: newWallName,
      bonus: newWallBonus,
      description: newWallDesc || 'Complete standard campaigns to score bonus coins.',
      locked: false,
      rating: newWallRating,
      iframeUrl: newWallIframe || 'https://example.com/mock-wall',
      logoUrl: newWallLogoUrl || 'https://img.icons8.com/color/96/commercial.png'
    };
    setOfferwalls(prev => [...prev, newWall]);
    setIsAddOfferwallOpen(false);
    setNewWallName('');
    setNewWallBonus(10);
    setNewWallDesc('');
    setNewWallIframe('');
    setNewWallLogoUrl('');
    alert('Brand new Offerwall registered successfully!');
  };

  const handleDeleteOfferwall = (id: string) => {
    if (confirm('Are you sure you want to delete this offerwall?')) {
      setOfferwalls(prev => prev.filter(w => w.id !== id));
    }
  };

  // Copy registration
  const [copiedUrlId, setCopiedUrlId] = useState<number | null>(null);

  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayName.trim()) {
      setPaymentError('Name is required.');
      return;
    }
    addPaymentMethod(newPayName, newPayCurrency, newPayType);
    setNewPayName('');
    setNewPayCurrency('USD');
    setNewPayType('Cash Payment');
    setIsAddPaymentOpen(false);
    setPaymentError('');
  };

  const handleAddPostbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNetworkName.trim() || !newPostbackUrl.trim()) {
      setPostbackError('Both fields are required.');
      return;
    }
    addPostback(newNetworkName, newPostbackUrl);
    setNewNetworkName('');
    setNewPostbackUrl('');
    setIsAddPostbackOpen(false);
    setPostbackError('');
  };

  const handleBlockIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipAddressBlockInput.trim()) return;
    setBlockedIpsList([...blockedIpsList, ipAddressBlockInput]);
    setCurrentIpMessage(`Successfully blocked IP ${ipAddressBlockInput} for ${ipBlockDuration} hours.`);
    setIpAddressBlockInput('');
    setTimeout(() => setCurrentIpMessage(''), 3000);
  };

  // Helper lists
  const filteredUsersList = registeredUsers.map((u, index) => {
    const stats = u.userStats || {};
    const riskScore = stats.riskScore ?? 10;
    const trustScore = Math.max(0, 100 - riskScore);
    const riskLevel = stats.banned ? 'Banned' : (stats.riskLevel || (riskScore > 75 ? 'High Risk' : riskScore > 35 ? 'Medium Risk' : 'Low Risk'));
    
    return {
      id: `#${2178 + index}`,
      username: u.username,
      email: u.email,
      trust: trustScore,
      risk: riskLevel,
      lastAct: stats.joinedDate || 'Never',
      banned: stats.banned || false,
      coins: stats.coins ?? 0,
      userStats: stats
    };
  }).filter(u => 
    u.username.toLowerCase().includes(userSearchText.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchText.toLowerCase())
  );

  // Dynamic marquee helper mapping points addition and withdrawals
  const getDynamicTickerItems = () => {
    const items: { text: string; type: 'add' | 'withdraw'; time: string }[] = [];

    // Approved manual tasks as point additions
    tasks.forEach((t) => {
      if (t.status === 'Approved') {
        items.push({
          text: `🎯 ${user.username || 'System User'} earned +${t.rewardCoins.toLocaleString()} Coins on Task: "${t.title}"`,
          type: 'add',
          time: 'Active'
        });
      }
    });

    // Payout transactions
    withdrawals.forEach((w) => {
      const displayAmount = w.currency === 'EGP' ? `EGP ${w.amount.toLocaleString()}` : `$${w.amount.toFixed(2)}`;
      if (w.status === 'Approved') {
        items.push({
          text: `💸 Cashout Success! ${w.user} Cashed Out ${displayAmount} via ${w.method}`,
          type: 'withdraw',
          time: 'Paid'
        });
      } else {
        items.push({
          text: `⏳ Withdrawal Requested: ${w.user} requested ${displayAmount} to ${w.method}`,
          type: 'withdraw',
          time: 'Pending'
        });
      }
    });

    const fallbackItems = [
      { text: '🔥 MikeEarns completed CPA Offerwall Survey and won +1,200 Coins!', type: 'add' as const, time: '1 min ago' },
      { text: '💸 Zayn_00 cashed out $5.00 via PayPal', type: 'withdraw' as const, time: '4 mins ago' },
      { text: '🎉 slowly reached Level 4 VIP with +500 Coins bonus!', type: 'add' as const, time: '12 mins ago' },
      { text: '💸 testuser cashed out EGP 200 via Instapay', type: 'withdraw' as const, time: '18 mins ago' },
      { text: '🔥 User_4914 started CPALead CPA campaign (+950 Coins conversion)', type: 'add' as const, time: '22 mins ago' }
    ];

    return [...items, ...fallbackItems];
  };

  // Render a beautiful layout
  return (
    <div id="admin-dashboard-root" className="min-h-screen bg-[#0f0c29] text-white font-sans flex flex-col overflow-x-hidden relative">
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-600/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/10 backdrop-blur-md border-b border-white/10 px-4 md:px-6 h-16 flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className="md:hidden p-2 text-gray-400 hover:text-white">
            <Sliders className="w-5 h-5" />
          </div>
          <span className="text-sm font-black tracking-widest text-pink-400 uppercase">Admin Command Center 🛡️</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleUser}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-500 text-white shadow-lg shadow-pink-500/20 hover:scale-105 transition-all border-none cursor-pointer"
          >
            <Compass className="w-4 h-4" /> Switch to User Portal 👤
          </button>

          {/* Dedicated History Ledger Button for Admins */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-lg text-xs font-semibold text-pink-300 transition-all cursor-pointer animate-pulse hover:animate-none"
            title="View Point & Withdraw Ledgers"
          >
            <Activity className="w-4 h-4 text-pink-400" />
            <span>History 📊</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow">
              A
            </div>
            <div className="hidden sm:block text-left select-none">
              <h4 className="text-xs font-bold text-white uppercase tracking-tight">ahmed</h4>
              <span className="text-[10px] text-gray-400 font-mono">Security Administrator</span>
            </div>
            {onLogout && (
              <button 
                onClick={onLogout}
                title="Log Out Admin"
                className="p-1.5 text-white/50 hover:text-red-400 hover:bg-white/10 rounded-full transition-all cursor-pointer border border-transparent hover:border-red-500/20"
              >
                <LogOut className="w-4 h-4 animate-pulse hover:animate-none" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CORE DISPLAY CONTAINER */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* LEFT ADMIN SIDEBAR NAVIGATION */}
        <aside className="hidden md:flex w-64 bg-white/5 backdrop-blur-lg border-r border-white/10 flex-col p-4 shrink-0 overflow-y-auto justify-between z-10">
          <div className="flex flex-col gap-6">
            
            {/* BRAND LOGO */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 select-none">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 to-yellow-500 flex items-center justify-center shadow-md">
                <span className="font-extrabold text-white text-xs">P</span>
              </div>
              <span className="text-lg font-black text-white tracking-widest font-sans">Prize<span className="text-pink-400 font-semibold">Hour</span></span>
            </div>

            {/* Nav Groups */}
            <div className="flex flex-col gap-5">
              
              <div>
                <span className="text-[10px] font-extrabold font-mono text-gray-500 uppercase tracking-widest block mb-2">MAIN DASHBOARD</span>
                <nav className="flex flex-col gap-0.5">
                  <button 
                    onClick={() => setActiveAdminTab('overview')}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'overview' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-2' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Overview
                  </button>
                  <button 
                    onClick={() => setActiveAdminTab('users')}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'users' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-2' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Users2 className="w-3.5 h-3.5" /> Users
                  </button>
                  <button 
                    onClick={() => setActiveAdminTab('tasks')}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'tasks' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-2' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Review Task Proofs
                  </button>
                  <button 
                    onClick={() => setActiveAdminTab('history')}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'history' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-2' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    <History className="w-3.5 h-3.5" /> Audit & History Hub
                  </button>
                </nav>
              </div>

              <div>
                <span className="text-[10px] font-extrabold font-mono text-white/40 uppercase tracking-widest block mb-2">INTEGRATIONS & CONFIGS</span>
                <nav className="flex flex-col gap-0.5">
                  <button 
                    onClick={() => setActiveAdminTab('postbacks')}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'postbacks' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-2' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Share2 className="w-3.5 h-3.5" /> Postback URLs
                  </button>
                  <button 
                    onClick={() => setActiveAdminTab('payments')}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'payments' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-2' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Wallet className="w-3.5 h-3.5" /> Payment Methods
                  </button>
                  <button 
                    onClick={() => setActiveAdminTab('security')}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'security' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-2' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Shield className="w-3.5 h-3.5" /> Security & Blocking
                  </button>
                  <button 
                    onClick={() => setActiveAdminTab('networks')}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'networks' ? 'bg-white/10 text-pink-400 border-l-4 border-pink-500 pl-2' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Server className="w-3.5 h-3.5" /> API Offer Networks
                  </button>
                </nav>
              </div>

            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-4 border-t border-white/10">
            {onLogout && (
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-white/5 cursor-pointer transition-all mb-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out Admin
              </button>
            )}
            <div className="text-[10px] text-white/30 font-mono">
              Security Dashboard v2.0 • 2026
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA FOR CONTENT */}
        <main className="flex-grow overflow-y-auto p-4 md:p-6 flex flex-col gap-6 z-10">
          
          <div className="flex border-b border-[#1c1a44]/50 pb-4 justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                {activeAdminTab === 'overview' && 'System Analytics Overview'}
                {activeAdminTab === 'users' && 'High Risk Users Management'}
                {activeAdminTab === 'tasks' && 'Review Manual Task Proofs'}
                {activeAdminTab === 'history' && 'Audit Hub & Completion Logs'}
                {activeAdminTab === 'postbacks' && 'Postback URLs Configuration'}
                {activeAdminTab === 'payments' && 'Payment Methods Management'}
                {activeAdminTab === 'security' && 'Security Overview & VPN/IP Controls'}
                {activeAdminTab === 'networks' && 'API Networks & Keys Management'}
              </h1>
              <p className="text-[11px] text-gray-400 mt-1">
                {activeAdminTab === 'overview' && 'Real-time statistical logs, charts, and activity streams.'}
                {activeAdminTab === 'users' && 'Review user profiles, ban/unban profiles, or inject coin bonuses.'}
                {activeAdminTab === 'tasks' && 'Reject or Approve completed users task submissions with live counts updates.'}
                {activeAdminTab === 'history' && 'Audit full platform withdrawal payout requests and completed user offers history logs.'}
                {activeAdminTab === 'postbacks' && 'Configure automated conversion URLs for our multi-network offers integration.'}
                {activeAdminTab === 'payments' && 'Define enabled financial gates, manage minimum parameters, or add methods.'}
                {activeAdminTab === 'security' && 'VPN blocking algorithms, active device logs, and security parameters.'}
                {activeAdminTab === 'networks' && 'Manage offer network sync parameters and register private network API keys.'}
              </p>
            </div>

            {/* Quick admin mobile top navigation buttons */}
            <div className="flex md:hidden items-center gap-1 overflow-x-auto max-w-[200px] py-1 scrollbar-none border-l pl-3 border-[#1c1a44]">
              {(['overview', 'users', 'tasks', 'history', 'postbacks', 'payments', 'security', 'networks'] as const).map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveAdminTab(tab)}
                  className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 capitalize ${activeAdminTab === tab ? 'bg-purple-600 text-white' : 'bg-[#100e2e] text-gray-500'}`}
                >
                  {tab === 'history' ? 'Audit Logs' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION A: OVERVIEW */}
          {activeAdminTab === 'overview' && (
            <div className="flex flex-col gap-6">

              {/* Metrics Grid (Screenshot 1) */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between" id="num-total-users">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1">TOTAL USERS</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{totalUsersCount}</h2>
                    <span className="text-[10px] text-pink-400 font-bold block mt-1">↑ Dynamic count</span>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1">ACTIVE USERS</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-cyan-400">{activeCount}</h2>
                    <span className="text-[10px] text-cyan-400 font-bold block mt-1">● {activePercent}% active</span>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1">BANNED USERS</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-red-400">{bannedCount}</h2>
                    <span className="text-[10px] text-white/30 font-bold block mt-1">⃠ {bannedCount} accounts</span>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1">VPN USERS</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-pink-500">{vpnEventsCount}</h2>
                    <span className="text-[10px] text-pink-400 font-bold block mt-1">🛡️ {vpnSuspectedCount} suspected IPs</span>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1">TOTAL WITHDRAWALS</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{totalWithdrawalsCount}</h2>
                    <span className="text-[10px] text-yellow-500 font-bold block mt-1">⏱️ {totalPendingCount} pending</span>
                  </div>
                </div>

                {/* TODAY PROFIT */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1 font-mono">TODAY'S PROFIT</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-yellow-400">${todayProfitVal.toFixed(2)}</h2>
                    <span className="text-[10px] text-white/40 font-bold block mt-1">${monthProfitVal.toFixed(2)} this month</span>
                  </div>
                </div>
              </div>

              {/* Graphical Visualizations (Screenshot 1) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Donut Chart */}
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5 flex flex-col justify-between min-h-[340px]">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Withdrawal Status Distribution</h3>
                    <p className="text-[10px] text-gray-450 mb-3">Overall breakdown of automated audit queues.</p>
                  </div>

                  {/* HIGH FIDELITY SVG DONUT GRAPH */}
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-4 flex-1">
                    
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Circle background */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#100e2e" strokeWidth="11" />
                        
                        {/* Circle approved – piece 1 */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="transparent" 
                          stroke="#10b981" 
                          strokeWidth="11" 
                          strokeDasharray={`${totalLength * approvedPct} ${totalLength}`} 
                          strokeDashoffset={0} 
                        />
                        
                        {/* Circle pending – piece 2 */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="transparent" 
                          stroke="#f59e0b" 
                          strokeWidth="11" 
                          strokeDasharray={`${totalLength * pendingPct} ${totalLength}`} 
                          strokeDashoffset={`-${totalLength * approvedPct}`} 
                        />

                        {/* Circle rejected – piece 3 */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="transparent" 
                          stroke="#ef4444" 
                          strokeWidth="11" 
                          strokeDasharray={`${totalLength * rejectedPct} ${totalLength}`} 
                          strokeDashoffset={`-${totalLength * (approvedPct + pendingPct)}`} 
                        />

                        {/* Circle refunded – piece 4 */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="transparent" 
                          stroke="#3b82f6" 
                          strokeWidth="11" 
                          strokeDasharray={`${totalLength * refundedPct} ${totalLength}`} 
                          strokeDashoffset={`-${totalLength * (approvedPct + pendingPct + rejectedPct)}`} 
                        />
                      </svg>

                      {/* Donut Center texts */}
                      <div className="absolute flex flex-col items-center select-none">
                        <span className="text-xl font-black text-white">{totalWithdrawalsCount}</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Requests</span>
                      </div>
                    </div>

                    {/* Donut Chart legend indicators details */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <span className="text-gray-400">Approved:</span>
                        <span className="font-bold text-white ml-auto">{totalApprovedCount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <span className="text-gray-400">Pending:</span>
                        <span className="font-bold text-white ml-auto">{totalPendingCount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                        <span className="text-gray-400">Rejected:</span>
                        <span className="font-bold text-white ml-auto">{totalRejectedCount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <span className="text-gray-400">Refunded:</span>
                        <span className="font-bold text-white ml-auto">{totalRefundedCount}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* User Growth Line Chart */}
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5 flex flex-col justify-between min-h-[340px]">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">User Growth Trend</h3>
                    <p className="text-[10px] text-gray-450 mb-3">Audited expansion registration log curves.</p>
                  </div>

                  {/* HIGH FIDELITY SVG GRADIENT CURVE LINE CHART */}
                  <div className="flex-1 flex flex-col justify-between mt-3 select-none">
                    <div className="h-44 w-full relative">
                      <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                        
                        {/* Horizontal guidelines */}
                        <line x1="0" y1="10" x2="100" y2="10" stroke="#1d1b54" strokeWidth="0.1" strokeDasharray="1 1" />
                        <line x1="0" y1="20" x2="100" y2="20" stroke="#1d1b54" strokeWidth="0.1" strokeDasharray="1 1" />
                        <line x1="0" y1="30" x2="100" y2="30" stroke="#1d1b54" strokeWidth="0.1" strokeDasharray="1 1" />

                        {/* Chart Area gradient backdrop */}
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        <path 
                          d={areaPath} 
                          fill="url(#chartGrad)" 
                        />

                        {/* Chart Line path */}
                        <path 
                          d={linePath} 
                          fill="none" 
                          stroke="#6366f1" 
                          strokeWidth="0.9" 
                          strokeLinecap="round" 
                        />

                        {/* Chart points */}
                        {xPoints.map((x, idx) => (
                          <circle 
                            key={idx}
                            cx={x} 
                            cy={yPoints[idx]} 
                            r={idx === 5 ? 0.9 : 0.75} 
                            fill={idx === 5 ? "#10b981" : "#6366f1"} 
                            stroke="white" 
                            strokeWidth="0.2" 
                            className={idx === 5 ? "animate-pulse" : ""} 
                          />
                        ))}
                      </svg>
                    </div>

                    {/* Months footer */}
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase font-mono px-2 border-t border-[#1a1844] pt-2">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Recent withdrawals review table */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Pending Withdrawals Queue</h3>
                  
                  <div className="relative w-48 sm:w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                      <Search className="w-3.5 h-3.5 text-gray-500" />
                    </span>
                    <input 
                      type="text" 
                      value={withdrawalSearchText}
                      onChange={(e) => setWithdrawalSearchText(e.target.value)}
                      placeholder="Filter withdrawals..." 
                      className="w-full bg-[#0a0820] text-xs pl-8 pr-3 py-1 text-white border border-[#1d1b54] rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#201d54] text-[10px] text-gray-550 font-bold uppercase font-mono">
                        <th className="pb-2">User Name</th>
                        <th className="pb-2">Method</th>
                        <th className="pb-2">Payout Amount</th>
                        <th className="pb-2">Coins cost</th>
                        <th className="pb-2">Risk Status</th>
                        <th className="pb-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-[#1c1a45]/30">
                      {withdrawals
                        .filter(w => w.status === 'Pending')
                        .filter(w => w.user.toLowerCase().includes(withdrawalSearchText.toLowerCase()) || w.method.toLowerCase().includes(withdrawalSearchText.toLowerCase()))
                        .map((withdraw) => (
                          <tr key={withdraw.id} className="hover:bg-[#151341]/30">
                            <td className="py-3 font-bold text-white">{withdraw.user}</td>
                            <td className="py-3 text-indigo-300">{withdraw.method}</td>
                            <td className="py-3 font-mono font-bold">
                              {withdraw.currency === 'EGP' ? `EGP ${withdraw.amount.toLocaleString()}` : `$${withdraw.amount.toFixed(2)}`}
                            </td>
                            <td className="py-3 text-amber-500 font-mono">{withdraw.pointsCost.toLocaleString()}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${withdraw.riskLevel === 'Low Risk' ? 'bg-emerald-500/10 text-emerald-400' : withdraw.riskLevel === 'Medium Risk' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-450'}`}>
                                {withdraw.riskLevel} ({withdraw.riskScore}%)
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex gap-1.5 justify-end">
                                <button 
                                  onClick={() => approveWithdrawal(withdraw.id)}
                                  className="p-1 px-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] uppercase font-bold transition-transform active:scale-95 cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => rejectWithdrawal(withdraw.id)}
                                  className="p-1 px-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] uppercase font-bold transition-transform active:scale-95 cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* SECTION B: USERS MANAGEMENT */}
          {activeAdminTab === 'users' && (
            <div className="flex flex-col gap-6">

              {/* Filters row */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                    <Search className="w-4 h-4 text-gray-500" />
                  </span>
                  <input 
                    type="text" 
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    placeholder="Search users by name/email..." 
                    className="w-full bg-[#0a0820] text-xs pl-8 pr-3 py-1.5 text-white border border-[#1d1b54] rounded-lg focus:outline-none"
                  />
                </div>

                <div className="text-xs text-indigo-300 font-semibold uppercase font-mono tracking-wider">
                  Total Managed Users: {filteredUsersList.length}
                </div>
              </div>

              {/* High Risk entries list */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Users Accounts Management</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#201d54] text-[10px] text-gray-500 uppercase font-mono tracking-wider">
                        <th className="pb-2">User ID</th>
                        <th className="pb-2">Username</th>
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Trust Score</th>
                        <th className="pb-2">Risk Level</th>
                        <th className="pb-2">Last Activity</th>
                        <th className="pb-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-[#1e1c54]/30">
                      {filteredUsersList.map((usr) => (
                        <tr key={usr.id} className="hover:bg-[#151341]/30">
                          <td className="py-3 font-mono text-indigo-300">{usr.id}</td>
                          <td className="py-3 font-bold text-white flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-550/15 border border-indigo-505/20 flex items-center justify-center font-bold text-[10px] text-indigo-300">
                              {usr.username.charAt(0).toUpperCase()}
                            </div>
                            {usr.username}
                          </td>
                          <td className="py-3 text-gray-400 font-mono">{usr.email}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-2 bg-[#0d0c1d] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-rose-500 to-emerald-500" 
                                  style={{ width: `${usr.trust}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-gray-300">{usr.trust}%</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${usr.banned ? 'bg-rose-500/10 text-rose-450 border border-rose-500/25' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {usr.risk}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400 font-mono">{usr.lastAct}</td>
                          <td className="py-3 text-right">
                            <div className="flex gap-1.5 justify-end">
                              <button 
                                onClick={() => {
                                  setSelectedUserToEdit(usr);
                                  setEditCoins(usr.coins);
                                  setEditLevel(usr.userStats?.level || 1);
                                  setEditRiskScore(usr.userStats?.riskScore || 0);
                                  setEditRiskLevel(usr.userStats?.riskLevel || 'Low Risk');
                                  setEditReferralsCount(usr.userStats?.referralsCount || 0);
                                  setEditStatus(usr.userStats?.status || 'Online');
                                  setEditUserEmail(usr.email);
                                }}
                                className="p-1 px-2 bg-purple-600 hover:bg-purple-550 text-white text-[10px] font-bold rounded cursor-pointer uppercase"
                              >
                                Edit 📝
                              </button>
                              <button 
                                onClick={() => handleToggleBanUser(usr.username)}
                                className={`p-1 px-2 text-[10px] font-bold rounded cursor-pointer uppercase transition-all ${usr.banned ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'} text-white`}
                              >
                                {usr.banned ? 'Unban' : 'Ban'}
                              </button>
                              <button 
                                onClick={() => handleAddCoinsToUser(usr.username)}
                                className="p-1 px-2 bg-indigo-600 hover:bg-indigo-550 text-white text-[10px] font-bold rounded cursor-pointer uppercase transition-transform active:scale-95"
                              >
                                +Coins
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* SECTION C: REVIEW TASKS */}
          {activeAdminTab === 'tasks' && (
            <div className="flex flex-col gap-6">
              
              {/* Review Queue */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Manual Tasks Review Queue</h3>
                
                {tasks.filter(t => t.status === 'Pending Approval').length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#1b1945] rounded-xl flex items-center justify-center text-lg mb-3">✓</div>
                    <h4 className="text-sm font-bold text-white mb-1">Queue is Clear!</h4>
                    <p className="text-xs text-gray-400">All user proof link submissions have been processed.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {tasks.filter(t => t.status === 'Pending Approval').map((task) => (
                      <div key={task.id} className="bg-[#100e2e] border border-[#1c1a44] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono uppercase">
                            Task #{task.id}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1.5">{task.title}</h4>
                          <div className="mt-2 text-xs">
                            <span className="text-gray-550 block font-semibold uppercase">Submitted Proof URL:</span>
                            <a 
                              href={task.proofLink} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-indigo-400 font-mono hover:underline break-all inline-flex items-center gap-1 mt-0.5"
                            >
                              {task.proofLink} <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 border-t md:border-t-0 border-[#1c1a44] pt-3 md:pt-0">
                          <button 
                            onClick={() => approveTaskProof(task.id)}
                            className="p-1.5 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-transform active:scale-95 cursor-pointer uppercase"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => rejectTaskProof(task.id)}
                            className="p-1.5 px-3 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-transform active:scale-95 cursor-pointer uppercase"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION D: POSTBACK CONFIG (Screenshot 9) */}
          {activeAdminTab === 'postbacks' && (
            <div className="flex flex-col gap-6">

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1">Total Postback URLs</span>
                  <h2 className="text-xl font-extrabold text-white">30</h2>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1 font-mono">Provider Networks</span>
                  <h2 className="text-xl font-extrabold text-white">25</h2>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1 font-mono">API Endpoints</span>
                  <h2 className="text-xl font-extrabold text-[#74fcff]">30</h2>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1 font-mono">Integration Status</span>
                  <h2 className="text-xl font-extrabold text-emerald-400">100%</h2>
                </div>
              </div>

              {/* Postbacks box lists (Screenshot 9) */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Postback URLs Configurations</h3>
                  
                  <button 
                    onClick={() => setIsAddPostbackOpen(true)}
                    className="p-1.5 px-3 rounded bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Integration
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {postbacks.map((pb) => (
                    <div key={pb.id} className="bg-[#100e2e] border border-[#201d54] rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/50 transition-all relative">
                      
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-extrabold text-white text-sm">{pb.network}</h4>
                        <span className="px-1.5 py-0.5 text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase">
                          Active
                        </span>
                      </div>

                      {/* URL string visual input details (Screenshot 9) */}
                      <div className="flex bg-[#070519] border border-[#242255] p-2 rounded-lg text-[10px] text-gray-300 font-mono items-center gap-2 select-all truncate mb-2">
                        <span className="flex-1 truncate">{pb.url}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(pb.url);
                            setCopiedUrlId(pb.id);
                            setTimeout(() => setCopiedUrlId(null), 2000);
                          }}
                          className="text-gray-500 hover:text-white shrink-0 cursor-pointer align-middle"
                        >
                          {copiedUrlId === pb.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SECTION E: PAYMENT METHODS MANAGEMENT (Screenshot 10) */}
          {activeAdminTab === 'payments' && (
            <div className="flex flex-col gap-6">

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1">Total Methods</span>
                  <h2 className="text-xl font-extrabold text-white">4 Available</h2>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1">Active methods</span>
                  <h2 className="text-xl font-extrabold text-[#74fcff]">4 currently</h2>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1 font-mono">Total All-Time Withdrawals</span>
                  <h2 className="text-xl font-extrabold text-white">26 processed</h2>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1 font-mono">Pending Amount</span>
                  <h2 className="text-xl font-extrabold text-amber-500">$0.00</h2>
                </div>
              </div>

              {/* Table Methods (Screenshot 10) */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Payment Methods Management ({paymentMethods.length} total)</h3>
                  
                  <button 
                    onClick={() => setIsAddPaymentOpen(true)}
                    className="p-1.5 px-3 rounded bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Payment Method
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#201d54] text-[10px] text-gray-450 uppercase font-mono">
                        <th className="pb-2">Gate Logo</th>
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Currency</th>
                        <th className="pb-2">Payment Type</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Withdrawals Log</th>
                        <th className="pb-2">Total Amount</th>
                        <th className="pb-2">Created</th>
                        <th className="pb-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-[#1e1c54]/30">
                      {paymentMethods.map((pm) => (
                        <tr key={pm.id} className="hover:bg-[#151341]/30">
                          <td className="py-3.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-550/15 border border-indigo-505/20 flex items-center justify-center text-xs font-mono font-bold text-indigo-300">
                              {pm.logoPlaceholder}
                            </div>
                          </td>
                          <td className="py-3.5 font-bold text-white">{pm.name}</td>
                          <td className="py-3.5 font-mono text-indigo-300 font-bold">{pm.currency}</td>
                          <td className="py-3.5 text-gray-400">{pm.type}</td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                              {pm.status}
                            </span>
                          </td>
                          <td className="py-3.5 font-mono">{pm.withdrawalsCount} withdrawals</td>
                          <td className="py-3.5 font-mono font-bold">${pm.totalPaidOut.toFixed(2)}</td>
                          <td className="py-3.5 text-gray-500 font-mono">{pm.dateCreated}</td>
                          <td className="py-3.5 text-right">
                            <button 
                              onClick={() => deletePaymentMethod(pm.id)}
                              className="text-rose-400 hover:text-rose-350 p-2 border border-[#201d54]/65 hover:border-rose-500/30 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center shadow"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* SECTION F: SECURITY OVERVIEW (Screenshot 11 & Screenshot 12) */}
          {activeAdminTab === 'security' && (
            <div className="flex flex-col gap-6">
              
              {/* Stats Security Dashboard columns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1">High Risk Events</span>
                  <h2 className="text-xl font-extrabold text-white">0</h2>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1 font-mono">VPN Detections</span>
                  <h2 className="text-xl font-extrabold text-white">0 Today</h2>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1 font-mono">Bot Detections</span>
                  <h2 className="text-xl font-extrabold text-[#74fcff]">0 Today</h2>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1 font-mono">Fraud Attempts</span>
                  <h2 className="text-xl font-extrabold text-rose-450">1 Unresolved</h2>
                </div>
              </div>

              {/* IP Management forms / block lists (Screenshot 11) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Block Input */}
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    🌐 IP Address Management
                  </h3>

                  {currentIpMessage && (
                    <div className="mb-4 bg-emerald-550/10 border border-emerald-550/20 p-2 px-3 rounded text-xs text-emerald-400 animate-pulse font-mono">
                      {currentIpMessage}
                    </div>
                  )}

                  <form onSubmit={handleBlockIpSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-450 uppercase font-semibold">IP Address or Range</label>
                      <input 
                        type="text"
                        required
                        value={ipAddressBlockInput}
                        onChange={(e) => setIpAddressBlockInput(e.target.value)}
                        placeholder="e.g. 192.168.1.1 or 192.168.1.0/24"
                        className="w-full bg-[#0a0820] text-xs text-white border border-[#222055] focus:border-indigo-500 rounded-lg p-2.5 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-450 uppercase font-semibold text-[11px]">Block Reason</label>
                        <select 
                          value={blockedReason}
                          onChange={(e) => setBlockedReason(e.target.value)}
                          className="w-full bg-[#0a0820] text-xs text-white border border-[#222055] rounded-lg p-2.5 focus:outline-none"
                        >
                          <option>Fraud Activity</option>
                          <option>Multiple Accounts</option>
                          <option>VPN Exploits</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-450 uppercase font-semibold text-[11px]">Duration (hours)</label>
                        <input 
                          type="number"
                          value={ipBlockDuration}
                          onChange={(e) => setIpBlockDuration(e.target.value)}
                          className="w-full bg-[#0a0820] text-xs text-white border border-[#222055] rounded-lg p-2.5 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-transform active:scale-95 uppercase font-mono shadow-md cursor-pointer mt-2"
                    >
                      Block IP Address ⃠
                    </button>
                  </form>
                </div>

                {/* Block list display details (Screenshot 11) */}
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      📋 Currently Blocked IPs ({blockedIpsList.length})
                    </h3>

                    {blockedIpsList.length === 0 ? (
                      <div className="py-8 text-center flex flex-col items-center">
                        <div className="w-10 h-10 bg-[#1b1945] rounded-lg text-gray-400 flex items-center justify-center mb-2">🌐</div>
                        <p className="text-xs text-gray-450 font-mono">No active blocks configured.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                        {blockedIpsList.map((ip, idx) => (
                          <div key={idx} className="bg-[#070519] border border-[#222055] p-2.5 rounded-lg flex items-center justify-between text-xs font-mono text-gray-200">
                            <span>{ip}</span>
                            <span className="text-[10px] text-rose-450 font-bold uppercase">{blockedReason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-500 italic block border-t border-[#1a1844] pt-2 mt-4">
                    Automatic dynamic rate limiting prevents abusive postback submissions.
                  </span>
                </div>

              </div>

              {/* Settings and recent check logs (Screenshot 12) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                
                {/* Global stats toggles */}
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-5">Global Security Settings</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">VPN Detection Algorithms</h4>
                        <p className="text-[10px] text-gray-400 leading-normal">Automatically scan client connection headers during cashouts.</p>
                      </div>
                      <button 
                        onClick={() => setVpnDetection(!vpnDetection)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${vpnDetection ? 'bg-indigo-600' : 'bg-gray-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${vpnDetection ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#1a1844] pt-4">
                      <div>
                        <h4 className="text-xs font-bold text-white">Auto IP Blocking</h4>
                        <p className="text-[10px] text-gray-400 leading-normal">Ban subids posting from repetitive identical addresses instantly.</p>
                      </div>
                      <button 
                        onClick={() => setAutoIpBlocking(!autoIpBlocking)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${autoIpBlocking ? 'bg-indigo-600' : 'bg-gray-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${autoIpBlocking ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#1a1844] pt-4">
                      <div>
                        <h4 className="text-xs font-bold text-white">Device Fingerprinting</h4>
                        <p className="text-[10px] text-gray-400 leading-normal">Identify unique user devices to prevent multi-account log creations.</p>
                      </div>
                      <button 
                        onClick={() => setDeviceFingerprinting(!deviceFingerprinting)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${deviceFingerprinting ? 'bg-indigo-600' : 'bg-gray-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${deviceFingerprinting ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent events logs exactly from Screenshot 12 */}
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Recent Security Events</h3>
                  
                  <div className="flex flex-col gap-3">
                    {securityEvents.map((evt, idx) => (
                      <div key={idx} className="bg-[#0c0a25] border border-[#1f1d53] rounded-xl p-3 flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-bold text-white">{evt.type}</span>
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1 rounded font-mono">
                              {evt.trustScore}% trust
                            </span>
                          </div>
                          
                          <div className="flex gap-2 text-[10px] text-gray-400 font-mono">
                            <span>{evt.ip}</span>
                            <span>• {evt.user}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-[#8e89f3] block tracking-tighter uppercase font-bold text-right">
                            🌍 {evt.countryCode === 'EG' ? 'Egypt' : evt.countryCode}
                          </span>
                          <span className="text-[10px] text-gray-500 font-semibold block uppercase text-right mt-1">{evt.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* SECTION G: API OFFER NETWORKS MANAGEMENT (Screenshot 13) */}
          {activeAdminTab === 'networks' && (
            <div className="flex flex-col gap-6">

              {/* Part A: Dynamic Exchange rate section & Quick metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-left">
                
                {/* 1. Point-to-dollar converter setting form */}
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5 lg:col-span-2 font-sans">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="text-indigo-400">💵</span> Point conversion rate ($) setting
                  </h3>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Set how many points are equal to $1.00 USD. This value is used to dynamically compute coin rewards across all offerwalls, surveys, and promotional videos to keep the payout structure balanced.
                  </p>

                  <form onSubmit={handleSaveExchangeRate} className="flex flex-col sm:flex-row items-end gap-3 max-w-xl">
                    <div className="flex-1 flex flex-col gap-1.5 w-full">
                      <label className="text-[10px] text-gray-400 uppercase font-mono font-bold">Points per $1.00 USD</label>
                      <div className="relative font-mono">
                        <input 
                          type="number"
                          value={localCoinsPerUSD}
                          min="1"
                          onChange={(e) => setLocalCoinsPerUSD(parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-[#0a0820] text-sm text-yellow-400 font-bold border border-[#2c2a6a] rounded-lg p-2.5 pl-4 focus:outline-none focus:border-indigo-500"
                        />
                        <span className="absolute right-3 top-3 text-[10px] text-gray-500 font-semibold">COINS / $1 USD</span>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 active:scale-95 text-white text-xs font-bold rounded-lg cursor-pointer transition-all uppercase whitespace-nowrap font-sans"
                    >
                      Save Rate Formula
                    </button>
                  </form>

                  <div className="bg-[#0a0820] border border-[#1d1b46]/65 rounded-lg p-3 mt-4 text-xs">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase block mb-1">Live Setting Calculations Review</span>
                    <p className="text-gray-300 leading-normal">
                      A user completing an offer of <strong className="text-[#74fcff]">$2.50 USD</strong> will automatically be credited with:{' '}
                      <strong className="text-yellow-400 font-mono">{(localCoinsPerUSD * 2.5).toLocaleString()} Points</strong>{' '}
                      (Formula: <code className="bg-[#121035] px-1 py-0.5 rounded text-gray-405 font-mono font-semibold">Reward = {localCoinsPerUSD} * $value</code>).
                    </p>
                  </div>
                </div>

                {/* 2. Mini stats list */}
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5 flex flex-col justify-between text-left font-sans">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#74fcff] uppercase tracking-wider mb-2">Sync parameters</h4>
                    <span className="text-[10px] text-gray-400 leading-relaxed block">
                      All synced platforms (Torox, AdGate, Wannads) instantly pull and convert using this rate.
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mt-4 font-mono text-xs text-gray-300">
                    <div className="flex items-center justify-between py-1 border-b border-[#1b1948]">
                      <span className="font-sans text-gray-400">Offerwalls:</span>
                      <span className="font-semibold text-white">{offerwalls.length} active</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#1b1948]">
                      <span className="font-sans text-gray-400">Campaigns:</span>
                      <span className="font-semibold text-white">{offers.length} active</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-sans text-gray-400">Sync Status:</span>
                      <span className="text-emerald-400">99.9% synced</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Part B: Premium Offerwalls Manager (A-to-Z creation list) */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5 text-left font-sans animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-[#181648] pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <span>⚙️</span> API Premium Offerwalls Manager
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 leading-normal font-sans">
                      Add, customize lock status, edit bonus multipliers, or configure direct iframe sources of offerwall partners.
                    </p>
                  </div>

                  <button 
                    onClick={() => setIsAddOfferwallOpen(true)}
                    className="p-2 px-4 bg-[#7511b8] hover:bg-[#630f9d] active:scale-95 text-white text-xs font-bold rounded-lg cursor-pointer transition-transform flex items-center gap-1 uppercase font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Custom Offerwall
                  </button>
                </div>

                {isAddOfferwallOpen && (
                  <div className="mb-6 bg-[#0a0820] border border-[#2b2767] rounded-xl p-5 relative animate-fade-in text-left">
                    <button 
                      type="button" 
                      onClick={() => setIsAddOfferwallOpen(false)}
                      className="absolute top-4 right-4 text-xs text-gray-400 hover:text-white"
                    >
                      [CLOSE]
                    </button>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">Register New Offerwall integration</h4>
                    
                    <form onSubmit={handleAddOfferwall} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5 text-xs text-left">
                        <label className="text-[10px] text-gray-400 uppercase font-bold font-mono">Offerwall Title</label>
                        <input 
                          type="text" 
                          required 
                          value={newWallName}
                          onChange={(e) => setNewWallName(e.target.value)}
                          placeholder="e.g. Bitlabs Surveys, CPX Research"
                          className="w-full bg-[#121035] text-xs text-white border border-[#2c2a6a] rounded-lg p-2 focus:outline-none focus:border-indigo-505"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs text-left">
                        <label className="text-[10px] text-gray-400 uppercase font-bold font-mono">Bonus Boost %</label>
                        <input 
                          type="number" 
                          value={newWallBonus}
                          onChange={(e) => setNewWallBonus(parseInt(e.target.value, 10) || 0)}
                          placeholder="e.g. 10"
                          className="w-full bg-[#121035] text-xs text-white border border-[#2c2a6a] rounded-lg p-2 focus:outline-none focus:border-indigo-505 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs text-left select-none">
                        <label className="text-[10px] text-gray-400 uppercase font-bold font-mono">Popularity Rating</label>
                        <select 
                          value={newWallRating}
                          onChange={(e) => setNewWallRating(parseInt(e.target.value, 10))}
                          className="w-full bg-[#121035] text-xs text-white border border-[#2c2a6a] rounded-lg p-2 focus:outline-none"
                        >
                          <option value={5}>5 Stars Rating - Popular</option>
                          <option value={4}>4 Stars Rating - High</option>
                          <option value={3}>3 Stars Rating - Medium</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs text-left sm:col-span-2 border-b border-indigo-500/10 pb-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold font-mono">Direct Iframe Link (Dynamic frame URL)</label>
                        <input 
                          type="text" 
                          value={newWallIframe}
                          onChange={(e) => setNewWallIframe(e.target.value)}
                          placeholder="e.g. https://cpx-research.com/index.php?app_id=295&subid={user_id}"
                          className="w-full bg-[#121035] text-xs text-white border border-[#2c2a6a] rounded-lg p-2 focus:outline-none font-mono"
                        />
                        <p className="text-[9px] text-gray-500 italic mt-0.5">Use <code className="bg-[#121035] px-1 text-pink-400 font-mono font-semibold">{"{user_id}"}</code> to dynamically substitute active player username.</p>
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs text-left">
                        <label className="text-[10px] text-gray-400 uppercase font-bold font-mono">Offerwall Logo URL</label>
                        <input 
                          type="url" 
                          value={newWallLogoUrl}
                          onChange={(e) => setNewWallLogoUrl(e.target.value)}
                          placeholder="e.g. https://domain.com/brand-logo.png"
                          className="w-full bg-[#121035] text-xs text-white border border-[#2c2a6a] rounded-lg p-2 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs text-left">
                        <label className="text-[10px] text-gray-400 uppercase font-bold font-mono">Short Description</label>
                        <input 
                          type="text" 
                          value={newWallDesc}
                          onChange={(e) => setNewWallDesc(e.target.value)}
                          placeholder="e.g. Earn rewards for answering real-time surveys."
                          className="w-full bg-[#121035] text-xs text-white border border-[#2c2a6a] rounded-lg p-2 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3 flex justify-end gap-3 mt-2 pt-3 border-t border-[#1e1c55]/40 font-semibold font-sans">
                        <button 
                          type="button" 
                          onClick={() => setIsAddOfferwallOpen(false)}
                          className="px-4 py-1.5 bg-[#121035] border border-[#252358] text-gray-300 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-550 text-white text-xs font-bold rounded-lg cursor-pointer animate-fade-in"
                        >
                          Publish Offerwall
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans">
                    <thead>
                      <tr className="border-b border-[#201d54] text-[10px] text-gray-500 uppercase font-mono">
                        <th className="pb-2">Offerwall Name</th>
                        <th className="pb-2">Multipliers / Bonus</th>
                        <th className="pb-2">API Iframe URL Path</th>
                        <th className="pb-2">Rating Display</th>
                        <th className="pb-2 text-right">Settings Control</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-[#1e1c54]/30">
                      {offerwalls.map((wall: any) => (
                        <tr key={wall.id} className="hover:bg-[#151341]/30">
                          <td className="py-4 font-bold text-white font-sans">
                            <div className="flex items-center gap-3 text-left">
                              {wall.logoUrl ? (
                                <img 
                                  src={wall.logoUrl} 
                                  alt={wall.name} 
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 object-contain rounded-lg bg-black/20 p-1 border border-white/5 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-550/20 flex items-center justify-center text-indigo-400 font-bold font-mono shrink-0">
                                  {wall.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <span className="text-[12px] uppercase block">{wall.name}</span>
                                <span className="text-[10px] text-gray-400 block font-normal text-muted mt-0.5 max-w-sm break-words">{wall.description}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 font-mono font-bold text-pink-400">
                            +{wall.bonus}% Coins Boosted
                          </td>
                          <td className="py-4 max-w-xs font-mono text-xs text-gray-400 truncate">
                            {wall.iframeUrl}
                          </td>
                          <td className="py-4 text-[#74fcff]">
                            {'★'.repeat(wall.rating || 5)}{'☆'.repeat(5 - (wall.rating || 5))}
                          </td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => handleDeleteOfferwall(wall.id)}
                              className="p-1 px-2.5 bg-rose-600/10 hover:bg-rose-600 hover:text-white text-rose-450 border border-rose-500/15 text-[10px] font-bold rounded cursor-pointer uppercase transition-colors"
                            >
                              Destroy / Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Part C: Featured Dynamic Campaign offers list & builder ($ Add) */}
              <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5 text-left animate-fade-in font-sans">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-[#181648] pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <span>🔥</span> Featured Offers Management
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 leading-normal">
                      Create premium campaign objectives that appear in the marquee row on user dashboards instantly.
                    </p>
                  </div>

                  <button 
                    onClick={() => setIsAddOfferOpen(true)}
                    className="p-2 px-4 bg-purple-600 hover:bg-purple-550 active:scale-95 text-white text-xs font-bold rounded-lg cursor-pointer transition-transform flex items-center gap-1 uppercase"
                  >
                    <Plus className="w-3.5 h-3.5" /> Publish Featured Offer
                  </button>
                </div>

                {isAddOfferOpen && (
                  <div className="mb-6 bg-[#0a0820] border border-[#2b2767] rounded-xl p-5 relative animate-fade-in text-left">
                    <button 
                      type="button" 
                      onClick={() => setIsAddOfferOpen(false)}
                      className="absolute top-4 right-4 text-xs text-gray-400 hover:text-white"
                    >
                      [CLOSE]
                    </button>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">Launch New Dynamic Campaign</h4>
                    
                    <form onSubmit={handleAddFeaturedOffer} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      
                      <div className="flex flex-col gap-1.5 text-xs text-left sm:col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold font-mono">Offer Target Name</label>
                        <input 
                          type="text" 
                          required 
                          value={newOfferTitle}
                          onChange={(e) => setNewOfferTitle(e.target.value)}
                          placeholder="e.g. Lords Mobile: Play & Complete level 5"
                          className="w-full bg-[#121035] text-xs text-white border border-[#2c2a6a] rounded-lg p-2 focus:outline-none focus:border-indigo-505 font-sans"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs text-left">
                        <label className="text-[10px] text-gray-400 uppercase font-bold font-mono font-semibold">Campaign Payout (USD $)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0.01"
                          required
                          value={newOfferValue}
                          onChange={(e) => setNewOfferValue(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#121035] text-xs text-white border border-[#2c2a6a] rounded-lg p-2 focus:outline-none focus:border-indigo-505 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs text-left select-none">
                        <label className="text-[10px] text-gray-400 uppercase font-bold font-mono font-semibold">API Network</label>
                        <select 
                          value={newOfferProvider}
                          onChange={(e) => setNewOfferProvider(e.target.value)}
                          className="w-full bg-[#121035] text-xs text-white border border-[#2c2a6a] rounded-lg p-2 focus:outline-none"
                        >
                          <option value="Torox">Torox Network</option>
                          <option value="CPA Lead">CPA Lead API</option>
                          <option value="BitLabs">BitLabs Labs</option>
                          <option value="Lootably">Lootably</option>
                          <option value="AdGate">AdGate Media</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs text-left sm:col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold font-mono font-semibold">Campaign Logo Image URL</label>
                        <input 
                          type="url" 
                          value={newOfferLogoUrl}
                          onChange={(e) => setNewOfferLogoUrl(e.target.value)}
                          placeholder="e.g. https://img.icons8.com/color/96/youtube.png"
                          className="w-full bg-[#121035] text-xs text-white border border-[#2c2a6a] rounded-lg p-2 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="sm:col-span-4 flex justify-end gap-3 mt-2 pt-3 border-t border-[#1e1c55]/40 text-left">
                        <span className="text-[10px] text-gray-450 font-mono mr-auto self-center uppercase italic font-semibold">
                          Reward yields: <strong className="text-yellow-400 font-bold">{(newOfferValue * coinsPerUSD).toLocaleString()} Coins</strong> to the end player
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setIsAddOfferOpen(false)}
                          className="px-4 py-1.5 bg-[#121035] border border-[#252358] text-gray-300 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-5 py-1.5 bg-purple-600 hover:bg-purple-550 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Publish Campaign
                        </button>
                      </div>

                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans">
                    <thead>
                      <tr className="border-b border-[#201d54] text-[10px] text-gray-500 uppercase font-mono">
                        <th className="pb-2">Campaign Title Target</th>
                        <th className="pb-2 font-mono">USD Payout value</th>
                        <th className="pb-2 font-mono">Points Equivalent</th>
                        <th className="pb-2">Network Source</th>
                        <th className="pb-2 text-right">Trash Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-[#1e1c54]/30">
                      {offers.map((off: Offer) => (
                        <tr key={off.id} className="hover:bg-[#151341]/30">
                          <td className="py-3 font-semibold text-white">
                            <div className="flex items-center gap-3 text-left">
                              {off.logoUrl ? (
                                <img 
                                  src={off.logoUrl} 
                                  alt={off.title} 
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 object-contain rounded bg-black/20 p-0.5 border border-white/5 shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-300 text-xs font-bold shrink-0">
                                  {off.image === 'Pippit' ? '📱' : '🎮'}
                                </div>
                              )}
                              <span className="truncate max-w-xs">{off.title}</span>
                            </div>
                          </td>
                          <td className="py-3 font-mono text-emerald-400 font-bold">
                            ${off.rewardValue.toFixed(2)} USD
                          </td>
                          <td className="py-3 text-yellow-400 font-bold font-mono">
                            {(off.rewardValue * coinsPerUSD).toLocaleString()} Coins
                          </td>
                          <td className="py-3 font-semibold uppercase text-purple-300 font-mono font-bold">
                            {off.provider}
                          </td>
                          <td className="py-3 text-right">
                            <button 
                              onClick={() => handleDeleteFeaturedOffer(off.id)}
                              className="p-1 px-2.5 bg-rose-600/10 hover:bg-rose-600 hover:text-white text-rose-450 border border-rose-500/15 text-[10px] font-bold rounded cursor-pointer transition-colors uppercase"
                            >
                              Delete Campaign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* SECTION H: FINANCIAL AUDITING & COMPLETION LOGS HISTORY */}
          {activeAdminTab === 'history' && (
            <div className="flex flex-col gap-6" id="admin-history-tab">
              
              {/* Stats overview boxes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1 font-semibold uppercase font-mono text-white/50">TOTAL PLATFORM PAYOUTS</span>
                  <h2 className="text-xl font-extrabold text-[#74fcff]">
                    ${withdrawals.filter(w => w.status === 'Approved').reduce((acc, w) => acc + (w.currency === 'USD' ? w.amount : w.amount / 16.5), 0).toFixed(2)}
                  </h2>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1">Paid out completely</span>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1 font-semibold uppercase font-mono text-white/50">TOTAL POINTS REWARDED</span>
                  <h2 className="text-xl font-extrabold text-yellow-400">
                    {(tasks.filter(t => t.status === 'Approved').reduce((acc, t) => acc + t.rewardCoins, 0) + 2680).toLocaleString()} Coins
                  </h2>
                  <span className="text-[10px] text-zinc-400 font-semibold block mt-1">From offers + manual verification</span>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1 font-semibold uppercase font-mono text-white/50">PENDING SECURITY CHECKS</span>
                  <h2 className="text-xl font-extrabold text-red-400">
                    {withdrawals.filter(w => w.status === 'Pending' || w.riskScore > 50).length} Requests
                  </h2>
                  <span className="text-[10px] text-rose-400 block mt-1">Score above limit threshold</span>
                </div>
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-4">
                  <span className="text-xs text-gray-400 block mb-1 font-semibold uppercase font-mono text-white/50">COMPLETION SUCCESS RATE</span>
                  <h2 className="text-xl font-extrabold text-green-400">96.8%</h2>
                  <span className="text-[10px] text-emerald-400 block mt-1">Clean logs conversion</span>
                </div>
              </div>

              {/* TWO COLUMN LOG VIEWER */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. All Withdrawal Payout requests history log */}
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Withdrawal requests Payout log</h3>
                    <div className="relative w-full sm:w-48">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                        <Search className="w-3.5 h-3.5 text-gray-500" />
                      </span>
                      <input 
                        type="text" 
                        placeholder="Filter payouts..." 
                        value={withdrawalSearchText}
                        onChange={(e) => setWithdrawalSearchText(e.target.value)}
                        className="w-full pl-7 pr-3 py-1 bg-[#0a0820] text-white border border-[#1c1a53] rounded text-[10px] focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#201d54] text-[9px] text-gray-500 uppercase font-mono">
                          <th className="pb-1.5">ID / User</th>
                          <th className="pb-1.5">Method</th>
                          <th className="pb-1.5">Amount (Coins)</th>
                          <th className="pb-1.5">Status</th>
                          <th className="pb-1.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] divide-y divide-[#1e1c54]/30">
                        {withdrawals
                          .filter(w => w.user.toLowerCase().includes(withdrawalSearchText.toLowerCase()) || w.method.toLowerCase().includes(withdrawalSearchText.toLowerCase()))
                          .map((w) => (
                          <tr key={w.id} className="hover:bg-[#151341]/20">
                            <td className="py-2.5">
                              <span className="text-indigo-300 font-mono font-bold block">{w.id}</span>
                              <span className="text-gray-400 block text-[9px] font-mono">{w.user}</span>
                            </td>
                            <td className="py-2.5 text-white font-semibold">{w.method}</td>
                            <td className="py-2.5">
                              <span className="text-white font-bold block">
                                {w.currency === 'EGP' ? `EGP ${w.amount}` : `$${w.amount.toFixed(2)}`}
                              </span>
                              <span className="text-amber-500 text-[10px] block font-mono">{w.pointsCost.toLocaleString()} Pts</span>
                            </td>
                            <td className="py-2.5">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${w.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : w.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-500'}`}>
                                {w.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              {w.status === 'Pending' ? (
                                <div className="flex gap-1 justify-end">
                                  <button 
                                    onClick={() => {
                                      approveWithdrawal(w.id);
                                    }}
                                    className="p-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[8px] font-bold cursor-pointer transition-transform"
                                  >
                                    Approve ✓
                                  </button>
                                  <button 
                                    onClick={() => {
                                      rejectWithdrawal(w.id);
                                    }}
                                    className="p-1 px-2 bg-red-650 hover:bg-red-550 text-white rounded text-[8px] font-bold cursor-pointer transition-transform"
                                  >
                                    Reject ⃠
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-505 font-mono text-[10px]">Audited</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Platform Offers & Tasks completion history logs */}
                <div className="bg-[#121035] border border-[#1e1c55] rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Completed Offers & manual Tasks Audit Log</h3>
                    <span className="text-[10px] text-pink-400 font-bold bg-[#1a174c] px-2.5 py-0.5 rounded border border-pink-500/15">Live Conversion Logs</span>
                  </div>

                  <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                    <table className="w-full text-left font-sans">
                      <thead>
                        <tr className="border-b border-[#201d54] text-[9px] text-gray-500 uppercase font-mono">
                          <th className="pb-1.5">User</th>
                          <th className="pb-1.5">Campaign Name</th>
                          <th className="pb-1.5">Network / Provider</th>
                          <th className="pb-1.5">Points Won</th>
                          <th className="pb-1.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] divide-y divide-[#1e1c54]/30">
                        {/* Static mock offer conversions + Dynamic tasks completions */}
                        {tasks.filter(t => t.status === 'Approved' || t.status === 'Pending Approval').map((t, index) => (
                          <tr key={`task-audit-${index}`} className="hover:bg-[#151341]/20">
                            <td className="py-2.5 font-mono text-gray-400">{user.username}</td>
                            <td className="py-2.5 font-semibold text-white leading-tight">
                              <span className="text-[8px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1 rounded block w-max uppercase mb-1">Manual Task</span>
                              {t.title}
                            </td>
                            <td className="py-2.5 text-gray-400 uppercase font-mono">{t.category}</td>
                            <td className="py-2.5 text-amber-500 font-mono font-bold">+{t.rewardCoins.toLocaleString()}</td>
                            <td className="py-2.5 text-right">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${t.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                {t.status === 'Approved' ? 'Credited' : 'Reviewing'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        
                        <tr className="hover:bg-[#151341]/20">
                          <td className="py-2.5 font-mono text-gray-400">User_4914</td>
                          <td className="py-2.5 font-semibold text-white leading-tight font-sans">Complete High-Paying Survey 812</td>
                          <td className="py-2.5 text-gray-400 uppercase font-mono">MYCHIPS</td>
                          <td className="py-2.5 text-amber-500 font-mono font-bold">+280 Coins</td>
                          <td className="py-2.5 text-right">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-500/10 text-emerald-400">Credited</span>
                          </td>
                        </tr>

                        <tr className="hover:bg-[#151341]/20">
                          <td className="py-2.5 font-mono text-gray-400">Zayn_00</td>
                          <td className="py-2.5 font-semibold text-white leading-tight font-sans">Stormshot: Reach Citadel Level 12</td>
                          <td className="py-2.5 text-gray-400 uppercase font-mono">ADGATE</td>
                          <td className="py-2.5 text-amber-500 font-mono font-bold">+900 Coins</td>
                          <td className="py-2.5 text-right">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-500/10 text-emerald-400">Credited</span>
                          </td>
                        </tr>

                        <tr className="hover:bg-[#151341]/20">
                          <td className="py-2.5 font-mono text-gray-400">testuser</td>
                          <td className="py-2.5 font-semibold text-white leading-tight font-sans">Install & Open Opera GX Browser</td>
                          <td className="py-2.5 text-gray-400 uppercase font-mono">LOOTABLY</td>
                          <td className="py-2.5 text-amber-500 font-mono font-bold">+3,000 Coins</td>
                          <td className="py-2.5 text-right">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-500/10 text-emerald-400">Credited</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* MODAL I: ADD PAYMENT METHOD (Screenshot 10) */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#121035] border border-[#2b2767] rounded-2xl shadow-2xl p-6 relative">
            
            <button 
              onClick={() => setIsAddPaymentOpen(false)}
              className="absolute top-4 right-4 text-gray-450 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-white mb-4">Add Payment Method</h3>

            {paymentError && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded p-2 text-xs text-rose-450">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleAddPaymentSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-450 uppercase font-bold font-mono">Payment Method Name</label>
                <input 
                  type="text"
                  required
                  value={newPayName}
                  onChange={(e) => {
                    setNewPayName(e.target.value);
                    setPaymentError('');
                  }}
                  placeholder="e.g. PayPal, Payeer, Bitcoin"
                  className="w-full bg-[#0a0820] text-xs text-white border border-[#2c2a6a] rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-450 uppercase font-bold font-mono">Currency</label>
                <input 
                  type="text"
                  required
                  value={newPayCurrency}
                  onChange={(e) => setNewPayCurrency(e.target.value)}
                  placeholder="e.g. USD, EUR, BTC, EGP"
                  className="w-full bg-[#0a0820] text-xs text-white border border-[#2c2a6a] rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-450 uppercase font-bold font-mono">Payment Type</label>
                <select 
                  id="payment-type-select"
                  value={newPayType}
                  onChange={(e) => setNewPayType(e.target.value as any)}
                  className="w-full bg-[#0a0820] text-xs text-white border border-[#2c2a6a] rounded-lg p-2.5 focus:outline-none"
                >
                  <option value="Cash Payment">Cash Payment</option>
                  <option value="Gift Cards">Gift Cards</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-[#1a1841] pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#141235] border border-[#222055] text-gray-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold cursor-pointer"
                >
                  Add Payment Method
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL II: ADD POSTBACK CONFIG */}
      {isAddPostbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#121035] border border-[#2b2767] rounded-2xl shadow-2xl p-6 relative">
            
            <button 
              onClick={() => setIsAddPostbackOpen(false)}
              className="absolute top-4 right-4 text-gray-450 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-white mb-4">Add Postback Integration</h3>

            {postbackError && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded p-2 text-xs text-rose-450">
                {postbackError}
              </div>
            )}

            <form onSubmit={handleAddPostbackSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-450 uppercase font-bold font-mono font-semibold">Network Name</label>
                <input 
                  type="text"
                  required
                  value={newNetworkName}
                  onChange={(e) => setNewNetworkName(e.target.value)}
                  placeholder="e.g. CPA Lead, OfferToro"
                  className="w-full bg-[#0a0820] text-xs text-white border border-[#2c2a6a] rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-450 uppercase font-bold font-mono font-semibold">Postback URL Payload</label>
                <input 
                  type="text"
                  required
                  value={newPostbackUrl}
                  onChange={(e) => setNewPostbackUrl(e.target.value)}
                  placeholder="https://prizehour.com/api/{network}?user_id={user_id}&amount={amount}"
                  className="w-full bg-[#0a0820] text-xs text-white border border-[#2c2a6a] rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-gray-500 italic mt-1 font-mono">Available variables: {'{conversion_id}'}, {'{amount}'}, {'{user_id}'}, {'{payout}'}</p>
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-[#1a1841] pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddPostbackOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#141235] border border-[#222055] text-gray-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold cursor-pointer"
                >
                  Create Integration
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

    </div>
  );
}
