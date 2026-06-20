/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

export const INITIAL_USER: UserStats = {
  username: 'Admin',
  email: 'admin@admin.com',
  level: 10,
  coins: 58225, // 58,225 Coins is shown in the header
  xpProgress: 20, // 20% to next level
  earningsUSD: 256.23, // $256.23 on leaderboard
  offersCompleted: 3,
  successRate: 100, // 100% Success
  joinedDate: 'Joined Jan 2025',
  status: 'Online',
  riskScore: 0,
  riskLevel: 'Low Risk',
  referralsCount: 12, // unlocks Tier 1 (req 10 referrals)
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 34,
    title: 'Task #34: Download & Play Merge Master',
    rewardCoins: 20,
    category: 'Gaming',
    instructions: 'Download the Merge Master game from the App Store or Google Play and complete Level 5. Upload your proof screenshot to Google Drive or Imgur and share the link below.',
    completed: false,
    proofSubmitted: false,
    status: 'Available',
    dateCreated: 'Jun 15, 2025'
  },
  {
    id: 401,
    title: 'Task #401: Complete Healthcare Survey',
    rewardCoins: 15,
    category: 'Surveys',
    instructions: 'Participate in our fast-paced US Healthcare awareness survey. Make sure to complete all questions truthfully and take a screenshot of the confirmation code at the end.',
    completed: false,
    proofSubmitted: false,
    status: 'Available',
    dateCreated: 'Jun 18, 2025'
  },
  {
    id: 112,
    title: 'Task #112: Leave a 5-Star Review',
    rewardCoins: 10,
    category: 'Social',
    instructions: 'Show your support for PrizeHour! Leave an honest 5-star review on Trustpilot and submit your review username as proof so we can verify it.',
    completed: false,
    proofSubmitted: false,
    status: 'Available',
    dateCreated: 'Jun 19, 2025'
  },
  {
    id: 88,
    title: 'Task #88: Join Telegram Channel',
    rewardCoins: 5,
    category: 'Social',
    instructions: 'Join our daily telegram sweepstakes announcements channel and stay subbed for at least 7 days to claim your coins.',
    completed: true,
    proofSubmitted: true,
    proofLink: 'https://t.me/prizehour/user_88_joined',
    status: 'Approved',
    dateCreated: 'May 10, 2025'
  }
];

export const INITIAL_OFFERS: Offer[] = [
  {
    id: 1,
    title: 'Pippit AI - Brainstorm Assistant',
    rewardValue: 0.25,
    image: 'Pippit',
    badgeText: 'Egypt',
    country: 'EG',
    provider: 'AdGate Media',
    logoUrl: 'https://img.icons8.com/color/96/brainstorm.png'
  },
  {
    id: 2,
    title: 'Forest Cleaner - Eco Clicker',
    rewardValue: 46.15,
    image: 'NOT.ME',
    badgeText: 'NOT.ME',
    country: 'GLOBAL',
    provider: 'Torox',
    logoUrl: 'https://img.icons8.com/color/96/forest.png'
  },
  {
    id: 3,
    title: 'Word City: Connect Word Game',
    rewardValue: 53.74,
    image: 'NOT.ME',
    badgeText: 'NOT.ME',
    country: 'GLOBAL',
    provider: 'MyChips',
    logoUrl: 'https://img.icons8.com/color/96/scrabble-tile.png'
  },
  {
    id: 4,
    title: 'Healthcare Survey US Quick',
    rewardValue: 7.80,
    image: 'NOT.ME',
    badgeText: 'NOT.ME',
    country: 'US',
    provider: 'AdGate Media',
    logoUrl: 'https://img.icons8.com/color/96/survey.png'
  },
  {
    id: 5,
    title: 'Stormshot - Isle of Adventure',
    rewardValue: 94.13,
    image: 'NOT.ME',
    badgeText: 'NOT.ME',
    country: 'GLOBAL',
    provider: 'Revenue Universe',
    logoUrl: 'https://img.icons8.com/color/96/compass.png'
  },
  {
    id: 6,
    title: 'DigGold Bonanza - Android Mine',
    rewardValue: 55.38,
    image: 'NOT.ME',
    badgeText: 'NOT.ME',
    country: 'GLOBAL',
    provider: 'Ayetstudio',
    logoUrl: 'https://img.icons8.com/color/96/gold-ore.png'
  },
  {
    id: 7,
    title: 'Mistplay - Play & Earn Giftcards',
    rewardValue: 109.20,
    image: 'NOT.ME',
    badgeText: 'NOT.ME',
    country: 'US',
    provider: 'Torox',
    logoUrl: 'https://img.icons8.com/color/96/game-controller.png'
  }
];

export const INITIAL_OFFERWALLS: Offerwall[] = [
  {
    id: 1,
    name: 'Torox',
    bonus: 20,
    locked: false,
    description: 'High paying offers & installations',
    rating: 4.0,
    logoUrl: 'https://img.icons8.com/color/96/shield.png'
  },
  {
    id: 2,
    name: 'MyChips',
    bonus: 20,
    locked: false,
    description: 'Daily survey routing with cash boosters',
    rating: 4.0,
    logoUrl: 'https://img.icons8.com/color/96/chip.png'
  },
  {
    id: 3,
    name: 'Revenue Universe',
    bonus: 30,
    locked: true,
    description: 'Tier-1 dynamic gaming rewards',
    rating: 5.0,
    logoUrl: 'https://img.icons8.com/color/96/commercial.png'
  },
  {
    id: 4,
    name: 'AdGate Media',
    bonus: 40,
    locked: false,
    description: 'Global reach surveys and click campaigns',
    rating: 4.0,
    logoUrl: 'https://img.icons8.com/color/96/key.png'
  },
  {
    id: 5,
    name: 'Ayetstudio',
    bonus: 30,
    locked: false,
    description: 'Sleek visual reward walls',
    rating: 5.0,
    logoUrl: 'https://img.icons8.com/color/96/mind-map.png'
  }
];

export const INITIAL_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'PH-9871',
    user: 'Ahmed (Security Administrator)',
    method: 'PayPal',
    amount: 15.00,
    currency: 'USD',
    pointsCost: 3000,
    status: 'Approved',
    riskScore: 0,
    riskLevel: 'Low Risk',
    date: 'Jun 19, 2025 15:32'
  },
  {
    id: 'PH-9872',
    user: 'Test9999',
    method: 'BitcoinCash',
    amount: 1.20,
    currency: 'USD',
    pointsCost: 240,
    status: 'Approved',
    riskScore: 12,
    riskLevel: 'Low Risk',
    date: 'Jun 19, 2025 11:20'
  },
  {
    id: 'PH-1002',
    user: 'slowly',
    method: 'Vodafone Cash',
    amount: 250,
    currency: 'EGP',
    pointsCost: 1500,
    status: 'Pending',
    riskScore: 40,
    riskLevel: 'Medium Risk',
    date: 'Jun 20, 2025 08:34'
  },
  {
    id: 'PH-1003',
    user: 'bot@prizehour.com',
    method: 'PayPal',
    amount: 50.00,
    currency: 'USD',
    pointsCost: 10000,
    status: 'Pending',
    riskScore: 78,
    riskLevel: 'High Risk',
    date: 'Jun 20, 2025 09:12'
  },
  {
    id: 'PH-1004',
    user: 'survey_master',
    method: 'PayPal',
    amount: 5.00,
    currency: 'USD',
    pointsCost: 1000,
    status: 'Pending',
    riskScore: 5,
    riskLevel: 'Low Risk',
    date: 'Jun 20, 2025 09:15'
  },
  {
    id: 'PH-1005',
    user: 'golden_guy',
    method: 'Test Payment Gift Card',
    amount: 25.00,
    currency: 'USD',
    pointsCost: 5000,
    status: 'Pending',
    riskScore: 18,
    riskLevel: 'Low Risk',
    date: 'Jun 20, 2025 09:18'
  },
  // We populate 22 pending in total to match the "Pending (22)" from Screenshot 1
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `PH-GEN-${1000 + i}`,
    user: `User_${2000 + i}`,
    method: i % 2 === 0 ? 'PayPal' : 'BitcoinCash',
    amount: Math.round((Math.random() * 45 + 5) * 100) / 100,
    currency: 'USD',
    pointsCost: 1000,
    status: 'Pending' as const,
    riskScore: Math.floor(Math.random() * 40),
    riskLevel: 'Low Risk' as const,
    date: 'Jun 20, 2025 02:44'
  }))
];

export const INITIAL_TIERS: ReferralTier[] = [
  { tier: 1, reqReferrals: 10, commission: 5.0, giftText: 'Small gift', unlocked: true, current: true },
  { tier: 2, reqReferrals: 20, commission: 6.0, giftText: 'Small gift', unlocked: false, current: false },
  { tier: 3, reqReferrals: 30, commission: 7.0, giftText: 'Small gift', unlocked: false, current: false },
  { tier: 4, reqReferrals: 40, commission: 8.0, giftText: 'Small gift', unlocked: false, current: false },
  { tier: 5, reqReferrals: 50, commission: 9.0, giftText: 'Small gift', unlocked: false, current: false },
  { tier: 6, reqReferrals: 60, commission: 10.0, giftText: 'Small gift', unlocked: false, current: false },
  { tier: 7, reqReferrals: 70, commission: 11.0, giftText: 'Small gift', unlocked: false, current: false },
  { tier: 8, reqReferrals: 80, commission: 12.0, giftText: 'Small gift', unlocked: false, current: false },
  { tier: 9, reqReferrals: 90, commission: 13.0, giftText: 'Small gift', unlocked: false, current: false },
  { tier: 10, reqReferrals: 100, commission: 14.0, giftText: 'Small gift', unlocked: false, current: false }
];

export const INITIAL_CHAT: ChatMessage[] = [
  { id: 1, username: 'Alex2024', tag: 'VIP', message: 'Just earned $50 from surveys today! 🔥 Anyone else having a great earning day?', time: '2:34 PM', avatarColor: 'bg-indigo-600' },
  { id: 2, username: 'SurveyKing', tag: 'MEMBER', message: '@Alex2024 Congrats! I\'m at $35 today. Which survey providers are paying the best right now?', time: '2:35 PM', avatarColor: 'bg-emerald-600' },
  { id: 3, username: 'MikeEarns', tag: 'PRO', message: 'Try the gaming offers! I made $28 just playing mobile games for 2 hours', time: '2:35 PM', avatarColor: 'bg-amber-600' }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'T-101',
    subject: 'Payout Delay for PayPal',
    status: 'Pending',
    realStatus: 'Pending Reply',
    date: 'Jun 19, 2025',
    messages: [
      {
        sender: 'user',
        senderName: 'Admin',
        text: 'Hello support, my recent withdraw request PH-9871 shows as approved but I haven\'t seen the funds in my PayPal yet. Can you please check?',
        time: 'Jun 19, 2025 15:40'
      }
    ]
  }
];

export const INITIAL_POSTBACKS: PostbackConfig[] = [
  { id: 1, network: 'AdGem', url: 'https://prizehour.com/api/adget?conversion_id={conversion_id}&user_id={user_id}', active: true },
  { id: 2, network: 'AdGetMedia', url: 'https://prizehour.com/api/adget?conversion_id={conversion_id}&points={amount}', active: true },
  { id: 3, network: 'OfferToro', url: 'https://prizehour.com/api/offertoro?user_id={user_id}&amount={amount}&o_name={offer_name}', active: true },
  { id: 4, network: 'CPA Lead', url: 'https://prizehour.com/api/cpalead?user_id={subid}&status=lead&lead_id={lead_id}', active: true },
  { id: 5, network: 'ayeTstudios', url: 'https://prizehour.com/api/t1/network/ayetstudios?uid={uid}&payout={payout}&campaign={campaign}', active: true },
  { id: 6, network: 'Bitlabs', url: 'https://prizehour.com/api/bitlabs?user_id={UId}&val={val}&hash={hash}', active: true },
  { id: 7, network: 'CPXResearch', url: 'https://prizehour.com/api/cpxresearch?user_id={user_id}&amount={coins}&hash={md5}', active: true },
  { id: 8, network: 'Inbrain', url: 'https://prizehour.com/api/postback/inbrain', active: true },
  { id: 9, network: 'MMWall', url: 'https://prizehour.com/api/makemoney?user_id={user_id}&amount={amount}&secret={pass}', active: true }
];

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pay-1',
    name: 'Vodafone Cash',
    currency: 'EGP',
    type: 'Cash Payment',
    status: 'Active',
    logoPlaceholder: '📱 VC',
    withdrawalsCount: 12,
    totalPaidOut: 0.00,
    dateCreated: 'Aug 22, 2025 12:03'
  },
  {
    id: 'pay-2',
    name: 'BitcoinCash',
    currency: 'BTC',
    type: 'Cash Payment',
    status: 'Active',
    logoPlaceholder: '🪙 BTC',
    withdrawalsCount: 13,
    totalPaidOut: 180.00,
    dateCreated: 'Jun 28, 2025 10:57'
  },
  {
    id: 'pay-3',
    name: 'PayPal',
    currency: 'USD',
    type: 'Cash Payment',
    status: 'Active',
    logoPlaceholder: '💳 PP',
    withdrawalsCount: 1,
    totalPaidOut: 0.00,
    dateCreated: 'Jun 28, 2025 10:57'
  },
  {
    id: 'pay-binance',
    name: 'Binance (USDT)',
    currency: 'USDT',
    type: 'Cash Payment',
    status: 'Active',
    logoPlaceholder: '🟡 BN',
    withdrawalsCount: 24,
    totalPaidOut: 450.00,
    dateCreated: 'Jun 20, 2025 11:00'
  },
  {
    id: 'pay-4',
    name: 'Test Payment Gift Card',
    currency: 'USD',
    type: 'Gift Cards',
    status: 'Active',
    logoPlaceholder: '🎁 GF',
    withdrawalsCount: 1,
    totalPaidOut: 0.00,
    dateCreated: 'Jun 28, 2025 10:57'
  }
];

export const INITIAL_SECURITY_EVENTS: SecurityEvent[] = [
  { id: 'sec-1', type: 'Security check', ip: '156.198.205.4', user: 'Admin', time: '3 months ago', countryCode: 'EG', trustScore: 70 },
  { id: 'sec-2', type: 'Security check', ip: '156.198.205.4', user: 'Admin', time: '3 months ago', countryCode: 'EG', trustScore: 70 },
  { id: 'sec-3', type: 'Login', ip: '197.38.99.101', user: 'Admin', time: '3 months ago', countryCode: 'Unknown', trustScore: 73 }
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 1,
    title: 'North Korea just opened its gaming market to dynamic offer walls',
    summary: 'In an unexpected move, new cross-border frameworks allow direct mobile task completions and offer-wall integrations to bypass traditional limits, offering huge payouts to global gamers...',
    author: 'Admin',
    date: 'Jul 04, 2025',
    readTime: '6 min read',
    views: 123,
    imageUrl: 'https://images.unsplash.com/photo-1547989453-11e67ffb3885?auto=format&fit=crop&w=600&q=80',
    featured: true
  }
];

export const MOCK_ADMINS = [
  { id: 1, name: 'ahmed', role: 'Security Administrator', avatar: 'A' }
];
