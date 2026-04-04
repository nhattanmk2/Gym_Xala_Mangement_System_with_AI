import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getRoadmapsByPackage, createRoadmap, updateRoadmap, reorderRoadmaps, deleteRoadmap,
    createSession, updateSession, reorderSessions, deleteSession,
    addExerciseToSession, removeExerciseFromSession
} from '../../../api/adminRoadmapApi';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getCategories, getExercisesByCategory, getLevelsByExercise } from '../../../api/adminExerciseApi';
import AdminLayout from '../layout/AdminLayout';
import './roadmapManagement.css';

// Sortable Session Item Component
const SortableSessionItem = ({ sess, roadmapId, setEditSession, deleteSession, fetchRoadmaps, removeExerciseFromSession, setShowExPicker, showExPicker, selectedCat, handleCatChange, pickerData, selectedEx, handleExChange, handleAddExerciseToSession }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sess.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : (showExPicker === sess.id ? 50 : 1),
    };

    return (
        <div ref={setNodeRef} style={style} className={`session-item ${isDragging ? 'dragging' : ''}`}>
            <div className="sess-head">
                <div className="drag-handle" {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: '10px' }}>
                    ⠿
                </div>
                <h4 onClick={() => setEditSession(sess)} style={{ cursor: 'pointer', flex: 1 }} title="Bấm để sửa tên">
                    {sess.name} <span style={{ fontSize: '10px', opacity: 0.6 }}>✍️</span>
                </h4>
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
    );
};

// Sortable Roadmap Item Component
const SortableRoadmapItem = ({ rm, setEditRoadmap, handleAddSession, deleteRoadmap, fetchRoadmaps, setEditSession, deleteSession, removeExerciseFromSession, setShowExPicker, showExPicker, selectedCat, handleCatChange, pickerData, selectedEx, handleExChange, handleAddExerciseToSession, handleDragEndSessions, sensors }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rm.id });

    const hasActivePicker = rm.sessions?.some(s => s.id === showExPicker);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : (hasActivePicker ? 50 : 1),
        position: 'relative'
    };

    return (
        <div ref={setNodeRef} style={style} className={`roadmap-card ${isDragging ? 'dragging' : ''}`}>
            <div className="roadmap-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="drag-handle-large" {...attributes} {...listeners} style={{ cursor: 'grab', fontSize: '20px', color: '#94a3b8' }}>
                            ⠿
                        </div>
                        <h2>{rm.name}</h2>
                    </div>
                    <button className="edit-btn-small" onClick={() => setEditRoadmap(rm)}>✍️ Sửa</button>
                </div>
                <p>{rm.description}</p>
                <div className="rm-actions">
                    <button className="add-session-btn" onClick={() => handleAddSession(rm.id)}>+ Thêm Buổi tập</button>
                    <button className="del-btn-text" onClick={() => deleteRoadmap(rm.id).then(fetchRoadmaps)}>Xóa lộ trình</button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEndSessions(rm.id, event)}
            >
                <SortableContext
                    items={rm.sessions?.map(s => s.id) || []}
                    strategy={rectSortingStrategy}
                >
                    <div className="sessions-grid">
                        {rm.sessions?.map(sess => (
                            <SortableSessionItem
                                key={sess.id}
                                sess={sess}
                                roadmapId={rm.id}
                                setEditSession={setEditSession}
                                deleteSession={deleteSession}
                                fetchRoadmaps={fetchRoadmaps}
                                removeExerciseFromSession={removeExerciseFromSession}
                                setShowExPicker={setShowExPicker}
                                showExPicker={showExPicker}
                                selectedCat={selectedCat}
                                handleCatChange={handleCatChange}
                                pickerData={pickerData}
                                selectedEx={selectedEx}
                                handleExChange={handleExChange}
                                handleAddExerciseToSession={handleAddExerciseToSession}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

const RoadmapManagement = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [showAddRoadmap, setShowAddRoadmap] = useState(false);
    const [newRoadmap, setNewRoadmap] = useState({ name: '', description: '', orderIndex: 1 });
    const [editRoadmap, setEditRoadmap] = useState(null); // {id, name, description, orderIndex}
    const [editSession, setEditSession] = useState(null); // {id, name, orderIndex}

    // Exercise Selection states
    const [showExPicker, setShowExPicker] = useState(null); // sessionId
    const [pickerData, setPickerData] = useState({ categories: [], exercises: [], levels: [] });
    const [selectedCat, setSelectedCat] = useState('');
    const [selectedEx, setSelectedEx] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
        // New roadmap default order is end of list
        const order = roadmaps.length + 1;
        await createRoadmap(packageId, { ...newRoadmap, orderIndex: order });
        setShowAddRoadmap(false);
        setNewRoadmap({ name: '', description: '', orderIndex: 1 });
        fetchRoadmaps();
    };

    const handleUpdateRoadmap = async () => {
        if (!editRoadmap) return;
        const payload = {
            name: editRoadmap.name,
            description: editRoadmap.description,
            orderIndex: editRoadmap.orderIndex
        };
        await updateRoadmap(editRoadmap.id, payload);
        setEditRoadmap(null);
        fetchRoadmaps();
    };

    const handleAddSession = async (roadmapId) => {
        const name = prompt("Tên buổi tập (VD: Buổi 1: Ngực):");
        if (!name) return;
        // Find roadmap to get session order
        const rm = roadmaps.find(r => r.id === roadmapId);
        const order = (rm?.sessions?.length || 0) + 1;
        await createSession(roadmapId, { name, orderIndex: order });
        fetchRoadmaps();
    };

    const handleUpdateSession = async () => {
        if (!editSession) return;
        const payload = {
            name: editSession.name,
            orderIndex: editSession.orderIndex
        };
        await updateSession(editSession.id, payload);
        setEditSession(null);
        fetchRoadmaps();
    };

    const handleAddExerciseToSession = async (sessionId, levelId) => {
        await addExerciseToSession(sessionId, { exerciseLevel: { id: levelId }, orderIndex: 1 });
        setShowExPicker(null);
        fetchRoadmaps();
    };

    const handleDragEndRoadmaps = async (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = roadmaps.findIndex((rm) => rm.id === active.id);
            const newIndex = roadmaps.findIndex((rm) => rm.id === over.id);
            const newRoadmaps = arrayMove(roadmaps, oldIndex, newIndex);
            setRoadmaps(newRoadmaps);
            try {
                await reorderRoadmaps(newRoadmaps.map(r => r.id));
            } catch (err) {
                console.error("Failed to reorder roadmaps:", err);
                fetchRoadmaps();
            }
        }
    };

    const handleDragEndSessions = async (roadmapId, event) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        const roadmap = roadmaps.find(rm => rm.id === roadmapId);
        if (!roadmap) return;

        const oldIndex = roadmap.sessions.findIndex((s) => s.id === active.id);
        const newIndex = roadmap.sessions.findIndex((s) => s.id === over.id);
        const newSessions = arrayMove(roadmap.sessions, oldIndex, newIndex);

        const updatedRoadmaps = roadmaps.map(rm =>
            rm.id === roadmapId ? { ...rm, sessions: newSessions } : rm
        );
        setRoadmaps(updatedRoadmaps);
        
        try {
            await reorderSessions(newSessions.map(s => s.id));
        } catch (err) {
            console.error("Failed to reorder sessions:", err);
            fetchRoadmaps();
        }
    };

    if (loading) return <AdminLayout><div className="loading">Đang tải dữ liệu...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="roadmap-mgmt">
                <header className="mgmt-header">
                    <button className="back-btn" onClick={() => navigate('/admin/packages')}>← Quay lại</button>
                    <h1>Thiết lập lộ trình Gói tập #{packageId}</h1>
                </header>

                {showAddRoadmap && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Tạo lộ trình mới</h3>
                            <input 
                                placeholder="Tên lộ trình..." 
                                value={newRoadmap.name} 
                                onChange={e => setNewRoadmap({ ...newRoadmap, name: e.target.value })} 
                            />
                            <textarea 
                                placeholder="Mô tả..." 
                                value={newRoadmap.description} 
                                onChange={e => setNewRoadmap({ ...newRoadmap, description: e.target.value })} 
                            />
                            <div className="modal-btns">
                                <button onClick={handleAddRoadmap}>Lưu</button>
                                <button className="cancel" onClick={() => setShowAddRoadmap(false)}>Hủy</button>
                            </div>
                        </div>
                    </div>
                )}

                {editRoadmap && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Chỉnh sửa lộ trình</h3>
                            <input 
                                placeholder="Tên lộ trình..." 
                                value={editRoadmap.name} 
                                onChange={e => setEditRoadmap({ ...editRoadmap, name: e.target.value })} 
                            />
                            <textarea 
                                placeholder="Mô tả..." 
                                value={editRoadmap.description} 
                                onChange={e => setEditRoadmap({ ...editRoadmap, description: e.target.value })} 
                            />
                            <div className="modal-btns">
                                <button onClick={handleUpdateRoadmap}>Cập nhật</button>
                                <button className="cancel" onClick={() => setEditRoadmap(null)}>Hủy</button>
                            </div>
                        </div>
                    </div>
                )}

                {editSession && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Chỉnh sửa buổi tập</h3>
                            <input 
                                placeholder="Tên buổi..." 
                                value={editSession.name} 
                                onChange={e => setEditSession({ ...editSession, name: e.target.value })} 
                            />
                            <div className="modal-btns">
                                <button onClick={handleUpdateSession}>Cập nhật</button>
                                <button className="cancel" onClick={() => setEditSession(null)}>Hủy</button>
                            </div>
                        </div>
                    </div>
                )}

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndRoadmaps}
                >
                    <SortableContext
                        items={roadmaps.map(r => r.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="roadmap-list">
                            {roadmaps.map(rm => (
                                <SortableRoadmapItem
                                    key={rm.id}
                                    rm={rm}
                                    setEditRoadmap={setEditRoadmap}
                                    handleAddSession={handleAddSession}
                                    deleteRoadmap={deleteRoadmap}
                                    fetchRoadmaps={fetchRoadmaps}
                                    setEditSession={setEditSession}
                                    deleteSession={deleteSession}
                                    removeExerciseFromSession={removeExerciseFromSession}
                                    setShowExPicker={setShowExPicker}
                                    showExPicker={showExPicker}
                                    selectedCat={selectedCat}
                                    handleCatChange={handleCatChange}
                                    pickerData={pickerData}
                                    selectedEx={selectedEx}
                                    handleExChange={handleExChange}
                                    handleAddExerciseToSession={handleAddExerciseToSession}
                                    handleDragEndSessions={handleDragEndSessions}
                                    sensors={sensors}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <div className="add-roadmap-bottom" style={{ marginTop: '30px', textAlign: 'center', padding: '40px 0' }}>
                    <button className="add-btn large" onClick={() => setShowAddRoadmap(true)}>
                        + Thêm Lộ trình Mới
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default RoadmapManagement;
