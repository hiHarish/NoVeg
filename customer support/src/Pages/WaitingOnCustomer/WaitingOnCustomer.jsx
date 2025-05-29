import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "./WaitingOnCustomer.css";

const socket = io("http://localhost:3000");

const WaitingOnCustomer = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Fetch tickets waiting for customer response on component mount
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/tickets");
        if (response.data.success) {
          const waitingTickets = response.data.tickets
            .filter((ticket) => ticket.status === "waiting for response")
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setTickets(waitingTickets);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, []);

  // Handle real-time messaging with Socket.IO
  useEffect(() => {
    if (!selectedTicket) return;

    socket.emit("joinTicket", { ticketId: selectedTicket.ticketId });

     // Listen for new user messages
     socket.on("newUserMessage", (data) => {
      if (data.ticketId === selectedTicket.ticketId) {
        setMessages((prev) => [
          ...prev,
          { sender: "user", text: data.message, time: new Date(data.timestamp).toLocaleTimeString() },
        ]);
      }
    });

     // Listen for new agent messages
     socket.on("newAgentMessage", (data) => {
      if (data.ticketId === selectedTicket.ticketId) {
        setMessages((prev) => [
          ...prev,
          { sender: "support", text: data.message, time: new Date(data.timestamp).toLocaleTimeString() },
        ]);
      }
    });

    // Cleanup on unmount or when ticket is deselected
    return () => {
      socket.emit("leaveTicket", { ticketId: selectedTicket.ticketId });
      socket.off("newUserMessage");
      socket.off("newAgentMessage");
    };
  }, [selectedTicket]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle ticket selection and load chat history
  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setIsChatMinimized(false);

    const storedMessages =
      JSON.parse(localStorage.getItem(`chat_${ticket.ticketId}`)) || [
        { sender: "system", text: "You are now connected to the ticket chat." },
        { sender: "system", text: "Waiting for customer to connect..." },
      ];

    setMessages(storedMessages);
  };

  // Send a new message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      ticketId: selectedTicket.ticketId,
      sender: "support",
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    socket.emit("userMessage", messageData);

    const newMessageObject = {
      sender: "support",
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => {
      const updatedMessages = [...prev, newMessageObject];
      localStorage.setItem(`chat_${selectedTicket.ticketId}`, JSON.stringify(updatedMessages));
      return updatedMessages;
    });

    setNewMessage("");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="waiting-on-customer-page">
      <div className="waiting-tickets-container">
        <h1>Tickets Waiting for Customer Response</h1>
        {tickets.length > 0 ? (
          <table className="waiting-ticket-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Issue</th>
                <th>Status</th>
                <th>User Message</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>User</th>
                <th>Mobile Number</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.ticketId}>
                  <td>
                    <button className="action-btn" onClick={() => handleTicketSelect(ticket)}>
                      {ticket.ticketId}
                    </button>
                  </td>
                  <td>{ticket.issue}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.userMessage || "No message provided"}</td>
                  <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                  <td>{new Date(ticket.updatedAt).toLocaleString()}</td>
                  <td>{ticket.userName || "N/A"}</td>
                  <td>{ticket.mobileNumber || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No tickets are currently waiting for customer response.</p>
        )}
        <button onClick={handleBack} className="back-button">
          Back
        </button>
      </div>

      {selectedTicket && (
        <div className={`chat-box ${isChatMinimized ? "minimized" : ""}`}>
          <div className="chat-header" onClick={() => setIsChatMinimized(!isChatMinimized)}>
            <h2>Support Chat - Ticket {selectedTicket.ticketId}</h2>
            <button className="minimize-chat">{isChatMinimized ? "🔼" : "🔽"}</button>
            <button className="close-chat" onClick={() => setSelectedTicket(null)}>✖</button>
          </div>
          {!isChatMinimized && (
            <>
              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${msg.sender === "support" ? "support-message" : "user-message"}`}
                  >
                    <strong>{msg.sender}:</strong> {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-container">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="chat-input"
                />
                <button onClick={sendMessage} className="send-btn">Send</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WaitingOnCustomer;