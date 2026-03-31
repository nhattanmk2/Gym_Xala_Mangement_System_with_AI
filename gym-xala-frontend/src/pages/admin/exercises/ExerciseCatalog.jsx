import React, { useState, useEffect } from 'react';
import {
    getCategories, createCategory, updateCategory, deleteCategory,
    getExercisesByCategory, createExercise, updateExercise, deleteExercise,
    getLevelsByExercise, createLevel, updateLevel, deleteLevel
} from '../../../api/adminExerciseApi';
import AdminLayout from '../layout/AdminLayout';
import './exerciseCatalog.css';

const ExerciseCatalog = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [levels, setLevels] = useState([]);

    const [levelEdits, setLevelEdits] = useState({}); // { levelId: { sets, reps } }

    
    // Modal states
    const [showCatModal, setShowCatModal] = useState(false);
    const [showExModal, setShowExModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [catForm, setCatForm] = useState({ name: '', description: '' });
    const [exForm, setExForm] = useState({ name: '', description: '', equipmentId: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await getCategories();
        setCategories(res.data);
    };

    const handleSelectCategory = async (cat) => {
        setSelectedCategory(cat);
        setSelectedExercise(null);
        setLevels([]);
        const res = await getExercisesByCategory(cat.id);
        setExercises(res.data);
    };

    const handleSelectExercise = async (ex) => {
        setSelectedExercise(ex);
        const res = await getLevelsByExercise(ex.id);
        const fetchedLevels = res.data;
        setLevels(fetchedLevels);
        
        // Initialize levelEdits with current values
        const edits = {};
        fetchedLevels.forEach(lvl => {
            edits[lvl.id] = { sets: lvl.sets, reps: lvl.reps };
        });
        setLevelEdits(edits);
    };

    const handleOpenCatModal = (cat = null) => {
        if (cat) {
            setEditMode(true);
            setEditId(cat.id);
            setCatForm({ name: cat.name, description: cat.description || '' });
        } else {
            setEditMode(false);
            setEditId(null);
            setCatForm({ name: '', description: '' });
        }
        setShowCatModal(true);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await updateCategory(editId, catForm);
            } else {
                await createCategory(catForm);
            }
            setShowCatModal(false);
            fetchCategories();
        } catch (error) {
            alert(error.response?.data || 'Lỗi khi lưu danh mục!');
        }
    };

    const handleOpenExModal = (ex = null) => {
        if (ex) {
            setEditMode(true);
            setEditId(ex.id);
            setExForm({ name: ex.name, description: ex.description || '', equipmentId: ex.equipment?.id || '' });
        } else {
            setEditMode(false);
            setEditId(null);
            setExForm({ name: '', description: '', equipmentId: '' });
        }
        setShowExModal(true);
    };

    const handleSaveExercise = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await updateExercise(editId, exForm);
            } else {
                await createExercise(selectedCategory.id, exForm);
            }
            setShowExModal(false);
            handleSelectCategory(selectedCategory);
        } catch (error) {
            alert(error.response?.data || 'Lỗi khi lưu bài tập!');
        }
    };

    const handleUpdateLevel = async (lvlId) => {
        try {
            const editData = levelEdits[lvlId];
            await updateLevel(lvlId, editData);
            alert('Cập nhật mức độ thành công!');
            handleSelectExercise(selectedExercise);
        } catch (error) {
            alert(error.response?.data || 'Lỗi khi cập nhật mức độ!');
        }
    };

    const updateLevelField = (lvlId, field, delta) => {
        const currentVal = levelEdits[lvlId]?.[field] || 0;
        const newVal = Math.max(1, currentVal + delta);
        setLevelEdits({
            ...levelEdits,
            [lvlId]: { ...levelEdits[lvlId], [field]: newVal }
        });
    };

    const handleDeleteCat = async (id) => {
        if (window.confirm('Xóa danh mục này?')) {
            try {
                await deleteCategory(id);
                fetchCategories();
                setSelectedCategory(null);
            } catch (error) {
                alert(error.response?.data || 'Có lỗi xảy ra khi xóa danh mục!');
            }
        }
    };

    const handleDeleteEx = async (id) => {
        if (window.confirm('Xóa bài tập này?')) {
            try {
                await deleteExercise(id);
                handleSelectCategory(selectedCategory);
                setSelectedExercise(null);
            } catch (error) {
                alert(error.response?.data || 'Có lỗi xảy ra khi xóa bài tập!');
            }
        }
    };

    return (
        <AdminLayout>
            <div className="exercise-catalog">
                <header className="catalog-header">
                    <h1>💪 Exercise Catalog</h1>
                    <p>Quản lý thư viện bài tập chuẩn cho toàn hệ thống</p>
                </header>

                <div className="catalog-grid">
                    <div className="catalog-column">
                        <div className="column-header">
                            <div className="header-flex">
                                <h3>1. Danh mục</h3>
                                <button className="add-btn-circle" onClick={() => handleOpenCatModal()}>+</button>
                            </div>
                        </div>
                        <div className="item-list">
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    className={`list-item ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                                    onClick={() => handleSelectCategory(cat)}
                                >
                                    <div className="item-info">
                                        <span>{cat.name}</span>
                                        {cat.description && <p>{cat.description}</p>}
                                    </div>
                                    <div className="item-actions">
                                        <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleOpenCatModal(cat); }}>✏️</button>
                                        <button className="del-btn" onClick={(e) => { e.stopPropagation(); handleDeleteCat(cat.id); }}>×</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CỘT 2: EXERCISES */}
                    <div className="catalog-column">
                        <div className="column-header">
                            <div className="header-flex">
                                <h3>2. Bài tập mẫu {selectedCategory && `(${selectedCategory.name})`}</h3>
                                {selectedCategory && <button className="add-btn-circle" onClick={() => handleOpenExModal()}>+</button>}
                            </div>
                        </div>
                        <div className="item-list">
                            {!selectedCategory ? <p className="empty-msg">Chọn danh mục để xem</p> :
                                exercises.map(ex => (
                                    <div
                                        key={ex.id}
                                        className={`list-item ${selectedExercise?.id === ex.id ? 'active' : ''}`}
                                        onClick={() => handleSelectExercise(ex)}
                                    >
                                        <div className="item-info">
                                            <strong>{ex.name}</strong>
                                            <p>{ex.description}</p>
                                        </div>
                                        <div className="item-actions">
                                            <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleOpenExModal(ex); }}>✏️</button>
                                            <button className="del-btn" onClick={(e) => { e.stopPropagation(); handleDeleteEx(ex.id); }}>×</button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* CỘT 3: LEVELS */}
                    <div className="catalog-column">
                        <div className="column-header">
                            <div className="header-flex">
                                <h3>3. Mức độ {selectedExercise && `(${selectedExercise.name})`}</h3>
                            </div>
                        </div>
                        <div className="item-list">
                            {!selectedExercise ? <p className="empty-msg">Chọn bài tập để xem mức độ</p> :
                                levels.sort((a, b) => {
                                    const order = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
                                    return order[a.levelName] - order[b.levelName];
                                }).map(lvl => (
                                    <div key={lvl.id} className="list-item level-edit-item">
                                        <div className="level-info-row">
                                            <div className="badge-container">
                                                <span className={`badge ${lvl.levelName}`}>
                                                    {lvl.levelName === 'LOW' ? 'Thấp' : lvl.levelName === 'MEDIUM' ? 'T.Bình' : 'Cao'}
                                                </span>
                                            </div>
                                            <div className="level-inputs">
                                                <div className="input-with-label">
                                                    <label>Hiệp</label>
                                                    <div className="number-stepper">
                                                        <button onClick={() => updateLevelField(lvl.id, 'sets', -1)}>-</button>
                                                        <input 
                                                            type="number" 
                                                            value={levelEdits[lvl.id]?.sets || ''} 
                                                            onChange={e => setLevelEdits({
                                                                ...levelEdits,
                                                                [lvl.id]: { ...levelEdits[lvl.id], sets: parseInt(e.target.value) || 0 }
                                                            })}
                                                        />
                                                        <button onClick={() => updateLevelField(lvl.id, 'sets', 1)}>+</button>
                                                    </div>
                                                </div>
                                                <div className="input-with-label">
                                                    <label>Lần</label>
                                                    <div className="number-stepper">
                                                        <button onClick={() => updateLevelField(lvl.id, 'reps', -1)}>-</button>
                                                        <input 
                                                            type="number" 
                                                            value={levelEdits[lvl.id]?.reps || ''} 
                                                            onChange={e => setLevelEdits({
                                                                ...levelEdits,
                                                                [lvl.id]: { ...levelEdits[lvl.id], reps: parseInt(e.target.value) || 0 }
                                                            })}
                                                        />
                                                        <button onClick={() => updateLevelField(lvl.id, 'reps', 1)}>+</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="save-btn-container">
                                                <button className="lvl-save-btn" onClick={() => handleUpdateLevel(lvl.id)}>Lưu</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DANH MỤC */}
            {showCatModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editMode ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
                            <button className="close-btn" onClick={() => setShowCatModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveCategory}>
                            <div className="form-group">
                                <label>Tên danh mục *</label>
                                <input
                                    type="text"
                                    value={catForm.name}
                                    onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                                    required
                                    placeholder="VD: Cardio, Sức mạnh..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả (không bắt buộc)</label>
                                <textarea
                                    value={catForm.description}
                                    onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                                    placeholder="Mô tả ngắn về danh mục..."
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowCatModal(false)}>Hủy</button>
                                <button type="submit" className="btn-primary">{editMode ? 'Lưu thay đổi' : 'Thêm mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL BÀI TẬP */}
            {showExModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editMode ? 'Sửa bài tập' : 'Thêm bài tập mẫu'}</h3>
                            <button className="close-btn" onClick={() => setShowExModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveExercise}>
                            <div className="form-group">
                                <label>Danh mục: <strong>{selectedCategory.name}</strong></label>
                            </div>
                            <div className="form-group">
                                <label>Tên bài tập *</label>
                                <input
                                    type="text"
                                    value={exForm.name}
                                    onChange={e => setExForm({ ...exForm, name: e.target.value })}
                                    required
                                    placeholder="VD: Push up, Squat..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả chi tiết *</label>
                                <textarea
                                    value={exForm.description}
                                    onChange={e => setExForm({ ...exForm, description: e.target.value })}
                                    required
                                    placeholder="Hướng dẫn thực hiện bài tập..."
                                    rows="4"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowExModal(false)}>Hủy</button>
                                <button type="submit" className="btn-primary">{editMode ? 'Lưu thay đổi' : 'Thêm mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ExerciseCatalog;
