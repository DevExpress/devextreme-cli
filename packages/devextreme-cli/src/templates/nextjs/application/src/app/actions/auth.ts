'use server'
import { redirect } from 'next/navigation'
import defaultUser from '@/utils/default-user';
import { createSession, deleteSession } from '@/app/lib/session'

export async function signUp(email<%=#isTypeScript%>: string<%=/isTypeScript%>, password<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  // Create a user in the database
  console.log(email, password);

  await signIn(email, password);
}

export async function signIn(email<%=#isTypeScript%>: string<%=/isTypeScript%>, password<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  // Verify that a user exists
  console.log(email, password);

  await createSession(defaultUser.id);
}

export async function signOut() {
  await deleteSession();
  redirect('/login');
}

export async function changePassword(email<%=#isTypeScript%>: string<%=/isTypeScript%>, recoveryCode<%=#isTypeScript%>?: string<%=/isTypeScript%>) {
  // Verify the recovery code
  console.log(email, recoveryCode);
}

export async function resetPassword(email<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  // Reset password
  console.log(email);
}
