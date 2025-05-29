import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import PropTypes from 'prop-types';
import { CiLogout } from "react-icons/ci";
import { LuLayoutDashboard } from "react-icons/lu";
import { LuTicketCheck } from "react-icons/lu";
import { LuUsersRound } from "react-icons/lu";
import { TbSettings } from "react-icons/tb";

const Sidebar = ({ onLogout, closeSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <h2>NoVeg</h2>
            <NavLink to="/dashboard" activeClassName="active" onClick={closeSidebar}>
                <LuLayoutDashboard className="icon" />Dashboard
            </NavLink>
            <NavLink to="/tickets" activeClassName="active" onClick={closeSidebar}>
                <LuTicketCheck className="icon" />Tickets
            </NavLink>
            <NavLink to="/customers" activeClassName="active" onClick={closeSidebar}>
                <LuUsersRound className="icon" />Customers
            </NavLink>
            <NavLink to="/settings" activeClassName="active" onClick={closeSidebar}>
                <TbSettings className="icon" />Settings
            </NavLink>
            <button className="logout" onClick={handleLogout}>
                <CiLogout className="logout-icon" />Logout
            </button>
        </div>
    );
};

Sidebar.propTypes = {
    onLogout: PropTypes.func.isRequired, // Define onLogout as a required function
    closeSidebar: PropTypes.func.isRequired, // Define closeSidebar as a required function
};

export default Sidebar;
