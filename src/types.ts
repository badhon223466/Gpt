/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserStats {
  username: string;
  level: number;
  coins: number;
  xpProgress: number; // 0 to 100
  earningsUSD: number;
  offersCompleted: number;
  successRate: number; // 0 to 100
  joinedDate: string;
  status: 'Online' | 'Offline' | 'Banned';
  riskScore: number; // 0 to 100
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  email: string;
  referralsCount: number;
}

export interface Task {
  id: number;
  title: string;
  rewardCoins: number;
  category: string;
  instructions: string;
  completed: boolean;
  proofSubmitted: boolean;
  proofLink?: string;
  status: 'Available' | 'Pending Approval' | 'Approved' | 'Rejected';
  dateCreated: string;
}

export interface Offer {
  id: number;
  title: string;
  rewardValue: number; // in USD or cents
  image: string; // url or placeholder description
  badgeText?: string;
  country: string;
  provider: string;
  logoUrl?: string;
}

export interface Offerwall {
  id: number;
  name: string;
  bonus: number; // e.g., +20%
  locked: boolean;
  description: string;
  rating: number; // 1 to 5 stars
  iframeUrl?: string;
  logoUrl?: string;
}

export interface Withdrawal {
  id: string;
  user: string;
  method: string;
  amount: number; // e.g., 25.00
  currency: string; // e.g., "USD", "BTC", "EGP"
  pointsCost: number; // Coin points cost
  status: 'Approved' | 'Pending' | 'Rejected' | 'Refunded';
  riskScore: number; // 0 to 100
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  date: string;
}

export interface ReferralTier {
  tier: number;
  reqReferrals: number;
  commission: number; // e.g., 5.0 for 5%
  giftText: string;
  unlocked: boolean;
  current: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'Total' | 'Pending' | 'Replied';
  realStatus: 'Pending Reply' | 'Replied' | 'Closed';
  date: string;
  messages: {
    sender: 'user' | 'admin';
    senderName: string;
    text: string;
    time: string;
  }[];
}

export interface PostbackConfig {
  id: number;
  network: string;
  url: string;
  active: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  currency: string;
  type: 'Cash Payment' | 'Gift Cards';
  status: 'Active' | 'Inactive';
  logoPlaceholder: string;
  withdrawalsCount: number;
  totalPaidOut: number;
  dateCreated: string;
}

export interface SecurityEvent {
  id: string;
  type: 'Security check' | 'Login' | 'VPN Detect' | 'Abuse Block';
  ip: string;
  user: string;
  time: string;
  countryCode: string; // e.g., "EG"
  trustScore: number; // e.g., 70
  flag?: string;
}

export interface ChatMessage {
  id: number;
  username: string;
  tag: 'VIP' | 'ADMIN' | 'MEMBER' | 'PRO';
  message: string;
  time: string;
  avatarColor: string;
}

export interface BlogArticle {
  id: number;
  title: string;
  summary: string;
  author: string;
  date: string;
  readTime: string;
  views: number;
  imageUrl: string;
  featured: boolean;
}
