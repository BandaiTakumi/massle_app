import "./Menu.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import exercisesDataJson from "../../data/exercises.json";
import { DEFAULT_CATEGORIES } from "../../utils/constants";
import { TrashIcon } from "../common/Icons";
import {
  getExercises,
  setExercises,
  getSelectedCategory,
  setSelectedCategory as saveSelectedCategory,
  getSelectedExercises,
  setSelectedExercises as saveSelectedExercises,
  setCurrentTraining,
  clearCurrentTraining,
  clearCurrentTrainingRecords,
  clearHasTraining,
  setHasTraining,
  getCurrentTraining,
  getCurrentTrainingRecords,
  setCurrentTrainingRecords
} from "../../utils/storageUtils";

function Menu() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return getSelectedCategory();
  });
  const [selectedExercises, setSelectedExercises] = useState(() => {
    return getSelectedExercises();
  });
  const [exercisesData, setExercisesData] = useState([]);

  // localStorageからexercisesデータを読み込む（初回はJSONから）
  useEffect(() => {
    const storedExercises = getExercises();
    if (storedExercises.length > 0) {
      setExercisesData(storedExercises);
    } else {
      // 初回読み込み時はJSONファイルからlocalStorageに保存
      setExercises(exercisesDataJson);
      setExercisesData(exercisesDataJson);
    }
  }, []);

  useEffect(() => {
    saveSelectedCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    saveSelectedExercises(selectedExercises);
  }, [selectedExercises]);

  const filteredExercises = exercisesData.filter((exercise) =>
    exercise.category.includes(selectedCategory)
  );

  const handleCheckboxChange = (exerciseId) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleAddClick = () => {
    console.log("選択されたトレーニング:", selectedExercises);
    
    // 選択された順番でデータを取得（チェックを入れた順）
    const selectedExercisesData = selectedExercises.map(id => 
      exercisesData.find(exercise => exercise.id === id)
    ).filter(Boolean); // nullやundefinedを除外
    
    // トレーニングデータをlocalStorageに保存
    const trainingData = {
      exercises: selectedExercisesData,
      createdAt: new Date().toISOString(),
    };
    setCurrentTraining(trainingData);
    
    // トレーニングボタンを表示するフラグを設定
    setHasTraining(true);
    
    // トレーニングページに遷移
    navigate('/training');
  };

  const handleAddOriginalMenu = () => {
    navigate("/add-menu");
  };

  const handleDelete = (exerciseId, exerciseName) => {
    const confirmed = window.confirm(`「${exerciseName}」を削除しますか？`);
    if (confirmed) {
      const updatedExercises = exercisesData.filter(
        (exercise) => exercise.id !== exerciseId
      );
      setExercisesData(updatedExercises);
      setExercises(updatedExercises);
      // 選択リストからも削除
      setSelectedExercises((prev) => prev.filter((id) => id !== exerciseId));
      
      // トレーニングデータからも削除
      const currentTraining = getCurrentTraining();
      if (currentTraining) {
        const updatedTrainingExercises = currentTraining.exercises.filter(
          (exercise) => exercise.id !== exerciseId
        );
        if (updatedTrainingExercises.length > 0) {
          currentTraining.exercises = updatedTrainingExercises;
          setCurrentTraining(currentTraining);
        } else {
          // トレーニング種目が全て削除された場合
          clearCurrentTraining();
          clearCurrentTrainingRecords();
          clearHasTraining();
        }
      }
      
      // currentTrainingRecordsからも削除
      const currentRecords = getCurrentTrainingRecords();
      if (currentRecords && currentRecords[exerciseId]) {
        delete currentRecords[exerciseId];
        setCurrentTrainingRecords(currentRecords);
      }
    }
  };

  return (
    <div className="menu-page">
      <div className="category-buttons">
        {DEFAULT_CATEGORIES.map((category) => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? "active" : ""}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <h3>トレーニング一覧 - {selectedCategory}</h3>

      <div className="exercise-list">
        {filteredExercises.map((exercise) => (
          <div 
            key={exercise.id} 
            className="exercise-item"
            onClick={() => handleCheckboxChange(exercise.id)}
          >
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(exercise.id, exercise.name);
              }}
              title="削除"
            >
              <TrashIcon width={16} height={16} />
            </button>
            <span className="exercise-name">{exercise.name}</span>
            <input
              type="checkbox"
              checked={selectedExercises.includes(exercise.id)}
              onChange={() => handleCheckboxChange(exercise.id)}
              className="exercise-checkbox"
            />
          </div>
        ))}
      </div>

      <div className="button-container">
        <button 
          className="original-menu-button" 
          onClick={handleAddOriginalMenu}
        >
          オリジナルメニューの追加
        </button>
        <button 
          className="add-menu-button" 
          onClick={handleAddClick}
          disabled={selectedExercises.length === 0}
        >
          メニューに追加
        </button>
      </div>
    </div>
  );
}

export default Menu;
