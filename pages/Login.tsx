import React, { useState } from 'react';
import { login } from '@/services/auth';

interface LoginProps {
    onLoginSuccess: () => void;
    onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!identifier || !password) {
            setError('请填写所有字段');
            return;
        }

        setIsLoading(true);

        const result = await login({ identifier, password });

        setIsLoading(false);

        if ('error' in result) {
            setError(result.error);
        } else {
            onLoginSuccess();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-charcoal-950 px-4">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-mystic-texture pointer-events-none"></div>
            <div className="absolute inset-0 stars pointer-events-none"></div>

            {/* 登录卡片 */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-charcoal-900/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
                    {/* Logo 和标题 */}
                    <div className="text-center mb-8">
                        <div className="inline-block mb-4">
                            <img src="/logo.jpg" alt="Logo" className="w-24 h-24 rounded-full object-cover border-4 border-gold-400 shadow-lg" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-2">
                            兄弟运势测评
                        </h1>
                        <p className="text-gray-400 text-sm">登录账号，开启您的运势之旅</p>
                    </div>

                    {/* 登录表单 */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* 错误提示 */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        {/* 邮箱/手机号输入 */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                邮箱或手机号
                            </label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="请输入邮箱或手机号"
                                className="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                                disabled={isLoading}
                            />
                        </div>

                        {/* 密码输入 */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                密码
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="请输入密码"
                                className="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                                disabled={isLoading}
                            />
                        </div>

                        {/* 登录按钮 */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gold-gradient text-charcoal-950 rounded-xl py-3 font-bold text-lg shadow-lg hover:shadow-gold-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    登录中...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">login</span>
                                    登录
                                </>
                            )}
                        </button>
                    </form>

                    {/* 切换到注册 */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={onSwitchToRegister}
                            className="text-gold-400 hover:text-gold-300 text-sm transition-colors"
                        >
                            还没有账号？<span className="font-bold">立即注册</span>
                        </button>
                    </div>
                </div>

                {/* 底部提示 */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    登录即表示您同意我们的服务条款和隐私政策
                </p>
            </div>
        </div>
    );
};

export default Login;
