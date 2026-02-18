import "./AddMenu.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import exercisesData from "../../data/exercises.json";
import { DEFAULT_CATEGORIES } from "../../utils/constants";
import { getExercises, setExercises } from "../../utils/storageUtils";

function AddMenu() {
  const navigate = useNavigate();
  const [menuName, setMenuName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const handleRegister = () => {
    if (!menuName.trim() || selectedCategories.length === 0) {
      alert("種目名と部位を選択してください");
      return;
    }

    // localStorageから既存のデータを取得
    const storedExercises = getExercises();
    const exercisesToUse = storedExercises.length > 0 ? storedExercises : exercisesData;

    // 新しいIDを生成（既存の最大ID + 1）
    const newId = Math.max(...exercisesToUse.map((ex) => ex.id), 0) + 1;

    const newExercise = {
      id: newId,
      name: menuName,
      category: selectedCategories,
    };

    // 新しいメニューを追加してlocalStorageに保存
    const updatedExercises = [...exercisesToUse, newExercise];
    setExercises(updatedExercises);

    console.log("新しいメニューを登録:", newExercise);
    alert(`「${menuName}」を登録しました`);
    
    // メニュー画面に戻る
    navigate("/");
  };

  return (
    <div className="add-menu-page">
      <h2>オリジナルメニュー追加</h2>

      <div className="form-section">
        <label className="form-label">種目名</label>
        <input
          type="text"
          className="menu-name-input"
          placeholder="例：プッシュアップ"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
        />
      </div>

      <div className="form-section">
        <label className="form-label">部位選択（複数選択可）</label>
        <div className="category-selection">
          {DEFAULT_CATEGORIES.map((category) => (
            <button
              key={category}
              className={`category-select-button ${selectedCategories.includes(category) ? "selected" : ""}`}
              onClick={() => handleCategoryToggle(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="note-section">
        <p className="note-text">
          ※ 登録したメニューは「メニュー登録」画面に表示されます。
          <br />
          登録したメニュー消費カロリーは1repで0.2kcal固定です
        </p>
      </div>

      <button className="register-button" onClick={handleRegister}>
        登録
      </button>
    </div>
  );
}

export default AddMenu;
