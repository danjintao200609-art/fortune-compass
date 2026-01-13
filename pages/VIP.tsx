
import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { interpretDream, getOutfitSuggestion } from '@/services/gemini';

// Fix: Destructure navigateTo from props to ensure consistent component interface.
const VIP: React.FC<{ navigateTo: (page: Page) => void; isAuthenticated?: boolean; onLoginPrompt?: () => void }> = ({ navigateTo, isAuthenticated, onLoginPrompt }) => {
  const [dreamInput, setDreamInput] = useState('');
  const [dreamResult, setDreamResult] = useState<string | null>(null);
  const [isDreamLoading, setIsDreamLoading] = useState(false);
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);
  const [outfitData, setOutfitData] = useState<{ colors: string[], accessory: string, quote: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      handleGenerateOutfit();
    }
  }, [isAuthenticated]);

  const handleDreamSearch = async (category?: string) => {
    if (!isAuthenticated) {
      onLoginPrompt?.();
      return;
    }
    const term = category || dreamInput;
    if (!term) return;
    setIsDreamLoading(true);
    setDreamResult(null);
    
    console.log('[handleDreamSearch] 开始解析梦境，term:', term);
    
    try {
      const result = await interpretDream(term);
      console.log('[handleDreamSearch] 梦境解析结果:', result);
      setDreamResult(result || "天机难测，请换个描述再试。");
    } catch (error) {
      console.error('[handleDreamSearch] 解析梦境失败:', error);
      setDreamResult("服务暂时不可用，请稍后再试。");
    } finally {
      setIsDreamLoading(false);
    }
  };

  const handleGenerateOutfit = async () => {
    if (!isAuthenticated) return;
    setIsGeneratingOutfit(true);
    
    console.log('[handleGenerateOutfit] 开始生成穿搭建议');
    
    try {
      const data = await getOutfitSuggestion();
      console.log('[handleGenerateOutfit] 穿搭建议结果:', data);
      setOutfitData(data);
    } catch (error) {
      console.error('[handleGenerateOutfit] 生成穿搭建议失败:', error);
      // 使用默认值，避免UI崩溃
      setOutfitData({
        colors: ["正红色", "亮金色"],
        accessory: "玉石挂件",
        quote: "鸿运当头，顺风顺水。"
      });
    } finally {
      setIsGeneratingOutfit(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-charcoal-950 px-8 text-center space-y-6 pb-24">
        <div className="w-24 h-24 rounded-full bg-gold-400/10 flex items-center justify-center border border-gold-400/20 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
          <span className="material-symbols-outlined text-5xl text-gold-400">lock</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-white text-2xl font-black tracking-widest">VIP 专享服务</h1>
          <p className="text-gray-400 text-sm leading-relaxed">该页面包含大师级深度解读与 AI 智慧穿搭，仅对登录用户开放。</p>
        </div>
        <button
          onClick={onLoginPrompt}
          className="w-full bg-gold-gradient py-4 rounded-xl text-charcoal-950 font-black text-sm shadow-xl active:scale-95 transition-all"
        >
          立即登录/注册
        </button>
        <button
          onClick={() => navigateTo(Page.HOME)}
          className="text-gray-500 text-xs font-bold uppercase tracking-widest"
        >
          先去随便看看
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-charcoal-950 px-4 py-6 space-y-6 pb-24 overflow-y-auto no-scrollbar relative">
      <header className="flex items-center justify-between mb-2">
        <div className="w-8"></div>
        <h1 className="text-white text-lg font-bold tracking-widest">VIP 特权服务</h1>
        <span className="material-symbols-outlined text-gold-400 filled">workspace_premium</span>
      </header>

      {/* 周公解梦 */}
      <section className="bg-charcoal-900/60 border border-white/5 p-5 rounded-2xl relative shadow-lg">
        <div className="absolute top-0 right-0 bg-gold-400/10 text-gold-400 text-[8px] font-bold px-3 py-1.5 rounded-bl-xl border-l border-b border-gold-400/10 uppercase tracking-tighter">VIP 专享</div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-gold-400 filled">bedtime</span>
          <h2 className="text-white font-bold text-sm tracking-wide">周公解梦大师版</h2>
        </div>
        <div className="relative mb-5 flex gap-2">
          <input
            className="flex-1 bg-charcoal-800/60 border border-gold-500/20 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:ring-1 focus:ring-gold-400 outline-none transition-all"
            placeholder="描述您的梦境..."
            value={dreamInput}
            onChange={(e) => setDreamInput(e.target.value)}
          />
          <button
            onClick={() => handleDreamSearch()}
            disabled={isDreamLoading}
            className="w-12 h-12 rounded-xl bg-gold-gradient text-charcoal-950 flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            {isDreamLoading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">search</span>}
          </button>
        </div>

        {dreamResult && (
          <div className="p-4 rounded-xl bg-gold-400/5 border border-gold-400/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-gold-100 text-sm italic leading-relaxed">“ {dreamResult} ”</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {['财运', '情感', '事业'].map(cat => (
            <button
              key={cat}
              onClick={() => handleDreamSearch(cat)}
              className="px-3 py-1.5 rounded-full bg-charcoal-800 text-gray-400 text-[10px] font-bold border border-white/5 hover:border-gold-400/30 transition-colors"
            >
              #{cat}
            </button>
          ))}
        </div>
      </section>

      {/* 每日开运穿搭 */}
      <section className="bg-charcoal-900/60 border border-white/5 p-5 rounded-2xl relative shadow-lg">
        <div className="absolute top-0 right-0 bg-gold-400/10 text-gold-400 text-[8px] font-bold px-3 py-1.5 rounded-bl-xl border-l border-b border-gold-400/10 uppercase tracking-tighter">AI 智慧</div>
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-gold-400 filled">checkroom</span>
          <h2 className="text-white font-bold text-sm tracking-wide">每日开运穿搭</h2>
        </div>

        <div className="space-y-6">
          {isGeneratingOutfit ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-10 h-10 border-4 border-gold-400/20 border-t-gold-400 rounded-full animate-spin"></div>
              <p className="text-gold-400/60 text-[11px] font-bold tracking-widest animate-pulse">正在为您推演开运装扮...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  {outfitData?.colors.map((color, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]" style={{ backgroundColor: color === '正红色' ? '#dc2626' : color === '亮金色' ? '#fbbf24' : color === '朱砂红' ? '#b91c1c' : color === '黛青色' ? '#1e293b' : color === '琥珀色' ? '#d97706' : '#444' }}></div>
                      <span className="text-[10px] text-gray-400 font-bold">{color}</span>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-[10px] block uppercase font-bold tracking-widest mb-1">建议配饰</span>
                  <span className="text-gold-300 text-sm font-bold tracking-tight">{outfitData?.accessory || '玉石挂件'}</span>
                </div>
              </div>

              <div className="relative p-5 rounded-2xl bg-charcoal-800/80 border border-gold-400/20 text-center shadow-inner">
                <p className="text-gold-100 text-sm italic font-serif leading-relaxed">
                  “ {outfitData?.quote || "今日着装得体，诸事皆宜。"} ”
                </p>
              </div>
            </>
          )}

          <button
            onClick={handleGenerateOutfit}
            disabled={isGeneratingOutfit}
            className="w-full py-4 rounded-xl border border-gold-400/40 bg-gold-400/5 text-gold-400 text-xs font-black uppercase tracking-widest hover:bg-gold-400/10 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isGeneratingOutfit ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">refresh</span>}
            重新演练今日穿搭
          </button>
        </div>
      </section>
    </div>
  );
};

export default VIP;
