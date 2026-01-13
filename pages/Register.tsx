import React, { useState } from 'react';
import { register } from '@/services/auth';

interface RegisterProps {
    onRegisterSuccess: () => void;
    onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [identificationType, setIdentificationType] = useState<'email' | 'phone'>('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 验证必填字段
        if (!username || !password || !confirmPassword) {
            setError('请填写所有必填字段');
            return;
        }

        if (identificationType === 'email' && !email) {
            setError('请输入邮箱');
            return;
        }

        if (identificationType === 'phone' && !phone) {
            setError('请输入手机号');
            return;
        }

        // 验证用户名长度
        if (username.length < 3 || username.length > 20) {
            setError('用户名长度应在3-20个字符之间');
            return;
        }

        // 验证密码长度
        if (password.length < 6) {
            setError('密码至少需要6位字符');
            return;
        }

        // 验证密码确认
        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        // 验证邮箱格式
        if (identificationType === 'email' && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('请输入有效的邮箱地址');
            return;
        }

        // 验证手机号格式
        if (identificationType === 'phone' && phone && !/^1[3-9]\d{9}$/.test(phone)) {
            setError('请输入有效的手机号');
            return;
        }

        setIsLoading(true);

        const result = await register({
            username,
            email: identificationType === 'email' ? email : undefined,
            phone: identificationType === 'phone' ? phone : undefined,
            password,
        });

        setIsLoading(false);

        if ('error' in result) {
            setError(result.error);
        } else {
            onRegisterSuccess();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-charcoal-950 px-4 py-8">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-mystic-texture pointer-events-none"></div>
            <div className="absolute inset-0 stars pointer-events-none"></div>

            {/* 注册卡片 */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-charcoal-900/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
                    {/* Logo 和标题 */}
                    <div className="text-center mb-6">
                        <div className="inline-block mb-3">
                            <img src="/logo.jpg" alt="Logo" className="w-20 h-20 rounded-full object-cover border-4 border-gold-400 shadow-lg" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-1">
                            注册新账号
                        </h1>
                        <p className="text-gray-400 text-sm">加入我们，探索您的运势奥秘</p>
                    </div>

                    {/* 注册表单 */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 错误提示 */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        {/* 用户名输入 */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                用户名 *
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="3-20个字符"
                                className="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                                disabled={isLoading}
                            />
                        </div>

                        {/* 选择邮箱或手机号 */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                注册方式 *
                            </label>
                            <div className="flex gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setIdentificationType('email')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${identificationType === 'email'
                                        ? 'bg-gold-400 text-charcoal-950'
                                        : 'bg-charcoal-800 text-gray-400 hover:bg-charcoal-700'
                                        }`}
                                    disabled={isLoading}
                                >
                                    邮箱
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIdentificationType('phone')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${identificationType === 'phone'
                                        ? 'bg-gold-400 text-charcoal-950'
                                        : 'bg-charcoal-800 text-gray-400 hover:bg-charcoal-700'
                                        }`}
                                    disabled={isLoading}
                                >
                                    手机号
                                </button>
                            </div>

                            {identificationType === 'email' ? (
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="请输入邮箱"
                                    className="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                                    disabled={isLoading}
                                />
                            ) : (
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="请输入手机号"
                                    className="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                                    disabled={isLoading}
                                />
                            )}
                        </div>

                        {/* 密码输入 */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                密码 *
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="至少6位字符"
                                className="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                                disabled={isLoading}
                            />
                        </div>

                        {/* 确认密码 */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                确认密码 *
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="再次输入密码"
                                className="w-full bg-charcoal-800 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                                disabled={isLoading}
                            />
                        </div>

                        {/* 注册按钮 */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gold-gradient text-charcoal-950 rounded-xl py-3 font-bold text-lg shadow-lg hover:shadow-gold-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    注册中...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">person_add</span>
                                    立即注册
                                </>
                            )}
                        </button>
                    </form>

                    {/* 切换到登录 */}
                    <div className="mt-5 text-center">
                        <button
                            onClick={onSwitchToLogin}
                            className="text-gold-400 hover:text-gold-300 text-sm transition-colors"
                        >
                            已有账号？<span className="font-bold">立即登录</span>
                        </button>
                    </div>
                </div>

                {/* 底部提示 */}
                <p className="text-center text-gray-500 text-xs mt-4">
                    注册即表示您同意我们的服务条款和隐私政策
                </p>
            </div>
        </div>
    );
};

export default Register;
