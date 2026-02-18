import './Training.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Training() {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState([])
  const [exerciseRecords, setExerciseRecords] = useState({})

  useEffect(() => {
    // localStorageから選択されたトレーニングデータを取得
    const savedTraining = localStorage.getItem('currentTraining')
    if (savedTraining) {
      const trainingData = JSON.parse(savedTraining)
      setExercises(trainingData.exercises)
      
      // 保存されている入力データを復元
      const savedRecords = localStorage.getItem('currentTrainingRecords')
      let records = {}
      
      if (savedRecords) {
        records = JSON.parse(savedRecords)
      }
      
      // すべての種目に対して初期セットを確保
      trainingData.exercises.forEach(exercise => {
        if (!records[exercise.id] || records[exercise.id].length === 0) {
          records[exercise.id] = [
            { setNumber: 1, weight: '', reps: '' }
          ]
        }
      })
      
      setExerciseRecords(records)
    }
  }, [])

  // exerciseRecordsが変更されたらlocalStorageに保存
  useEffect(() => {
    if (Object.keys(exerciseRecords).length > 0) {
      localStorage.setItem('currentTrainingRecords', JSON.stringify(exerciseRecords))
    }
  }, [exerciseRecords])

  // 前回の記録を取得
  const getPreviousRecord = (exerciseId, setNumber) => {
    const history = JSON.parse(localStorage.getItem('trainingHistory') || '[]')
    const previousSession = history.find(session => 
      session.exercises.some(ex => ex.id === exerciseId)
    )
    
    if (previousSession) {
      const previousExercise = previousSession.exercises.find(ex => ex.id === exerciseId)
      const previousSet = previousExercise?.sets?.[setNumber - 1]
      return previousSet || null
    }
    return null
  }

  // セットの入力を更新
  const updateSet = (exerciseId, setIndex, field, value) => {
    setExerciseRecords(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, idx) =>
        idx === setIndex ? { ...set, [field]: value } : set
      )
    }))
  }

  // セットを追加
  const addSet = (exerciseId) => {
    setExerciseRecords(prev => {
      const currentSets = prev[exerciseId] || []
      const newSetNumber = currentSets.length + 1
      return {
        ...prev,
        [exerciseId]: [...currentSets, { setNumber: newSetNumber, weight: '', reps: '' }]
      }
    })
  }

  // セットを削除
  const removeSet = (exerciseId, setIndex) => {
    setExerciseRecords(prev => {
      const currentSets = prev[exerciseId] || []
      // 最後の1セットは削除しない
      if (currentSets.length <= 1) {
        return prev
      }
      const updatedSets = currentSets.filter((_, idx) => idx !== setIndex)
      // セット番号を振り直す
      const renumberedSets = updatedSets.map((set, idx) => ({
        ...set,
        setNumber: idx + 1
      }))
      return {
        ...prev,
        [exerciseId]: renumberedSets
      }
    })
  }

  // 種目を削除（ページから削除のみ）
  const removeExercise = (exerciseId) => {
    const exercise = exercises.find(ex => ex.id === exerciseId)
    const confirmed = window.confirm(`「${exercise.name}」を削除しますか？`)
    if (confirmed) {
      const updatedExercises = exercises.filter(ex => ex.id !== exerciseId)
      setExercises(updatedExercises)
      
      // exerciseRecordsからも削除
      setExerciseRecords(prev => {
        const updated = { ...prev }
        delete updated[exerciseId]
        return updated
      })
      
      // localStorageのcurrentTrainingを更新
      const currentTraining = localStorage.getItem('currentTraining')
      if (currentTraining) {
        const trainingData = JSON.parse(currentTraining)
        trainingData.exercises = updatedExercises
        localStorage.setItem('currentTraining', JSON.stringify(trainingData))
      }
      
      // currentTrainingRecordsも更新
      const savedRecords = localStorage.getItem('currentTrainingRecords')
      if (savedRecords) {
        const records = JSON.parse(savedRecords)
        delete records[exerciseId]
        localStorage.setItem('currentTrainingRecords', JSON.stringify(records))
      }
      
      // メニュー登録画面の選択状態からも削除
      const selectedExercises = JSON.parse(localStorage.getItem('selectedExercises') || '[]')
      const updatedSelection = selectedExercises.filter(id => id !== exerciseId)
      localStorage.setItem('selectedExercises', JSON.stringify(updatedSelection))
    }
  }

  // 種目を完了（確認なしで削除）
  const completeExercise = (exerciseId) => {
    const exercise = exercises.find(ex => ex.id === exerciseId)
    const sets = exerciseRecords[exerciseId] || []
    
    // 完了データを保存
    const completedData = {
      id: exerciseId,
      name: exercise.name,
      sets: sets.filter(set => set.weight || set.reps),
      completedAt: new Date().toISOString()
    }
    
    const completed = JSON.parse(localStorage.getItem('completedExercises') || '[]')
    completed.push(completedData)
    localStorage.setItem('completedExercises', JSON.stringify(completed))
    
    // ページから削除（確認なし）
    const updatedExercises = exercises.filter(ex => ex.id !== exerciseId)
    setExercises(updatedExercises)
    
    setExerciseRecords(prev => {
      const updated = { ...prev }
      delete updated[exerciseId]
      return updated
    })
    
    // localStorageのcurrentTrainingを更新
    const currentTraining = localStorage.getItem('currentTraining')
    if (currentTraining) {
      const trainingData = JSON.parse(currentTraining)
      trainingData.exercises = updatedExercises
      localStorage.setItem('currentTraining', JSON.stringify(trainingData))
    }
    
    // currentTrainingRecordsも更新
    const savedRecords = localStorage.getItem('currentTrainingRecords')
    if (savedRecords) {
      const records = JSON.parse(savedRecords)
      delete records[exerciseId]
      localStorage.setItem('currentTrainingRecords', JSON.stringify(records))
    }
    
    // メニュー登録画面の選択状態からも削除
    const selectedExercises = JSON.parse(localStorage.getItem('selectedExercises') || '[]')
    const updatedSelection = selectedExercises.filter(id => id !== exerciseId)
    localStorage.setItem('selectedExercises', JSON.stringify(updatedSelection))
  }

  // すべてのトレーニングを完了
  const completeAllTraining = () => {
    // 残っている種目を全て完了として保存
    exercises.forEach(exercise => {
      const sets = exerciseRecords[exercise.id] || []
      if (sets.some(set => set.weight || set.reps)) {
        const completedData = {
          id: exercise.id,
          name: exercise.name,
          sets: sets.filter(set => set.weight || set.reps),
          completedAt: new Date().toISOString()
        }
        
        const completed = JSON.parse(localStorage.getItem('completedExercises') || '[]')
        completed.push(completedData)
        localStorage.setItem('completedExercises', JSON.stringify(completed))
      }
    })
    
    // トレーニング履歴に保存
    const history = JSON.parse(localStorage.getItem('trainingHistory') || '[]')
    const sessionData = {
      date: new Date().toISOString(),
      exercises: exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        sets: exerciseRecords[exercise.id] || []
      }))
    }
    history.push(sessionData)
    localStorage.setItem('trainingHistory', JSON.stringify(history))
    
    // トレーニングデータをクリア
    localStorage.removeItem('currentTraining')
    localStorage.removeItem('currentTrainingRecords')
    localStorage.removeItem('hasTraining')
    localStorage.removeItem('completedExercises')
    
    // 完了ページに遷移
    navigate('/training-complete')
  }

  if (exercises.length === 0) {
    return (
      <div className="training-page">
        <h1>トレーニング</h1>
        <p>トレーニングデータがありません</p>
      </div>
    )
  }

  return (
    <div className="training-page">
      <h1>トレーニング</h1>
      
      <div className="training-exercises">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="training-exercise-block">
            <div className="exercise-header">
              <button
                className="delete-exercise-button"
                onClick={() => removeExercise(exercise.id)}
                title="削除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
              <h2 className="exercise-name">{exercise.name}</h2>
              <button
                className="complete-exercise-button"
                onClick={() => completeExercise(exercise.id)}
              >
                完了
              </button>
            </div>

            <div className="sets-container">
              <div className="sets-header">
                <span className="set-label">セット</span>
                <span className="weight-label">重量(kg)</span>
                <span className="reps-label">rep数</span>
              </div>

              {(exerciseRecords[exercise.id] || []).map((set, index) => {
                const previousSet = getPreviousRecord(exercise.id, set.setNumber)
                const canDelete = (exerciseRecords[exercise.id] || []).length > 1
                return (
                  <div key={index} className="set-row">
                    <span className="set-number">{set.setNumber}</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="weight-input"
                      value={set.weight}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          updateSet(exercise.id, index, 'weight', value);
                        }
                      }}
                      placeholder={previousSet?.weight || ''}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      className="reps-input"
                      value={set.reps}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d+$/.test(value)) {
                          updateSet(exercise.id, index, 'reps', value);
                        }
                      }}
                      placeholder={previousSet?.reps || ''}
                    />
                    {canDelete && (
                      <button
                        className="remove-set-button"
                        onClick={() => removeSet(exercise.id, index)}
                        title="このセットを削除"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )
              })}

              <button
                className="add-set-button"
                onClick={() => addSet(exercise.id)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="complete-all-button" onClick={completeAllTraining}>
        すべてのトレーニングを完了
      </button>
    </div>
  )
}

export default Training
