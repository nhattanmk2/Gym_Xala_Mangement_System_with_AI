import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAIConsultation } from "../../../api/aiConsultationApi";
import ConsultationHistory from "./ConsultationHistory";
import "./ai-consultation.css";

export default function AIConsultation() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [formData, setFormData] = useState({
        weight: "",
        height: "",
        age: "",
        gender: "MALE",
        goal: "WEIGHT_LOSS",
        preferredDate: "",
        startTime: "",
        endTime: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGoalSelect = (goalValue) => {
        setFormData(prev => ({ ...prev, goal: goalValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.weight || !formData.height || !formData.age) {
            alert("Vui lòng điền đầy đủ chiều cao, cân nặng, và tuổi!");
            return;
        }

        let startDateTime = null;
        let endDateTime = null;

        if (formData.preferredDate && formData.startTime && formData.endTime) {
            startDateTime = `${formData.preferredDate}T${formData.startTime}:00`;
            endDateTime = `${formData.preferredDate}T${formData.endTime}:00`;
        }

        try {
            setLoading(true);
            const payload = {
                weight: parseFloat(formData.weight),
                height: parseFloat(formData.height),
                age: parseInt(formData.age),
                gender: formData.gender,
                goal: formData.goal,
                preferredStartTime: startDateTime,
                preferredEndTime: endDateTime
            };

            const data = await getAIConsultation(payload);
            setResult(data);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error getting AI consultation:", error);
            alert("Có lỗi xảy ra khi gọi chuyên gia AI. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-consultation-container">
            <div className="ai-header">
                <h1>Chuyên Gia AI Tư Vấn</h1>
                <p>Nhập thông tin thể trạng của bạn để hệ thống phân tích và đưa ra lộ trình tập luyện tối ưu nhất.</p>
            </div>

            {!result && !loading && (
                <form className="ai-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Giới tính</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Độ tuổi</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="VD: 25" min="10" max="100" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Chiều cao (cm)</label>
                            <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="VD: 175" min="100" max="250" />
                        </div>
                        <div className="form-group">
                            <label>Cân nặng (kg)</label>
                            <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="VD: 70" min="30" max="200" />
                        </div>
                    </div>

                    <div className="goal-selection">
                        <label>Khung giờ bạn dự định tập luyện (Bắt buộc để gợi ý PT)</label>
                        <div className="form-row" style={{ marginTop: '10px' }}>
                            <div className="form-group">
                                <label>Ngày tập</label>
                                <input
                                    type="date"
                                    name="preferredDate"
                                    value={formData.preferredDate}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Từ giờ</label>
                                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Đến giờ</label>
                                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <div className="goal-selection">
                        <label>Mục tiêu tập luyện của bạn là gì?</label>
                        <div className="goal-cards">
                            <div
                                className={`goal-card ${formData.goal === 'WEIGHT_LOSS' ? 'active' : ''}`}
                                onClick={() => handleGoalSelect('WEIGHT_LOSS')}
                            >
                                <div className="goal-icon">🔥</div>
                                <h3>Giảm mỡ, Giảm cân</h3>
                            </div>
                            <div
                                className={`goal-card ${formData.goal === 'MUSCLE_GAIN' ? 'active' : ''}`}
                                onClick={() => handleGoalSelect('MUSCLE_GAIN')}
                            >
                                <div className="goal-icon">💪</div>
                                <h3>Tăng cơ bắp</h3>
                            </div>
                            <div
                                className={`goal-card ${formData.goal === 'MAINTAIN' ? 'active' : ''}`}
                                onClick={() => handleGoalSelect('MAINTAIN')}
                            >
                                <div className="goal-icon">✨</div>
                                <h3>Giữ dáng, Khỏe mạnh</h3>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="submit-ai-btn">Phân Tích Ngay</button>
                </form>
            )}

            {loading && (
                <div className="ai-loading">
                    <div className="spinner"></div>
                    <h3>AI đang tổng hợp dữ liệu và phân tích cơ địa của bạn...</h3>
                </div>
            )}

            {result && !loading && (
                <div className="ai-result">
                    <div className="result-header">
                        <h2>Kết Quả Phân Tích Cơ Thể</h2>
                        <button className="reset-btn" onClick={() => setResult(null)}>Tính lại ↺</button>
                    </div>

                    <div className="bmi-card">
                        <div className="bmi-score">
                            <span className="bmi-label">Chỉ số BMI</span>
                            <span className="bmi-value">{result.bmi}</span>
                            <span className={`bmi-category cat-${result.bmiCategory === 'Thiếu cân' ? 'under' : result.bmiCategory === 'Bình thường' ? 'normal' : result.bmiCategory === 'Thừa cân' ? 'over' : 'obese'}`}>
                                {result.bmiCategory}
                            </span>
                        </div>
                        <div className="bmi-advice">
                            <p>{result.advice}</p>
                        </div>
                    </div>

                    <h3 className="rec-title">Đề Xuất Gói Tập Phù Hợp Nhất Dành Cho Bạn</h3>

                    <div className="rec-grid">
                        {result.recommendedPackages && result.recommendedPackages.length > 0 ? (
                            result.recommendedPackages.map((pkg) => (
                                <div key={pkg.packageInfo.id} className="rec-card">
                                    <div className="rec-card-image">
                                        {pkg.packageInfo.image ? (
                                            <img src={`data:image/png;base64,${pkg.packageInfo.image}`} alt={pkg.packageInfo.name} />
                                        ) : (
                                            <div className="placeholder-img">🏅</div>
                                        )}
                                    </div>
                                    <div className="rec-card-info">
                                        <h4>{pkg.packageInfo.name}</h4>
                                        <span className="rec-price">{pkg.packageInfo.price?.toLocaleString()} đ</span>
                                        <p className="rec-desc">{pkg.packageInfo.description && pkg.packageInfo.description.length > 80 ? pkg.packageInfo.description.substring(0, 80) + '...' : pkg.packageInfo.description}</p>

                                        {pkg.reason && (
                                            <div className="rec-reason">
                                                💡 <i>{pkg.reason}</i>
                                            </div>
                                        )}

                                        {pkg.recommendedPts && pkg.recommendedPts.length > 0 && (
                                            <div className="rec-pt-list" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '8px', borderLeft: '3px solid #00e5ff' }}>
                                                <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#00e5ff' }}>👨‍🏫 HLV Chuyên môn phù hợp đề xuất:</h5>
                                                {pkg.recommendedPts.map(pt => (
                                                    <div key={pt.ptId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #333' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>{pt.ptName} <span style={{ color: '#ffc107', fontSize: '13px' }}>⭐ {pt.ptRating}</span></div>
                                                            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{pt.ptSpecialty} • {pt.ptExperience}</div>
                                                        </div>
                                                        <button
                                                            style={{ padding: '6px 12px', background: '#00e5ff', border: 'none', color: '#000', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                                            onClick={() => navigate('/member/booking')}
                                                        >
                                                            Đặt lịch PT
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button className="book-btn" onClick={() => navigate(`/member/packages/${pkg.packageInfo.id}`)}>Xem chi tiết</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Hệ thống hiện chưa tìm thấy gói tập nào phù hợp với bạn. Vui lòng liên hệ lễ tân để được hỗ trợ.</p>
                        )}
                    </div>
                </div>
            )}

            <ConsultationHistory triggerFetch={refreshTrigger} />
        </div>
    );
}
