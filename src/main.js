
import './style.css'
import './auth/auth.js'
import { supabase } from './lib/supabase.js'

/////////////////////////////////////////
// 猫の情報登録・取得
/////////////////////////////////////////

// 猫のデータを格納する配列
let cats = []

// HTML要素を取得
const catForm = document.querySelector('#cat-form')
const catList = document.querySelector('#cat-list')
const catMessage = document.querySelector('#cat-message')
const catPhoto = document.querySelector('#cat-photo')
const photoPreviewArea = document.querySelector('#photo-preview-area')
const photoPreview = document.querySelector('#photo-preview')


// 画像が選択されたときの処理
catPhoto.addEventListener('change', () => {
  const file = catPhoto.files[0]

  // 画像が選択されていない場合
  if (!file) {
    photoPreviewArea.hidden = true
    photoPreview.removeAttribute('src')
    return
  }

  // 画像のプレビューURLを作成
  const imageUrl = URL.createObjectURL(file)

  // 画像を表示
  photoPreview.src = imageUrl
  photoPreviewArea.hidden = false
})


// 猫の一覧を表示する関数
function renderCats() {
  catList.replaceChildren()

  if (cats.length === 0) {
    const message = document.createElement('p')
    message.textContent = 'まだ猫が登録されていません。'
    catList.append(message)
    return
  }

  cats.forEach((cat) => {
    const card = document.createElement('div')
    card.classList.add('cat-card')

    const name = document.createElement('h3')
    name.textContent = cat.name

    const birthday = document.createElement('p')
    birthday.textContent = `生年月日：${cat.birthday}`

    const gender = document.createElement('p')
    gender.textContent = `性別：${cat.gender}`

    card.append(name, birthday, gender)
    catList.append(card)
  })
}

// Supabaseから猫の一覧を取得する関数
async function loadCats() {
  const { data, error } = await supabase
    .from('cats')
    .select('id, name, birthday, gender')
    .order('created_at', { ascending: true })

  if (error) {
    catMessage.textContent = `取得エラー：${error.message}`
    return
  }

  cats = data
  renderCats()
}

// フォームが送信されたときの処理
catForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  catMessage.textContent = ''

  // ログイン中のユーザー情報を取得
  const { data: userData, error: userError } =
    await supabase.auth.getUser()

  if (userError || !userData.user) {
    catMessage.textContent = 'ログイン状態を確認できません。'
    return
  }

  // フォームの入力値を取得
  const formData = new FormData(catForm)

  // Supabaseに登録する猫のデータ
  const cat = {
    user_id: userData.user.id,
    name: formData.get('name'),
    birthday: formData.get('birthday'),
    gender: formData.get('gender')
  }

  // Supabaseのcatsテーブルに登録
  const { error } = await supabase
    .from('cats')
    .insert(cat)

  if (error) {
    catMessage.textContent = `登録エラー：${error.message}`
    return
  }

  // 登録成功後、フォームをリセット
  catForm.reset()

  catMessage.textContent = '猫の情報を登録しました。'

  // データベースから最新の一覧を取得
  await loadCats()
})

// ログイン状態の変化を監視
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    // 認証状態の通知処理が終わってからDBにアクセス
    setTimeout(() => {
      loadCats()
    }, 0)
  } else {
    // ログアウトしたら猫の一覧を空にする
    cats = []
    catList.replaceChildren()
    catMessage.textContent = ''
  }
})
