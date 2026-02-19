import { STORAGE_KEYS } from './constants'

/**
 * LocalStorageからJSONデータを取得
 * @param {string} key - StorageKey
 * @param {*} defaultValue - デフォルト値
 * @returns {*} パースされたデータまたはデフォルト値
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error)
    return defaultValue
  }
}

/**
 * LocalStorageにJSONデータを保存
 * @param {string} key - StorageKey
 * @param {*} value - 保存する値
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting ${key} to localStorage:`, error)
  }
}

/**
 * LocalStorageからキーを削除
 * @param {string} key - StorageKey
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error)
  }
}

/**
 * LocalStorageから生の文字列を取得
 * @param {string} key - StorageKey
 * @param {string} defaultValue - デフォルト値
 * @returns {string} 文字列データ
 */
export const getStorageString = (key, defaultValue = '') => {
  return localStorage.getItem(key) || defaultValue
}

/**
 * LocalStorageに文字列を保存
 * @param {string} key - StorageKey
 * @param {string} value - 保存する文字列
 */
export const setStorageString = (key, value) => {
  localStorage.setItem(key, value)
}

// === 特定データ操作用ヘルパー関数 ===

/**
 * エクササイズデータを取得
 */
export const getExercises = () => {
  return getStorageItem(STORAGE_KEYS.EXERCISES, [])
}

/**
 * エクササイズデータを保存
 */
export const setExercises = (exercises) => {
  setStorageItem(STORAGE_KEYS.EXERCISES, exercises)
}

/**
 * 選択中のカテゴリを取得
 */
export const getSelectedCategory = (defaultCategory = '胸') => {
  return getStorageString(STORAGE_KEYS.SELECTED_CATEGORY, defaultCategory)
}

/**
 * 選択中のカテゴリを保存
 */
export const setSelectedCategory = (category) => {
  setStorageString(STORAGE_KEYS.SELECTED_CATEGORY, category)
}

/**
 * 選択中のエクササイズIDリストを取得
 */
export const getSelectedExercises = () => {
  return getStorageItem(STORAGE_KEYS.SELECTED_EXERCISES, [])
}

/**
 * 選択中のエクササイズIDリストを保存
 */
export const setSelectedExercises = (exerciseIds) => {
  setStorageItem(STORAGE_KEYS.SELECTED_EXERCISES, exerciseIds)
}

/**
 * 現在のトレーニングデータを取得
 */
export const getCurrentTraining = () => {
  return getStorageItem(STORAGE_KEYS.CURRENT_TRAINING, null)
}

/**
 * 現在のトレーニングデータを保存
 */
export const setCurrentTraining = (trainingData) => {
  setStorageItem(STORAGE_KEYS.CURRENT_TRAINING, trainingData)
}

/**
 * 現在のトレーニングデータを削除
 */
export const clearCurrentTraining = () => {
  removeStorageItem(STORAGE_KEYS.CURRENT_TRAINING)
}

/**
 * 現在のトレーニング記録を取得
 */
export const getCurrentTrainingRecords = () => {
  return getStorageItem(STORAGE_KEYS.CURRENT_TRAINING_RECORDS, {})
}

/**
 * 現在のトレーニング記録を保存
 */
export const setCurrentTrainingRecords = (records) => {
  setStorageItem(STORAGE_KEYS.CURRENT_TRAINING_RECORDS, records)
}

/**
 * 現在のトレーニング記録を削除
 */
export const clearCurrentTrainingRecords = () => {
  removeStorageItem(STORAGE_KEYS.CURRENT_TRAINING_RECORDS)
}

/**
 * トレーニング履歴を取得
 */
export const getTrainingHistory = () => {
  return getStorageItem(STORAGE_KEYS.TRAINING_HISTORY, [])
}

/**
 * トレーニング履歴を保存
 */
export const setTrainingHistory = (history) => {
  setStorageItem(STORAGE_KEYS.TRAINING_HISTORY, history)
}

/**
 * トレーニング履歴に新しいセッションを追加
 */
export const addTrainingSession = (sessionData) => {
  const history = getTrainingHistory()
  history.push(sessionData)
  setTrainingHistory(history)
}

/**
 * 完了したエクササイズリストを取得
 */
export const getCompletedExercises = () => {
  return getStorageItem(STORAGE_KEYS.COMPLETED_EXERCISES, [])
}

/**
 * 完了したエクササイズリストを保存
 */
export const setCompletedExercises = (completed) => {
  setStorageItem(STORAGE_KEYS.COMPLETED_EXERCISES, completed)
}

/**
 * 完了したエクササイズリストに追加
 */
export const addCompletedExercise = (exerciseData) => {
  const completed = getCompletedExercises()
  completed.push(exerciseData)
  setCompletedExercises(completed)
}

/**
 * 完了したエクササイズリストを削除
 */
export const clearCompletedExercises = () => {
  removeStorageItem(STORAGE_KEYS.COMPLETED_EXERCISES)
}

/**
 * トレーニング中フラグを取得
 */
export const getHasTraining = () => {
  return getStorageString(STORAGE_KEYS.HAS_TRAINING) === 'true'
}

/**
 * トレーニング中フラグを設定
 */
export const setHasTraining = (hasTraining) => {
  setStorageString(STORAGE_KEYS.HAS_TRAINING, hasTraining ? 'true' : 'false')
}

/**
 * トレーニング中フラグを削除
 */
export const clearHasTraining = () => {
  removeStorageItem(STORAGE_KEYS.HAS_TRAINING)
}

/**
 * トレーニングセッション関連データを全てクリア
 */
export const clearTrainingSession = () => {
  clearCurrentTraining()
  clearCurrentTrainingRecords()
  clearHasTraining()
  clearCompletedExercises()
  setSelectedExercises([])
}

// ========================================
// 体重管理関連
// ========================================

/**
 * ユーザープロフィール（年齢・身長）を取得
 * @returns {{ age: number, height: number } | null}
 */
export const getUserProfile = () => {
  return getStorageItem(STORAGE_KEYS.USER_PROFILE, null)
}

/**
 * ユーザープロフィール（年齢・身長）を保存
 * @param {{ age: number, height: number }} profile
 */
export const setUserProfile = (profile) => {
  setStorageItem(STORAGE_KEYS.USER_PROFILE, profile)
}

/**
 * 体重履歴を取得
 * @returns {Array<{ date: string, weight: number, bmi: number, age: number, height: number }>}
 */
export const getWeightHistory = () => {
  return getStorageItem(STORAGE_KEYS.WEIGHT_HISTORY, [])
}

/**
 * 体重履歴を保存
 * @param {Array} history
 */
export const setWeightHistory = (history) => {
  setStorageItem(STORAGE_KEYS.WEIGHT_HISTORY, history)
}

/**
 * 体重記録を追加
 * @param {{ date: string, weight: number, bmi: number, age: number, height: number }} record
 */
export const addWeightRecord = (record) => {
  const history = getWeightHistory()
  history.push(record)
  setWeightHistory(history)
}

// ========================================
// カレンダー選択日付関連
// ========================================

/**
 * カレンダーの選択日付を取得
 * @returns {string | null}
 */
export const getCalendarSelectedDate = () => {
  return getStorageString(STORAGE_KEYS.CALENDAR_SELECTED_DATE, null)
}

/**
 * カレンダーの選択日付を保存
 * @param {string} dateString - ISO形式の日付文字列
 */
export const setCalendarSelectedDate = (dateString) => {
  setStorageString(STORAGE_KEYS.CALENDAR_SELECTED_DATE, dateString)
}
