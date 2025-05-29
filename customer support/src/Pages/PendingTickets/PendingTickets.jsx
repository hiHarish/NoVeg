import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./PendingTickets.css";

const socket = io("https://backend-7j5d.onrender.com");

const PendingTickets = () => {
  const [pendingTickets, setPendingTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch pending tickets on component mount
  useEffect(() => {
    const fetchPendingTickets = async () => {
      try {
        const response = await axios.get("https://backend-7j5d.onrender.com/api/tickets");
        if (response.data.success) {
          const pending = response.data.tickets
            .filter((ticket) => ticket.status === "pending")
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setPendingTickets(pending);
        }
      } catch (error) {
        console.error("Error fetching pending tickets:", error);
      }
    };
    fetchPendingTickets();
  }, []);

  // Handle real-time messaging with Socket.IO
  useEffect(() => {
    if (!selectedTicket) return;

    socket.on("receiveMessage", (data) => {
      if (data.ticketId === selectedTicket.ticketId) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.text === data.message && msg.sender === data.sender)) {
            return prev;
          }
          return [
            ...prev,
            { sender: data.sender, text: data.message, time: new Date(data.timestamp).toLocaleTimeString() },
          ];
        });
      }
    });

    return () => {
      socket.emit("leaveTicket", { ticketId: selectedTicket.ticketId });
      socket.off("receiveMessage");
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

    socket.emit("sendMessage", messageData);

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

  return (
    <div className="pending-tickets-page">
      <div className="pending-tickets-container">
        <h1>Pending Tickets</h1>
        <table className="pending-tickets-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Issue</th>
              <th>Status</th>
              <th>User Message</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>User Name</th>
              <th>Mobile Number</th>
            </tr>
          </thead>
          <tbody>
            {pendingTickets.map((ticket) => (
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

export default PendingTickets;
