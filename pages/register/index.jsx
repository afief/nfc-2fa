import { useRouter } from 'next/dist/client/router'
import { useCallback, useState } from 'react'
import Link from 'next/link'
import crypto from 'crypto-js'
import style from './index.module.scss'
import db from '../../services/db'
import { TABLE_NAME } from '../../constants'

function PageIndex () {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const onSubmit = useCallback((e) => {
    e.preventDefault()

    if (!username || !password) {
      return setError('Semua isian harus terisi')
    }

    db.table(TABLE_NAME).where({ username }).toArray().then((res) => {
      if (res.length) {
        return setError(`User '${username}' sudah didaftarkan. Lupa password? maaf itu tanggung jawab Anda.`)
      }
      db.table(TABLE_NAME)
        .add({ username, password: crypto.SHA256(password).toString(), nfcData: '' })
        .then(id => {
          window.localStorage.setItem('register', id)
          router.push('/register/2fa')
        })
    })
  }, [username, password, router])

  return <div className={style.pageRegister}>
    <div className='inputForm'>
      <h2>Daftar</h2>
      <p>Dapatkan akses ke platform kami</p>

      { error && <div className='error'>{ error }</div> }

      <form onSubmit={onSubmit}>
        <label htmlFor='inputEmail'>Surel</label>
        <input id='inputEmail' type='email' value={username} onChange={(e) => setUsername(e.target.value)} />

        <label htmlFor='inputPassword'>Password</label>
        <input id='inputPassword' type='password' value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type='submit'>Daftar</button>

        <p>Sudah punya akun? <Link href='/login'><a>Login</a></Link></p>
      </form>
    </div>
  </div>
}

export default PageIndex
