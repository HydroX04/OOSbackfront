import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import homeImage from '../assets/coffee.jpg';
import { Eye, EyeOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './login.css';
import { AuthContext } from './AuthContext'; // ✅ Import AuthContext

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login, isLoggedIn } = useContext(AuthContext); // ✅ Use login and isLoggedIn from context

  // ✅ Redirect to home if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Please fill in all fields', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      const formBody = new URLSearchParams();
      formBody.append('username', username);
      formBody.append('password', password);

      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });

      if (response.ok) {
        const data = await response.json();

        // ✅ Set auth state and replace login page in history
        login(data.access_token);

        toast.success('Login successful!', {
          position: 'top-right',
          autoClose: 1500,
          onClose: () => navigate('/', { replace: true }) // ✅ Replace login in history
        });

        console.log('Token:', data.access_token);
      } else if (response.status === 401) {
        toast.error('Invalid credentials', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error('Login failed', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="login-container">
      <ToastContainer />
      <div className="login-box">
        <div className="login-form">
          <div className="logo-wrapper">
            <img src={logo} alt="Logo" className="circle-logo" />
          </div>
          <h2>Welcome Back</h2>
          <p>Please Enter Your Details To Log In.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>

            <div className="forgot-password">
              <a href="/forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-button">Log In</button>
          </form>

          <div className="signup-link">
            Don’t have an account? <a href="/signup">Sign up</a>
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

export default LoginPage;
