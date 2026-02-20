import './Training.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrashIcon } from '../common/Icons'
import RestTimer from '../common/RestTimer'
import {
  getCurrentTraining,
  setCurrentTraining,
  getCurrentTrainingRecords,
  setCurrentTrainingRecords,
  getTrainingHistory,
  addTrainingSession,
  addCompletedExercise,
  clearTrainingSession,
  getSelectedExercises,
  setSelectedExercises as saveSelectedExercises
} from '../../utils/storageUtils'

function Training() {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState(() => {
    const savedTraining = getCurrentTraining()
    return savedTraining ? savedTraining.exercises : []
  })
  const [exerciseRecords, setExerciseRecords] = useState(() => {
    const savedTraining = getCurrentTraining()
    if (savedTraining) {
      let records = getCurrentTrainingRecords()
      
      // すべての種目に対して初期セットを確保
      savedTraining.exercises.forEach(exercise => {
        if (!records[exercise.id] || records[exercise.id].length === 0) {
          records[exercise.id] = [
            { setNumber: 1, weight: '', reps: '' }
          ]
        }
      })
      
      return records
    }
    return {}
  })

  // exerciseRecordsが変更されたらlocalStorageに保存
  useEffect(() => {
    if (Object.keys(exerciseRecords).length > 0) {
      setCurrentTrainingRecords(exerciseRecords)
    }
  }, [exerciseRecords])

  // 前回の記録を取得
  const getPreviousRecord = (exerciseId, setNumber) => {
    const history = getTrainingHistory()
    
    // 履歴を日付順（新しい順）にソート
    const sortedHistory = [...history].sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    })
    
    // 該当する種目を含むセッションをすべて取得
    const sessionsWithExercise = sortedHistory
      .map(session => {
        const exercise = session.exercises.find(ex => ex.id === exerciseId)
        if (exercise) {
          return {
            date: session.date,
            exercise: exercise
          }
        }
        return null
      })
      .filter(item => item !== null)
    
    if (sessionsWithExercise.length === 0) {
      return null
    }
    
    // 同じ日に複数回記録がある場合、最新のもの（completedAtが最新）を選択
    const latestDate = sessionsWithExercise[0].date
    const sameDateSessions = sessionsWithExercise.filter(item => 
      new Date(item.date).toDateString() === new Date(latestDate).toDateString()
    )
    
    // completedAtでソート（新しい順）
    const latestExercise = sameDateSessions.sort((a, b) => {
      const aTime = a.exercise.completedAt || a.date
      const bTime = b.exercise.completedAt || b.date
      return new Date(bTime) - new Date(aTime)
    })[0].exercise
    
    const previousSets = latestExercise.sets || []
    const previousSetCount = previousSets.length
    
    // セット番号が前回の総セット数を超える場合、最終セットを返す
    if (setNumber > previousSetCount) {
      return previousSets[previousSetCount - 1] || null
    }
    
    // 通常は該当するセット番号の記録を返す
    return previousSets[setNumber - 1] || null
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
    const updatedExercises = exercises.filter(ex => ex.id !== exerciseId)
    setExercises(updatedExercises)
    
    // exerciseRecordsからも削除
    setExerciseRecords(prev => {
      const updated = { ...prev }
      delete updated[exerciseId]
      return updated
    })
    
    // localStorageのcurrentTrainingを更新
    const currentTraining = getCurrentTraining()
    if (currentTraining) {
      currentTraining.exercises = updatedExercises
      setCurrentTraining(currentTraining)
    }
    
    // currentTrainingRecordsも更新
    const records = getCurrentTrainingRecords()
    if (records[exerciseId]) {
      delete records[exerciseId]
      setCurrentTrainingRecords(records)
    }
    
    // メニュー登録画面の選択状態からも削除
    const selectedExercises = getSelectedExercises()
    const updatedSelection = selectedExercises.filter(id => id !== exerciseId)
    saveSelectedExercises(updatedSelection)
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
    
    addCompletedExercise(completedData)
    
    // トレーニング履歴にも保存（カレンダー表示用）
    const sessionData = {
      date: new Date().toISOString(),
      exercises: [{
        id: exerciseId,
        name: exercise.name,
        sets: sets.filter(set => set.weight || set.reps)
      }]
    }
    addTrainingSession(sessionData)
    
    // ページから削除（確認なし）
    const updatedExercises = exercises.filter(ex => ex.id !== exerciseId)
    setExercises(updatedExercises)
    
    setExerciseRecords(prev => {
      const updated = { ...prev }
      delete updated[exerciseId]
      return updated
    })
    
    // localStorageのcurrentTrainingを更新
    const currentTraining = getCurrentTraining()
    if (currentTraining) {
      currentTraining.exercises = updatedExercises
      setCurrentTraining(currentTraining)
    }
    
    // currentTrainingRecordsも更新
    const records = getCurrentTrainingRecords()
    if (records[exerciseId]) {
      delete records[exerciseId]
      setCurrentTrainingRecords(records)
    }
    
    // メニュー登録画面の選択状態からも削除
    const selectedExercises = getSelectedExercises()
    const updatedSelection = selectedExercises.filter(id => id !== exerciseId)
    saveSelectedExercises(updatedSelection)
    
    // 最後の種目を完了した場合、カレンダー画面に遷移
    if (updatedExercises.length === 0) {
      clearTrainingSession()
      navigate('/calender')
    }
  }

  // 種目の完了ボタン有効判定
  const canCompleteExercise = (exerciseId) => {
    const sets = exerciseRecords[exerciseId] || []
    return sets.length > 0 && sets.every(set => set.weight && set.reps)
  }

  // すべてのトレーニング完了ボタン有効判定
  const canCompleteAllTraining = () => {
    return exercises.every(exercise => canCompleteExercise(exercise.id))
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
        
        addCompletedExercise(completedData)
      }
    })
    
    // トレーニング履歴に保存
    const sessionData = {
      date: new Date().toISOString(),
      exercises: exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        sets: exerciseRecords[exercise.id] || []
      }))
    }
    addTrainingSession(sessionData)
    
    // トレーニングデータをクリア
    clearTrainingSession()
    
    // カレンダー画面に遷移
    navigate('/calender')
  }

  if (exercises.length === 0) {
    return (
      <div className="training-page">
        <p>トレーニングデータがありません</p>
      </div>
    )
  }

  return (
    <div className="training-page">
      <RestTimer />
      <div className="training-exercises">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="training-exercise-block">
            <div className="exercise-header">
              <button
                className="delete-exercise-button"
                onClick={() => removeExercise(exercise.id)}
                title="削除"
              >
                <TrashIcon width={20} height={20} color="#fff" />
              </button>
              <h2 className="exercise-name">{exercise.name}</h2>
              <button
                className="complete-exercise-button"
                onClick={() => completeExercise(exercise.id)}
                disabled={!canCompleteExercise(exercise.id)}
              >
                完了
              </button>
            </div>

            <div className="sets-container">
              {(exerciseRecords[exercise.id] || []).map((set, index) => {
                const previousSet = getPreviousRecord(exercise.id, set.setNumber)
                const canDelete = (exerciseRecords[exercise.id] || []).length > 1
                return (
                  <div key={index} className="set-row">
                    <div className="set-row-main">
                      <span className="set-number">{set.setNumber} set</span>
                      <div className="input-with-unit">
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
                          placeholder={previousSet?.weight || '0'}
                        />
                        <span className="unit">kg</span>
                      </div>
                      <div className="input-with-unit">
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
                          placeholder={previousSet?.reps || '0'}
                        />
                        <span className="unit">rep</span>
                      </div>
                    </div>
                    <div className="set-row-actions">
                      {canDelete && (
                        <button
                          className="remove-set-button"
                          onClick={() => removeSet(exercise.id, index)}
                          title="このセットを削除"
                        >
                          <TrashIcon width={16} height={16} color="#dc3545" />
                        </button>
                      )}
                    </div>
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

      <button 
        className="add-training-button" 
        onClick={() => navigate('/')}
      >
        トレーニング追加
      </button>

      <button 
        className="complete-all-button" 
        onClick={completeAllTraining}
        disabled={!canCompleteAllTraining()}
      >
        すべてのトレーニングを完了
      </button>
    </div>
  )
}

export default Training
