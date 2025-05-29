import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Login from './Pages/Login.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import Profile from './Pages/Profile/Profile.jsx';
import Tickets from './Pages/Tickets/Tickets.jsx'; 
import CustomerTickets from './Pages/CustomerTickets/CustomerTickets.jsx'; 
import Customers from './Pages/Customers/Customers.jsx';
import TotalTickets from './Pages/TotalTickets/TotalTickets.jsx'; // Import TotalTickets
import ClosedTickets from './Pages/ClosedTickets/ClosedTickets.jsx';
import OpenTickets from "./Pages/OpenTickets/OpenTickets.jsx";
import PendingTickets from './Pages/PendingTickets/PendingTickets.jsx'; // Import PendingTickets component
import WaitingOnCustomer from './Pages/WaitingOnCustomer/WaitingOnCustomer.jsx'; // Import WaitingOnCustomer

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return JSON.parse(localStorage.getItem('isAuthenticated')) || false;
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
    }, [isAuthenticated]);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setIsSidebarOpen(false);
        localStorage.removeItem('isAuthenticated');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <Router>
            <div style={{ display: 'flex' }}>
                {isAuthenticated && isSidebarOpen && <Sidebar onLogout={handleLogout} closeSidebar={closeSidebar} />}
                
                <div style={{ flex: 1, marginLeft: isAuthenticated && isSidebarOpen ? '250px' : '0' }}>
                    <Navbar isAuthenticated={isAuthenticated} onLogout={isAuthenticated ? handleLogout : null} toggleSidebar={toggleSidebar} />

                    <Routes>
                        <Route path="/login" element={<Login onLogin={handleLogin} />} />
                        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
                        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
                        <Route path="/tickets" element={isAuthenticated ? <Tickets /> : <Navigate to="/login" />} />
                        <Route path="/customers" element={isAuthenticated ? <Customers /> : <Navigate to="/login" />} />
                        <Route path="/customer-tickets" element={isAuthenticated ? <CustomerTickets /> : <Navigate to="/login" />} />
                        <Route path="/total-tickets" element={isAuthenticated ? <TotalTickets /> : <Navigate to="/login" />} />
                        <Route path="/closed-tickets" element={isAuthenticated ? <ClosedTickets /> : <Navigate to="/login" />} />
                        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
                        <Route path="/open-tickets" element={ isAuthenticated ? <OpenTickets /> : <Navigate to="/login" />} />
                        <Route path="/pending-tickets" element={isAuthenticated ? <PendingTickets /> : <Navigate to="/login" />} />
                        <Route path="/waiting-on-customer" element={isAuthenticated ? <WaitingOnCustomer /> : <Navigate to="/login" />} />
                        
            
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
