import React, { useState, useEffect } from 'react';
import {
    getCategories, createCategory, deleteCategory,
    getExercisesByCategory, createExercise, deleteExercise,
    getLevelsByExercise, createLevel, deleteLevel
} from '../../../api/adminExerciseApi';
import AdminLayout from '../layout/AdminLayout';
import './exerciseCatalog.css';

const ExerciseCatalog = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [levels, setLevels] = useState([]);

    const [newCategoryName, setNewCategoryName] = useState('');
    const [newExName, setNewExName] = useState('');
    const [newExDesc, setNewExDesc] = useState('');
    const [newLevel, setNewLevel] = useState({ levelName: 'LOW', sets: 3, reps: 12 });

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
        setLevels(res.data);
    };

    const handleAddCategory = async () => {
        if (!newCategoryName) return;
        await createCategory({ name: newCategoryName });
        setNewCategoryName('');
        fetchCategories();
    };

    const handleAddExercise = async () => {
        if (!newExName || !selectedCategory) return;
        await createExercise(selectedCategory.id, { name: newExName, description: newExDesc });
        setNewExName('');
        setNewExDesc('');
        handleSelectCategory(selectedCategory);
    };

    const handleAddLevel = async () => {
        if (!selectedExercise) return;
        await createLevel(selectedExercise.id, newLevel);
        handleSelectExercise(selectedExercise);
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

    return (
        <AdminLayout>
            <div className="exercise-catalog">
                <header className="catalog-header">
                    <h1>💪 Exercise Catalog</h1>
                    <p>Quản lý thư viện bài tập chuẩn cho toàn hệ thống</p>
                </header>

                <div className="catalog-grid">
                    {/* CỘT 1: CATEGORIES */}
                    <div className="catalog-column">
                        <div className="column-header">
                            <h3>1. Danh mục</h3>
                            <div className="add-box">
                                <input
                                    placeholder="Tên loại..."
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                />
                                <button onClick={handleAddCategory}>+</button>
                            </div>
                        </div>
                        <div className="item-list">
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    className={`list-item ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                                    onClick={() => handleSelectCategory(cat)}
                                >
                                    <span>{cat.name}</span>
                                    <button className="del-btn" onClick={(e) => { e.stopPropagation(); handleDeleteCat(cat.id); }}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CỘT 2: EXERCISES */}
                    <div className="catalog-column">
                        <div className="column-header">
                            <h3>2. Bài tập mẫu {selectedCategory && `(${selectedCategory.name})`}</h3>
                            {selectedCategory && (
                                <div className="add-box-vertical">
                                    <input placeholder="Tên bài tập..." value={newExName} onChange={e => setNewExName(e.target.value)} />
                                    <textarea placeholder="Mô tả ngắn..." value={newExDesc} onChange={e => setNewExDesc(e.target.value)} />
                                    <button onClick={handleAddExercise}>Thêm bài tập</button>
                                </div>
                            )}
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
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* CỘT 3: LEVELS */}
                    <div className="catalog-column">
                        <div className="column-header">
                            <h3>3. Mức độ {selectedExercise && `(${selectedExercise.name})`}</h3>
                            {selectedExercise && (
                                <div className="add-box-horizontal">
                                    <select value={newLevel.levelName} onChange={e => setNewLevel({ ...newLevel, levelName: e.target.value })}>
                                        <option value="LOW">Thấp</option>
                                        <option value="MEDIUM">Trung bình</option>
                                        <option value="HIGH">Cao</option>
                                    </select>
                                    <input type="number" value={newLevel.sets} onChange={e => setNewLevel({ ...newLevel, sets: e.target.value })} />
                                    <input type="number" value={newLevel.reps} onChange={e => setNewLevel({ ...newLevel, reps: e.target.value })} />
                                    <button onClick={handleAddLevel}>Lưu</button>
                                </div>
                            )}
                        </div>
                        <div className="item-list">
                            {!selectedExercise ? <p className="empty-msg">Chọn bài tập để xem mức độ</p> :
                                levels.map(lvl => (
                                    <div key={lvl.id} className="list-item level-item">
                                        <span className={`badge ${lvl.levelName}`}>{lvl.levelName}</span>
                                        <div className="lvl-stats">
                                            <span><strong>{lvl.sets}</strong> Hiệp</span>
                                            <span><strong>{lvl.reps}</strong> Lần</span>
                                        </div>
                                        <button className="del-btn" onClick={() => deleteLevel(lvl.id).then(() => handleSelectExercise(selectedExercise)).catch(err => alert(err.response?.data || 'Lỗi khi xóa mức độ!'))}>×</button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ExerciseCatalog;
