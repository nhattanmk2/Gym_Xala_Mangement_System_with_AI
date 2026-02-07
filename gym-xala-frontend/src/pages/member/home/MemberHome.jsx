import { useEffect, useState, useRef } from "react";
import "./member-home.css";

export default function MemberHome() {
  const [branches, setBranches] = useState([]);
  const [packages, setPackages] = useState([]);

  const [showChatbot, setShowChatbot] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      chatType: "BOT",
      content:
        "Chào mừng bạn đến với phòng Gym Xala, hôm nay tôi có thể giúp gì bạn?",
    },
  ]);

  const [message, setMessage] = useState("");
  const chatBoxRef = useRef(null);

  // Fake API load
  useEffect(() => {
    setBranches([
      {
        id: 1,
        name: "Gym Xala Hà Đông",
        address: "Hà Nội",
        image:
          "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg",
      },
    ]);

    setPackages([
      {
        id: 1,
        name: "Gói 3 tháng",
        price: "1.500.000 VNĐ",
        image:
          "https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg",
      },
    ]);
  }, []);

  // Scroll chatbot xuống cuối
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Send message
  const sendMessage = () => {
    if (!message.trim()) return;

    const userMsg = {
      chatType: "USER",
      content: message,
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setMessage("");

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        { chatType: "BOT", content: "Mình đã nhận câu hỏi của bạn 😄" },
      ]);
    }, 1000);
  };

  return (
    <div className="member-container">
      {/* Banner */}
      <img
        className="banner"
        src="https://i.ibb.co/WVnV8Zp/barner.png"
        alt="banner"
      />

      {/* Branch Slider */}
      <section>
        <h2 className="section-title">CÁC CHI NHÁNH</h2>

        <div className="slider">
          {branches.map((b) => (
            <div key={b.id} className="card-slide">
              <img src={b.image} alt={b.name} />
              <div className="overlay">
                <h3>{b.name}</h3>
                <p>📍 {b.address}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Package Slider */}
      <section>
        <h2 className="section-title">GÓI THÀNH VIÊN</h2>

        <div className="slider">
          {packages.map((p) => (
            <div key={p.id} className="card-slide">
              <img src={p.image} alt={p.name} />
              <div className="overlay">
                <h3>{p.name}</h3>
                <p>🏷 {p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Chatbot */}
      <button
        className="chatbot-icon"
        onClick={() => setShowChatbot(!showChatbot)}
      >
        🤖
      </button>

      {/* Chatbot Popup */}
      {showChatbot && (
        <div className="chatbot-popup">
          <div className="chat-header">
            <span>Chatbot hỗ trợ</span>
            <button onClick={() => setShowChatbot(false)}>×</button>
          </div>

          <div className="chat-body" ref={chatBoxRef}>
            {chatHistory.map((c, i) => (
              <div
                key={i}
                className={`chat-msg ${
                  c.chatType === "USER" ? "user" : "bot"
                }`}
              >
                {c.content}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              value={message}
              placeholder="Nhập câu hỏi..."
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
}
