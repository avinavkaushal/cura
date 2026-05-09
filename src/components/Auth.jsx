import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Ensure these are exported from your firebase.js
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { AlertCircle, Loader2, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
const Auth = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme, toggleTheme } = useTheme();

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [orphanageName, setOrphanageName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Save additional details to Firestore 'users' collection
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: fullName,
        orphanage_name: orphanageName,
        role: 'manager',
        created_at: new Date()
      });

      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-jost bg-white dark:bg-gray-950">
      
      {/* LEFT PANEL: Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10">
        
        {/* Logo Area */}
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-cura-blue/20 text-cura-blue dark:text-blue-400 font-bold rounded-xl text-xl shadow-sm">
            C
          </div>
          <span className="font-bold text-xl tracking-wide text-cura-dark dark:text-white">CURA.ai</span>
        </div>

        {/* Theme Toggle */}
        <div className="absolute top-8 right-8 sm:top-12 sm:right-12 z-50">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-cura-grey dark:text-gray-400 hover:text-cura-dark dark:hover:text-gray-100 transition-colors shadow-sm focus:outline-none"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        <div className="w-full max-w-md mx-auto mt-16 lg:mt-0">
          <h1 className="text-4xl font-bold text-cura-dark dark:text-gray-100 mb-2">
            {isLoginView ? 'Welcome Back!' : 'Sign Up'}
          </h1>
          <p className="text-cura-grey dark:text-gray-400 mb-8">
            {isLoginView 
              ? 'Enter your details to access your dashboard.' 
              : 'Let\'s get your orphanage set up on the platform.'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {isLoginView ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-cura-dark dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="@cura.com" 
                  required 
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-cura-dark dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cura-blue/40 transition-all placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-cura-dark dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password" 
                    required 
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-cura-dark dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cura-blue/40 transition-all placeholder:text-gray-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cura-dark dark:hover:text-gray-200 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-4 py-4 bg-cura-blue text-white font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-cura-blue/30 flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
              </button>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-cura-dark dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                    Manager Name
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter Name" 
                    required 
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-cura-dark dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cura-blue/40 transition-all placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-cura-dark dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                    Orphanage Name
                  </label>
                  <input 
                    type="text" 
                    value={orphanageName}
                    onChange={(e) => setOrphanageName(e.target.value)}
                    placeholder="Hope Center" 
                    required 
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-cura-dark dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cura-blue/40 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-cura-dark dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="@cura.com" 
                  required 
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-cura-dark dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cura-blue/40 transition-all placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-cura-dark dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Create Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password" 
                    required 
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-cura-dark dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cura-blue/40 transition-all placeholder:text-gray-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cura-dark dark:hover:text-gray-200 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-4 py-4 bg-cura-blue text-white font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-cura-blue/30 flex justify-center items-center gap-2 disabled:opacity-70"
              >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Started'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <button 
              type="button" 
              onClick={toggleView} 
              className="text-sm font-bold text-cura-grey hover:text-cura-blue transition-colors"
            >
              {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Showcase Section (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-cura-blue relative items-center justify-center overflow-hidden p-12">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
        
        {/* Large Decorative Circles */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-black/10 blur-3xl"></div>

        {/* Dashboard Mockup Presentation */}
        <div className="relative z-10 w-full max-w-2xl transform hover:scale-[1.02] transition-transform duration-500">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl">
             {/* Replace the src below with your actual uploaded image path in your public folder */}
             <img 
               src="/dashboard-mockup.png" 
               alt="CURA Dashboard Interface" 
               className="w-full h-auto rounded-xl shadow-lg border border-gray-200/20"
             />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Auth;