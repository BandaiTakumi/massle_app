import './TrainingComplete.css'
import { useNavigate } from 'react-router-dom'

function TrainingComplete() {
  const navigate = useNavigate()

  const handleBackToMenu = () => {
    navigate('/')
  }

  return (
    <div className="training-complete-page">
      <div className="complete-content">
        <div className="complete-icon">✅</div>
        <h1>トレーニング完了</h1>
        <p>お疲れ様でした！</p>
        <p>トレーニングの記録が保存されました。</p>
        
        <button className="back-to-menu-button" onClick={handleBackToMenu}>
          メニュー登録に戻る
        </button>
      </div>
    </div>
  )
}

export default TrainingComplete
