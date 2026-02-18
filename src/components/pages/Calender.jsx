import { useState, useEffect } from 'react'
import './Calender.css'
import { getTrainingHistory, setTrainingHistory } from '../../utils/storageUtils'
import { generateCalendarDays, isSameDay, formatDateJP, formatTime } from '../../utils/dateUtils'
import { TrashIcon } from '../common/Icons'

function Calender() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [trainingHistory, setTrainingHistoryState] = useState([])
  const [expandedExercises, setExpandedExercises] = useState({})  

  useEffect(() => {
    const history = getTrainingHistory()
    setTrainingHistoryState(history)
  }, [])

  // trainingHistoryを更新してlocalStorageにも保存
  const updateTrainingHistory = (newHistory) => {
    setTrainingHistoryState(newHistory)
    setTrainingHistory(newHistory)
  }

  // その日にトレーニング記録があるかチェック
  const hasTraining = (date) => {
    return trainingHistory.some(record => {
      const recordDate = new Date(record.date)
      return isSameDay(recordDate, date)
    })
  }

  // 指定日のトレーニング記録を取得
  const getTrainingByDate = (date) => {
    return trainingHistory.filter(record => {
      const recordDate = new Date(record.date)
      return isSameDay(recordDate, date)
    })
  }

  // 前月へ移動
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  // 次月へ移動
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  // 日付クリック
  const handleDateClick = (day) => {
    if (!day.isCurrentMonth) return
    setSelectedDate(day.fullDate)
    setExpandedExercises({}) // 日付変更時は展開状態をリセット
  }

  // エクササイズの展開/折りたたみ
  const toggleExerciseExpand = (trainingIdx, exerciseIdx) => {
    const key = `${trainingIdx}-${exerciseIdx}`
    setExpandedExercises(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // トレーニング記録を削除
  const deleteTrainingRecord = (trainingDate) => {
    const confirmed = window.confirm('このトレーニング記録を削除しますか？')
    if (confirmed) {
      const updatedHistory = trainingHistory.filter(record => record.date !== trainingDate)
      updateTrainingHistory(updatedHistory)
      
      // 削除後に選択日のトレーニングがなくなった場合
      const remainingTrainings = getTrainingByDate(selectedDate)
      if (remainingTrainings.length === 0) {
        setExpandedExercises({})
      }
    }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const calendarDays = generateCalendarDays(year, month)
  const selectedTrainings = selectedDate ? getTrainingByDate(selectedDate) : []

  return (
    <div className="calender-page">
      {/* カレンダーヘッダー */}
      <div className="calendar-header">
        <button className="month-nav-button" onClick={goToPrevMonth}>
          ←
        </button>
        <h2 className="current-month">
          {year}年 {month + 1}月
        </h2>
        <button className="month-nav-button" onClick={goToNextMonth}>
          →
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="calendar-weekdays">
        <div className="weekday">日</div>
        <div className="weekday">月</div>
        <div className="weekday">火</div>
        <div className="weekday">水</div>
        <div className="weekday">木</div>
        <div className="weekday">金</div>
        <div className="weekday">土</div>
      </div>

      {/* カレンダーグリッド */}
      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="calendar-day empty-day"></div>
          }
          
          const isToday = day.fullDate.toDateString() === new Date().toDateString()
          const isSelected = selectedDate && day.fullDate.toDateString() === selectedDate.toDateString()
          const hasRecord = day.isCurrentMonth && hasTraining(day.fullDate)
          const isSunday = day.dayOfWeek === 0
          const isSaturday = day.dayOfWeek === 6

          return (
            <div
              key={index}
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasRecord ? 'has-training' : ''} ${isSunday ? 'sunday' : ''} ${isSaturday ? 'saturday' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <span className="day-number">{day.date}</span>
              {hasRecord && <span className="training-dot"></span>}
            </div>
          )
        })}
      </div>

      {/* トレーニング詳細表示 */}
      <div className="training-details">
        <h3 className="details-title">
          {selectedDate 
            ? `${formatDateJP(selectedDate)}のトレーニング`
            : '日付を選択してください'}
        </h3>
        
        {selectedDate && (
          selectedTrainings.length > 0 ? (
            <div className="training-list">
              {selectedTrainings.map((training, idx) => (
                <div key={idx} className="training-record">
                  <div className="record-header">
                    <div className="record-time">
                      {formatTime(training.date)}
                    </div>
                    <button
                      className="delete-record-button"
                      onClick={() => deleteTrainingRecord(training.date)}
                      title="削除"
                    >
                      <TrashIcon width={18} height={18} color="#dc3545" />
                    </button>
                  </div>
                  {training.exercises.map((exercise, exIdx) => {
                    const isExpanded = expandedExercises[`${idx}-${exIdx}`]
                    return (
                      <div key={exIdx} className="exercise-detail">
                        <div 
                          className="exercise-header-clickable"
                          onClick={() => toggleExerciseExpand(idx, exIdx)}
                        >
                          <h4 className="exercise-name">{exercise.name}</h4>
                          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                        </div>
                        {isExpanded && (
                          <div className="sets-list">
                            {exercise.sets.map((set, setIdx) => (
                              <div key={setIdx} className="set-info">
                                <span className="set-number">{set.setNumber}セット目:</span>
                                <span className="set-data">{set.weight}kg × {set.reps}回</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-training-message">完了トレーニングはありません</p>
          )
        )}
      </div>
    </div>
  )
}

export default Calender
