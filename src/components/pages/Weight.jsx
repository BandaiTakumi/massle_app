import { useState } from 'react'
import './Weight.css'
import { getUserProfile, setUserProfile, getWeightHistory, addWeightRecord } from '../../utils/storageUtils'

function Weight() {
  const [age, setAge] = useState(() => {
    const profile = getUserProfile()
    return profile ? profile.age.toString() : ''
  })
  const [height, setHeight] = useState(() => {
    const profile = getUserProfile()
    return profile ? profile.height.toString() : ''
  })
  const [weight, setWeight] = useState('')
  const [weightHistory, setWeightHistoryState] = useState(() => getWeightHistory())
  
  // TDEEを計算（最新の記録から）
  const calculateCurrentTDEE = () => {
    const history = getWeightHistory()
    if (history.length === 0) return null
    
    // 最新の記録を取得
    const latestRecord = history[history.length - 1]
    const bmr = calculateBMR(latestRecord.weight, latestRecord.height, latestRecord.age)
    return calculateTDEE(bmr)
  }
  
  const [currentDate, setCurrentDate] = useState(new Date())

  // BMI計算
  const calculateBMI = (weightKg, heightCm) => {
    const heightM = heightCm / 100
    return (weightKg / (heightM * heightM)).toFixed(1)
  }

  // 基礎代謝計算（ハリス・ベネディクト方程式 - 男性）
  const calculateBMR = (weightKg, heightCm, ageYears) => {
    return 13.397 * weightKg + 4.799 * heightCm - 5.677 * ageYears + 88.362
  }

  // TDEE計算
  const calculateTDEE = (bmr) => {
    return Math.round(bmr * 1.725)
  }

  // 確定ボタンが有効か
  const canSubmit = () => {
    return age && height && weight
  }

  // 今日既に登録済みかチェック
  const isRegisteredToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return weightHistory.some(record => {
      const recordDate = new Date(record.date)
      recordDate.setHours(0, 0, 0, 0)
      return recordDate.getTime() === today.getTime()
    })
  }

  // 確定ボタン押下
  const handleSubmit = () => {
    if (isRegisteredToday()) {
      alert('本日は既に登録済みです。\n1日1回のみ登録できます。')
      return
    }

    const confirmed = window.confirm('体重データを確定しますか？\n登録できるのは１日１回です。\n一度登録すると削除できません。')
    if (!confirmed) return

    const ageNum = parseFloat(age)
    const heightNum = parseFloat(height)
    const weightNum = parseFloat(weight)

    // プロフィールを保存
    setUserProfile({ age: ageNum, height: heightNum })

    // BMI計算
    const bmi = calculateBMI(weightNum, heightNum)

    // 体重記録を追加
    const record = {
      date: new Date().toISOString(),
      weight: weightNum,
      bmi: parseFloat(bmi),
      age: ageNum,
      height: heightNum
    }
    addWeightRecord(record)

    // 履歴を更新
    const updatedHistory = getWeightHistory()
    setWeightHistoryState(updatedHistory)

    // 体重入力欄をリセット
    setWeight('')
  }

  // 前月へ移動
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // 次月へ移動
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // 表示中の月が今月かチェック
  const isCurrentMonth = () => {
    const now = new Date()
    return currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() === now.getMonth()
  }

  // 指定月のデータをフィルタ
  const getMonthData = () => {
    const displayYear = currentDate.getFullYear()
    const displayMonth = currentDate.getMonth()

    return weightHistory.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getFullYear() === displayYear && recordDate.getMonth() === displayMonth
    })
  }

  const monthData = getMonthData()
  const hasData = monthData.length > 0
  const tdee = calculateCurrentTDEE()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  return (
    <div className="weight-page">
      <h1>体重管理</h1>

      {/* 月ナビゲーション */}
      <div className="month-navigation">
        <button className="month-nav-button" onClick={goToPrevMonth}>
          ←
        </button>
        <h2 className="current-month">
          {year}年 {month}月
        </h2>
        {!isCurrentMonth() && (
          <button className="month-nav-button" onClick={goToNextMonth}>
            →
          </button>
        )}
        {isCurrentMonth() && <div className="month-nav-spacer"></div>}
      </div>

      <div className="input-section">
        <div className="input-row">
          <div className="input-group">
            <label>年齢</label>
            <input
              type="text"
              inputMode="numeric"
              value={age}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || /^\d+$/.test(value)) {
                  setAge(value)
                }
              }}
              placeholder="例: 25"
            />
            <span className="unit">歳</span>
          </div>

          <div className="input-group">
            <label>身長</label>
            <input
              type="text"
              inputMode="decimal"
              value={height}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setHeight(value)
                }
              }}
              placeholder="例: 170"
            />
            <span className="unit">cm</span>
          </div>

          <div className="input-group">
            <label>体重</label>
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setWeight(value)
                }
              }}
              placeholder="例: 70"
            />
            <span className="unit">kg</span>
          </div>
        </div>

        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={!canSubmit()}
        >
          確定
        </button>
      </div>

      {!hasData && (
        <div className="no-data-message">
          <p>今月の記録はありません</p>
        </div>
      )}

      {hasData && (
        <div className="charts-section">
          <div className="chart-container">
            <h3>BMI推移</h3>
            <LineChart data={monthData} dataKey="bmi" color="#007bff" unit="" />
          </div>

          <div className="chart-container">
            <h3>体重推移</h3>
            <LineChart data={monthData} dataKey="weight" color="#28a745" unit="kg" />
          </div>
        </div>
      )}

      {tdee && isCurrentMonth() && (
        <div className="tdee-section">
          <h3>想定必要カロリー (TDEE)</h3>
          <p className="tdee-value">{tdee} kcal/日</p>
          <p className="tdee-note">※活動レベル: 中程度の運動（週4-5日）で計算</p>
        </div>
      )}
    </div>
  )
}

// 折れ線グラフコンポーネント
function LineChart({ data, dataKey, color, unit }) {
  if (!data || data.length === 0) return null

  const width = 100
  const height = 60
  const padding = 10

  // データの最大値と最小値を計算
  const values = data.map(d => d[dataKey])
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const valueRange = maxValue - minValue || 1

  // 日付を取得
  const dates = data.map(d => {
    const date = new Date(d.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })

  // ポイントを計算
  const points = data.map((d, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2)
    const y = height - padding - ((d[dataKey] - minValue) / valueRange) * (height - padding * 2)
    return { x, y, value: d[dataKey], date: dates[index] }
  })

  // パスを生成
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* グリッド線 */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e0e0e0" strokeWidth="0.5" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e0e0e0" strokeWidth="0.5" />

        {/* 折れ線 */}
        <path d={pathData} fill="none" stroke={color} strokeWidth="1.5" />

        {/* データポイント */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} />
        ))}
      </svg>

      {/* データラベル */}
      <div className="chart-labels">
        {points.map((p, i) => (
          <div key={i} className="chart-label">
            <div className="label-date">{p.date}</div>
            <div className="label-value">{p.value}{unit}</div>
          </div>
        ))}
      </div>

      {/* Y軸の値表示 */}
      <div className="y-axis-labels">
        <span className="y-max">{maxValue.toFixed(1)}{unit}</span>
        <span className="y-min">{minValue.toFixed(1)}{unit}</span>
      </div>
    </div>
  )
}

export default Weight
