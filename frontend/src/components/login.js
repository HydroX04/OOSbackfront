import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import homeImage from '../assets/coffee.jpg';
import { Eye, EyeOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './login.css';
import { AuthContext } from './AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMsg, setUsernameErrorMsg] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const navigate = useNavigate();

  // Define max attempts and lockout duration (in seconds)
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60; // 15 minutes

  const { login } = useContext(AuthContext);

  React.useEffect(() => {
    let timer;
    if (isLockedOut && lockoutTimer > 0) {
      console.log('Lockout timer running, current:', lockoutTimer);
      timer = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setFailedAttempts(0);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLockedOut, lockoutTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim inputs to remove extra spaces
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // Reset errors
    setUsernameError(false);
    setUsernameErrorMsg('');
    setPasswordError(false);
    setPasswordErrorMsg('');

    let hasError = false;

    // Validation checks
    if (!trimmedUsername) {
      setUsernameError(true);
      setUsernameErrorMsg('Username is required');
      hasError = true;
    } else if (trimmedUsername.length < 3) {
      setUsernameError(true);
      setUsernameErrorMsg('Username must be at least 3 characters');
      hasError = true;
    } else if (trimmedUsername.length > 20) {
      setUsernameError(true);
      setUsernameErrorMsg('Username cannot exceed 20 characters');
      hasError = true;
    } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setUsernameError(true);
      setUsernameErrorMsg('Invalid Input');
      hasError = true;
    }

    if (!trimmedPassword) {
      setPasswordError(true);
      setPasswordErrorMsg('Password cannot be empty');
      hasError = true;
    } else if (trimmedPassword.length < 6) {
      setPasswordError(true);
      setPasswordErrorMsg('Password must be at least 6 characters');
      hasError = true;
    } else if (trimmedPassword.length > 20) {
      setPasswordError(true);
      setPasswordErrorMsg('Password cannot exceed 20 characters');
      hasError = true;
    } else if (/['";\-]/.test(trimmedPassword)) {
      setPasswordError(true);
      setPasswordErrorMsg('Invalid characters in password');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      const formBody = new URLSearchParams();
      formBody.append('username', trimmedUsername);
      formBody.append('password', trimmedPassword);

      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });

      if (response.ok) {
        const data = await response.json();

        login(data.access_token);

        toast.success('Login successful!', {
          position: 'top-right',
          autoClose: 1000,
        });
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);

        console.log('Token:', data.access_token);
      } else if (response.status === 401) {
        // Increment failed attempts on invalid login
        setFailedAttempts((prev) => {
          const newAttempts = prev + 1;
          console.log('Failed attempts updated:', newAttempts);
          if (newAttempts >= MAX_ATTEMPTS) {
            setIsLockedOut(true);
            setLockoutTimer(LOCKOUT_DURATION);
          }
          return newAttempts;
        });
        // Show attempts left in toast notification outside state update
        toast.error(`Invalid username or password. You have ${MAX_ATTEMPTS - (failedAttempts + 1)} login ${MAX_ATTEMPTS - (failedAttempts + 1) === 1 ? 'attempt' : 'attempts'} left.`, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else if (response.status === 403) {
        // On lockout, fetch remaining lockout time from backend
        try {
          const lockoutResponse = await fetch(`http://127.0.0.1:8000/lockout-status?username=${encodeURIComponent(trimmedUsername)}`);
          if (lockoutResponse.ok) {
            const lockoutData = await lockoutResponse.json();
            setIsLockedOut(true);
            setLockoutTimer(lockoutData.remaining_seconds);
          } else {
            setIsLockedOut(true);
            setLockoutTimer(LOCKOUT_DURATION);
          }
        } catch (error) {
          console.error('Error fetching lockout status:', error);
          setIsLockedOut(true);
          setLockoutTimer(LOCKOUT_DURATION);
        }

        toast.error('Account locked due to too many failed login attempts. Please try again later.', {
          position: 'top-right',
          autoClose: 5000,
        });
      } else {
        // Removed toast error for login failed
      }
    } catch (error) {
      console.error('Login error:', error);
      // Removed toast error for login error
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
            <div className={`form-group ${usernameError ? 'input-error' : ''}`}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              {usernameError && <div className="error-message">{usernameErrorMsg}</div>}
            </div>

            <div className={`form-group password-group ${passwordError ? 'input-error' : ''}`}>
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {passwordError && <div className="error-message">{passwordErrorMsg}</div>}
            </div>

            <div className="forgot-password">
              <a href="/forgot-password"></a>
            </div>

            <button type="submit" className="login-button">Log In</button>
          </form>

          {/* Show attempts left message */}
          {/* Removed UI message for attempts left as per user request */}
          {/* {!isLockedOut && failedAttempts > 0 && (
            <div className="lockout-message" style={{ color: 'red', marginTop: '10px' }}>
              You have {MAX_ATTEMPTS - failedAttempts} login {MAX_ATTEMPTS - failedAttempts === 1 ? 'attempt' : 'attempts'} left.
              {console.log('Rendering attempts left:', MAX_ATTEMPTS - failedAttempts)}
            </div>
          )} */}

          {/* Show lockout time message */}
          {isLockedOut && (
            <div className="lockout-message" style={{ color: 'red', marginTop: '10px' }}>
              {console.log('Rendering lockout message, lockoutTimer:', lockoutTimer, 'isLockedOut:', isLockedOut)}
              {/* Show lockout timer */}
              <p>Your account is locked. Please try again in {Math.floor(lockoutTimer / 60).toString().padStart(2, '0')}:{(lockoutTimer % 60).toString().padStart(2, '0')} minutes.</p>
            </div>
          )}

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
