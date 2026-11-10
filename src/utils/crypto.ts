import { ecb } from '@noble/ciphers/aes.js';

/**
 * AES helpers for the RuoYi api encryption.
 *
 * Ported from plus-ui 6.1.0 `src/utils/crypto.ts` and kept wire-compatible with the backend
 * `EncryptUtils` (AES/ECB/PKCS7Padding + base64).
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function generateRandomString(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Generate a random 32 chars AES key. */
export function generateAesKey(): Uint8Array {
  return encoder.encode(generateRandomString());
}

/** Encode bytes to base64. */
export function encryptBase64(bytes: Uint8Array): string {
  return bytesToBase64(bytes);
}

/** Decode base64 to bytes. */
export function decryptBase64(str: string): Uint8Array {
  return base64ToBytes(str);
}

/** Encrypt a string with the AES key (AES/ECB/PKCS7Padding, same as the backend). */
export function encryptWithAes(message: string, aesKey: Uint8Array): string {
  const encrypted = ecb(aesKey).encrypt(encoder.encode(message));
  return bytesToBase64(encrypted);
}

/** Decrypt a base64 string with the AES key. */
export function decryptWithAes(message: string, aesKey: Uint8Array): string {
  const decrypted = ecb(aesKey).decrypt(base64ToBytes(message));
  return decoder.decode(decrypted);
}
