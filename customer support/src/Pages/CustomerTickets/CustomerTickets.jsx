import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./CustomerTickets.css";

const socket = io("http://localhost:3000");

const CustomerTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/tickets");
        if (response.data.success) {
          const sortedTickets = response.data.tickets.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setTickets(sortedTickets);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    if (!selectedTicket) return;

    socket.emit("joinTicket", { ticketId: selectedTicket.ticketId });

    const handleReceiveMessage = (data) => {
      if (data.ticketId === selectedTicket.ticketId && data.sender !== "support") {
        setMessages((prev) => {
          const updatedMessages = [
            ...prev,
            { sender: data.sender, text: data.message },
          ];
          localStorage.setItem(`chat_${selectedTicket.ticketId}`, JSON.stringify(updatedMessages));
          return updatedMessages;
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.emit("leaveTicket", { ticketId: selectedTicket.ticketId });
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:3000/api/tickets/${ticketId}`, { status: newStatus });
      if (response.data.success) {
        setTickets((prevTickets) => {
          const updatedTickets = prevTickets.map((ticket) =>
            ticket.ticketId === ticketId ? { ...ticket, status: newStatus } : ticket
          );
          return updatedTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });

        if (newStatus === "closed" && selectedTicket && selectedTicket.ticketId === ticketId) {
          const messageData = {
            ticketId: selectedTicket.ticketId,
            sender: "support",
            message: "solved",
            timestamp: new Date().toISOString(),
          };
          socket.emit("sendMessage", messageData);

          setMessages((prev) => {
            const updatedMessages = [
              ...prev,
              { sender: "support", text: "solved" },
            ];
            localStorage.setItem(`chat_${selectedTicket.ticketId}`, JSON.stringify(updatedMessages));
            return updatedMessages;
          });
        }
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

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
    };

    setMessages((prev) => {
      const updatedMessages = [...prev, newMessageObject];
      localStorage.setItem(`chat_${selectedTicket.ticketId}`, JSON.stringify(updatedMessages));
      return updatedMessages;
    });

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="ticket-page">
      <div className="ticket-table-container">
        <h1>Customer Tickets</h1>
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Issue</th>
              <th>Status</th>
              <th>User Message</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Name</th>
              <th>Number</th>
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
                <td>
                  <select
                    className="status-dropdown"
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.ticketId, e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="waiting for response">Waiting for Response</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
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
                    className={`chat-message ${
                      msg.sender === "support" ? "support-message" : "user-message"
                    }`}
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
                  onKeyPress={handleKeyPress}
                  className="chat-input"
                />
                <button onClick={sendMessage} className="send-btn">
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerTickets;