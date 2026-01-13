
import React, { useState, useEffect } from 'react';
import { UserConfig, FortuneResult, Gender, GameType } from '../types';
import { generateFortune } from '@/services/gemini';

interface HomeProps {
  config: UserConfig;
  setConfig: React.Dispatch<React.SetStateAction<UserConfig>>;
  onStart: (result: FortuneResult) => void;
  setIsLoading: (val: boolean) => void;
  isLoading: boolean;
  profileData: {
    birthday: string;
    gender: Gender;
  };
}

const slotsData = [
  { id: 'slot_1', label: '子-寅', time: '23:00-03:00', start: 23, end: 3 },
  { id: 'slot_2', label: '寅-辰', time: '03:00-07:00', start: 3, end: 7 },
  { id: 'slot_3', label: '辰-午', time: '07:00-11:00', start: 7, end: 11 },
  { id: 'slot_4', label: '午-申', time: '11:00-15:00', start: 11, end: 15 },
  { id: 'slot_5', label: '申-戌', time: '15:00-19:00', start: 15, end: 19 },
  { id: 'slot_6', label: '戌-子', time: '19:00-23:00', start: 19, end: 23 },
];

const getSlotStatus = (start: number, end: number, isToday: boolean, currentHour: number) => {
  if (!isToday) return 'upcoming';

  // Special case for midnight crossing slot: 子-寅 (23:00 - 03:00)
  if (start === 23 && end === 3) {
    if (currentHour >= 3 && currentHour < 23) return 'past';
    return 'current';
  }

  if (currentHour >= end) return 'past';
  if (currentHour < start) return 'upcoming';
  return 'current';
};

const LoadingOverlay: React.FC = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const phrases = [
    "正在感应星辰方位...",
    "推演五行流转...",
    "开启财帛宫位...",
    "沟通乾坤易理...",
    "凝聚今日鸿运..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-charcoal-950/95 backdrop-blur-xl transition-all duration-700">
      <div className="absolute inset-0 bg-mystic-texture pointer-events-none opacity-40"></div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gold-400/10 rounded-full blur-[60px] animate-pulse"></div>

        {/* Geometric Rings */}
        <div className="absolute inset-0 border border-gold-400/20 rounded-full animate-rotate-slow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-gold-400 rounded-full shadow-[0_0_10px_#D4AF37]"></div>
        </div>
        <div className="absolute inset-6 border border-dashed border-gold-400/10 rounded-full animate-rotate-slow-reverse"></div>
        <div className="absolute inset-12 border border-gold-400/30 rounded-full animate-pulse-gold"></div>

        {/* Center Symbol */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-charcoal-900 border border-gold-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <span className="material-symbols-outlined text-[42px] text-gold-300 filled animate-pulse">balance</span>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center px-10">
        <div className="h-8 flex items-center justify-center">
          <p className="text-gold-100 text-xl font-serif italic tracking-widest transition-opacity duration-500">
            {phrases[phraseIndex]}
          </p>
        </div>
        <div className="mt-6 space-y-2 opacity-50">
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em]">天机运算中 · 请静候佳音</p>
          <div className="flex justify-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-gold-400 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 rounded-full bg-gold-400 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 rounded-full bg-gold-400 animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ config, setConfig, onStart, setIsLoading, isLoading, profileData }) => {
  const today = new Date().toISOString().split('T')[0];
  const isToday = config.predictionDate === today;
  const currentHour = new Date().getHours();

  // Find currently selected slot object
  const selectedSlotObj = slotsData.find(s => s.id === config.timeSlot);
  const isSelectedSlotPast = selectedSlotObj ? getSlotStatus(selectedSlotObj.start, selectedSlotObj.end, isToday, currentHour) === 'past' : false;

  // Handle auto-selecting next available slot if current one is past when changing date
  useEffect(() => {
    const currentSlot = slotsData.find(s => s.id === config.timeSlot);
    if (currentSlot && isToday) {
      const status = getSlotStatus(currentSlot.start, currentSlot.end, isToday, currentHour);
      if (status === 'past') {
        const available = slotsData.find(s => getSlotStatus(s.start, s.end, isToday, currentHour) !== 'past');
        if (available) {
          setConfig(prev => ({ ...prev, timeSlot: available.id }));
        }
      }
    }
  }, [config.predictionDate]);

  const handleStart = async () => {
    if (isSelectedSlotPast) return; // Prevent start if slot is past
    setIsLoading(true);
    const startTime = Date.now();
    const result = await generateFortune(config, 'fengshui');
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (duration < 2500) {
      await new Promise(resolve => setTimeout(resolve, 2500 - duration));
    }

    setIsLoading(false);
    onStart(result);
  };

  const handleAutoFill = () => {
    setConfig(prev => ({
      ...prev,
      birthday: profileData.birthday,
      gender: profileData.gender
    }));
  };

  return (
    <div className="px-5 py-6 space-y-8 pb-10 min-h-full">
      {isLoading && <LoadingOverlay />}

      <header className="flex items-center justify-between mb-2">
        <button className="text-gold-200"><span className="material-symbols-outlined">arrow_back_ios_new</span></button>
        <h1 className="text-gold-100 text-lg font-bold tracking-wide">运势指南针</h1>
        <button className="text-gold-200"><span className="material-symbols-outlined">help</span></button>
      </header>

      <div className="text-center space-y-4 relative">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b from-charcoal-800 to-charcoal-900 border border-gold-400/30 text-gold-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
          <span className="material-symbols-outlined text-[40px] filled">balance</span>
        </div>
        <div>
          <h2 className="text-white text-2xl font-bold tracking-wider">运势设置</h2>
          <p className="text-gold-100/80 text-sm font-serif italic mt-1">
            “ 时来天地皆同力，运去英雄不自由。”
          </p>
        </div>
        <button
          onClick={handleAutoFill}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-gold-gradient text-charcoal-950 text-xs font-bold shadow-lg transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          自动填入我的信息
        </button>
      </div>

      <section className="space-y-6">
        <div className="space-y-2">
          <label className="block text-gold-100 text-xs font-bold pl-1 uppercase tracking-widest">出生年月</label>
          <div className="relative">
            <input
              className="w-full bg-charcoal-800/60 border border-gold-500/30 rounded-xl px-4 py-4 text-gray-100 focus:ring-1 focus:ring-gold-400 appearance-none"
              type="date"
              value={config.birthday}
              onChange={(e) => setConfig({ ...config, birthday: e.target.value })}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-400 pointer-events-none">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-gold-100 text-xs font-bold pl-1 uppercase tracking-widest">性别</label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-charcoal-800/40 rounded-xl border border-gold-500/10">
            {(['male', 'female'] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setConfig({ ...config, gender: g })}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${config.gender === g ? 'bg-charcoal-700 border border-gold-500/30 text-gold-300 shadow-lg' : 'text-gray-400 hover:text-gray-300'}`}
              >
                <span className="material-symbols-outlined text-[20px]">{g === 'male' ? 'man' : 'woman'}</span>
                <span>{g === 'male' ? '男' : '女'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-gold-100 text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
            <span className="w-1 h-4 bg-gold-400 rounded-full"></span> 游戏类目
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <GameCard
              selected={config.gameType === 'mahjong'}
              onClick={() => setConfig({ ...config, gameType: 'mahjong' })}
              icon="發"
              color="green"
              label="麻将"
            />
            <GameCard
              selected={config.gameType === 'poker'}
              onClick={() => setConfig({ ...config, gameType: 'poker' })}
              icon="A"
              color="red"
              label="扑克牌"
            />
            <GameCard
              selected={config.gameType === 'guandan'}
              onClick={() => setConfig({ ...config, gameType: 'guandan' })}
              icon="掼"
              color="blue"
              label="掼蛋"
            />
          </div>
        </div>

        {/* Prediction Date Section */}
        <div className="space-y-2">
          <h3 className="text-gold-100 text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
            <span className="w-1 h-4 bg-gold-400 rounded-full"></span> 预测日期
          </h3>
          <div className="relative">
            <input
              className="w-full bg-charcoal-800/60 border border-gold-500/30 rounded-xl px-4 py-4 text-gray-100 focus:ring-1 focus:ring-gold-400 appearance-none"
              type="date"
              min={today}
              value={config.predictionDate}
              onChange={(e) => setConfig({ ...config, predictionDate: e.target.value })}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-400 pointer-events-none">
              <span className="material-symbols-outlined">event</span>
            </div>
          </div>
          <p className="text-[10px] text-gold-400/60 italic pl-1">只能选择今日或以后的日期进行预测</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-gold-100 text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
            <span className="w-1 h-4 bg-gold-400 rounded-full"></span> 时间段选择
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {slotsData.map((s) => {
              const status = getSlotStatus(s.start, s.end, isToday, currentHour);
              const isPast = status === 'past';
              const isUpcoming = status === 'upcoming';
              const isSelected = config.timeSlot === s.id;

              return (
                <button
                  key={s.id}
                  disabled={isPast}
                  onClick={() => setConfig({ ...config, timeSlot: s.id })}
                  className={`flex flex-col items-center py-3 rounded-xl border transition-all ${isSelected
                    ? 'bg-gold-500/10 border-gold-400 text-gold-300 shadow-[0_0_8px_rgba(212,175,55,0.2)]'
                    : isPast
                      ? 'opacity-30 border-white/5 bg-charcoal-900/50 text-gray-600 grayscale cursor-not-allowed'
                      : isUpcoming
                        ? 'border-green-500/40 bg-green-500/5 text-green-400 shadow-[inset_0_0_10px_rgba(34,197,94,0.05)]'
                        : 'border-white/10 bg-charcoal-800/30 text-gray-400 hover:border-white/20'
                    }`}
                >
                  <span className="text-xs font-bold">{s.label}</span>
                  <span className="text-[9px] mt-0.5">{s.time}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={isLoading || isSelectedSlotPast}
          className={`w-full font-bold text-lg py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group ${isLoading || isSelectedSlotPast
            ? 'bg-charcoal-800 text-gray-600 cursor-not-allowed opacity-60'
            : 'bg-gold-gradient text-charcoal-950 active:scale-[0.98]'
            }`}
        >
          {isLoading ? (
            <span className="animate-spin material-symbols-outlined">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined group-hover:animate-pulse">auto_awesome</span>
              <span>开启运势</span>
            </>
          )}
        </button>
        {isSelectedSlotPast && !isLoading && (
          <p className="text-center text-red-500/80 text-[10px] font-bold animate-pulse">
            所选时辰已过，请选择后续时辰或明天
          </p>
        )}
      </section>
    </div>
  );
};

const GameCard: React.FC<{ selected: boolean; onClick: () => void; icon: string; color: 'green' | 'red' | 'blue'; label: string }> = ({ selected, onClick, icon, color, label }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center p-4 rounded-xl border backdrop-blur-md transition-all ${selected ? 'border-gold-400/60 bg-charcoal-800/80 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/5 bg-charcoal-800/40 hover:bg-charcoal-800/60'}`}
  >
    {selected && (
      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gold-400 flex items-center justify-center z-10">
        <span className="material-symbols-outlined text-charcoal-900 text-[12px] font-bold">check</span>
      </div>
    )}
    <div className={`w-12 h-16 mb-2 rounded bg-gradient-to-b from-gray-100 to-gray-300 flex items-center justify-center border border-gray-400 shadow-md ${selected ? 'ring-2 ring-gold-400/50' : ''}`}>
      <span className={`text-2xl font-bold ${color === 'green' ? 'text-green-700' : color === 'red' ? 'text-red-700' : 'text-blue-700'}`}>{icon}</span>
    </div>
    <span className={`text-xs font-bold transition-colors ${selected ? 'text-gold-300' : 'text-gray-400'}`}>{label}</span>
  </button>
);

export default Home;
