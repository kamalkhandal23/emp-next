import crypto from 'crypto'

const ALGO = 'aes-256-gcm'
const KEY = crypto.createHash('sha256').update(String(process.env.PII_SECRET || 'changeme')).digest()

export function encrypt(text) {
  if (!text) return { c: '', iv: '', tag: '' }
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, KEY, iv)
  const c = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return { c: c.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64') }
}

export function decrypt({ c, iv, tag }) {
  if (!c) return ''
  const decipher = crypto.createDecipheriv(ALGO, KEY, Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  const p = Buffer.concat([decipher.update(Buffer.from(c, 'base64')), decipher.final()])
  return p.toString('utf8')
}


