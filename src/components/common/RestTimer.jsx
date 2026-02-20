import { useEffect, useState, useRef } from 'react'
import './RestTimer.css'

const STORAGE_KEY = 'REST_TIMER_STATE'

function readStateFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.warn('readStateFromStorage failed', err)
    return null
  }
}

function writeStateToStorage(state) {
  try {
    const existing = readStateFromStorage() || {}
    const merged = { ...existing, ...state }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch (err) {
    console.warn('writeStateToStorage failed', err)
  }
}

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec || 0))
  const m = Math.floor(s / 60)
  const r = s % 60
  return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0')
}

export default function RestTimer({ compact = false }) {
  const saved = readStateFromStorage()
  const [minutes, setMinutes] = useState(saved?.minutes?.toString() ?? '1')
  const [seconds, setSeconds] = useState(saved?.seconds?.toString() ?? '0')
  const [running, setRunning] = useState(!!saved?.running)
  const [remaining, setRemaining] = useState(saved?.remaining ?? null)
  const [total, setTotal] = useState(saved?.total ?? null)
  const [paused, setPaused] = useState(!!saved?.paused)
  const [popupPos, setPopupPos] = useState(() => {
    try {
      const raw = localStorage.getItem('REST_TIMER_POPUP_POS')
      if (raw) return JSON.parse(raw)
    } catch {
      console.warn('read popup pos failed')
    }
    return { x: window?.innerWidth ? window.innerWidth - 96 : 9999, y: 12 }
  })
  const [popupHidden, setPopupHidden] = useState(() => {
    try {
      const s = readStateFromStorage()
      return !!(s && s.popupHidden)
    } catch {
      return false
    }
  })
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, initX: 0, initY: 0 })
  const [closed, setClosed] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    const onStorage = () => {
      // support both native storage events and custom internal events
      const data = readStateFromStorage()
      if (!data) {
        // If storage cleared from other window, mark closed but don't nuke UI unexpectedly
        setClosed(true)
        setRunning(false)
        setPaused(false)
        setRemaining(null)
        setTotal(null)
        return
      }
      setClosed(!!data.closed)
      setPopupHidden(!!data.popupHidden)
      setMinutes(data.minutes?.toString() ?? '1')
      setSeconds(data.seconds?.toString() ?? '0')
      setRunning(!!data.running)
      setPaused(!!data.paused)
      setRemaining(data.remaining ?? null)
      setTotal(data.total ?? null)
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('rest_timer_change', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('rest_timer_change', onStorage)
    }
  }, [])

  // ensure popup stays in viewport on resize
  useEffect(() => {
    function handleResize() {
      setPopupPos((p) => {
        const maxX = Math.max(6, window.innerWidth - 96)
        const maxY = Math.max(6, window.innerHeight - 56)
        return { x: Math.min(p.x, maxX), y: Math.min(p.y, maxY) }
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // expose popup position and meter percent as CSS vars (avoid inline styles)
  useEffect(() => {
    try {
      document.documentElement.style.setProperty('--rest-popup-left', popupPos.x + 'px')
      document.documentElement.style.setProperty('--rest-popup-top', popupPos.y + 'px')
    } catch {
      // ignore
    }
  }, [popupPos])

  useEffect(() => {
    if (running && !paused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev === null) return prev
          if (prev <= 1) {
            // timer finished: reset to initial total and stop (paused state) until user restarts
            clearInterval(intervalRef.current)
            const newState = { minutes: parseInt(minutes || '0', 10), seconds: parseInt(seconds || '0', 10), running: false, paused: true, remaining: total, total, closed: false }
            writeStateToStorage(newState)
            setRunning(false)
            setPaused(true)
            return total
          }
          const next = prev - 1
          const newState = { minutes, seconds, running: true, paused: false, remaining: next, total, closed: false }
          writeStateToStorage(newState)
          return next
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running, paused, minutes, seconds, total])


  const stop = () => {
    const savedBefore = { minutes: parseInt(minutes || '0', 10), seconds: parseInt(seconds || '0', 10) }
    // mark closed instead of clearing storage to avoid race where other listeners read null
    const newState = { minutes: savedBefore.minutes, seconds: savedBefore.seconds, running: false, paused: false, remaining: null, total: null, closed: true }
    writeStateToStorage(newState)
    setClosed(true)
    setRunning(false)
    setPaused(false)
    setRemaining(null)
    setTotal(null)
    setMinutes(savedBefore.minutes.toString())
    setSeconds(savedBefore.seconds.toString())
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('rest_timer_change'))
    }
  }

  const handleHidePopup = (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    setPopupHidden(true)
    writeStateToStorage({ popupHidden: true })
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('rest_timer_change'))
    }
  }

  // resume helper
  const resume = () => {
    if ((remaining ?? 0) <= 0) return
    setRunning(true)
    setPaused(false)
    setClosed(false)
    writeStateToStorage({ minutes: parseInt(minutes || '0', 10), seconds: parseInt(seconds || '0', 10), running: true, paused: false, remaining, total, closed: false })
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('rest_timer_change'))
    }
  }

  // restart helper: reset remaining to total and resume
  const restart = () => {
    const t = total ?? (Math.max(0, parseInt(minutes || '0', 10)) * 60 + Math.max(0, parseInt(seconds || '0', 10)))
    if (t <= 0) return
    // reset to full time but leave paused so user can resume manually
    setTotal(t)
    setRemaining(t)
    setRunning(false)
    setPaused(true)
    setClosed(false)
    writeStateToStorage({ minutes: parseInt(minutes || '0', 10), seconds: parseInt(seconds || '0', 10), running: false, paused: true, remaining: t, total: t, closed: false })
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('rest_timer_change'))
    }
  }

  // dragging handlers for popup
  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current.dragging) return
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const dx = clientX - dragRef.current.startX
      const dy = clientY - dragRef.current.startY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true
      const next = { x: dragRef.current.initX + dx, y: Math.max(6, dragRef.current.initY + dy) }
      setPopupPos(next)
    }
    const onUp = () => {
      if (!dragRef.current.dragging) return
      dragRef.current.dragging = false
      try {
        localStorage.setItem('REST_TIMER_POPUP_POS', JSON.stringify(popupPos))
      } catch (err) {
        console.warn('save popup pos failed', err)
      }
      // clear moved after mouse up so click can behave normally next
      setTimeout(() => { dragRef.current.moved = false }, 50)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [popupPos])

  const togglePause = () => {
    if (!running) {
      // if currently paused (not running) and we have remaining time, resume
      if (paused && (remaining ?? 0) > 0) {
        resume()
      }
      return
    }
    const nextPaused = !paused
    setPaused(nextPaused)
    writeStateToStorage({ minutes: parseInt(minutes || '0', 10), seconds: parseInt(seconds || '0', 10), running: running, paused: nextPaused, remaining, total, closed: false })
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('rest_timer_change'))
    }
  }

  const handleConfirm = () => {
    // prepare timer but don't start running immediately — enter paused state
    const min = Math.max(0, parseInt(minutes || '0', 10))
    const sec = Math.max(0, parseInt(seconds || '0', 10))
    const tot = min * 60 + sec
    if (tot <= 0) return
    setTotal(tot)
    setRemaining(tot)
    setRunning(false)
    setPaused(true)
    setClosed(false)
    writeStateToStorage({ minutes: min, seconds: sec, running: false, paused: true, remaining: tot, total: tot, closed: false })
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('rest_timer_change'))
    }
  }

  const percent = total ? Math.max(0, Math.min(100, Math.round(((total - (remaining ?? total)) / total) * 100))) : 0

  useEffect(() => {
    try {
      document.documentElement.style.setProperty('--rest-meter-percent', percent + '%')
    } catch {
      // ignore
    }
  }, [percent])

  const displayMinutes = remaining !== null ? Math.floor(remaining / 60) : parseInt(minutes || '0', 10)
  const displaySeconds = remaining !== null ? (remaining % 60) : parseInt(seconds || '0', 10)

  const hasTimer = (remaining !== null) || (total !== null)
  const startTotalSec = total ?? (Math.max(0, parseInt(minutes || '0', 10)) * 60 + Math.max(0, parseInt(seconds || '0', 10)))

    if (compact) {
    // popup view uses component state so it stays in sync across instances
    if (!hasTimer || closed || popupHidden) return null
    const storedTotal = (remaining ?? total ?? 0)
    const icon = (running && !paused) ? '⏸' : '▶'
    return (
      <div
        className="rest-timer-popup"
        onMouseDown={(e) => {
          e.stopPropagation()
          dragRef.current.dragging = true
          dragRef.current.startX = e.clientX
          dragRef.current.startY = e.clientY
          dragRef.current.initX = popupPos.x
          dragRef.current.initY = popupPos.y
        }}
        onTouchStart={(e) => {
          e.stopPropagation()
          dragRef.current.dragging = true
          dragRef.current.startX = e.touches[0].clientX
          dragRef.current.startY = e.touches[0].clientY
          dragRef.current.initX = popupPos.x
          dragRef.current.initY = popupPos.y
        }}
        onClick={() => {
          // avoid toggling when the user just dragged
          if (dragRef.current.moved) return
          // toggle: if running -> pause/resume, if stopped but remaining exists -> resume
          if (running) {
            togglePause()
            return
          }
          if ((remaining ?? 0) > 0) {
            // resume
            setRunning(true)
            setPaused(false)
            writeStateToStorage({ minutes: parseInt(minutes || '0', 10), seconds: parseInt(seconds || '0', 10), running: true, paused: false, remaining, total, closed: false })
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
              window.dispatchEvent(new Event('rest_timer_change'))
            }
          }
        }}
      >
        <div className="popup-icon">{icon}</div>
        <div className="popup-time">{formatTime(storedTotal)}</div>
        <div className="popup-total">/{formatTime(startTotalSec)}</div>
        <button className="popup-hide" onClick={(e) => { e.stopPropagation(); handleHidePopup(e) }} title="非表示">_</button>
        <button className="popup-close" onClick={(e) => {
          e.stopPropagation()
          stop()
        }}>✖</button>
      </div>
    )
  }

  return (
    <div className="rest-timer">
      {!hasTimer ? (
        <div className="rest-inputs">
          <label>レスト時間は？</label>
          <div className="rest-input-row">
            <input type="text" inputMode="numeric" value={minutes} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setMinutes(v) }} />
            <span>分</span>
            <input type="text" inputMode="numeric" value={seconds} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setSeconds(v) }} />
            <span>秒</span>
            <button className="confirm-btn" onClick={handleConfirm}>確定</button>
          </div>
        </div>
      ) : (
        <div className={`rest-running ${paused && !running ? 'paused' : ''}`} onClick={() => togglePause()} role="button" tabIndex={0}>
          <div className="meter"></div>
          <div className="state-icon">{paused ? '▶' : '⏸'}</div>
          <div className="time-display">
            <span className="remaining">{String(displayMinutes).padStart(2,'0')}:{String(displaySeconds).padStart(2,'0')}</span>
            <span className="total">/{formatTime(startTotalSec)}</span>
          </div>
          <button className="restart-btn" onClick={(e) => { e.stopPropagation(); restart() }} title="再スタート">↻</button>
          <button className="stop-btn" onClick={(e) => { e.stopPropagation(); stop() }}>✖</button>
        </div>
      )}
    </div>
  )
}
