import { JSEncrypt } from 'jsencrypt';

/**
 * RSA helpers for the RuoYi api encryption.
 *
 * Ported from plus-ui 6.1.0 `src/utils/jsencrypt.ts`.
 */

const publicKey = import.meta.env.VITE_APP_RSA_PUBLIC_KEY;
const privateKey = import.meta.env.VITE_APP_RSA_PRIVATE_KEY;

/** Encrypt a text with the RSA public key. */
export function encrypt(txt: string): string {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey || '');
  return encryptor.encrypt(txt) || '';
}

/** Decrypt a text with the RSA private key (used by the encrypted response). */
export function decrypt(txt: string): string {
  const encryptor = new JSEncrypt();
  encryptor.setPrivateKey(privateKey || '');
  return encryptor.decrypt(txt) || '';
}
