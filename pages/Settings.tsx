
import React, { useState, useEffect } from 'react';
import { Page, Gender } from '../types';

type SettingView = 'main' | 'login' | 'register' | 'profile' | 'notifications' | 'language' | 'about';

interface SettingsProps {
  navigateTo: (page: Page) => void;
  profileData: {
    nickname: string;
    signature: string;
    birthday: string;
    gender: Gender;
  };
  setProfileData: (newData: any) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  onSwitchToAuth: (view: 'login' | 'register') => void;
}

const Settings: React.FC<SettingsProps> = ({ navigateTo, profileData, setProfileData, isAuthenticated, onLogout, onSwitchToAuth }) => {
  const [currentView, setCurrentView] = useState<SettingView>('main');
  const [isSaving, setIsSaving] = useState(false);
  // 新增：本地草稿状态，用于表单编辑，避免每输入一个字就触发 API
  const [draftProfile, setDraftProfile] = useState({ ...profileData });
  const [notifState, setNotifState] = useState({

    daily: true,
    vip: true,
    system: true
  });
  const [language, setLanguage] = useState<'zh-CN' | 'zh-TW' | 'en'>('zh-CN');

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // 真正保存时，将草稿数据一次性提交
      await setProfileData(draftProfile);
      // 延迟一点时间显示保存动画
      setTimeout(() => {
        setIsSaving(false);
        setCurrentView('main');
      }, 800);
    } catch (error) {
      console.error('保存失败:', error);
      setIsSaving(false);
      alert('保存失败，请重试');
    }
  };

  // 进入编辑页面时更新草稿
  useEffect(() => {
    if (currentView === 'profile') {
      setDraftProfile({ ...profileData });
    }
  }, [currentView, profileData]);

  const renderHeader = (title: string, onBack: () => void) => (
    <header className="flex items-center mb-8">
      <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 active:scale-90 transition-all">
        <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
      </button>
      <h1 className="flex-1 text-center text-white text-md font-bold mr-10 uppercase tracking-[0.2em]">{title}</h1>
    </header>
  );

  // The login/register view is now handled in App.tsx
  // We don't need the local currentView === 'login' block anymore

  // Profile Sub-page
  if (currentView === 'profile') {
    return (
      <div className="px-5 py-6 h-full flex flex-col bg-charcoal-950 animate-in fade-in slide-in-from-right-4 duration-300">
        {renderHeader('个人资料', () => setCurrentView('main'))}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-charcoal-900 border-2 border-gold-400/50 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <span className="material-symbols-outlined text-[56px] text-gold-400 filled">person</span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gold-400 text-charcoal-950 flex items-center justify-center border-2 border-charcoal-950">
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
            </button>
          </div>
          <p className="mt-4 text-[11px] text-gray-500 font-bold uppercase tracking-widest">点击更换头像</p>
        </div>

        <div className="space-y-6">
          <ProfileField
            label="用户昵称"
            value={draftProfile.nickname}
            onChange={(val) => setDraftProfile({ ...draftProfile, nickname: val })}
          />
          <ProfileField label="用户 ID" value="888666" readonly />
          <ProfileField
            label="个人签名"
            value={draftProfile.signature}
            type="textarea"
            onChange={(val) => setDraftProfile({ ...draftProfile, signature: val })}
          />
          <ProfileField
            label="出生日期"
            value={draftProfile.birthday}
            type="date"
            onChange={(val) => setDraftProfile({ ...draftProfile, birthday: val })}
          />
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">性别</label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-charcoal-900 border border-white/10 rounded-xl">
              {(['male', 'female'] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setDraftProfile({ ...draftProfile, gender: g })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${draftProfile.gender === g ? 'bg-charcoal-800 border border-gold-500/30 text-gold-300' : 'text-gray-500'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{g === 'male' ? 'man' : 'woman'}</span>
                  <span className="text-sm font-bold">{g === 'male' ? '男' : '女'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className={`w-full mt-10 py-4 rounded-xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${isSaving ? 'bg-gold-400/50 text-charcoal-950/50 cursor-not-allowed' : 'bg-gold-gradient text-charcoal-950'}`}
        >
          {isSaving && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
          {isSaving ? '正在保存...' : '保存修改'}
        </button>
      </div>
    );
  }

  // Notifications Sub-page
  if (currentView === 'notifications') {
    return (
      <div className="px-5 py-6 h-full flex flex-col bg-charcoal-950 animate-in fade-in slide-in-from-right-4 duration-300">
        {renderHeader('推送通知', () => setCurrentView('main'))}
        <div className="bg-charcoal-900/60 rounded-2xl border border-white/5 divide-y divide-white/5">
          <ToggleItem
            label="每日运势提醒"
            desc="每天早上 8:00 为您推送今日最佳运势"
            active={notifState.daily}
            onToggle={() => setNotifState({ ...notifState, daily: !notifState.daily })}
          />
          <ToggleItem
            label="VIP 专属更新"
            desc="第一时间获取大师级运势解读与功能更新"
            active={notifState.vip}
            onToggle={() => setNotifState({ ...notifState, vip: !notifState.vip })}
          />
          <ToggleItem
            label="系统公告"
            desc="重要的维护公告与系统提醒"
            active={notifState.system}
            onToggle={() => setNotifState({ ...notifState, system: !notifState.system })}
          />
        </div>
      </div>
    );
  }

  // Language Sub-page
  if (currentView === 'language') {
    return (
      <div className="px-5 py-6 h-full flex flex-col bg-charcoal-950 animate-in fade-in slide-in-from-right-4 duration-300">
        {renderHeader('语言与字体', () => setCurrentView('main'))}
        <div className="space-y-6">
          <div className="bg-charcoal-900/60 rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
            <LangItem label="简体中文" active={language === 'zh-CN'} onClick={() => setLanguage('zh-CN')} />
            <LangItem label="繁體中文" active={language === 'zh-TW'} onClick={() => setLanguage('zh-TW')} />
            <LangItem label="English" active={language === 'en'} onClick={() => setLanguage('en')} />
          </div>

          <div className="p-5 bg-charcoal-900/60 rounded-2xl border border-white/5">
            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">字体大小</h3>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">A</span>
              <input type="range" className="flex-1 accent-gold-400 bg-white/10 rounded-full h-1" />
              <span className="text-xl text-gray-500">A</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // About Sub-page
  if (currentView === 'about') {
    return (
      <div className="px-5 py-6 h-full flex flex-col bg-charcoal-950 animate-in fade-in slide-in-from-right-4 duration-300">
        {renderHeader('关于我们', () => setCurrentView('main'))}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl bg-charcoal-900 border border-gold-400/20 flex items-center justify-center shadow-2xl mb-6 mt-10">
            <span className="material-symbols-outlined text-[56px] text-gold-400 filled">balance</span>
          </div>
          <h2 className="text-white text-xl font-black tracking-widest">运势指南针</h2>
          <p className="text-gray-500 text-xs mt-2">Version 2.4.0 (Build 108)</p>

          <div className="w-full mt-12 space-y-2">
            <AboutLink label="用户协议" />
            <AboutLink label="隐私政策" />
            <AboutLink label="检查更新" badge="新版本" />
            <AboutLink label="官方网站" />
          </div>

          <div className="mt-auto pb-10 text-center">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-4">© 2025 玄术科技 · 版权所有</p>
            <div className="flex justify-center gap-6 text-gray-600">
              <span className="material-symbols-outlined text-[20px]">public</span>
              <span className="material-symbols-outlined text-[20px]">alternate_email</span>
              <span className="material-symbols-outlined text-[20px]">share</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 space-y-7 h-full flex flex-col bg-charcoal-950 animate-in fade-in duration-300">
      <header className="flex items-center justify-center py-2">
        <h1 className="text-white text-md font-bold tracking-widest">设置</h1>
      </header>

      {/* User Header */}
      {isAuthenticated ? (
        <div
          onClick={() => setCurrentView('profile')}
          className="flex items-center gap-4 cursor-pointer active:scale-95 transition-all"
        >
          <div className="relative w-16 h-16 rounded-full bg-charcoal-900 border border-gold-400/40 flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-[40px] text-gold-400 filled">person</span>
          </div>
          <div className="flex-1">
            <h2 className="text-white text-lg font-bold">{profileData.nickname}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-bold text-gold-400 bg-gold-900/20 px-1.5 py-0.5 rounded border border-gold-500/20 uppercase tracking-tighter">已实名</span>
              <span className="material-symbols-outlined text-[12px] text-gray-500 cursor-pointer active:scale-90 transition-transform">content_copy</span>
            </div>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      ) : (
        <div
          onClick={() => onSwitchToAuth('login')}
          className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer active:scale-95 transition-all"
        >
          <div className="w-14 h-14 rounded-full bg-charcoal-900 border border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-gray-600">person_outline</span>
          </div>
          <div className="flex-1">
            <h2 className="text-white text-md font-bold">点击登录/注册</h2>
            <p className="text-gray-500 text-[10px] mt-1 font-medium">登录后同步您的所有运势数据</p>
          </div>
          <span className="material-symbols-outlined text-gray-500">chevron_right</span>
        </div>
      )}

      {/* VIP Status Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-charcoal-800 to-black border border-gold-500/20 p-5 flex items-center justify-between">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-gold-500 filled text-[20px]">diamond</span>
            <h3 className="text-gold-100 font-bold text-md tracking-tight">会员状态</h3>
          </div>
          <p className="text-gold-400/60 text-[10px] font-medium">尊享VIP大师级独家指南</p>
        </div>
        <button
          onClick={() => {
            // 直接开通VIP，然后导航到VIP页面
            const userId = localStorage.getItem('user_id');
            if (userId) {
              localStorage.setItem(`vip-${userId}`, 'true');
              alert('VIP功能已成功开通！');
            }
            navigateTo(Page.VIP);
          }}
          className="bg-gold-gradient text-charcoal-950 font-black text-[10px] px-5 py-2.5 rounded-full shadow-lg active:scale-95 transition-all"
        >
          立即开通
        </button>
      </div>

      {/* Menu List */}
      <div className="bg-charcoal-900/60 rounded-2xl border border-white/5 overflow-hidden">
        <MenuItem icon="account_circle" label="个人资料" iconColor="#3b82f6" onClick={() => isAuthenticated ? setCurrentView('profile') : onSwitchToAuth('login')} />
        <MenuItem icon="notifications" label="推送通知" iconColor="#ef4444" onClick={() => setCurrentView('notifications')} />
        <MenuItem icon="translate" label="语言与字体" iconColor="#a855f7" subLabel="简体中文" onClick={() => setCurrentView('language')} />
        <MenuItem icon="info" label="关于我们" iconColor="#22c55e" noBorder onClick={() => setCurrentView('about')} />
      </div>

      {isAuthenticated && (
        <button
          onClick={onLogout}
          className="w-full py-4 rounded-xl border border-white/5 text-gray-500 text-sm font-bold hover:bg-white/5 active:text-red-400 transition-all mt-auto"
        >
          退出当前登录
        </button>
      )}
    </div>
  );
};

const MenuItem: React.FC<{ icon: string; label: string; iconColor: string; subLabel?: string; noBorder?: boolean; onClick?: () => void }> = ({ icon, label, iconColor, subLabel, noBorder, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center p-4 hover:bg-white/5 active:bg-white/10 transition-colors ${!noBorder ? 'border-b border-white/5' : ''}`}>
    <div className="w-8 h-8 rounded-lg bg-charcoal-800 flex items-center justify-center mr-3">
      <span className="material-symbols-outlined text-[18px]" style={{ color: iconColor }}>{icon}</span>
    </div>
    <span className="text-gray-200 text-sm font-bold flex-1 text-left">{label}</span>
    {subLabel && <span className="text-[10px] text-gray-600 mr-2">{subLabel}</span>}
    <span className="material-symbols-outlined text-gray-600 text-[20px]">chevron_right</span>
  </button>
);

const SocialIcon: React.FC<{ icon: string }> = ({ icon }) => (
  <button className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 border border-white/5 active:border-gold-400/40 active:text-gold-400 transition-all">
    <span className="material-symbols-outlined text-[24px]">{icon}</span>
  </button>
);

const ProfileField: React.FC<{ label: string; value: string; readonly?: boolean; type?: string; onChange?: (val: string) => void }> = ({ label, value, readonly, type = 'text', onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">{label}</label>
    {type === 'textarea' ? (
      <textarea
        className="w-full bg-charcoal-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-400 transition-all outline-none resize-none"
        rows={3}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      ></textarea>
    ) : (
      <input
        readOnly={readonly}
        className={`w-full bg-charcoal-900 border border-white/10 rounded-xl px-4 py-4 text-sm text-white transition-all outline-none ${readonly ? 'opacity-50 grayscale' : 'focus:border-gold-400'}`}
        value={value}
        type={type}
        onChange={(e) => onChange?.(e.target.value)}
      />
    )}
  </div>
);

const ToggleItem: React.FC<{ label: string; desc: string; active: boolean; onToggle: () => void }> = ({ label, desc, active, onToggle }) => (
  <div className="flex items-center p-5 gap-4">
    <div className="flex-1">
      <h3 className="text-gray-100 text-sm font-bold">{label}</h3>
      <p className="text-gray-500 text-[10px] mt-1">{desc}</p>
    </div>
    <button onClick={onToggle} className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${active ? 'bg-gold-400' : 'bg-white/10'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? 'left-7' : 'left-1'}`}></div>
    </button>
  </div>
);

const LangItem: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 active:bg-white/5 transition-colors">
    <span className={`text-sm font-bold ${active ? 'text-gold-400' : 'text-gray-400'}`}>{label}</span>
    {active && <span className="material-symbols-outlined text-gold-400 text-[20px]">check_circle</span>}
  </button>
);

const AboutLink: React.FC<{ label: string; badge?: string }> = ({ label, badge }) => (
  <button className="w-full flex items-center justify-between p-4 bg-charcoal-900/40 rounded-xl border border-white/5 active:bg-white/5 transition-colors">
    <span className="text-gray-300 text-sm font-bold">{label}</span>
    <div className="flex items-center gap-2">
      {badge && <span className="bg-red-500/20 text-red-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">{badge}</span>}
      <span className="material-symbols-outlined text-gray-600 text-[18px]">chevron_right</span>
    </div>
  </button>
);

export default Settings;
