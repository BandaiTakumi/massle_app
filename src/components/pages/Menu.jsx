import "./Menu.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import exercisesDataJson from "../../data/exercises.json";

function Menu() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem("selectedCategory") || "胸";
  });
  const [selectedExercises, setSelectedExercises] = useState(() => {
    const stored = localStorage.getItem("selectedExercises");
    return stored ? JSON.parse(stored) : [];
  });
  const [exercisesData, setExercisesData] = useState([]);

  // localStorageからexercisesデータを読み込む（初回はJSONから）
  useEffect(() => {
    const storedExercises = localStorage.getItem("exercises");
    if (storedExercises) {
      setExercisesData(JSON.parse(storedExercises));
    } else {
      // 初回読み込み時はJSONファイルからlocalStorageに保存
      localStorage.setItem("exercises", JSON.stringify(exercisesDataJson));
      setExercisesData(exercisesDataJson);
    }
  }, []);

  const categories = ["胸", "肩", "腕", "脚", "腹筋", "背中"];

  useEffect(() => {
    localStorage.setItem("selectedCategory", selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem("selectedExercises", JSON.stringify(selectedExercises));
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
    localStorage.setItem('currentTraining', JSON.stringify(trainingData));
    
    // トレーニングボタンを表示するフラグを設定
    localStorage.setItem('hasTraining', 'true');
    
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
      localStorage.setItem("exercises", JSON.stringify(updatedExercises));
      // 選択リストからも削除
      setSelectedExercises((prev) => prev.filter((id) => id !== exerciseId));
      
      // トレーニングデータからも削除
      const currentTraining = localStorage.getItem('currentTraining');
      if (currentTraining) {
        const trainingData = JSON.parse(currentTraining);
        const updatedTrainingExercises = trainingData.exercises.filter(
          (exercise) => exercise.id !== exerciseId
        );
        if (updatedTrainingExercises.length > 0) {
          trainingData.exercises = updatedTrainingExercises;
          localStorage.setItem('currentTraining', JSON.stringify(trainingData));
        } else {
          // トレーニング種目が全て削除された場合
          localStorage.removeItem('currentTraining');
          localStorage.removeItem('currentTrainingRecords');
          localStorage.removeItem('hasTraining');
        }
      }
      
      // currentTrainingRecordsからも削除
      const currentRecords = localStorage.getItem('currentTrainingRecords');
      if (currentRecords) {
        const records = JSON.parse(currentRecords);
        delete records[exerciseId];
        localStorage.setItem('currentTrainingRecords', JSON.stringify(records));
      }
    }
  };

  return (
    <div className="menu-page">
      <div className="category-buttons">
        {categories.map((category) => (
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
            {/* ごみ箱のsvgアイコン */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              
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
