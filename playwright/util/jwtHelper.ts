import {
  randomUUID,
  createPrivateKey,
  KeyObject,
  type JsonWebKey as CryptoJsonWebKey,
} from 'crypto';
import * as jwt from 'jsonwebtoken';

/**
 * JWT Helper Utilities for Maskinporten Integration
 *
 * Provides utilities for creating and signing JWTs used with Maskinporten
 */

/**
 * Generate a unique JWT ID (jti claim)
 * @returns A unique UUID string
 */
export function generateJti(): string {
  return randomUUID();
}

/**
 * Get current timestamps for JWT claims
 * @param expSeconds Expiration time in seconds from now. Default: 60 seconds
 * @returns Object containing iat (issued at) and exp (expires) timestamps
 */
export function getCurrentTimestamps(expSeconds: number = 60): {
  iat: number;
  exp: number;
} {
  const now = Math.floor(Date.now() / 1000);
  return {
    iat: now,
    exp: now + expSeconds,
  };
}

/**
 * Sign a JWT with a JWK private key
 * @param payload The JWT payload (claims)
 * @param privateKey The private key in JWK format
 * @param algorithm The signing algorithm. Default: 'RS256'
 * @returns The signed JWT as a string
 */
export function signJWT(
  payload: Record<string, unknown>,
  privateKey: JsonWebKey,
  algorithm: jwt.Algorithm = 'RS256',
): string {
  // Convert JWK to KeyObject for signing
  const keyObject: KeyObject = createPrivateKey({
    key: privateKey as unknown as CryptoJsonWebKey,
    format: 'jwk',
  });

  // Sign the JWT using jsonwebtoken library
  return jwt.sign(payload, keyObject, {
    algorithm,
    keyid: (privateKey as { kid?: string }).kid,
  });
}

/**
 * Create a standard Maskinporten token request JWT
 * @param clientId The Maskinporten client ID
 * @param scope The requested scope
 * @param tokenEndpoint The Maskinporten token endpoint URL
 * @param privateKey The private key in JWK format
 * @returns The signed JWT as a string
 */
export function createMaskinportenGrantAssertion(
  clientId: string,
  scope: string,
  tokenEndpoint: string,
  privateKey: JsonWebKey,
): string {
  const { iat, exp } = getCurrentTimestamps();
  const jti = generateJti();

  const payload = {
    aud: tokenEndpoint,
    iss: clientId,
    scope,
    iat,
    exp,
    jti,
  };

  return signJWT(payload, privateKey);
}

/**
 * Create a consent authorization JWT
 * @param clientId The Maskinporten client ID
 * @param consentRequestId The ID of the consent request
 * @param fromPersonId The person ID in URN format (e.g., urn:altinn:person:identifier-no:21818297804)
 * @param tokenEndpoint The Maskinporten token endpoint URL
 * @param privateKey The private key in JWK format
 * @returns The signed JWT as a string
 */
export function createConsentAuthorizationJWT(
  clientId: string,
  consentRequestId: string,
  fromPersonId: string,
  tokenEndpoint: string,
  privateKey: JsonWebKey,
): string {
  const { iat, exp } = getCurrentTimestamps();
  const jti = generateJti();

  const payload = {
    aud: 'https://test.maskinporten.no/', // Default Maskinporten audience
    iss: clientId,
    scope: 'altinn:consentrequests.read',
    iat,
    exp,
    jti,
    authorization_details: [
      {
        type: 'urn:altinn:consent',
        id: consentRequestId,
        from: fromPersonId,
      },
    ],
  };

  return signJWT(payload, privateKey);
}

/**
 * Decode a JWT without verifying signature (useful for debugging)
 * @param token The JWT to decode
 * @returns The decoded payload and header
 */
export function decodeJWT(token: string): { header: object; payload: object } | null {
  return jwt.decode(token, { complete: true }) as { header: object; payload: object } | null;
}
