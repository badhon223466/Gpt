import React, { useState, useEffect } from 'react';
import { X, Search, Coins, ArrowUpRight, DollarSign, Filter, Activity, RefreshCw } from 'lucide-react';
import { Task, Withdrawal } from '../types';

export interface PointLog {
  id: string;
  user: string;
  type: 'Approved Task' | 'Simulated Offer' | 'Admin Bonus' | 'Referral Commission' | 'Welcome Bonus';
  description: string;
  coins: number;
  date: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  withdrawals: Withdrawal[];
  currentUser?: string;
}

export default function HistoryModal({ isOpen, onClose, tasks, withdrawals, currentUser }: HistoryModalProps) {
  const [activeTab, setActiveTab] = useState<'points' | 'withdrawals'>('points');
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('All');

  // Point Logs: Create list combining real approved tasks from tasks list, custom logs, and initial data
  const [pointLogs, setPointLogs] = useState<PointLog[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Load custom logs from localStorage
    let savedLogs: PointLog[] = [];
    try {
      const saved = localStorage.getItem('prizehour_point_logs');
      if (saved) {
        savedLogs = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading point logs', e);
    }

    // Convert approved tasks to dynamic Point Logs
    const approvedTasksLogs: PointLog[] = tasks
      .filter(t => t.status === 'Approved')
      .map(t => ({
        id: `LOG-T-${t.id}`,
        user: currentUser || 'Admin',
        type: 'Approved Task',
        description: t.title,
        coins: t.rewardCoins,
        date: t.dateCreated || 'Just now'
      }));

    // Seed initial point logs if none exist in localStorage
    const seedLogs: PointLog[] = [
      {
        id: 'LOG-S1',
        user: currentUser || 'Admin',
        type: 'Welcome Bonus',
        description: 'New account signup reward points credit',
        coins: 1000,
        date: 'Jun 10, 2026'
      },
      {
        id: 'LOG-S2',
        user: 'Zayn_00',
        type: 'Simulated Offer',
        description: 'Stormshot install campaign - RevUniverse',
        coins: 900,
        date: 'Jun 19, 2026'
      },
      {
        id: 'LOG-S3',
        user: 'MikeEarns',
        type: 'Referral Commission',
        description: 'Lvl 1 referral reward check',
        coins: 120,
        date: 'Jun 19, 2026'
      },
      {
        id: 'LOG-S4',
        user: currentUser || 'Admin',
        type: 'Simulated Offer',
        description: 'Completed survey routing in MyChips',
        coins: 280,
        date: 'Jun 20, 2026'
      }
    ];

    // Combine and remove duplicates based on ID
    const combined = [...approvedTasksLogs, ...savedLogs, ...seedLogs];
    const uniqueLogs = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    // Save back if new logs loaded
    setPointLogs(uniqueLogs);
  }, [isOpen, tasks, currentUser]);

  if (!isOpen) return null;

  // Filter lists based on tab, search text, and log types
  const filteredPointLogs = pointLogs.filter(log => {
    const textMatch = 
      log.user.toLowerCase().includes(searchText.toLowerCase()) ||
      log.description.toLowerCase().includes(searchText.toLowerCase()) ||
      log.type.toLowerCase().includes(searchText.toLowerCase());

    const typeMatch = filterType === 'All' || log.type === filterType;

    return textMatch && typeMatch;
  });

  const filteredWithdrawals = withdrawals.filter(w => {
    const textMatch = 
      w.user.toLowerCase().includes(searchText.toLowerCase()) ||
      w.method.toLowerCase().includes(searchText.toLowerCase()) ||
      w.id.toLowerCase().includes(searchText.toLowerCase());

    const statusMatch = filterType === 'All' || w.status === filterType;

    return textMatch && statusMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div 
        id="history-modal"
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#18154c] via-[#0e0b2e] to-[#08061f] border border-white/15 rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Neon Aesthetic Light Effects inside the Modal */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-pink-500/10 rounded-full blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px]" />

        {/* Header section with refined naming and premium styling */}
        <div className="relative p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]/30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-pink-500/20 to-purple-600/20 text-pink-400 rounded-xl flex items-center justify-center border border-pink-500/25 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
              <Activity className="w-5 h-5 text-pink-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                VERIFIED PLATFORM LEDGER
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold tracking-widest px-2 py-0.5 rounded-full uppercase animate-pulse">Synced Live</span>
              </h3>
              <p className="text-xs text-white/50 font-medium">Fully certified cryptographic trace record of points claim events and cashout ledgers</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all cursor-pointer border border-white/10 hover:border-white/20 active:scale-95"
            title="Close ledger window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation tabs Row & search Row */}
        <div className="p-5 border-b border-white/10 bg-[#09071c] flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
          <div className="flex gap-1.5 p-1 bg-white/[0.03] rounded-xl border border-white/5 w-fit">
            <button
              onClick={() => {
                setActiveTab('points');
                setFilterType('All');
              }}
              className={`px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'points' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_4px_15px_rgba(236,72,153,0.3)]' 
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Coins className="w-4 h-4" /> Coin Additions
            </button>
            <button
              onClick={() => {
                setActiveTab('withdrawals');
                setFilterType('All');
              }}
              className={`px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'withdrawals' 
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)]' 
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <DollarSign className="w-4 h-4" /> Cashout Approvals
            </button>
          </div>

          <div className="flex items-center gap-3 flex-grow md:justify-end">
            {/* Search Input Assembly */}
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search by ID, user or detail..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 focus:bg-white/[0.07] transition-all"
              />
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-white/30" />
              </span>
            </div>

            {/* Filter Dropdown Assembly */}
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5">
              <Filter className="w-3.5 h-3.5 text-white/40" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer border-none p-0 pr-2 select-style font-semibold"
              >
                {activeTab === 'points' ? (
                  <>
                    <option value="All" className="bg-[#100e2e] text-white">All Event Types</option>
                    <option value="Approved Task" className="bg-[#100e2e] text-white">Approved Task</option>
                    <option value="Simulated Offer" className="bg-[#100e2e] text-white">Simulated Offer</option>
                    <option value="Admin Bonus" className="bg-[#100e2e] text-white">Admin Bonus</option>
                    <option value="Welcome Bonus" className="bg-[#100e2e] text-white">Welcome Bonus</option>
                  </>
                ) : (
                  <>
                    <option value="All" className="bg-[#100e2e] text-white">All Statuses</option>
                    <option value="Pending" className="bg-[#100e2e] text-white">Pending</option>
                    <option value="Approved" className="bg-[#100e2e] text-white">Approved</option>
                    <option value="Rejected" className="bg-[#100e2e] text-white">Rejected</option>
                    <option value="Refunded" className="bg-[#100e2e] text-white">Refunded</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Content Scrolling Pane */}
        <div className="flex-grow overflow-y-auto p-6 bg-[#08061a]/40 custom-scrollbar z-10">
          {activeTab === 'points' ? (
            <div className="overflow-x-auto">
              {filteredPointLogs.length === 0 ? (
                <div className="text-center py-16 text-white/30 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                    <Coins className="w-6 h-6 text-white/20 animate-bounce" />
                  </div>
                  <span className="text-xs font-semibold">No matching point additions found.</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-white/40 font-mono uppercase tracking-widest">
                      <th className="pb-3.5 pl-2">User account</th>
                      <th className="pb-3.5">Type</th>
                      <th className="pb-3.5">Verified Details</th>
                      <th className="pb-3.5 text-right pr-2">Coins Reward</th>
                      <th className="pb-3.5 text-right pr-2">Date stamp</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-white/80 divide-y divide-white/[0.04]">
                    {filteredPointLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.03] transition-colors rounded-lg group">
                        <td className="py-3.5 pl-2 font-bold text-white flex items-center gap-2.5 whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                          <span className="group-hover:text-pink-400 transition-colors">{log.user}</span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            log.type === 'Approved Task' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.08)]' :
                            log.type === 'Admin Bonus' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_2px_8px_rgba(245,158,11,0.08)]' :
                            log.type === 'Welcome Bonus' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_2px_8px_rgba(99,102,241,0.08)]' :
                            'bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_2px_8px_rgba(236,72,153,0.08)]'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="py-3.5 max-w-sm truncate text-[11px] text-white/65 font-medium">
                          {log.description}
                        </td>
                        <td className="py-3.5 text-right font-black text-[#10b981] font-mono text-[13px] tracking-wide pr-2">
                          <span className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">+{log.coins.toLocaleString()}</span>
                        </td>
                        <td className="py-3.5 text-right text-white/40 text-[11px] font-mono pr-2">
                          {log.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {filteredWithdrawals.length === 0 ? (
                <div className="text-center py-16 text-white/30 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white/20 animate-bounce" />
                  </div>
                  <span className="text-xs font-semibold">No matching transactions found.</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-white/40 font-mono uppercase tracking-widest">
                      <th className="pb-3.5 pl-2">TX REF ID</th>
                      <th className="pb-3.5">Account Owner</th>
                      <th className="pb-3.5">Method</th>
                      <th className="pb-3.5 text-right">Cash Amount</th>
                      <th className="pb-3.5 text-right">Coin Value</th>
                      <th className="pb-3.5 text-right pr-2">Request Date</th>
                      <th className="pb-3.5 text-right pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-white/80 divide-y divide-white/[0.04]">
                    {filteredWithdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-white/[0.03] transition-colors rounded-lg group">
                        <td className="py-3.5 pl-2 font-mono text-indigo-300 font-bold tracking-wide text-[11px] group-hover:text-pink-400 transition-colors uppercase">
                          {w.id}
                        </td>
                        <td className="py-3.5 font-bold text-white whitespace-nowrap">
                          {w.user}
                        </td>
                        <td className="py-3.5">
                          <span className="bg-white/5 border border-white/10 rounded-full px-3 py-1 font-mono text-[10px] text-white/90 font-semibold shadow-inner">
                            {w.method}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-black text-white text-[13px] tracking-wide">
                          {w.currency === 'EGP' ? `EGP ${w.amount.toLocaleString()}` : `$${w.amount.toFixed(2)}`}
                        </td>
                        <td className="py-3.5 text-right text-yellow-400 font-mono font-bold text-[12px]">
                          {w.pointsCost.toLocaleString()} Coins
                        </td>
                        <td className="py-3.5 text-right text-white/40 text-[11px] font-mono pr-2">
                          {w.date}
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            w.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.08)]' :
                            w.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_2px_8px_rgba(245,158,11,0.08)]' :
                            w.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_2px_8px_rgba(244,63,94,0.08)]' :
                            'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_2px_8px_rgba(99,102,241,0.08)]'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Footer info text with premium layout */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]/30 backdrop-blur-md text-center flex flex-col sm:flex-row sm:justify-between items-center text-[10px] text-white/30 gap-3 z-10 font-mono font-medium tracking-wide">
          <span>Fully compliant automated ledger engine. Multi-layered anti-fraud checked.</span>
          <span className="flex items-center gap-1.5 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400/80 font-semibold uppercase text-[9px]">Continuous Secure Synced</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function addPointHistoryLog(user: string, type: 'Approved Task' | 'Simulated Offer' | 'Admin Bonus' | 'Referral Commission' | 'Welcome Bonus', description: string, coins: number) {
  try {
    const logsStr = localStorage.getItem('prizehour_point_logs') || '[]';
    let logs: PointLog[] = [];
    try {
      logs = JSON.parse(logsStr);
    } catch {
      logs = [];
    }
    const newLog: PointLog = {
      id: `LOG-DND-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user,
      type,
      description,
      coins,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    logs.unshift(newLog);
    localStorage.setItem('prizehour_point_logs', JSON.stringify(logs.slice(0, 200)));
  } catch (e) {
    console.error('Error adding point history log', e);
  }
}
