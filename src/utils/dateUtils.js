/**
 * 2つの日付が同じ日かどうか判定
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {boolean}
 */
export const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

/**
 * 日付を "YYYY年MM月DD日" 形式でフォーマット
 * @param {Date} date 
 * @returns {string}
 */
export const formatDateJP = (date) => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

/**
 * 時刻を "HH:MM" 形式でフォーマット
 * @param {Date|string} date 
 * @returns {string}
 */
export const formatTime = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

/**
 * 今日の日付を取得
 * @returns {Date}
 */
export const getToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/**
 * 指定された年月のカレンダーデータを生成
 * @param {number} year 
 * @param {number} month 
 * @returns {Array<Object|null>}
 */
export const generateCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const firstDayOfWeek = firstDay.getDay()
  const lastDate = lastDay.getDate()
  
  const days = []
  
  // 前月の空白セル
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }
  
  // 当月の日付のみ
  for (let i = 1; i <= lastDate; i++) {
    days.push({
      date: i,
      isCurrentMonth: true,
      fullDate: new Date(year, month, i),
      dayOfWeek: new Date(year, month, i).getDay()
    })
  }
  
  return days
}
