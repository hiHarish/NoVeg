// src/Pages/Profile.jsx

import React from 'react';
import './Profile.css';

const Profile = () => {
    return (
        <div className="profile-container">
            <h1>Settings</h1>
            <div className="section">
                <h2>Profile Settings</h2>
                <p><strong>Name:</strong> Admin User</p>
                <p><strong>Email:</strong> admin@noveg.com</p>
            </div>
            <div className="section">
                <h2>Notification Settings</h2>
                <div className="toggle">
                    <p><strong>Email Notifications</strong></p>
                    <input type="checkbox" />
                </div>
                <p>Receive notifications about new tickets</p>
            </div>
            <div className="section">
                <h2>Security Settings</h2>
                <div className="toggle">
                    <p><strong>Two-Factor Authentication</strong></p>
                    <input type="checkbox" />
                </div>
                <p>Enable additional security for your account</p>
            </div>
        </div>
    );
};

export default Profile;
