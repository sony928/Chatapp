import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Picker from "emoji-picker-react"; // Simple Emoji Picker
import "./Chat.css";

const socket = io("http://localhost:5000");

function Chat() {
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_list", (userList) => {
      setUsers(userList);
    });

    socket.on("user_typing", (typingUser) => {
      console.log(`${typingUser} is typing...`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSetUsername = () => {
    if (username.trim()) {
      setCurrentUser(username);
      socket.emit("set_username", username);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", { username: currentUser, message });
      setMessages((prev) => [
        ...prev,
        { username: currentUser, message, self: true },
      ]);
      setMessage("");
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.emoji);
    setEmojiPickerVisible(false);
  };

  return (
    <div className="chat-container">
      {!currentUser ? (
        <div className="username-container">
          <input
            type="text"
            placeholder="Enter your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="username-input"
          />
          <button onClick={handleSetUsername} className="btn">
            Join Chat
          </button>
        </div>
      ) : (
        <div className="chat-room">
          <div className="chat-header">
            <h2>Chat Room</h2>
          </div>
          <div className="chat-body">
            <div className="chat-users">
              <h4>Users</h4>
              <ul>
                {users.map((user, index) => (
                  <li key={index} className="user-item">
                    {user}
                  </li>
                ))}
              </ul>
            </div>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.self ? "message-self" : "message-other"
                  }`}
                >
                  <span className="message-user">{msg.username}</span>:{" "}
                  <span className="message-text">{msg.message}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chat-footer">
            {emojiPickerVisible && (
              <div className="emoji-picker">
                <Picker onEmojiClick={handleEmojiSelect} />
              </div>
            )}
            <button
              onClick={() => setEmojiPickerVisible((prev) => !prev)}
              className="emoji-btn"
            >
              😊
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="message-input"
            />
            <button onClick={handleSendMessage} className="btn">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
