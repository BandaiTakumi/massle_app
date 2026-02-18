# プロジェクト構造とリファクタリング

## ディレクトリ構造

```
src/
├── components/
│   ├── common/           # 共通コンポーネント
│   │   └── Icons.jsx     # 共通アイコン（TrashIcon等）
│   ├── layout/           # レイアウトコンポーネント
│   │   ├── Layout.jsx
│   │   ├── Footer.jsx
│   │   └── *.css
│   └── pages/            # ページコンポーネント
│       ├── Menu.jsx
│       ├── Training.jsx
│       ├── Calender.jsx
│       ├── AddMenu.jsx
│       ├── Weight.jsx
│       ├── TrainingComplete.jsx
│       └── *.css
├── utils/                # ユーティリティ関数
│   ├── constants.js      # 定数定義
│   ├── storageUtils.js   # LocalStorage操作
│   └── dateUtils.js      # 日付操作
├── data/
│   └── exercises.json    # エクササイズマスターデータ
├── App.jsx
└── main.jsx
```

## ユーティリティ

### constants.js
アプリケーション全体で使用する定数を定義

- `STORAGE_KEYS`: LocalStorageのキー名
- `COLORS`: カラーテーマ
- `DEFAULT_CATEGORIES`: デフォルトカテゴリ

### storageUtils.js
LocalStorage操作を抽象化

#### 基本操作
- `getStorageItem(key, defaultValue)`: JSONデータ取得
- `setStorageItem(key, value)`: JSONデータ保存
- `removeStorageItem(key)`: キー削除

#### 特定データ操作
- `getExercises()` / `setExercises(exercises)`: エクササイズデータ
- `getSelectedCategory()` / `setSelectedCategory(category)`: 選択中カテゴリ
- `getSelectedExercises()` / `setSelectedExercises(ids)`: 選択中エクササイズ
- `getCurrentTraining()` / `setCurrentTraining(data)`: 現在のトレーニング
- `getCurrentTrainingRecords()` / `setCurrentTrainingRecords(records)`: 現在のトレーニング記録
- `getTrainingHistory()` / `addTrainingSession(session)`: トレーニング履歴
- `getCompletedExercises()` / `addCompletedExercise(data)`: 完了エクササイズ
- `clearTrainingSession()`: セッションデータ一括クリア

### dateUtils.js
日付操作ユーティリティ

- `isSameDay(date1, date2)`: 同じ日付か判定
- `formatDateJP(date)`: "YYYY年MM月DD日"形式
- `formatTime(date)`: "HH:MM"形式
- `getToday()`: 今日の日付
- `generateCalendarDays(year, month)`: カレンダーデータ生成

## データ構造

### exercises
```javascript
{
  id: number,
  name: string,
  category: string[]
}
```

### currentTraining
```javascript
{
  exercises: Exercise[],
  createdAt: string (ISO 8601)
}
```

### currentTrainingRecords
```javascript
{
  [exerciseId]: [
    {
      setNumber: number,
      weight: string,
      reps: string
    }
  ]
}
```

### trainingHistory
```javascript
[
  {
    date: string (ISO 8601),
    exercises: [
      {
        id: number,
        name: string,
        sets: [
          {
            setNumber: number,
            weight: string,
            reps: string
          }
        ]
      }
    ]
  }
]
```

## リファクタリングの利点

1. **コードの重複削減**: LocalStorage操作が各コンポーネントに散在していたのを一箇所に集約
2. **保守性向上**: キー名変更時は`constants.js`を修正するだけ
3. **型安全性**: 関数名で操作内容が明確
4. **テスタビリティ**: ユーティリティ関数を個別にテスト可能
5. **可読性向上**: ビジネスロジックとデータ操作が分離

## 使用例

### Before (リファクタリング前)
```javascript
const exercises = JSON.parse(localStorage.getItem('exercises') || '[]')
localStorage.setItem('exercises', JSON.stringify(updatedExercises))
```

### After (リファクタリング後)
```javascript
import { getExercises, setExercises } from '../../utils/storageUtils'

const exercises = getExercises()
setExercises(updatedExercises)
```

## 今後の拡張

- エラーハンドリングの強化
- TypeScript化による型安全性向上
- IndexedDBへの移行検討
- オフライン対応
- データのインポート/エクスポート機能
