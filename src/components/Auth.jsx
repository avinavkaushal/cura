// src/Auth.jsx
import React, { useState } from 'react';
import './Auth.css';

const Auth = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleView = () => setIsLoginView(!isLoginView);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // You can add actual authentication logic here later
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    // You can add actual signup logic here later
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="header-group">
          <div className="logo-square">C</div>
          <h2 className="auth-title">{isLoginView ? 'Login' : 'Sign Up'}</h2>
        </div>

        {isLoginView ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary">Login</button>
            <button type="button" onClick={toggleView} className="btn btn-secondary">
              New user? Create an account
            </button>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="email@orphanage.com" required />
            </div>
            <div className="form-group">
              <label>Orphanage Name</label>
              <input type="text" placeholder="Enter Orphanage Name" required />
            </div>
            <div className="form-group">
              <label>Create Password</label>
              <input type="password" placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary">Create Account</button>
            <button type="button" onClick={toggleView} className="btn btn-secondary">
              Already have an account? Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;