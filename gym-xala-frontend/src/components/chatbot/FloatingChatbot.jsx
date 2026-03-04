import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAIConsultation } from '../../api/aiConsultationApi';
import './floating-chatbot.css';

const FloatingChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // State to hold the conversation step and extracted user data
    const [step, setStep] = useState(0);
    const [userData, setUserData] = useState({
        weight: null,
        height: null,
        age: null,
        gender: null,
        goal: null
    });

    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Initial greeting when opened first time
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            addBotMessage("👋 Chào bạn, mình là HLV ảo của Xala Gym. Bạn đang muốn nhận tư vấn định hướng tập luyện hay tìm gói tập phù hợp ạ?");
            setTimeout(() => {
                addBotMessage("Để mình có thể tư vấn chính xác nhất, bạn vui lòng cho mình biết **Chiều cao (cm)** và **Cân nặng (kg)** của bạn nhé. (VD: 175cm 70kg)");
            }, 1000);
        }
    }, [isOpen]);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const addBotMessage = (text, customPayload = null) => {
        setMessages(prev => [...prev, { sender: 'bot', text, customPayload, id: Date.now() }]);
    };

    const handleSend = async (textOverride = null) => {
        const text = textOverride || inputValue;
        if (!text.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { sender: 'user', text, id: Date.now() }]);
        setInputValue("");
        setIsTyping(true);

        // Process message based on current step
        setTimeout(() => {
            processUserInput(text);
        }, 800);
    };

    const processUserInput = async (text) => {
        let nextData = { ...userData };

        if (step === 0) {
            // Extract height and weight using simple regex
            const numbers = text.match(/\d+/g);
            if (numbers && numbers.length >= 2) {
                // assume first might be height (if > 100) and second weight
                let n1 = parseInt(numbers[0]);
                let n2 = parseInt(numbers[1]);
                if (n1 < n2) { [n1, n2] = [n2, n1]; } // usually height > weight

                nextData.height = n1;
                nextData.weight = n2;
                setUserData(nextData);

                addBotMessage(`Tuyệt vời. Chiều cao ${n1}cm và cân nặng ${n2}kg.`);
                setTimeout(() => {
                    addBotMessage("Tiếp theo, bạn cho mình biết **Độ tuổi** và **Giới tính** của bạn nhé! (VD: 25 Nam)");
                }, 500);
                setStep(1);
            } else {
                addBotMessage("Hmm, mình chưa bắt được số đo của bạn. Bạn gõ lại rõ ràng 2 số Chiều cao và Cân nặng giúp mình nhé! Ví dụ: 170 65");
            }
            setIsTyping(false);
        }
        else if (step === 1) {
            // Extract age and gender
            const numbers = text.match(/\d+/g);
            if (numbers) {
                nextData.age = parseInt(numbers[0]);
            }

            const lowerText = text.toLowerCase();
            if (lowerText.includes("nam") || lowerText.includes("trai")) {
                nextData.gender = "MALE";
            } else if (lowerText.includes("nữ") || lowerText.includes("gái")) {
                nextData.gender = "FEMALE";
            }

            if (nextData.age && nextData.gender) {
                setUserData(nextData);
                addBotMessage(`Ok bạn ${nextData.age} tuổi, giới tính ${nextData.gender === 'MALE' ? 'Nam' : 'Nữ'}.`);
                setTimeout(() => {
                    addBotMessage("Cuối cùng, mục tiêu tập luyện hiện tại của bạn là gì? Bạn có thể ấn vào các nút Gợi ý bên dưới nhé!", {
                        type: 'quick_replies',
                        options: [
                            { label: '🔥 Giảm mỡ', value: 'WEIGHT_LOSS' },
                            { label: '💪 Tăng cơ', value: 'MUSCLE_GAIN' },
                            { label: '🧘 Giữ dáng', value: 'MAINTAIN' }
                        ]
                    });
                }, 500);
                setStep(2);
            } else {
                addBotMessage("Hình như bạn quên nhập Tuổi hoặc Giới tính rồi. Nhập lại giúp mình nhé, ví dụ: 22 Nữ");
            }
            setIsTyping(false);
        }
        else if (step === 2) {
            // Processing the goal
            // In case user typed it out instead of clicking
            let goalValue = "MAINTAIN"; // default
            const lowerText = text.toLowerCase();
            if (lowerText.includes("giảm")) goalValue = "WEIGHT_LOSS";
            else if (lowerText.includes("tăng") || lowerText.includes("cơ")) goalValue = "MUSCLE_GAIN";
            else if (lowerText.includes("giữ") || lowerText.includes("duy trì")) goalValue = "MAINTAIN";
            else goalValue = text; // If clicked from quick reply button, the value is passed directly

            nextData.goal = goalValue;
            setUserData(nextData);

            addBotMessage("Đã nhận đủ thông tin! Đợi mình một chút để đưa dữ liệu vào cỗ máy AI phân tích nhé... 🧠🔍");

            try {
                // Call API
                const reqData = {
                    weight: nextData.weight || 60,
                    height: nextData.height || 170,
                    age: nextData.age || 25,
                    gender: nextData.gender || 'MALE',
                    goal: nextData.goal
                };

                const response = await getAIConsultation(reqData);

                setIsTyping(false);
                addBotMessage(`**Kết quả BMI:** ${response.bmi} (${response.bmiCategory})\n\n**Lời khuyên từ AI:** ${response.advice}`);

                if (response.recommendedPackages && response.recommendedPackages.length > 0) {
                    setTimeout(() => {
                        addBotMessage("Dựa trên thể trạng của bạn, hệ thống lọc ra được các thẻ tập phù hợp nhất dưới đây:", {
                            type: 'packages',
                            data: response.recommendedPackages
                        });
                        setStep(3); // End of flow
                    }, 1000);
                } else {
                    setStep(3); // End of flow
                }

            } catch (err) {
                setIsTyping(false);
                addBotMessage("Ui da, có lỗi kết nối tới máy chủ AI rồi. Nhờ bạn thử lại sau nhé 😢");
            }
        } else {
            setIsTyping(false);
            addBotMessage("Cảm ơn bạn. Nếu muốn tư vấn lại từ đầu, hãy nhắn 'Làm lại' nhé!");
            if (text.toLowerCase().includes("lại")) {
                setStep(0);
                setUserData({});
                addBotMessage("Chúng ta bắt đầu lại nào. Hãy cho mình biết **Chiều cao** và **Cân nặng** nhé.");
            }
        }
    };

    const handleQuickReply = (value, label) => {
        handleSend(value); // send the hidden value
        // but visually we might want to show the label, so let's override logic if needed
        // For simplicity, we just sent the value to processUserInput
    };

    const parseMessageText = (text) => {
        // simple bold parser "**text**" -> <strong>text</strong>
        return text.split('**').map((part, i) => i % 2 !== 0 ? <strong key={i}>{part}</strong> : part);
    };

    return (
        <div className="floating-chatbot-container">
            {!isOpen && (
                <button className="chatbot-trigger" onClick={() => setIsOpen(true)}>
                    🤖
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="bot-avatar">🤖</div>
                            <div className="chatbot-header-titles">
                                <h3>AI Coach</h3>
                                <p>Online & Sẵn sàng</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>✖</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                <div className="message-text">
                                    {parseMessageText(msg.text)}
                                </div>

                                {/* Custom Payload Renderers */}
                                {msg.customPayload?.type === 'quick_replies' && (
                                    <div className="quick-replies" style={{ marginTop: '10px' }}>
                                        {msg.customPayload.options.map(opt => (
                                            <button
                                                key={opt.value}
                                                className="quick-reply-btn"
                                                onClick={() => {
                                                    // Immediately display the label as a user message
                                                    setMessages(prev => [...prev, { sender: 'user', text: opt.label, id: Date.now() }]);
                                                    setIsTyping(true);
                                                    setTimeout(() => processUserInput(opt.value), 500);
                                                    // Disable the buttons by removing the payload visually (optional)
                                                    msg.customPayload = null;
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {msg.customPayload?.type === 'packages' && (
                                    <div className="chat-packages">
                                        {msg.customPayload.data.map((pkg, i) => (
                                            <div key={i} className="chat-package-card">
                                                {pkg.packageInfo.image && (
                                                    <img
                                                        src={`data:image/jpeg;base64,${pkg.packageInfo.image}`}
                                                        alt={pkg.packageInfo.name}
                                                        className="chat-package-img"
                                                    />
                                                )}
                                                <div className="chat-package-info">
                                                    <h4 className="chat-package-title">{pkg.packageInfo.name}</h4>
                                                    <div className="chat-package-price">
                                                        {pkg.packageInfo.price ? pkg.packageInfo.price.toLocaleString() + 'đ' : 'Miễn phí'}
                                                    </div>

                                                    {pkg.reason && (
                                                        <div className="chat-package-reason">
                                                            💡 <i>{pkg.reason}</i>
                                                        </div>
                                                    )}

                                                    <button
                                                        className="chat-package-link"
                                                        onClick={() => {
                                                            navigate(`/member/packages/${pkg.packageInfo.id}`);
                                                            setIsOpen(false); // Optionally close chat when navigating
                                                        }}
                                                    >
                                                        Xem chi tiết & Đăng ký 👉
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="message bot typing">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-area">
                        <div className="input-container">
                            <input
                                type="text"
                                placeholder="Nhắn tin cho AI..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                disabled={isTyping}
                            />
                            <button
                                className="send-btn"
                                onClick={() => handleSend()}
                                disabled={isTyping || !inputValue.trim()}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingChatbot;
