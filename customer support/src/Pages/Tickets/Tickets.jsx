import { Link } from 'react-router-dom';
import './Tickets.css';
const Tickets = () => {

    return (
        <div className="tickets-container">
            <h2>Tickets</h2>
            
            <div className="row">
                <Link to="/customer-tickets" className="ticket customer-ticket">
                    <h3>Customer Tickets</h3>
                </Link>
                <Link to="/delivery-tickets" className="ticket delivery-ticket">
                    <h3>Delivery Tickets</h3>
                </Link>
                <Link to="/vendor-tickets" className="ticket vendor-ticket">
                    <h3>Vendor Tickets</h3>
                </Link>
            </div>
        </div>
    );
};

export default Tickets;