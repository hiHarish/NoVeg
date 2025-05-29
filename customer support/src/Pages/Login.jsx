import './Login.css';
import { GoArrowLeft } from "react-icons/go";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import icon from '../assets/icon.png'; // Correct path to the profile image

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState(''); // Renamed to 'email'
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [showLoginForm, setShowLoginForm] = useState(false); // Track login form visibility
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Debugging: Log credentials (ensure not in production!)
      console.log('Attempting login with:', email, password);

      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Use 'email' here
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log('Login successful:', data);

        onLogin(data); // Notify parent component about the login
        setIsLoggedIn(true); // Update login state
        setShowLoginForm(false); // Hide login form after successful login
        navigate('/dashboard'); // Redirect to the dashboard
      } else {
        // Extract error message from the response
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
        console.error('Login error:', errorData);
      }
    } catch (err) {
      // Log unexpected errors
      setError('An unexpected error occurred. Please try again.');
      console.error('Unexpected error:', err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // Reset login state
    setShowLoginForm(false); // Hide login form on logout
    setEmail(''); // Clear email
    setPassword(''); // Clear password
    setError(''); // Clear error
    navigate('/'); // Redirect to home or customer desk page
  };

  const handleLoginClick = () => {
    setShowLoginForm(true); // Show login form when "Login" is clicked
  };

  return (
    <div className="login-container">
      {!showLoginForm && !isLoggedIn && (
        <div className="customer-desk-banner">
          <h2>NoVeg Customer Desk</h2>
          <img src={icon} alt="NoVeg Logo" className="logo" />
          <button onClick={handleLoginClick} className="login-btn">Login</button>
        </div>
      )}
      {(showLoginForm || isLoggedIn) && (
        <div>
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="login-btn">Login</button>
            <Link to='/home'><GoArrowLeft className='close-btn' /></Link>
          </form>
          {isLoggedIn && (
            <div>
              <div className="profile-icon-container">
                <img src={icon} alt="Profile" className="profile-icon" />
              </div>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;