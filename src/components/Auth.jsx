import React, { useState } from 'react';

const Auth = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleView = () => setIsLoginView(!isLoginView);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4 font-jost overflow-hidden">
      
      {/* Animated Fintech Background Elements */}
      <div className="absolute inset-0 z-0 flex justify-center items-center overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-cura-blue/20 dark:bg-cura-blue/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-40 dark:opacity-20 animate-blob top-0 -left-20"></div>
        <div className="absolute w-[500px] h-[500px] bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-30 dark:opacity-10 animate-blob animation-delay-2000 top-20 -right-20"></div>
        <div className="absolute w-[550px] h-[550px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-40 dark:opacity-20 animate-blob animation-delay-4000 -bottom-32 left-1/4"></div>
        
        {/* Extremely Subtle Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[400px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-800/50 p-8 md:p-10 transition-all">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-cura-blue/20 text-cura-blue dark:text-blue-400 font-bold rounded-xl text-xl shadow-sm">
            C
          </div>
          <h2 className="text-2xl font-bold text-cura-dark dark:text-gray-100 m-0">
            {isLoginView ? 'Login' : 'Sign Up'}
          </h2>
        </div>

        {isLoginView ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-cura-dark dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                required 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cura-blue/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-cura-dark dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input 
                type="password" 
                placeholder="Enter password" 
                required 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cura-blue/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <button type="submit" className="w-full mt-6 py-3.5 bg-cura-dark dark:bg-cura-blue text-white font-bold rounded-xl hover:bg-black dark:hover:bg-blue-600 transition-colors shadow-lg">
              Login
            </button>
            <button type="button" onClick={toggleView} className="w-full mt-2 py-3 bg-transparent text-cura-blue dark:text-blue-400 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm">
              New user? Create an account
            </button>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-cura-dark dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <input 
                type="text" 
                placeholder="John Doe" 
                required 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cura-blue/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-cura-dark dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                required 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cura-blue/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-cura-dark dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                Orphanage Name
              </label>
              <input 
                type="text" 
                placeholder="Enter Orphanage Name" 
                required 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cura-blue/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-cura-dark dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                Create Password
              </label>
              <input 
                type="password" 
                placeholder="Create a password" 
                required 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cura-blue/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <button type="submit" className="w-full mt-6 py-3.5 bg-cura-dark dark:bg-cura-blue text-white font-bold rounded-xl hover:bg-black dark:hover:bg-blue-600 transition-colors shadow-lg">
              Create Account
            </button>
            <button type="button" onClick={toggleView} className="w-full mt-2 py-3 bg-transparent text-cura-blue dark:text-blue-400 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm">
              Already have an account? Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;