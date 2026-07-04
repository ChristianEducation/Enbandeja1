// ═══════════════════════════════════════════════════════════════════
// Encryption — AES-256-GCM para credenciales de pasarelas de pago
// ═══════════════════════════════════════════════════════════════════
// Cifra y descifra campos sensibles (apiKey, secretKey) antes de
// almacenarlos en PaymentProviderConfig.
//
// Requiere env var PAYMENT_ENCRYPTION_KEY (64 chars hex = 32 bytes)
// En desarrollo sin la key, usa modo passthrough (sin cifrado).
// ═══════════════════════════════════════════════════════════════════

import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

function getEncryptionKey(): Buffer | null {
  const keyHex = process.env.PAYMENT_ENCRYPTION_KEY
  if (!keyHex) return null
  try {
    const buf = Buffer.from(keyHex, "hex")
    if (buf.length !== 32) return null
    return buf
  } catch {
    return null
  }
}

/**
 * Cifra un texto plano con AES-256-GCM.
 * Retorna base64(iv:ciphertext:authTag).
 * Si no hay PAYMENT_ENCRYPTION_KEY configurada, retorna el valor directo
 * con prefijo "PLAIN:" para identificación (modo desarrollo).
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  if (!key) {
    // Modo desarrollo: sin cifrado real
    return `PLAIN:${plaintext}`
  }

  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, "utf8", "base64")
  encrypted += cipher.final("base64")

  const authTag = cipher.getAuthTag()

  // Formato: base64(iv + ciphertext + authTag)
  const combined = Buffer.concat([
    iv,
    Buffer.from(encrypted, "base64"),
    authTag,
  ])

  return combined.toString("base64")
}

/**
 * Descifra un valor cifrado con AES-256-GCM.
 * Si el valor tiene prefijo "PLAIN:", lo retorna directamente (modo desarrollo).
 */
export function decrypt(ciphertext: string): string {
  // Modo desarrollo: valor sin cifrado
  if (ciphertext.startsWith("PLAIN:")) {
    return ciphertext.slice(6)
  }

  const key = getEncryptionKey()
  if (!key) {
    throw new Error(
      "PAYMENT_ENCRYPTION_KEY no configurada. No se pueden descifrar credenciales."
    )
  }

  const combined = Buffer.from(ciphertext, "base64")

  const iv = combined.subarray(0, IV_LENGTH)
  const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH)
  const encrypted = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, undefined, "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

/**
 * Genera una clave de encriptación aleatoria de 32 bytes (64 chars hex).
 * Útil para crear la PAYMENT_ENCRYPTION_KEY inicial.
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString("hex")
}
