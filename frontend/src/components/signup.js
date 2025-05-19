import React, { useState } from 'react';
import logo from '../assets/logo.jpg';
import homeImage from '../assets/coffee.jpg';
import { Eye, EyeOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './signup.css'

const Signup = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    toast.error('Passwords do not match!');
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password,
        full_name: fullName,
        phone,
        email
      })
    });

    const data = await response.json();

    if (response.ok) {
      toast.success(data.message || "Account created successfully!");
      // Optional: Redirect to login page
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } else {
      toast.error(data.detail || "Signup failed.");
    }
  } catch (error) {
    console.error("Signup error:", error);
    toast.error("Something went wrong.");
  }
};


  // Style object for consistent placeholder styling
  const inputStyles = {
    borderRadius: '12px', 
    padding: '8px 12px', 
    borderColor: '#c0c9c9',
    color: '#495057', // Dark gray for input text
    backgroundColor: '#f8f9fa' // Light gray background
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #EBF5F6, #abdfe7, #65b2c2, #90bfc7)',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} />
      <div style={{
        display: 'flex',
        maxWidth: '850px',
        width: '100%',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: 'white'
      }}>
        {/* Form Column */}
        <div style={{
          flex: 1,
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <img src={logo} alt="Logo" style={{width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto'}} />
          </div>
          <h2 style={{textAlign: 'center', marginBottom: '10px', color: '#5EA5B3', fontWeight: '700'}}>Create Account</h2>
          <p style={{textAlign: 'center', marginBottom: '20px', color: '#5BA7B4', fontWeight: '300'}}>Please fill in your details to sign up.</p>

          <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '15px'}}>
              <label htmlFor="username" style={{color: '#5EA5B3', fontWeight: '500', display: 'block', marginBottom: '5px'}}>Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={inputStyles}
              />
            </div>

            <div style={{marginBottom: '15px'}}>
              <label htmlFor="fullName" style={{color: '#5EA5B3', fontWeight: '500', display: 'block', marginBottom: '5px'}}>Full Name</label>
              <input
                type="text"
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={inputStyles}
              />
            </div>

            <div style={{marginBottom: '15px'}}>
              <label htmlFor="phone" style={{color: '#5EA5B3', fontWeight: '500', display: 'block', marginBottom: '5px'}}>Phone</label>
              <input
                type="text"
                id="phone"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={inputStyles}
              />
            </div>

            <div style={{marginBottom: '15px'}}>
              <label htmlFor="email" style={{color: '#5EA5B3', fontWeight: '500', display: 'block', marginBottom: '5px'}}>Email</label>
              <input
                type="email"
                id="email"
                placeholder="Sample@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyles}
              />
            </div>

            <div style={{marginBottom: '15px', position: 'relative'}}>
              <label htmlFor="password" style={{color: '#5EA5B3', fontWeight: '500', display: 'block', marginBottom: '5px'}}>Password</label>
              <div style={{position: 'relative'}}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{...inputStyles, paddingRight: '40px'}}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#5BA7B4'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{marginBottom: '20px', position: 'relative'}}>
              <label htmlFor="confirmPassword" style={{color: '#5EA5B3', fontWeight: '500', display: 'block', marginBottom: '5px'}}>Confirm Password</label>
              <div style={{position: 'relative'}}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{...inputStyles, paddingRight: '40px'}}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#5BA7B4'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#4B929D',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3d7d87'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4B929D'}
            >
              Sign Up
            </button>
          </form>

          <div style={{textAlign: 'center', marginTop: '15px'}}>
            <small style={{color: '#6c757d'}}>
              Already have an account? <a href="/login" style={{color: '#4B929D', fontWeight: '500', textDecoration: 'none'}}>Log in</a>
            </small>
          </div>
        </div>

        {/* Image Column */}
        <div style={{
          flex: 1,
          display: 'none',
          backgroundImage: `url(${homeImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '500px',
          borderTopRightRadius: '18px',
          borderBottomRightRadius: '18px'
        }} className="d-md-block">
        </div>
      </div>
    </div>
  );
};

export default Signup;