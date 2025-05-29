// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './Dashboard.css';

const Dashboard = () => {
    const [tickets, setTickets] = useState({
        totalTickets: 0,
        openTickets: 0,
        closedTickets: 0,
        pendingTickets: 0,
        driverTickets: 0,
        waitingOnCustomerTickets: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTickets, setFilteredTickets] = useState({
        totalTickets: 0,
        openTickets: 0,
        closedTickets: 0,
        pendingTickets: 0,
        driverTickets: 0,
        waitingOnCustomerTickets: 0
    });

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/tickets");
                const data = await response.json();
                if (data.success) {
                    const totalTickets = data.tickets.length;
                    const openTickets = data.tickets.filter(ticket => ticket.status === "open").length;
                    const closedTickets = data.tickets.filter(ticket => ticket.status === "closed").length;
                    const pendingTickets = data.tickets.filter(ticket => ticket.status === "pending").length;
                    const waitingOnCustomerTickets = data.tickets.filter(ticket => ticket.status === "waiting for response").length;
                    const driverTickets = data.tickets.filter(ticket => ticket.type === "driver").length;
                    
                    const ticketStats = { 
                        totalTickets, 
                        openTickets, 
                        closedTickets, 
                        pendingTickets, 
                        driverTickets,
                        waitingOnCustomerTickets 
                    };
                    
                    setTickets(ticketStats);
                    setFilteredTickets(ticketStats);
                }
            } catch (error) {
                console.error("Error fetching ticket data:", error);
            }
        };
        fetchTickets();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        
        const filtered = {
            totalTickets: tickets.totalTickets,
            openTickets: tickets.openTickets,
            closedTickets: tickets.closedTickets,
            pendingTickets: tickets.pendingTickets,
            driverTickets: tickets.driverTickets,
            waitingOnCustomerTickets: tickets.waitingOnCustomerTickets
        };
        
        setFilteredTickets(filtered);
    };

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>
            
            <div className="ticket-stats">
                <div className="ticket-row">
                    <Link to="/total-tickets" className="ticket-stat total-tickets">
                        <h3>Total Tickets</h3>
                        <p>{filteredTickets.totalTickets}</p>
                    </Link>
                    <Link to="/open-tickets" className="ticket-stat open-tickets">
                    <h3>Open Tickets</h3>
                    <p>{filteredTickets.openTickets}</p>
                    </Link>

                </div>
                <div className="ticket-row">
                    <Link to="/closed-tickets" className="ticket-stat closed-tickets">
                        <h3>Closed Tickets</h3>
                        <p>{filteredTickets.closedTickets}</p>
                    </Link>
                    <Link to="/pending-tickets" className="ticket-stat pending-tickets">
                        <h3>Pending Tickets</h3>
                        <p>{filteredTickets.pendingTickets}</p>
                    </Link>
                </div>
                <div className="ticket-row">
                    <Link to="/driver-tickets" className="ticket-stat driver-tickets">
                        <h3>Driver Tickets</h3>
                        <p>{filteredTickets.driverTickets}</p>
                    </Link>
                    <Link to="/waiting-on-customer" className="ticket-stat waiting-on-customer">
                    <h3>Waiting for response</h3>
                    <p>{filteredTickets.waitingOnCustomerTickets}</p>
                    </Link>

                    
                </div>
            </div>
        </div>
    );
};

export default Dashboard;