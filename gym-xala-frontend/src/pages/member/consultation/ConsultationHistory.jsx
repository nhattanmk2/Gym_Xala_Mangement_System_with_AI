import React, { useState, useEffect } from "react";
import { getAIConsultationHistory } from "../../../api/aiConsultationApi";
import { useNavigate } from "react-router-dom";
import "./consultation-history.css";

const ConsultationHistory = ({ triggerFetch }) => {
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, [triggerFetch]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await getAIConsultationHistory();
            setHistoryList(data);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoStr) => {
        const d = new Date(isoStr);
        return d.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const parseRecommendations = (jsonStr) => {
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            return [];
        }
    };

    return (
        <div className="history-container">
            <h2 className="history-title">📚 Nhật Ký Tư Vấn AI Của Bạn</h2>
            {loading ? (
                <div className="history-loading">Đang tải dữ liệu...</div>
            ) : historyList.length === 0 ? (
                <div className="history-empty">Chưa có lịch sử tư vấn nào. Hãy trải nghiệm AI ngay!</div>
            ) : (
                <div className="history-list">
                    {historyList.map((item) => {
                        const recs = parseRecommendations(item.recommendationJson);
                        return (
                            <div key={item.id} className="history-card">
                                <div className="h-card-header">
                                    <span className="h-time">🕒 {formatDate(item.consultationTime)}</span>
                                    <span className={`h-bmi-badge cat-${item.bmiCategory === 'Thiếu cân' ? 'under' : item.bmiCategory === 'Bình thường' ? 'normal' : item.bmiCategory === 'Thừa cân' ? 'over' : 'obese'}`}>
                                        BMI: {item.bmi} - {item.bmiCategory}
                                    </span>
                                </div>

                                <div className="h-params">
                                    <span>Mục tiêu: <strong>{item.goal === 'WEIGHT_LOSS' ? 'Giảm mỡ' : item.goal === 'MUSCLE_GAIN' ? 'Tăng cơ' : 'Giữ dáng'}</strong></span>
                                    <span>Cao: <strong>{item.height}cm</strong></span>
                                    <span>Nặng: <strong>{item.weight}kg</strong></span>
                                </div>

                                <div className="h-advice">
                                    <p>💡 {item.advice}</p>
                                </div>

                                <div className="h-recs">
                                    <h4>Thể tập đề xuất lúc đó:</h4>
                                    {recs && recs.length > 0 ? (
                                        recs.map((r, i) => (
                                            <div key={i} className="h-rec-item">
                                                <div className="h-rec-name">🏅 {r.packageInfo?.name}</div>
                                                <div className="h-pts">
                                                    {r.recommendedPts && r.recommendedPts.length > 0 && <span>PT phù hợp nhất: {r.recommendedPts[0].ptName} ({r.recommendedPts[0].matchPercentage}%)</span>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="h-no-rec">Không có đề xuất</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default ConsultationHistory;
