import React, { useState, useEffect } from "react";
import { getCurrentCard } from "../../../api/membershipApi";
import { getMemberProgress, toggleExerciseStatus } from "../../../api/memberProgressApi";
import "./workout-progress.css";

const WorkoutProgress = () => {
    const [progress, setProgress] = useState(null);
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Accordion state
    const [expandedRoadmap, setExpandedRoadmap] = useState(null);
    const [expandedSession, setExpandedSession] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const currentCard = await getCurrentCard();
            if (!currentCard) {
                setError("Bạn hiện không có gói tập nào đang hoạt động.");
                return;
            }
            setCard(currentCard);
            const progressData = await getMemberProgress(currentCard.id);
            setProgress(progressData);

            // Tự động mở roadmap đầu tiên
            if (progressData.roadmaps.length > 0) {
                setExpandedRoadmap(progressData.roadmaps[0].roadmapId);
            }
        } catch (err) {
            console.error(err);
            setError("Không thể tải thông tin tiến độ. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (sessionExId) => {
        try {
            await toggleExerciseStatus(card.id, sessionExId);
            // Refresh local state
            const updated = await getMemberProgress(card.id);
            setProgress(updated);
        } catch (err) {
            console.error(err);
            alert("Lỗi khi cập nhật trạng thái bài tập.");
        }
    };

    if (loading) return <div className="loader">Đang tính toán tiến độ...</div>;
    if (error) return (
        <div className="error-panel">
            <span className="icon">⚠️</span>
            <p>{error}</p>
        </div>
    );

    return (
        <div className="workout-progress">
            <header className="progress-header">
                <div className="summary-left">
                    <h1>Tiến độ tập luyện</h1>
                    <p>Gói tập: <strong>{card?.packageName}</strong></p>
                    <div className="stats-row">
                        <div className="stat-box">
                            <span className="label">Đã tập</span>
                            <span className="val">
                                {card?.remainingSessions !== null && card?.remainingSessions !== undefined
                                    ? (card?.maxSessions || 0) - card.remainingSessions 
                                    : 0} buổi
                            </span>
                        </div>
                        <div className="stat-box">
                            <span className="label">Còn lại</span>
                            <span className="val">
                                {card?.remainingSessions !== null && card?.remainingSessions !== undefined 
                                    ? card.remainingSessions 
                                    : (card?.maxSessions || 0)} buổi
                            </span>
                        </div>
                    </div>
                </div>
                <div className="summary-right">
                    <div className="circle-progress">
                        <svg viewBox="0 0 36 36" className="circular-chart">
                            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="circle" strokeDasharray={`${progress.overallPercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <text x="18" y="20.35" className="percentage">{Math.round(progress.overallPercentage)}%</text>
                        </svg>
                    </div>
                    <span className="progress-label">Tổng thể</span>
                </div>
            </header>

            {/* Thống kê theo loại bài tập */}
            <div className="category-stats-grid">
                {progress.categories.map(cat => (
                    <div key={cat.categoryName} className="category-card">
                        <div className="cat-top">
                            <span className="cat-name">{cat.categoryName}</span>
                            <span className="cat-pct">{Math.round(cat.percentage)}%</span>
                        </div>
                        <div className="mini-progress-bar">
                            <div className="fill" style={{ width: `${cat.percentage}%` }}></div>
                        </div>
                        <span className="cat-count">Hoàn thành {cat.completedExercises}/{cat.totalExercises} bài</span>
                    </div>
                ))}
            </div>

            <div className="roadmaps-container">
                <h2 className="section-title">Chi tiết lộ trình</h2>
                
                {(!progress.roadmaps || progress.roadmaps.length === 0) && (
                    <div className="empty-roadmap-message" style={{ textAlign: "center", padding: "2rem", color: "#a0a0a0" }}>
                        <p>Chưa có lộ trình nào được thiết lập cho gói tập này trong cơ sở dữ liệu.</p>
                        <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Vui lòng liên hệ Admin hoặc PT để bổ sung lộ trình.</p>
                    </div>
                )}

                {progress.roadmaps && progress.roadmaps.map((rm, rmIdx) => (
                    <div key={rm.roadmapId} className={`roadmap-accordion ${expandedRoadmap === rm.roadmapId ? 'open' : ''}`}>
                        <div className="roadmap-header-row" onClick={() => setExpandedRoadmap(expandedRoadmap === rm.roadmapId ? null : rm.roadmapId)}>
                            <div className="rm-title-group">
                                <div className="rm-title">
                                    <span className="index">Lộ trình {rmIdx + 1}</span>
                                    <h3>{rm.name}</h3>
                                </div>
                                <div className="roadmap-main-bar">
                                    <div className="bar-bg">
                                        <div className="bar-fill" style={{ width: `${rm.percentage}%` }}></div>
                                    </div>
                                    <span className="bar-val">{Math.round(rm.percentage)}%</span>
                                </div>
                            </div>
                            <span className="arrow">{expandedRoadmap === rm.roadmapId ? '▼' : '▶'}</span>
                        </div>

                        {expandedRoadmap === rm.roadmapId && (
                            <div className="roadmap-content">
                                {rm.sessionProgresses.map((sess, sIdx) => (
                                    <div key={sess.sessionId} className={`session-section ${expandedSession === sess.sessionId ? 'open' : ''}`}>
                                        <div className="session-title-row" onClick={() => setExpandedSession(expandedSession === sess.sessionId ? null : sess.sessionId)}>
                                            <div className="sess-info">
                                                <h4>{sess.name}</h4>
                                                <div className="sess-progress-mini">
                                                    <div className="mini-bar">
                                                        <div className="mini-fill" style={{ width: `${sess.percentage}%` }}></div>
                                                    </div>
                                                    <span className="pct">{Math.round(sess.percentage)}%</span>
                                                </div>
                                            </div>
                                            <span className="count">{sess.completedExercises}/{sess.totalExercises} bài</span>
                                        </div>

                                        {(expandedSession === sess.sessionId || sess.exercises.some(e => !e.isCompleted)) && (
                                            <div className="exercises-list">
                                                {sess.exercises.map(ex => (
                                                    <div key={ex.sessionExerciseId} className={`exercise-row ${ex.isCompleted ? 'completed' : ''}`}>
                                                        <div className="check-box" onClick={() => handleToggle(ex.sessionExerciseId)}>
                                                            {ex.isCompleted ? '✓' : ''}
                                                        </div>
                                                        <div className="ex-info">
                                                            <h5>{ex.exerciseName}</h5>
                                                            <div className="ex-details">
                                                                <span>{ex.categoryName}</span>
                                                                <span>•</span>
                                                                <span>{ex.sets} Hiệp</span>
                                                                <span>•</span>
                                                                <span>{ex.reps} {ex.categoryName === 'Cardio' ? 'Phút' : 'Lần'}</span>
                                                                <span className={`lvl-badge ${ex.levelName}`}>{ex.levelName}</span>
                                                            </div>
                                                            {ex.completedAt && <p className="completed-time">Đã hoàn thành lúc: {ex.completedAt}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkoutProgress;
