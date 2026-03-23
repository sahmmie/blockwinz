import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Encryption from 'src/shared/helpers/encryption';

function requireDataEncryptionKey(config: ConfigService): string {
  const key = config.get<string>('DATA_ENCRYPTION_KEY')?.trim();
  if (!key) {
    throw new InternalServerErrorException(
      'DATA_ENCRYPTION_KEY must be configured for wallet encryption (do not use JWT_SECRET for this purpose).',
    );
  }
  return key;
}

/** Encrypt wallet private key material using DATA_ENCRYPTION_KEY only. */
export function encryptWalletSecret(
  plaintext: string,
  config: ConfigService,
): string {
  return new Encryption(requireDataEncryptionKey(config)).encryptIfNotEncrypted(
    plaintext,
  );
}

/** Decrypt wallet private key ciphertext using DATA_ENCRYPTION_KEY only. */
export function decryptWalletSecret(
  ciphertext: string,
  config: ConfigService,
): string {
  return new Encryption(
    requireDataEncryptionKey(config),
  ).decryptIfEncrypted(ciphertext);
}
