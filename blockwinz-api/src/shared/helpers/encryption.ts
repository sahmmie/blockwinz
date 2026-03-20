import * as CryptoJS from 'crypto-js';

class Encryption {
  private readonly key: CryptoJS.lib.WordArray;

  constructor(secret: string) {
    this.key = CryptoJS.SHA256(secret);
  }

  isEncrypted(text: string): boolean {
    return typeof text === 'string' && text.startsWith('ENC:');
  }

  encrypt(text: string): string {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(text, this.key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return `ENC:${JSON.stringify({
      iv: iv.toString(CryptoJS.enc.Hex),
      ct: encrypted.toString(),
    })}`;
  }

  decrypt(text: string): string {
    if (!this.isEncrypted(text)) {
      throw new Error('Input is not in encrypted format.');
    }

    const json = JSON.parse(text.replace(/^ENC:/, ''));
    const iv = CryptoJS.enc.Hex.parse(json.iv);
    const decrypted = CryptoJS.AES.decrypt(json.ct, this.key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  // Optional: Ensures no double-encryption
  encryptIfNotEncrypted(text: string): string {
    return this.isEncrypted(text) ? text : this.encrypt(text);
  }

  decryptIfEncrypted(text: string): string {
    return this.isEncrypted(text) ? this.decrypt(text) : text;
  }
}

export default Encryption;
