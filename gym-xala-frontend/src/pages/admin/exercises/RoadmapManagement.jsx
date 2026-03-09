import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getRoadmapsByPackage, createRoadmap, deleteRoadmap,
    createSession, deleteSession,
    addExerciseToSession, removeExerciseFromSession
} from '../../../api/adminRoadmapApi';
import { getCategories, getExercisesByCategory, getLevelsByExercise } from '../../../api/adminExerciseApi';
import AdminLayout from '../layout/AdminLayout';
import './roadmapManagement.css';

const RoadmapManagement = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [showAddRoadmap, setShowAddRoadmap] = useState(false);
    const [newRoadmap, setNewRoadmap] = useState({ name: '', description: '', orderIndex: 1 });

    // Exercise Selection states
    const [showExPicker, setShowExPicker] = useState(null); // sessionId
    const [pickerData, setPickerData] = useState({ categories: [], exercises: [], levels: [] });
    const [selectedCat, setSelectedCat] = useState('');
    const [selectedEx, setSelectedEx] = useState('');

    useEffect(() => {
        fetchRoadmaps();
        fetchPickerCategories();
    }, [packageId]);

    const fetchRoadmaps = async () => {
        try {
            const res = await getRoadmapsByPackage(packageId);
            setRoadmaps(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPickerCategories = async () => {
        const res = await getCategories();
        setPickerData(prev => ({ ...prev, categories: res.data }));
    };

    const handleCatChange = async (catId) => {
        setSelectedCat(catId);
        setSelectedEx('');
        const res = await getExercisesByCategory(catId);
        setPickerData(prev => ({ ...prev, exercises: res.data, levels: [] }));
    };

    const handleExChange = async (exId) => {
        setSelectedEx(exId);
        const res = await getLevelsByExercise(exId);
        setPickerData(prev => ({ ...prev, levels: res.data }));
    };

    const handleAddRoadmap = async () => {
        await createRoadmap(packageId, newRoadmap);
        setShowAddRoadmap(false);
        fetchRoadmaps();
    };

    const handleAddSession = async (roadmapId) => {
        const name = prompt("Tên buổi tập (VD: Buổi 1: Ngực):");
        if (!name) return;
        await createSession(roadmapId, { name, orderIndex: 1 });
        fetchRoadmaps();
    };

    const handleAddExerciseToSession = async (sessionId, levelId) => {
        await addExerciseToSession(sessionId, { exerciseLevel: { id: levelId }, orderIndex: 1 });
        setShowExPicker(null);
        fetchRoadmaps();
    };

    return (
        <AdminLayout>
            <div className="roadmap-mgmt">
                <header className="mgmt-header">
                    <button className="back-btn" onClick={() => navigate('/admin/packages')}>← Quay lại</button>
                    <h1>Thiết lập lộ trình Gói tập #{packageId}</h1>
                    <button className="add-btn" onClick={() => setShowAddRoadmap(true)}>+ Thêm Lộ trình</button>
                </header>

                {showAddRoadmap && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Tạo lộ trình mới</h3>
                            <input placeholder="Tên lộ trình..." value={newRoadmap.name} onChange={e => setNewRoadmap({ ...newRoadmap, name: e.target.value })} />
                            <textarea placeholder="Mô tả..." value={newRoadmap.description} onChange={e => setNewRoadmap({ ...newRoadmap, description: e.target.value })} />
                            <div className="modal-btns">
                                <button onClick={handleAddRoadmap}>Lưu</button>
                                <button className="cancel" onClick={() => setShowAddRoadmap(false)}>Hủy</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="roadmap-list">
                    {roadmaps.map(rm => (
                        <div key={rm.id} className="roadmap-card">
                            <div className="roadmap-info">
                                <h2>{rm.name}</h2>
                                <p>{rm.description}</p>
                                <button className="add-session-btn" onClick={() => handleAddSession(rm.id)}>+ Thêm Buổi tập</button>
                                <button className="del-btn-text" onClick={() => deleteRoadmap(rm.id).then(fetchRoadmaps)}>Xóa lộ trình</button>
                            </div>

                            <div className="sessions-grid">
                                {rm.sessions?.map(sess => (
                                    <div key={sess.id} className="session-item">
                                        <div className="sess-head">
                                            <h4>{sess.name}</h4>
                                            <button className="del-small" onClick={() => deleteSession(sess.id).then(fetchRoadmaps)}>×</button>
                                        </div>
                                        <div className="sess-exercises">
                                            {sess.exercises?.map(ex => (
                                                <div key={ex.id} className="ex-tag">
                                                    <span>{ex.exerciseLevel.standardExercise.name} ({ex.exerciseLevel.levelName})</span>
                                                    <button onClick={() => removeExerciseFromSession(ex.id).then(fetchRoadmaps)}>×</button>
                                                </div>
                                            ))}
                                            <button className="add-ex-btn" onClick={() => setShowExPicker(sess.id)}>+ Thêm bài tập</button>
                                        </div>

                                        {showExPicker === sess.id && (
                                            <div className="ex-picker">
                                                <select value={selectedCat} onChange={e => handleCatChange(e.target.value)}>
                                                    <option value="">Chọn loại...</option>
                                                    {pickerData.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                                <select value={selectedEx} onChange={e => handleExChange(e.target.value)} disabled={!selectedCat}>
                                                    <option value="">Chọn bài tập...</option>
                                                    {pickerData.exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                                </select>
                                                <div className="level-options">
                                                    {pickerData.levels.map(l => (
                                                        <button key={l.id} onClick={() => handleAddExerciseToSession(sess.id, l.id)}>
                                                            {l.levelName} ({l.sets}x{l.reps})
                                                        </button>
                                                    ))}
                                                </div>
                                                <button className="close-picker" onClick={() => setShowExPicker(null)}>Đóng</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default RoadmapManagement;
