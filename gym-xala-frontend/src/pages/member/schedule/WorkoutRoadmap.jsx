import { useState, useEffect } from "react";
import { getMyRoadmap, toggleExercise } from "../../../api/memberWorkoutApi";
import "./workout-roadmap.css";

const WorkoutRoadmap = () => {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRoadmap();
    }, []);

    const fetchRoadmap = async () => {
        try {
            setLoading(true);
            const data = await getMyRoadmap();
            setRoadmap(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching roadmap:", err);
            setError(err.response?.data?.message || "Bạn chưa có lộ trình tập luyện. Vui lòng đăng ký gói tập để bắt đầu.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (exerciseId) => {
        try {
            await toggleExercise(exerciseId);
            // Update local state for immediate feedback
            setRoadmap(prev => ({
                ...prev,
                exercises: prev.exercises.map(ex =>
                    ex.id === exerciseId ? { ...ex, isCompleted: !ex.isCompleted } : ex
                )
            }));
        } catch (err) {
            console.error("Error toggling exercise:", err);
            alert("Không thể cập nhật trạng thái bài tập.");
        }
    };

    if (loading) return <div className="loader-container">Đang tải lộ trình...</div>;

    if (error) return (
        <div className="error-state">
            <div className="error-icon">📋</div>
            <h3>{error}</h3>
            <p>Liên hệ Admin hoặc PT nếu bạn tin đây là một lỗi.</p>
        </div>
    );

    const completedCount = roadmap.exercises.filter(ex => ex.isCompleted).length;
    const progressPercent = roadmap.exercises.length > 0
        ? Math.round((completedCount / roadmap.exercises.length) * 100)
        : 0;

    return (
        <div className="workout-roadmap-container">
            <div className="roadmap-header">
                <div className="header-content">
                    <h1>{roadmap.name}</h1>
                    <p>{roadmap.description}</p>
                </div>
                <div className="progress-section">
                    <div className="progress-info">
                        <span>Tiến độ tập luyện</span>
                        <span className="percent">{progressPercent}%</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <p className="stats">{completedCount}/{roadmap.exercises.length} bài tập đã hoàn thành</p>
                </div>
            </div>

            <div className="exercise-roadmap">
                {roadmap.exercises.map((ex, index) => (
                    <div key={ex.id} className={`exercise-card ${ex.isCompleted ? 'completed' : ''}`}>
                        <div className="card-left">
                            <div className="step-number">{index + 1}</div>
                            <div className="connector"></div>
                        </div>
                        <div className="card-right">
                            <div className="ex-main">
                                <div className="ex-info">
                                    <h3>{ex.name}</h3>
                                    <div className="ex-meta">
                                        <span className="meta-tag sets">{ex.sets} Hiệp</span>
                                        <span className="meta-tag reps">{ex.reps} Lần/Hiệp</span>
                                    </div>
                                    <p className="ex-desc">{ex.description}</p>
                                </div>
                                <button
                                    className={`check-btn ${ex.isCompleted ? 'checked' : ''}`}
                                    onClick={() => handleToggle(ex.id)}
                                >
                                    {ex.isCompleted ? '✓ Hoàn thành' : 'Đánh dấu xong'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkoutRoadmap;
