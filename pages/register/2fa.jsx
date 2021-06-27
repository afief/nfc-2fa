/* global NDEFReader */
import { useRouter } from 'next/dist/client/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import crypto from 'crypto-js'
import db from '../../services/db'
import style from './2fa.module.scss'
import { TABLE_NAME } from '../../constants'

function Page2faRegister () {
  const [triggered, setTriggered] = useState(false)
  const [error, setError] = useState('')
  const ndefRef = useRef()
  const route = useRouter()

  const writeNfc = useCallback(() => {
    setTriggered(true)
    const userId = parseInt(window.localStorage.getItem('register') || 0)
    if (!userId) {
      return route.replace('/register')
    }
    if ('NDEFReader' in window) {
      ndefRef.current = new NDEFReader()
      const encoder = new TextEncoder()
      const nfcData = crypto.SHA256(userId).toString()
      ndefRef.current.scan() // to catch any incoming NFC card data
      ndefRef.current.write({
        records: [{ id: '/nfc-2fa', recordType: 'mime', data: encoder.encode(nfcData) }]
      }).then(() => {
        db.table(TABLE_NAME).get(userId).then(userData => {
          db.table(TABLE_NAME).update(userId, { ...userData, nfcData }).then((updated) => {
            if (updated) route.replace('/login')
          }).catch((err) => {
            setError(`update user error: ${err}`)
          })
        }).catch((err) => {
          setError(`get user error: ${err}`)
        })
      }).catch((err) => {
        setError(`write NFC error: ${err}`)
      })
    } else {
      setError('NFC or Device not supported')
    }
  }, [route])

  useEffect(() => {
    if (!window.localStorage.getItem('register')) {
      route.replace('/register')
    }
  }, [route])

  if (error) {
    return <div className={style.error}>
      {error}
    </div>
  }

  return <div className={style.fa2}>
    <h4>Pindah KTP Anda</h4>
    { !triggered && <button onClick={writeNfc}>Mulai Pindai</button>}
  </div>
}

export default Page2faRegister
