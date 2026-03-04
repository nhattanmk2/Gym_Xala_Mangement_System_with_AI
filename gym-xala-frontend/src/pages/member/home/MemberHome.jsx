import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getActivePackages } from "../../../api/packageApi";
import { getAllLocations } from "../../../api/locationApi";
import { getMemberWeeklyStats } from "../../../api/ptScheduleApi";
import "./member-home.css";

export default function MemberHome() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [packages, setPackages] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);

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
    const fetchLocations = async () => {
      try {
        const data = await getAllLocations();
        setBranches(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();

    const fetchPackages = async () => {
      try {
        const data = await getActivePackages();
        // Chỉ hiện ra 4 gói tập nổi bật nhất (hoặc mới nhất)
        setPackages(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };
    fetchPackages();

    const fetchWeeklyStats = async () => {
      try {
        const data = await getMemberWeeklyStats();
        setWeeklyStats(data);
      } catch (error) {
        console.error("Error fetching weekly stats:", error);
      }
    };
    fetchWeeklyStats();
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
      {/* Header Info */}
      <div className="dashboard-header">
        <div>
          <h1 className="welcome-title">Chào mừng trở lại, Hội viên!</h1>
          <p className="welcome-subtitle">Cùng tiếp tục hành trình tập luyện tuyệt vời nhé.</p>
        </div>
      </div>

      {/* Banner */}
      <div className="banner-wrapper">
        <img
          className="banner"
          src="https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg"
          alt="Banner Gym Xala"
        />
        <div className="banner-content">
          <h2>Đăng ký gói tập hôm nay</h2>
          <p>Nhận ngay ưu đãi giảm 20% cho gói VIP 6 tháng.</p>
          <button className="banner-btn" onClick={() => navigate('/member/packages')}>Xem chi tiết</button>
        </div>
      </div>

      {/* Weekly Stats Chart */}
      <section className="dashboard-section chart-section">
        <div className="section-header">
          <h2 className="section-title">THỐNG KÊ TẬP LUYỆN (TUẦN NÀY)</h2>
          <span className="total-time-badge">
            ⏱️ Tổng thời gian: <b>{weeklyStats?.totalMinutes || 0} phút</b>
          </span>
        </div>

        <div className="chart-container">
          {weeklyStats?.dailyStats?.map((day, idx) => {
            // Find max minutes to calculate relative height (max height = 150px)
            const maxMinutes = Math.max(...weeklyStats.dailyStats.map(d => d.minutes), 60); // min max = 60
            const heightPercentage = (day.minutes / maxMinutes) * 100;

            return (
              <div key={idx} className="chart-col-wrapper">
                <div className="chart-col-value">{day.minutes}p</div>
                <div className="chart-col">
                  <div
                    className="chart-col-fill"
                    style={{ height: `${heightPercentage}%` }}
                    title={`${day.minutes} phút vào ${day.dayOfWeek} (${day.dateStr})`}
                  ></div>
                </div>
                <div className="chart-col-label">{day.dayOfWeek}</div>
                <div className="chart-col-date">{day.dateStr}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Branch Grid */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">CÁC CHI NHÁNH</h2>
          <button className="view-all-btn" onClick={() => navigate('/member/booking')}>Xem tất cả</button>
        </div>

        <div className="card-grid">
          {branches.map((b) => (
            <div key={b.id} className="card-item">
              <div className="card-image-wrapper">
                <img
                  src={b.image ? `data:image/png;base64,${b.image}` : "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg"}
                  alt={b.name}
                />
              </div>
              <div className="card-info">
                <h3>{b.name}</h3>
                <p>📍 {b.address}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Package Grid */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">GÓI THÀNH VIÊN NỔI BẬT</h2>
          <button className="view-all-btn" onClick={() => navigate('/member/packages')}>Khám phá ngay</button>
        </div>

        <div className="card-grid package-grid">
          {packages.map((p) => (
            <div key={p.id} className="card-item package-item">
              <div className="card-image-wrapper">
                {p.image ? (
                  <img src={`data:image/png;base64,${p.image}`} alt={p.name} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                    🏋️
                  </div>
                )}
              </div>
              <div className="card-info">
                <h3>{p.name}</h3>
                <p className="price">🏷 {p.price?.toLocaleString()} đ</p>
                <button className="register-btn" onClick={() => navigate(`/member/packages/${p.id}`)}>Đăng ký ngay</button>
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
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {/* Chatbot Popup */}
      {showChatbot && (
        <div className="chatbot-popup">
          <div className="chat-header">
            <span>🤖 Trợ lý Gym Xala</span>
            <button className="close-chat-btn" onClick={() => setShowChatbot(false)}>✕</button>
          </div>

          <div className="chat-body" ref={chatBoxRef}>
            {chatHistory.map((c, i) => (
              <div
                key={i}
                className={`chat-msg ${c.chatType === "USER" ? "user" : "bot"
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
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

