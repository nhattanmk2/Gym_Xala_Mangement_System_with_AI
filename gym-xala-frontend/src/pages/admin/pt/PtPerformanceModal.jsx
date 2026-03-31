import React, { useEffect, useState } from "react";
import { getPtPerformance } from "../../../api/adminPtApi";
import "./ptPerformanceModal.css";

const PtPerformanceModal = ({ ptId, ptName, onClose }) => {
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                setLoading(true);
                const data = await getPtPerformance(ptId);
                setPerformance(data);
            } catch (error) {
                console.error("Error fetching PT performance:", error);
            } finally {
                setLoading(false);
            }
        };

        if (ptId) {
            fetchPerformance();
        }
    }, [ptId]);

    if (!ptId) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content performance-modal">
                <div className="modal-header">
                    <h3>Hiệu suất Huấn luyện viên: {ptName}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {loading ? (
                    <div className="loading-spinner">Đang tải dữ liệu...</div>
                ) : performance ? (
                    <div className="performance-body">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-label">Tổng học viên</span>
                                <span className="stat-value">{performance.totalStudents}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Số buổi dạy</span>
                                <span className="stat-value">{performance.totalSessions}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Đánh giá TB</span>
                                <span className="stat-value">{performance.averageRating?.toFixed(1)} ⭐</span>
                            </div>
                        </div>

                        <div className="feedback-section">
                            <h4>Phản hồi từ học viên ({performance.feedbacks?.length || 0})</h4>
                            <div className="feedback-list">
                                {performance.feedbacks && performance.feedbacks.length > 0 ? (
                                    performance.feedbacks.map((fb, index) => (
                                        <div key={index} className="feedback-item">
                                            <div className="feedback-header">
                                                <span className="member-name">{fb.memberName}</span>
                                                <span className="feedback-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < fb.rating ? "star filled" : "star"}>★</span>
                                                    ))}
                                                </span>
                                            </div>
                                            <p className="feedback-comment">"{fb.comment}"</p>
                                            <span className="feedback-date">
                                                {new Date(fb.date).toLocaleDateString("vi-VN")}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data">Chưa có phản hồi nào.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="error-message">Không thể tải dữ liệu hiệu suất.</p>
                )}

                <div className="modal-actions">
                    <button className="action-btn" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default PtPerformanceModal;
