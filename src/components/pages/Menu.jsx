import "./Menu.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import exercisesDataJson from "../../data/exercises.json";

function Menu() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem("selectedCategory") || "胸";
  });
  const [selectedExercises, setSelectedExercises] = useState([]);
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
    // ここに追加処理を実装（トレーニングページ作成）
  };

  const handleAddOriginalMenu = () => {
    navigate("/add-menu");
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
          <div key={exercise.id} className="exercise-item">
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
