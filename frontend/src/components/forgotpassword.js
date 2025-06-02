import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/logo.jpg';
import homeImage from '../assets/coffee.jpg';
import './forgotpassword.css';

const Forgotpassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reset_link: 'http://localhost:3000/Reset-password',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to reset password');
      }

      toast.success('Password reset request sent!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="login-box">
        <div className="login-form">
          <div className="logo-wrapper">
            <img src={logo} alt="Logo" className="circle-logo" />
          </div>
          <h2>Reset Password</h2>
          <p>Enter your email to receive password reset instructions.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Sample@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button">Send Reset Link</button>
          </form>

          <div className="signup-link">
            Access your account? Go back to <a href="/login">Log in</a>
          </div>
        </div>

        <div
          className="login-image"
          style={{ backgroundImage: `url(${homeImage})` }}
        >
          <div className="brand-logo"></div>
        </div>
      </div>
    </div>
  );
};

export default Forgotpassword;
