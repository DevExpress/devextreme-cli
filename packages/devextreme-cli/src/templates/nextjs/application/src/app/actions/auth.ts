'use server'
import { redirect } from 'next/navigation'
import defaultUser from '@/utils/default-user';
import { createSession, deleteSession } from '@/app/lib/session'

export async function signUp(email<%=#isTypeScript%>: string<%=/isTypeScript%>, password<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  try {
    // 1. Check if the user exists in the database and return isOk: false if so;
    // 2. Otherwise, add the user to the database.
    console.log(email, password);

    return {
      isOk: true,
    }
  } catch {
    return {
      isOk: false,
      message: 'Unable to create an account',
    }
  }
}

export async function signIn(email<%=#isTypeScript%>: string<%=/isTypeScript%>, password<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  try {
    // Verify that a user exists
    console.log(email, password);

    await createSession(defaultUser.id);

    return {
      isOk: true,
    }
  } catch {
    return {
      isOk: false,
      message: 'Unable to sign in',
    }
  }
}

export async function signOut() {
  await deleteSession();
  redirect('/login');
}

export async function changePassword(email<%=#isTypeScript%>: string<%=/isTypeScript%>, recoveryCode<%=#isTypeScript%>?: string<%=/isTypeScript%>) {
  try {
    // Verify the recovery code
    console.log(email, recoveryCode);

    return {
      isOk: true,
    }
  } catch {
    return {
      isOk: false,
      message: 'Unable to change the password',
    }
  }
}

export async function resetPassword(email<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  try {
    // Reset password
    console.log(email);

    return {
      isOk: true,
    }
  } catch {
    return {
      isOk: false,
      message: 'Unable to reset password',
    }
  }
}
