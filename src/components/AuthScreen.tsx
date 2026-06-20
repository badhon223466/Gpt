import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, Sparkles, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { UserStats } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: UserStats, role: 'user' | 'admin') => void;
}

// Initial fallback database of registered test users
const SEED_USERS = [
  {
    username: 'testuser',
    email: 'user@example.com',
    password: 'password',
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
      status: 'Online' as const,
      riskScore: 12,
      riskLevel: 'Low Risk' as const,
      referralsCount: 4
    }
  }
];

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Alerts & loading states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load / initialize users list in localStorage
  const getStoredUsers = () => {
    try {
      const stored = localStorage.getItem('prizehour_auth_users');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored users', e);
    }
    // Return seeded demo users if nothing fits
    return SEED_USERS;
  };

  const saveStoredUsers = (users: typeof SEED_USERS) => {
    localStorage.setItem('prizehour_auth_users', JSON.stringify(users));
  };

  // Switch tabs cleanly resetting the form errors and logs
  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // Submit flow
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    setTimeout(() => {
      try {
        if (activeTab === 'login') {
          const normalizedIdent = username.trim().toLowerCase();
          const normalizedPass = password.trim();

          // Check if admin credentials were provided
          const isAdminCredential = 
            (normalizedIdent === 'admin' || normalizedIdent === 'admin@admin.com') && 
            normalizedPass === 'admin';

          if (isAdminCredential) {
            setSuccessMsg('Admin authorized successfully! Entering Command Center...');
            
            // Create fallback Admin stats
            const adminStats: UserStats = {
              username: 'Admin',
              email: 'admin@admin.com',
              level: 10,
              coins: 58225,
              xpProgress: 80,
              earningsUSD: 256.23,
              offersCompleted: 45,
              successRate: 100,
              joinedDate: 'Joined Jan 2026',
              status: 'Online',
              riskScore: 0,
              riskLevel: 'Low Risk',
              referralsCount: 12
            };

            setTimeout(() => {
              onLoginSuccess(adminStats, 'admin');
              setIsLoading(false);
            }, 1000);
            return;
          }

          // Standard User Login Check
          const authList = getStoredUsers();

          const foundUser = authList.find(
            (u: any) => 
              (u.username.toLowerCase() === normalizedIdent || u.email.toLowerCase() === normalizedIdent) && 
              u.password === password
          );

          if (foundUser) {
            setSuccessMsg(`Welcome back, ${foundUser.username}! Loading Dashboard...`);
            setTimeout(() => {
              onLoginSuccess(foundUser.userStats, 'user');
              setIsLoading(false);
            }, 1000);
          } else {
            setErrorMsg('Invalid username/email or password credentials.');
            setIsLoading(false);
          }
          return;
        }

        if (activeTab === 'register') {
          // Standard User Register
          const cleanUser = username.trim();
          const cleanEmail = email.trim();
          
          if (!cleanUser || cleanUser.length < 3) {
            setErrorMsg('Username must be at least 3 characters.');
            setIsLoading(false);
            return;
          }

          if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
            setErrorMsg('Please input a valid email address.');
            setIsLoading(false);
            return;
          }

          if (password.length < 5) {
            setErrorMsg('Password should be at least 5 characters.');
            setIsLoading(false);
            return;
          }

          if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            setIsLoading(false);
            return;
          }

          const authList = getStoredUsers();

          // Check duplicate
          const isDuplicate = authList.some(
            (u: any) => 
              u.username.toLowerCase() === cleanUser.toLowerCase() || 
              u.email.toLowerCase() === cleanEmail.toLowerCase()
          );

          if (isDuplicate) {
            setErrorMsg('A user with this username or email already exists.');
            setIsLoading(false);
            return;
          }

          // Create new user record
          const newUserStats: UserStats = {
            username: cleanUser,
            email: cleanEmail,
            level: 1,
            coins: 5000, // Gift 5000 startup testing coins
            xpProgress: 0,
            earningsUSD: 0,
            offersCompleted: 0,
            successRate: 100,
            joinedDate: `Joined Jun 2026`,
            status: 'Online',
            riskScore: 2,
            riskLevel: 'Low Risk',
            referralsCount: 0
          };

          const newAccountRecord = {
            username: cleanUser,
            email: cleanEmail,
            password: password,
            userStats: newUserStats
          };

          authList.push(newAccountRecord);
          saveStoredUsers(authList);

          setSuccessMsg('Registration completed! You received +5,000 helper coins! Logging you in...');
          setTimeout(() => {
            onLoginSuccess(newUserStats, 'user');
            setIsLoading(false);
          }, 1500);
        }
      } catch (err) {
        setErrorMsg('An unexpected error occurred. Please try again.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div id="auth-screen-root" className="min-h-screen w-full flex items-center justify-center bg-[#070617] text-white font-sans p-4 relative overflow-hidden selection:bg-pink-500/30 selection:text-white">
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-pink-600/25 rounded-full blur-[110px] pointer-events-none z-0"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 flex flex-col gap-6">
        
        {/* APP BRAND SIGNATURE LOGO */}
        <div className="flex flex-col items-center gap-2 select-none text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-pink-500/35 mb-2">
            <span className="font-extrabold text-white text-2xl tracking-tighter">P</span>
          </div>
          <h1 className="text-3xl font-black tracking-wider text-white">
            Prize<span className="text-pink-500 font-semibold">Hour</span>
          </h1>
          <p className="text-xs text-white/55 font-medium leading-relaxed">
            The Ultimate Task Proofing & Offerwall Portal
          </p>
        </div>

        {/* TABS SWITCHER */}
        <div className="grid grid-cols-2 bg-white/5 rounded-2xl p-1 border border-white/5">
          <button
            onClick={() => handleTabChange('login')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'login' 
                ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            User Login
          </button>
          
          <button
            onClick={() => handleTabChange('register')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Register
          </button>
        </div>

        {/* ALERTS */}
        {errorMsg && (
          <div className="bg-red-500/15 border border-red-500/35 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-red-300 animate-pulse">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/15 border border-emerald-500/35 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN / SIGNUP FORM PANEL */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Email field ONLY for sign up */}
          {activeTab === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-white/55 font-mono">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500 transition-all font-sans"
                />
                <Mail className="w-4 h-4 text-white/35 absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          {/* Username Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-white/55 font-mono">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={
                  activeTab === 'register' 
                    ? 'Choose a unique username' 
                    : 'Enter username or email'
                }
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500 transition-all font-sans"
              />
              <User className="w-4 h-4 text-white/35 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-white/55 font-mono">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500 transition-all font-sans"
              />
              <Lock className="w-4 h-4 text-white/35 absolute left-3.5 top-3.5" />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 p-0.5 text-white/35 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field ONLY for sign up */}
          {activeTab === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-white/55 font-mono">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500 transition-all font-sans"
                />
                <Lock className="w-4 h-4 text-white/35 absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          {/* Tips for evaluation ease */}
          <div className="text-[11px] text-white/45 bg-white/5 border border-white/5 rounded-2xl p-3 leading-relaxed mt-1 flex gap-2 items-start font-sans">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              {activeTab === 'register' ? (
                <span>Register a new tester account to receive <strong>5,000 free coins</strong> instantly to evaluate features like cashouts.</span>
              ) : (
                <span>
                  Log in with <strong>testuser</strong> / <strong>password</strong>. To log in as Administrator, use username <strong>admin</strong> and password <strong>admin</strong>.
                </span>
              )}
            </div>
          </div>

          {/* Form Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-pink-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                {activeTab === 'login' && 'Sign Into Account'}
                {activeTab === 'register' && 'Register Free Account'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
