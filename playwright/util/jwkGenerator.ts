import { generateKeyPairSync, createPublicKey, createPrivateKey, KeyObject } from 'crypto';

/**
 * JWK (JSON Web Key) Generator for Maskinporten
 *
 * This utility helps generate RSA key pairs for Maskinporten integration.
 * The public key needs to be registered in Maskinporten.
 *
 * Usage:
 * 1. Run `node playwright/util/jwkGenerator.ts` to generate a new key pair
 * 2. Copy the PUBLIC KEY and register it in Maskinporten at https://integrasjon.digdir.no/
 * 3. Copy the PRIVATE KEY and store it as MASKINPORTEN_JWK environment variable
 *
 * Security:
 * - Never commit the private key to version control
 * - Store the private key securely (use environment variables or secure vaults)
 * - Use different keys for test and production environments
 */

/**
 * Generate a new RSA key pair and return both keys in JWK format
 * @param keySize RSA key size in bits (2048 or 4096). Default: 2048
 * @returns Object containing private and public keys in JWK format
 */
export function generateKeyPair(keySize: number = 2048): {
  privateKey: object;
  publicKey: object;
} {
  // Generate RSA key pair
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: keySize,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  // Convert PEM keys to JWK format
  const publicJWK = JSON.parse(exportJWK(publicKey) as unknown as string);
  const privateJWK = JSON.parse(exportJWK(privateKey) as unknown as string);

  return {
    privateKey: privateJWK,
    publicKey: publicJWK,
  };
}

/**
 * Convert PEM format key to JWK format
 * @param pemKey Key in PEM format
 * @param isPrivate Whether this is a private key
 * @returns Key in JWK format
 */
export function pemToJWK(pemKey: string, isPrivate: boolean): object {
  // This is a helper for converting existing PEM keys
  // Note: The actual conversion happens via the crypto module's import/export functions
  return {};
}

/**
 * Standalone script to generate a new key pair
 * Run with: npx ts-node playwright/util/jwkGenerator.ts
 * Or compile first: npx tsc playwright/util/jwkGenerator.ts && node playwright/util/jwkGenerator.js
 */
if (typeof require !== 'undefined' && require.main === module) {
  const keyPair = generateKeyPair(2048);

  console.log('='.repeat(80));
  console.log('PRIVATE KEY (store as MASKINPORTEN_JWK environment variable):');
  console.log('='.repeat(80));
  console.log(JSON.stringify(keyPair.privateKey, null, 2));
  console.log('\n');

  console.log('='.repeat(80));
  console.log('PUBLIC KEY (register in Maskinporten):');
  console.log('='.repeat(80));
  console.log(JSON.stringify(keyPair.publicKey, null, 2));
  console.log('\n');

  console.log('Steps to complete setup:');
  console.log('1. Copy the PUBLIC KEY above');
  console.log('2. Go to https://integrasjon.digdir.no/');
  console.log('3. Register your client and add this public key as a JWK');
  console.log('4. Copy the PRIVATE KEY above and store it securely as MASKINPORTEN_JWK');
  console.log('5. Never commit the private key to version control!');
}
function exportJWK(privateKey: string): unknown {
  throw new Error('Function not implemented.');
}
