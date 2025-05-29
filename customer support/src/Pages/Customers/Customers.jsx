import { useEffect, useState } from "react";
import axios from "axios";
import { FiChevronDown } from "react-icons/fi"; // Import dropdown icon
import "./Customers.css";

const Customer = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(""); // For filtering orders
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown visibility

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/orders");
        if (response.data.success) {
          setOrders(response.data.data);
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setShowDropdown(false); // Close dropdown after selection
  };

  const filteredOrders = filterStatus
    ? orders.filter((order) => order.status.toLowerCase() === filterStatus.toLowerCase())
    : orders;

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div>
      <h1>All Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div>
          {/* Dropdown for filtering */}
          <div className="filter-container">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              Filter by Status <FiChevronDown />
            </button>
            {showDropdown && (
              <ul className="dropdown-menu">
                <li onClick={() => handleFilterSelect("Delivered")}>Delivered</li>
                <li onClick={() => handleFilterSelect("Out for Delivery")}>
                  Out for Delivery
                </li>
                <li onClick={() => handleFilterSelect("Food Processing")}>
                  Food Processing
                </li>
              </ul>
            )}
          </div>

          {/* Table */}
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Street</th>
                <th>City</th>
                <th>State</th>
                <th>Zipcode</th>
                <th>Country</th>
                <th>Phone</th>
                <th>Order ID</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.address.firstName}</td>
                  <td>{order.address.lastName}</td>
                  <td>{order.address.email}</td>
                  <td>{order.address.street}</td>
                  <td>{order.address.city}</td>
                  <td>{order.address.state}</td>
                  <td>{order.address.zipcode}</td>
                  <td>{order.address.country}</td>
                  <td>{order.address.phone}</td>
                  <td>{order.orderId}</td>
                  <td>{order.status}</td>
                  <td>₹{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Filter indicator */}
          {filterStatus && (
            <p>
              Showing results for status: <strong>{filterStatus}</strong>{" "}
              <button onClick={() => setFilterStatus("")}>Clear Filter</button>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Customer;