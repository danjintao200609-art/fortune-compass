import React, { useState, useEffect } from 'react';
import { Page, UserConfig, FortuneResult, Gender } from './types';
import Home from './pages/Home';
import Result from './pages/Result';
import VIP from './pages/VIP';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import * as api from "@/services/gemini";
import * as auth from "./src/services/auth";

const App: React.FC = () => {
  // 认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<auth.AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);

  const [profileData, setProfileData] = useState({
    nickname: '运势达人',
    signature: '时来天地皆同力，运去英雄不自由。',
    birthday: '1990-01-01',
    gender: 'male' as Gender
  });

  const [userConfig, setUserConfig] = useState<UserConfig>({
    birthday: '1990-01-01',
    predictionDate: new Date().toISOString().split('T')[0],
    gender: 'male',
    gameType: 'mahjong',
    timeSlot: 'slot_5'
  });
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 验证登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const user = await auth.verifyToken();
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  // Load profile on mount (after authentication)
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    api.getProfile(currentUser.id).then(data => {
      if (data) {
        setProfileData({
          nickname: data.nickname || currentUser.username || '运势达人',
          signature: data.signature || '时来天地皆同力，运去英雄不自由。',
          birthday: data.birthday || '1990-01-01',
          gender: (data.gender as Gender) || 'male'
        });
        setUserConfig(prev => ({
          ...prev,
          birthday: data.birthday || prev.birthday,
          gender: (data.gender as Gender) || prev.gender
        }));
      }
    });
  }, [isAuthenticated, currentUser]);

  // Save profile when changed
  const handleProfileUpdate = (newData: typeof profileData) => {
    if (!currentUser) return;
    setProfileData(newData);
    api.updateProfile(currentUser.id, {
      nickname: newData.nickname,
      birthday: newData.birthday,
      gender: newData.gender,
      signature: newData.signature
    });
  };

  const navigateTo = (page: Page) => setCurrentPage(page);

  // 处理登录成功
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const user = auth.getCurrentUser();
    if (user) setCurrentUser(user);
  };

  // 处理注册成功
  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
    const user = auth.getCurrentUser();
    if (user) setCurrentUser(user);
  };

  // 处理登出
  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage(Page.HOME);
  };

  // 加载中
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-950">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gold-400 animate-spin">progress_activity</span>
          <p className="text-gray-400 mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登的情况
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setAuthView('register')}
        />
      );
    } else {
      return (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return <Home
          config={userConfig}
          setConfig={setUserConfig}
          onStart={async () => {
            setIsLoading(true);
            try {
              const f = await api.generateFortune(userConfig, 'fengshui');
              setFortune(f);
              setCurrentPage(Page.RESULT);
            } catch (e) {
              console.error(e);
              alert('获取运势失败，请检查后端服务');
            } finally {
              setIsLoading(false);
            }
          }}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          profileData={profileData}
        />;
      case Page.RESULT:
        return <Result
          fortune={fortune}
          navigateTo={navigateTo}
          userConfig={userConfig}
          updateFortune={setFortune}
        />;
      case Page.VIP:
        return <VIP
          navigateTo={navigateTo}
          isAuthenticated={isAuthenticated}
          onLoginPrompt={() => {
            setAuthView('login');
            setIsAuthenticated(false);
          }}
        />;
      case Page.SETTINGS:
        return <Settings
          navigateTo={navigateTo}
          profileData={profileData}
          setProfileData={handleProfileUpdate}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          onSwitchToAuth={(view) => {
            setAuthView(view);
            setIsAuthenticated(false); // Ensure the auth screen shows up
          }}
        />;
      default:
        return <Home
          config={userConfig}
          setConfig={setUserConfig}
          onStart={async () => {
            setIsLoading(true);
            try {
              const f = await api.generateFortune(userConfig, 'fengshui');
              setFortune(f);
              setCurrentPage(Page.RESULT);
            } catch (e) {
              console.error(e);
              alert('获取运势失败，请检查后端服务');
            } finally {
              setIsLoading(false);
            }
          }}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          profileData={profileData}
        />;
    }
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="relative flex flex-col w-full max-w-md bg-charcoal-950 shadow-2xl overflow-hidden border-x border-white/5 h-screen">
        <div className="absolute inset-0 bg-mystic-texture pointer-events-none z-0"></div>
        <div className="absolute inset-0 stars pointer-events-none z-0"></div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar z-10">
          {renderPage()}
        </div>

        {/* Global Nav Bar */}
        <nav className="flex-shrink-0 bg-charcoal-950/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center h-[80px] pb-4 px-2 z-50">
          <NavButton
            active={currentPage === Page.HOME || currentPage === Page.RESULT}
            icon="home"
            label="首页"
            onClick={() => navigateTo(Page.HOME)}
          />
          <NavButton
            active={currentPage === Page.RESULT}
            icon="online_prediction"
            label="预测"
            onClick={() => fortune ? navigateTo(Page.RESULT) : navigateTo(Page.HOME)}
          />
          <NavButton
            active={currentPage === Page.VIP}
            icon="diamond"
            label="VIP"
            onClick={() => navigateTo(Page.VIP)}
          />
          <NavButton
            active={currentPage === Page.SETTINGS}
            icon="settings"
            label="设置"
            onClick={() => navigateTo(Page.SETTINGS)}
          />
        </nav>
      </div>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-300 ${active ? 'text-gold-400' : 'text-gray-500'}`}
  >
    {active && <div className="absolute top-0 w-10 h-[2px] bg-gold-400 shadow-[0_0_10px_#D4AF37]"></div>}
    <span className={`material-symbols-outlined text-[26px] ${active ? 'filled drop-shadow-[0_0_5px_rgba(212,175,55,0.4)]' : ''}`}>
      {icon}
    </span>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;
