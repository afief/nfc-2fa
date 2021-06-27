import Dexie from 'dexie'
import { TABLE_NAME } from '../constants'

const db = new Dexie('nfc-2fa')
db.version(1).stores({ [TABLE_NAME]: '++id, username' })

export default db
