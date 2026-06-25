const SECRET = process.env.JWT_SECRET || 'coinmitra-super-secret-key-at-least-32-characters';

export type SessionPayload = {
  userId: string;
  phone: string;
  adminId?: string;
  email?: string;
  role?: 'admin' | 'user';
  expires: number;
};

function base64url(source: ArrayBuffer): string {
  const bytes = new Uint8Array(source);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64urlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Convert a string to an ArrayBuffer
function stringToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  const payloadStr = JSON.stringify(payload);
  const encodedPayload = btoa(payloadStr)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const data = stringToBuffer(encodedPayload);
  const key = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const encodedSignature = base64url(signature);

  return `${encodedPayload}.${encodedSignature}`;
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [encodedPayload, encodedSignature] = parts;
    
    // Check HMAC signature
    const key = await crypto.subtle.importKey(
      'raw',
      stringToBuffer(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = stringToBuffer(encodedPayload);
    const signatureBuffer = base64urlDecode(encodedSignature);

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBuffer, data);
    if (!isValid) return null;

    // Decode payload
    const decodedPayloadStr = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decodedPayloadStr);

    // Verify expiration
    if (payload.expires && Date.now() > payload.expires) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
