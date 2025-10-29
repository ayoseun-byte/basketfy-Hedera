import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShoppingBasket,
    Sparkles,
    BarChart3,
    Users,
    ArrowLeft,
    Home
} from 'lucide-react';
import { GOOGLE_CLIENT_ID } from '../../constants/config';
import { useDispatch } from 'react-redux';
import { setUserData, setWalletAddress } from '../../store/store';

const LoginPage = ({ darkMode }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
    });
    
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const address = "77775444chcjdhjd8748dhjd8748dhjd8748dhjd";
    
    const handleSignIn = (e) => {
        e.preventDefault();
        if (formData.email && formData.password) {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                dispatch(setUserData({
                    id: "xxxxxxxxx",
                    email: formData.email,
                    name: formData.name,
                    avatar: "response.avatar" || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
                    role: 'user'
                }));
                
                if (address) {
                    dispatch(setWalletAddress("77775444chcjdhjd8748dhjd8748dhjd8748dhjd"));
                }
                navigate('/profile');
            }, 1000);
        }
    };

    const handleGoogleSignIn = () => {
        console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
        setIsGoogleLoading(true);

        const clientId = GOOGLE_CLIENT_ID;
        const redirectUri =
            window.location.hostname === 'localhost'
                ? 'http://localhost:5173/profile'
                : 'https://basketfy.netlify.app/profile';

        const scope = 'email profile openid';
        const responseType = 'code';
        const state = Math.random().toString(36).substring(7);

        sessionStorage.setItem('oauth_state', state);

        const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        googleAuthUrl.searchParams.append('client_id', clientId);
        googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
        googleAuthUrl.searchParams.append('response_type', responseType);
        googleAuthUrl.searchParams.append('scope', scope);
        googleAuthUrl.searchParams.append('state', state);
        googleAuthUrl.searchParams.append('access_type', 'offline');
        googleAuthUrl.searchParams.append('prompt', 'consent');

        window.location.href = googleAuthUrl.toString();
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black' : 'bg-gradient-to-br from-white via-purple-50 to-gray-100'} flex items-center justify-center p-6`}>
            {/* Back to Home Button - Only Addition */}
            <button
                onClick={() => navigate('/')}
                className={`fixed top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm  transition-all hover:scale-105 ${
                    darkMode 
                        ? 'bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50' 
                        : 'bg-white/50 border-gray-300 text-gray-700 hover:bg-white/70'
                } shadow-lg`}
            >
                <ArrowLeft className="w-4 h-4" />
                {/* <Home className="w-4 h-4" /> */}
                <span className="text-sm font-medium">Back to Home</span>
            </button>

            {/* Original Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Original Content - No Changes */}
            <div className="max-w-6xl w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="text-center lg:text-left space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/30 backdrop-blur-md">
                            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                            <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-purple-800'}`}>Welcome Back to Basketfy</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black leading-tight">
                            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                                Your Crypto
                            </span>
                            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Journey Continues
                            </span>
                        </h1>

                        <p className={`text-sm sm:text-base lg:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-md mx-auto lg:mx-0 px-4 sm:px-0`}>
    Sign in to manage your diversified crypto baskets, track performance, and grow your wealth with AI-powered rebalancing.
                        </p>

                        <div className="grid grid-cols-3 gap-4 pt-6">
                            <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm p-4 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <ShoppingBasket className="w-6 h-6 text-purple-400 mb-2" />
                                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-grey-600'}`}>150+</div>
                                <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>Active Baskets</div>
                            </div>
                            <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm p-4 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <Users className="w-6 h-6 text-blue-400 mb-2" />
                                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-grey-600'}`}>10K+</div>
                                <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>Investors</div>
                            </div>
                            <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm p-4 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <BarChart3 className="w-6 h-6 text-green-400 mb-2" />
                                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-grey-600'}`}>$5M+</div>
                                <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>TVL</div>
                            </div>
                        </div>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl p-8 shadow-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white/70' : 'text-grey-600'}`}>Sign In</h2>
                        <form onSubmit={handleSignIn}>
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white/70' : 'text-grey-600'}`}>Email Address</label>
                                    <div className="relative">
                                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="ayoseunsolomon@gmail.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full pl-12 pr-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white/70' : 'text-grey-600'}`}>Password</label>
                                    <div className="relative">
                                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`w-full pl-12 pr-12 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        >
                                            {showPassword ?
                                                <EyeOff className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} /> :
                                                <Eye className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                            }
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" className="rounded" />
                                        <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-grey-600'}`}>Remember me</span>
                                    </label>
                                    <button type="button" className="text-sm text-purple-400 hover:text-purple-300">
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                    {!isLoading && <ArrowRight className="w-5 h-5" />}
                                </button>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className={`px-4 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}>
                                            Or continue with
                                        </span>
                                    </div>
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    disabled={isGoogleLoading}
                                    className={`w-full ${darkMode ? 'bg-white hover:bg-gray-100' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-3 font-medium ${darkMode ? 'text-gray-900' : 'text-gray-700'} shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    {isGoogleLoading ? 'Signing In...' : 'Sign in with Google'}
                                </button>
                            </div>
                        </form>
                        
                        <div className="mt-6 text-center">
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/register')}
                                    className="text-purple-400 hover:text-purple-300 font-semibold"
                                >
                                    Sign up
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default LoginPage;