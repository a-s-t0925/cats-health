
import { supabase } from '../lib/supabase.js'

// HTML要素を取得
const loginForm = document.querySelector('#login-form')
const signupForm = document.querySelector('#signup-form')

const loginArea = document.querySelector('#login-area')
const signupArea = document.querySelector('#signup-area')

const showSignupButton = document.querySelector('#show-signup')
const showLoginButton = document.querySelector('#show-login')

const authSection = document.querySelector('#auth-section')
const appSection = document.querySelector('#app-section')
const authMessage = document.querySelector('#auth-message')

const userEmail = document.querySelector('#user-email')
const logoutButton = document.querySelector('#logout-button')

// ログイン画面とユーザー登録画面を切り替える
showSignupButton.addEventListener('click', () => {
  loginArea.hidden = true
  signupArea.hidden = false
  authMessage.textContent = ''
})

showLoginButton.addEventListener('click', () => {
  signupArea.hidden = true
  loginArea.hidden = false
  authMessage.textContent = ''
})

// 新規ユーザー登録
signupForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const formData = new FormData(signupForm)

  const email = formData.get('email')
  const password = formData.get('password')

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    authMessage.textContent = `登録エラー：${error.message}`
    return
  }

  authMessage.textContent =
    '確認メールを送信しました。メールを確認してください。'

  signupForm.reset()

  console.log('登録結果:', data)
})

// ログイン
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const formData = new FormData(loginForm)

  const email = formData.get('email')
  const password = formData.get('password')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    authMessage.textContent = `ログインエラー：${error.message}`
    return
  }

  loginForm.reset()

  console.log('ログイン結果:', data)
})

// ログアウト
logoutButton.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    authMessage.textContent = `ログアウトエラー：${error.message}`
  }
})

// 認証状態の変化を監視
supabase.auth.onAuthStateChange((event, session) => {
  const user = session?.user

  if (user) {
    // ログイン済みの場合
    authSection.hidden = true
    appSection.hidden = false

    userEmail.textContent = `ログイン中：${user.email}`
  } else {
    // 未ログインの場合
    authSection.hidden = false
    appSection.hidden = true

    userEmail.textContent = ''
  }

  console.log('認証イベント:', event)
})
