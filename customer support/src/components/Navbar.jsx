import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import './Navbar.css';
import { assets } from '../assets/assets';
import PropTypes from 'prop-types';

const Navbar = ({ isAuthenticated, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showImage, setShowImage] = useState(true); // State to control the image visibility

  const handleLoginClick = () => {
    navigate('/login');
    setShowImage(false); // Hide the image when the login button is clicked
  };

  const handleProfileClick = () => {
    navigate('/profile'); // Navigate to the Profile page
  };

  return (
    <div className="header">
      <a href="/" className="logo">
        <img src={assets.noveglogo} alt="Logo" className="logo" />
      </a>
      <p className="navbar-title">NoVeg Customer Desk</p>
      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="auth-controls">
            <FaBars className="menu-icon" onClick={toggleSidebar} />
            <div
              className="profile-icon-container"
              onClick={handleProfileClick}
            >
              <img src={assets.icon} alt="Profile" className="profile-icon" />
            </div>
          </div>
        ) : (
          <button className="login-button" onClick={handleLoginClick}>
            Login
          </button>
        )}
      </div>
      {!isAuthenticated && showImage && ( // Show the image only if not authenticated and showImage is true
        <div className="navbar-image-container">
          <img
            src={assets.customerIcon}
            alt="CustomerIcon"
            className="navbar-image"
          />
        </div>
      )}
    </div>
  );
};

Navbar.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
  toggleSidebar: PropTypes.func.isRequired, // Define toggleSidebar as a required function
};

export default Navbar;