import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./TotalTickets.css";

const socket = io("https://backend-7j5d.onrender.com"); // <-- FIXED: connect to root, not /api/tickets
socket.on("connect", () => {
  console.log("Socket connected with id:", socket.id);
});

const TotalTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch tickets on component mount and sort by LCFS
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("https://backend-7j5d.onrender.com/api/tickets");
        const data = await response.json();
        if (data.success) {
          // Sort tickets by createdAt in descending order (LCFS)
          const sortedTickets = data.tickets.sort((a, b) => 
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

  // Handle real-time messaging with Socket.IO
  useEffect(() => {
    if (!selectedTicket) return;

    console.log(`Joining room for ticket: ${selectedTicket.ticketId}`);
    socket.on("receiveMessage", (data) => {
      if (data.roomId === selectedTicket.ticketId) {
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
      //socket.emit("leaveTicket", { ticketId: selectedTicket.ticketId });
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
    // Join Socket Room only if ticketId exists
    if (ticket.ticketId) {
      socket.emit("joinRoom", { roomId: ticket.ticketId }, (ack) => {
        if (ack && ack.success) {
          console.log(`Joined room for ticket: ${ticket.ticketId}`);
        } else {
          console.error(`Failed to join room for ticket: ${ticket.ticketId}`);
          console.log(`Failed to join room for ticket: ${ticket.ticketId}`)
        }
      });
    } else {
      console.error("Selected ticket does not have a ticketId:", ticket);
    }
    console.log("Selected ticket:", ticket.ticketId);

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
      roomId: selectedTicket.ticketId,
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
    <div className="total-tickets-page">
      <div className="total-tickets-container">
        <h2>Total Tickets</h2>
        <table className="total-tickets-table">
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

export default TotalTickets;
