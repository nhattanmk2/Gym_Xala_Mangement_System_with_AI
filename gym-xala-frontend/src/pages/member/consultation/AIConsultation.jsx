import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAIConsultation } from "../../../api/aiConsultationApi";
import "./ai-consultation.css";

export default function AIConsultation() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const [formData, setFormData] = useState({
        weight: "",
        height: "",
        age: "",
        gender: "MALE",
        goal: "WEIGHT_LOSS"
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
            alert("Vui lòng điền đầy đủ chiều cao, cân nặng và tuổi!");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                weight: parseFloat(formData.weight),
                height: parseFloat(formData.height),
                age: parseInt(formData.age),
                gender: formData.gender,
                goal: formData.goal
            };

            const data = await getAIConsultation(payload);
            setResult(data);
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
        </div>
    );
}
