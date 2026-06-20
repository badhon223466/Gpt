/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_USER,
  INITIAL_TASKS,
  INITIAL_OFFERS,
  INITIAL_OFFERWALLS,
  INITIAL_WITHDRAWALS,
  INITIAL_TIERS,
  INITIAL_CHAT,
  INITIAL_TICKETS,
  INITIAL_POSTBACKS,
  INITIAL_PAYMENT_METHODS,
  INITIAL_SECURITY_EVENTS,
  BLOG_ARTICLES
} from './data';
import {
  UserStats,
  Task,
  Offer,
  Offerwall,
  Withdrawal,
  ReferralTier,
  SupportTicket,
  PostbackConfig,
  PaymentMethod,
  SecurityEvent,
  ChatMessage,
  BlogArticle
} from './types';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthScreen from './components/AuthScreen';
import { addPointHistoryLog } from './components/HistoryModal';

export default function App() {
  // Auth & Session tracking
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('prizehour_is_logged_in') === 'true';
  });
  
  const [currentUserRole, setCurrentUserRole] = useState<'user' | 'admin'>(() => {
    return (localStorage.getItem('prizehour_user_role') as 'user' | 'admin') || 'user';
  });

  // App routing master toggle: user portion or admin command center
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return localStorage.getItem('prizehour_is_admin_mode') === 'true';
  });

  // Core synchronized persistent states
  const [userState, setUserState] = useState<UserStats>(() => {
    const saved = localStorage.getItem('prizehour_current_user_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored user stats', e);
      }
    }
    return INITIAL_USER;
  });

  const [tasksState, setTasksState] = useState<Task[]>(INITIAL_TASKS);
  const [withdrawalsState, setWithdrawalsState] = useState<Withdrawal[]>(INITIAL_WITHDRAWALS);
  const [paymentMethodsState, setPaymentMethodsState] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [postbacksState, setPostbacksState] = useState<PostbackConfig[]>(INITIAL_POSTBACKS);
  const [securityEventsState, setSecurityEventsState] = useState<SecurityEvent[]>(INITIAL_SECURITY_EVENTS);
  const [supportTicketsState, setSupportTicketsState] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [chatMessagesState, setChatMessagesState] = useState<ChatMessage[]>(INITIAL_CHAT);

  // Dynamic offer, offerwall and exchange rate states editable by administrator
  const [offersState, setOffersState] = useState<Offer[]>(() => {
    const saved = localStorage.getItem('prizehour_offers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved offers', e);
      }
    }
    return INITIAL_OFFERS;
  });

  const [offerwallsState, setOfferwallsState] = useState<Offerwall[]>(() => {
    const saved = localStorage.getItem('prizehour_offerwalls');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved offerwalls', e);
      }
    }
    return INITIAL_OFFERWALLS;
  });

  const [coinsPerUSD, setCoinsPerUSD] = useState<number>(() => {
    const saved = localStorage.getItem('prizehour_coins_per_usd');
    return saved ? parseInt(saved, 10) : 1000;
  });

  useEffect(() => {
    localStorage.setItem('prizehour_offers', JSON.stringify(offersState));
  }, [offersState]);

  useEffect(() => {
    localStorage.setItem('prizehour_offerwalls', JSON.stringify(offerwallsState));
  }, [offerwallsState]);

  useEffect(() => {
    localStorage.setItem('prizehour_coins_per_usd', coinsPerUSD.toString());
  }, [coinsPerUSD]);

  // Sync user state changes to local storage and the registered users database in real-time
  useEffect(() => {
    if (userState && isLoggedIn && currentUserRole === 'user') {
      localStorage.setItem('prizehour_current_user_stats', JSON.stringify(userState));
      try {
        const storedUsers = localStorage.getItem('prizehour_auth_users');
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          const updated = parsed.map((item: any) => {
            if (item.username.toLowerCase() === userState.username.toLowerCase() || item.email.toLowerCase() === userState.email.toLowerCase()) {
              return {
                ...item,
                userStats: userState
              };
            }
            return item;
          });
          localStorage.setItem('prizehour_auth_users', JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Error syncing user state to master list', err);
      }
    }
  }, [userState, isLoggedIn, currentUserRole]);

  // Auth Action Handlers
  const handleLoginSuccess = (stats: UserStats, role: 'user' | 'admin') => {
    setUserState(stats);
    setCurrentUserRole(role);
    setIsLoggedIn(true);
    const calculatedAdminMode = role === 'admin';
    setIsAdminMode(calculatedAdminMode);

    localStorage.setItem('prizehour_is_logged_in', 'true');
    localStorage.setItem('prizehour_user_role', role);
    localStorage.setItem('prizehour_current_user_stats', JSON.stringify(stats));
    localStorage.setItem('prizehour_is_admin_mode', calculatedAdminMode ? 'true' : 'false');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserRole('user');
    setIsAdminMode(false);
    localStorage.removeItem('prizehour_is_logged_in');
    localStorage.removeItem('prizehour_user_role');
    localStorage.removeItem('prizehour_current_user_stats');
    localStorage.removeItem('prizehour_is_admin_mode');
  };

  const handleToggleAdminMode = (modeVal: boolean) => {
    setIsAdminMode(modeVal);
    localStorage.setItem('prizehour_is_admin_mode', modeVal ? 'true' : 'false');
  };

  // 1. UPDATE USER BALANCE DIRECT COIN MANIPULATIONS
  const updateUserCoins = (newCoinsCount: number) => {
    setUserState((prev) => ({
      ...prev,
      coins: newCoinsCount
    }));
  };

  // 2. USER SUBMITS TASK PROOF SCREENSHOT OR LINK
  const submitTaskProof = (taskId: number, proofLinkUrl: string) => {
    setTasksState((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: true,
              proofSubmitted: true,
              proofLink: proofLinkUrl,
              status: 'Pending Approval'
            }
          : t
      )
    );
  };

  // 3. ADMIN APPROVES SUBMITTED PROOF - Credits user balance!
  const approveTaskProof = (taskId: number) => {
    const targetTask = tasksState.find((t) => t.id === taskId);
    if (!targetTask) return;

    // Credit coins
    setUserState((prev) => {
      addPointHistoryLog(prev.username, 'Approved Task', `Approved task: ${targetTask.title}`, targetTask.rewardCoins);
      return {
        ...prev,
        coins: prev.coins + targetTask.rewardCoins,
        offersCompleted: prev.offersCompleted + 1
      };
    });

    // Update status
    setTasksState((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'Approved'
            }
          : t
      )
    );

    // Notify with a security event log entry
    const newLog: SecurityEvent = {
      id: `sec-approved-${taskId}-${Date.now()}`,
      type: 'Security check',
      ip: '127.0.0.1',
      user: userState.username,
      time: 'Just now',
      countryCode: 'EG',
      trustScore: 100
    };
    setSecurityEventsState((prev) => [newLog, ...prev]);
  };

  // 4. ADMIN REJECTS SUBMITTED PROOF
  const rejectTaskProof = (taskId: number) => {
    setTasksState((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: false,
              proofSubmitted: false,
              proofLink: undefined,
              status: 'Rejected'
            }
          : t
      )
    );
  };

  // 5. USER INITIATES HEAVY COIN CASHOUT PAYOUT WITHDRAWAL
  const addWithdrawal = (
    methodName: string,
    cashAmount: number,
    coinsCost: number,
    currencySymbol: string
  ) => {
    // Deduct coins from state
    setUserState((prev) => ({
      ...prev,
      coins: Math.max(0, prev.coins - coinsCost)
    }));

    const randomizedRiskScore = Math.floor(Math.random() * 32); // normal safe user
    const riskIndicator =
      randomizedRiskScore > 75 ? 'High Risk' : randomizedRiskScore > 40 ? 'Medium Risk' : 'Low Risk';

    const newWithdraw: Withdrawal = {
      id: `WH-${Math.floor(1000 + Math.random() * 9000)}`,
      user: userState.username,
      method: methodName,
      amount: cashAmount,
      currency: currencySymbol,
      pointsCost: coinsCost,
      status: 'Pending',
      riskScore: randomizedRiskScore,
      riskLevel: riskIndicator,
      date: 'Just now'
    };

    setWithdrawalsState((prev) => [newWithdraw, ...prev]);

    // Also register a security detection log to the admin terminal
    const newSecLog: SecurityEvent = {
      id: `sec-${Date.now()}`,
      type: 'Login',
      ip: '197.38.99.105',
      user: userState.username,
      time: 'Just now',
      countryCode: 'EG',
      trustScore: 100 - randomizedRiskScore
    };
    setSecurityEventsState((prev) => [newSecLog, ...prev]);
  };

  // 6. ADMIN APPROVES CASHOUT PENDING REQUEST
  const approveWithdrawal = (withdrawalId: string) => {
    setWithdrawalsState((prev) =>
      prev.map((w) =>
        w.id === withdrawalId
          ? {
              ...w,
              status: 'Approved'
            }
          : w
      )
    );
  };

  // 7. ADMIN REJECTS CASHOUT REQUEST - Refunds users points!
  const rejectWithdrawal = (withdrawalId: string) => {
    const targetWH = withdrawalsState.find((w) => w.id === withdrawalId);
    if (!targetWH) return;

    // Refund points
    setUserState((prev) => {
      addPointHistoryLog(prev.username, 'Admin Bonus', `Refunded points for rejected cashout ${targetWH.id}`, targetWH.pointsCost);
      return {
        ...prev,
        coins: prev.coins + targetWH.pointsCost
      };
    });

    setWithdrawalsState((prev) =>
      prev.map((w) =>
        w.id === withdrawalId
          ? {
              ...w,
              status: 'Rejected'
            }
          : w
      )
    );
  };

  // 8. ADD NEW PAYMENT GATEWAY
  const addPaymentMethod = (name: string, currency: string, type: 'Cash Payment' | 'Gift Cards') => {
    const key = `pay-gen-${Date.now()}`;
    const newPM: PaymentMethod = {
      id: key,
      name,
      currency,
      type,
      status: 'Active',
      logoPlaceholder: type === 'Gift Cards' ? '🎁 GF' : '🪙 AP',
      withdrawalsCount: 0,
      totalPaidOut: 0,
      dateCreated: 'Just now'
    };
    setPaymentMethodsState((prev) => [...prev, newPM]);
  };

  // 9. DELETE PAYMENT GATEWAY
  const deletePaymentMethod = (id: string) => {
    setPaymentMethodsState((prev) => prev.filter((pm) => pm.id !== id));
  };

  // 10. ADD NEW POSTBACK PATH
  const addPostback = (networkName: string, urlPayload: string) => {
    const newPB: PostbackConfig = {
      id: Date.now(),
      network: networkName,
      url: urlPayload,
      active: true
    };
    setPostbacksState((prev) => [...prev, newPB]);
  };

  // 11. USER FILES SUPPORT TICKET
  const addSupportTicket = (subject: string, msgText: string) => {
    const ticketId = `T-${Math.floor(100 + Math.random() * 900)}`;
    const newT: SupportTicket = {
      id: ticketId,
      subject,
      status: 'Total',
      realStatus: 'Pending Reply',
      date: 'Just now',
      messages: [
        {
          sender: 'user',
          senderName: userState.username,
          text: msgText,
          time: 'Just now'
        }
      ]
    };
    setSupportTicketsState((prev) => [newT, ...prev]);

    // Provide a delayed helpful automated bot response after 3 seconds! This makes support dynamic.
    setTimeout(() => {
      setSupportTicketsState((current) =>
        current.map((t) => {
          if (t.id === ticketId) {
            return {
              ...t,
              realStatus: 'Replied',
              messages: [
                ...t.messages,
                {
                  sender: 'admin',
                  senderName: 'PrizeDesk Support Bot',
                  text: 'Thank you for contacting PrizeHour help center. A security team member is reviewing your transaction data. Please expect a detailed reply in under 2 hours.',
                  time: 'Just now'
                }
              ]
            };
          }
          return t;
        })
      );
    }, 4000);
  };

  // 12. USER OR ADMIN REPLES TO SUPPORT TICKET
  const addTicketMessage = (ticketId: string, replyMessageText: string) => {
    setSupportTicketsState((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            realStatus: 'Pending Reply',
            messages: [
              ...t.messages,
              {
                sender: 'user',
                senderName: userState.username,
                text: replyMessageText,
                time: 'Just now'
              }
            ]
          };
        }
        return t;
      })
    );
  };

  // 13. LIVE CHAT MESSAGE CREATOR
  const addChatMessage = (msgStr: string) => {
    const newChat: ChatMessage = {
      id: Date.now(),
      username: userState.username,
      tag: 'ADMIN',
      message: msgStr,
      time: 'Just now',
      avatarColor: 'bg-purple-600'
    };
    setChatMessagesState((prev) => [...prev, newChat]);
  };

  return (
    <div id="master-root" className="min-h-screen bg-[#070617] text-gray-300 antialiased selection:bg-purple-500/30 selection:text-white">
      {!isLoggedIn ? (
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      ) : isAdminMode ? (
        <AdminDashboard
          user={userState}
          tasks={tasksState}
          approveTaskProof={approveTaskProof}
          rejectTaskProof={rejectTaskProof}
          withdrawals={withdrawalsState}
          approveWithdrawal={approveWithdrawal}
          rejectWithdrawal={rejectWithdrawal}
          paymentMethods={paymentMethodsState}
          addPaymentMethod={addPaymentMethod}
          deletePaymentMethod={deletePaymentMethod}
          postbacks={postbacksState}
          addPostback={addPostback}
          securityEvents={securityEventsState}
          onToggleUser={() => handleToggleAdminMode(false)}
          onLogout={handleLogout}
          offers={offersState}
          setOffers={setOffersState}
          offerwalls={offerwallsState}
          setOfferwalls={setOfferwallsState}
          coinsPerUSD={coinsPerUSD}
          setCoinsPerUSD={setCoinsPerUSD}
        />
      ) : (
        <UserDashboard
          user={userState}
          updateUserCoins={updateUserCoins}
          tasks={tasksState}
          submitTaskProof={submitTaskProof}
          offers={offersState}
          offerwalls={offerwallsState}
          referralTiers={INITIAL_TIERS}
          tickets={supportTicketsState}
          addSupportTicket={addSupportTicket}
          addTicketMessage={addTicketMessage}
          paymentMethods={paymentMethodsState}
          withdrawals={withdrawalsState}
          addWithdrawal={addWithdrawal}
          chatMessages={chatMessagesState}
          addChatMessage={addChatMessage}
          articles={BLOG_ARTICLES}
          onToggleAdmin={() => handleToggleAdminMode(true)}
          onLogout={handleLogout}
          isAdminUser={currentUserRole === 'admin'}
          coinsPerUSD={coinsPerUSD}
        />
      )}
    </div>
  );
}
