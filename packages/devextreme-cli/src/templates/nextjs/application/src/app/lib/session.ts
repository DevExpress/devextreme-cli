import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
<%=#isTypeScript%>import type { SessionPayload } from '@/types';
<%=/isTypeScript%>
const secretKey = process.env.SESSION_SECRET;
const encoder = new TextEncoder();
const encodedKey = encoder.encode(secretKey);

export async function encrypt(payload<%=#isTypeScript%>: SessionPayload<%=/isTypeScript%>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}
 
export async function decrypt(session<%=#isTypeScript%>: string | undefined = ''<%=/isTypeScript%>) {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });

    return payload;
  } catch (error) {
    console.log('Failed to verify session');
  }
}

export async function createSession(userId<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });
  const cookieStore = await cookies();
 
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
