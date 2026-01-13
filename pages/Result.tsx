
import React, { useState, useEffect } from 'react';
import { FortuneResult, Page, UserConfig, FortuneMode } from '../types';
import { generateFortune } from '@/services/gemini';

interface ResultProps {
  fortune: FortuneResult | null;
  navigateTo: (page: Page) => void;
  userConfig: UserConfig;
  updateFortune: (f: FortuneResult) => void;
}

const Result: React.FC<ResultProps> = ({ fortune: initialFortune, navigateTo, userConfig, updateFortune }) => {
  const [activeModel, setActiveModel] = useState('deepseek-fengshui');
  const [isSwitching, setIsSwitching] = useState(false);
  const [currentFortune, setCurrentFortune] = useState<FortuneResult | null>(initialFortune);
  const [displayRotation, setDisplayRotation] = useState(0);

  const dirMap: Record<string, number> = {
    'N': 0, 'NE': 45, 'E': 90, 'SE': 135, 'S': 180, 'SW': 225, 'W': 270, 'NW': 315
  };

  useEffect(() => {
    if (currentFortune) {
      const baseAngle = dirMap[currentFortune.direction] || 0;
      // Add multiple full spins to the rotation to make it look like the compass is searching
      const extraSpins = 3 * 360;

      setDisplayRotation(prev => {
        // Calculate the next rotation value to always spin forward toward the target
        const currentNormalized = prev % 360;
        let diff = baseAngle - currentNormalized;
        if (diff <= 0) diff += 360; // Ensure it always spins forward at least a bit
        return prev + diff + extraSpins;
      });
    }
  }, [currentFortune?.direction, currentFortune?.mode]);

  const handleModelChange = async (modelId: string, mode: FortuneMode) => {
    if (modelId === activeModel) return;
    setIsSwitching(true);
    setActiveModel(modelId);

    try {
      // 根据modelId选择AI服务类型
      const aiServiceType = modelId.startsWith('doubao') ? 'doubao' : 'deepseek';
      const newFortune = await generateFortune(userConfig, mode, aiServiceType);
      setCurrentFortune(newFortune);
      updateFortune(newFortune);
    } catch (error) {
      console.error("Switch error:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!currentFortune) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-12 h-12 border-4 border-gold-400/20 border-t-gold-400 rounded-full animate-spin"></div>
        <div className="text-gold-400 font-serif animate-pulse">正在窥探天机...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <header className="flex items-center justify-between p-4 z-20">
        <button onClick={() => navigateTo(Page.HOME)} className="text-gray-400 active:text-gold-400 transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-white text-lg font-bold tracking-widest">最佳坐向</h2>
        <div className="w-8"></div>
      </header>

      <div className="relative flex-1 px-4 pb-24 overflow-y-auto no-scrollbar z-10">
        {/* Full Compass Core */}
        <div className="relative w-full aspect-square flex items-center justify-center my-2 scale-90">
          <div className="absolute w-72 h-72 bg-holo-cyan/5 rounded-full blur-[100px] animate-pulse"></div>

          <div className="relative w-80 h-80 bg-charcoal-900/60 backdrop-blur-xl rounded-full border border-holo-cyan/20 flex items-center justify-center overflow-hidden shadow-[inset_0_0_80px_rgba(6,182,212,0.15)]">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Decorative Rings */}
            <div className="absolute inset-2 rounded-full border border-white/5 animate-[spin_180s_linear_infinite]"></div>
            <div className="absolute inset-10 rounded-full border border-dashed border-holo-cyan/5 animate-[spin_100s_linear_infinite_reverse]"></div>

            <div className="w-16 h-16 border border-holo-cyan/30 rounded-full flex items-center justify-center bg-charcoal-900 shadow-[0_0_20px_rgba(6,182,212,0.2)] z-20">
              <span className={`material-symbols-outlined text-holo-cyan transition-all duration-700 ${isSwitching ? 'opacity-20 scale-50' : 'opacity-100 scale-100'}`} style={{ fontSize: '32px' }}>
                {currentFortune.mode === 'fengshui' ? 'balance' : 'stars'}
              </span>
            </div>

            {/* Cardinal Directions */}
            <div className="absolute top-6 text-holo-cyan/80 text-xs font-black tracking-tighter">北 (N)</div>
            <div className="absolute bottom-6 text-holo-cyan/80 text-xs font-black tracking-tighter">南 (S)</div>
            <div className="absolute left-6 text-holo-cyan/80 text-xs font-black tracking-tighter">西 (W)</div>
            <div className="absolute right-6 text-holo-cyan/80 text-xs font-black tracking-tighter">东 (E)</div>

            {/* The Dynamic Pointer */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform"
              style={{
                transform: `rotate(${displayRotation}deg)`,
                transition: 'transform 3.5s cubic-bezier(0.15, 0, 0.15, 1)'
              }}
            >
              <div className="relative h-full w-full">
                <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  {/* Glowing Pointer Head */}
                  <div className="w-12 h-12 rounded-full bg-primary border-4 border-white shadow-[0_0_30px_rgba(16,185,129,0.8)] flex items-center justify-center animate-bounce">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>navigation</span>
                  </div>
                  <div className="mt-3 bg-primary/90 backdrop-blur-md border border-white/20 text-white text-[10px] px-3 py-1 rounded-full font-black shadow-xl">
                    {currentFortune.mode === 'fengshui' ? '吉位' : '旺位'}
                  </div>
                </div>
              </div>
            </div>

            {/* Lucky Badge */}
            <div className="absolute right-10 top-10 transform rotate-12 bg-charcoal-950/90 border-2 border-gold-400 p-2 rounded-full shadow-[0_0_25px_rgba(212,175,55,0.4)] text-center leading-none z-30 animate-pulse transition-opacity duration-300" style={{ opacity: isSwitching ? 0 : 1 }}>
              <div className="text-gold-400 text-[8px] font-black uppercase">{currentFortune.mode === 'fengshui' ? '鸿运' : '星运'}</div>
              <div className="text-gold-100 text-lg font-black my-0.5 font-serif">大吉</div>
            </div>
          </div>
        </div>

        {/* Model/Mode Toggle Group */}
        <div className="flex flex-col gap-2 p-2 bg-charcoal-900/60 rounded-2xl border border-white/5 mb-6">
          <div className="flex gap-2">
            <ToggleBtn active={activeModel === 'deepseek-fengshui'} label="DeepSeek风水" onClick={() => handleModelChange('deepseek-fengshui', 'fengshui')} />
            <ToggleBtn active={activeModel === 'deepseek-constellation'} label="DeepSeek星座" onClick={() => handleModelChange('deepseek-constellation', 'horoscope')} />
          </div>
          <div className="flex gap-2">
            <ToggleBtn active={activeModel === 'doubao-fengshui'} label="豆包风水" onClick={() => handleModelChange('doubao-fengshui', 'fengshui')} />
            <ToggleBtn active={activeModel === 'doubao-constellation'} label="豆包星座" onClick={() => handleModelChange('doubao-constellation', 'horoscope')} />
          </div>
        </div>

        {/* Detailed Fortune Card */}
        <div className={`bg-charcoal-900/80 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-2xl transition-all duration-500 ${isSwitching ? 'opacity-30 blur-md scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-gold-400 filled">
              {currentFortune.mode === 'fengshui' ? 'auto_awesome' : 'stars'}
            </span>
            <h3 className="text-gold-400 text-xs font-black uppercase tracking-[0.2em]">
              今日{currentFortune.mode === 'fengshui' ? '风水' : '星座'}分析
            </h3>
          </div>

          <div className="relative min-h-[80px] flex items-center">
            {isSwitching ? (
              <div className="w-full flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin"></div>
                <span className="text-[10px] text-gold-400/60 font-bold">天机变幻中...</span>
              </div>
            ) : (
              <p className="text-gray-200 text-sm leading-relaxed border-b border-white/5 pb-6 font-medium">
                {currentFortune.summary}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-6 pt-6">
            <InfoItem label="幸运色彩" value={currentFortune.luckyColor} dotColor="#ef4444" />
            <InfoItem label="最佳时间" value={currentFortune.bestTime} icon="schedule" />
            <InfoItem label={currentFortune.energyLabel} value={currentFortune.energyValue} icon={currentFortune.mode === 'fengshui' ? 'local_fire_department' : 'explore'} />
            <InfoItem label="运势数字" value={currentFortune.luckyNumbers.join('、')} icon="casino" />
          </div>
        </div>

        {/* VIP Entry */}
        <div
          onClick={() => navigateTo(Page.VIP)}
          className="mt-6 bg-gradient-to-r from-gold-900/40 via-charcoal-900 to-charcoal-950 p-5 rounded-2xl border border-gold-500/20 flex items-center justify-between group cursor-pointer active:scale-95 transition-all shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-400 group-hover:text-charcoal-950 transition-all duration-300 shadow-inner">
              <span className="material-symbols-outlined filled text-[28px]">workspace_premium</span>
            </div>
            <div>
              <div className="text-gold-400 text-[10px] font-black tracking-widest uppercase">VIP 会员功能</div>
              <div className="text-white font-black text-sm">解锁大师级独家指南</div>
            </div>
          </div>
          <span className="material-symbols-outlined text-gold-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
        </div>
      </div>
    </div>
  );
};

const ToggleBtn: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 text-[11px] font-black rounded-xl transition-all duration-500 transform active:scale-95 ${active ? 'bg-white/10 text-white border border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.3)]' : 'text-gray-500 hover:text-gray-400'}`}
  >
    {label}
  </button>
);

const InfoItem: React.FC<{ label: string; value: string; icon?: string; dotColor?: string }> = ({ label, value, icon, dotColor }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-2">
      {dotColor && <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.6)]" style={{ backgroundColor: dotColor }}></div>}
      {icon && <span className="material-symbols-outlined text-[18px] text-holo-cyan/80">{icon}</span>}
      <span className="text-white text-[13px] font-black tracking-tight">{value}</span>
    </div>
  </div>
);

export default Result;
