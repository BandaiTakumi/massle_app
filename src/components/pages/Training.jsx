import './Training.css'
import { useState, useEffect } from 'react'

function Training() {
  const [trainingData, setTrainingData] = useState(null)

  useEffect(() => {
    // localStorageから選択されたトレーニングデータを取得
    const savedTraining = localStorage.getItem('currentTraining')
    if (savedTraining) {
      setTrainingData(JSON.parse(savedTraining))
    }
  }, [])

  return (
    <div className="training-page">
      <h1>トレーニング</h1>
      {trainingData ? (
        <div className="training-content">
          <h2>選択された種目</h2>
          <ul className="training-list">
            {trainingData.exercises.map((exercise) => (
              <li key={exercise.id} className="training-item">
                {exercise.name}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>トレーニングデータがありません</p>
      )}
    </div>
  )
}

export default Training
