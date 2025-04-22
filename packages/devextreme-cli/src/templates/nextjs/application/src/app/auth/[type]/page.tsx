'use client'
import { use } from 'react';
import { notFound } from 'next/navigation';
import { SingleCard } from '@/layouts';
import { LoginForm, CreateAccountForm, ResetPasswordForm } from '@/components'

const formText = {
  'login': {
    title: 'Sign In'
  },
  'create-account': {
    title: 'Sign Up'
  },
  'reset-password': {
    title: 'Reset Password',
    description: 'Please enter the email address that you used to register, and we will send you a link to reset your password via Email.'
  }
}

function AuthForm({name}<%=#isTypeScript%>: Record<string, any><%=/isTypeScript%>) {
  switch (name) {
    case 'login': return <LoginForm />;
    case 'create-account': return <CreateAccountForm />;
    case 'reset-password': return <ResetPasswordForm />;
  }
}

export default function AuthPage({ params }) {
  const { type } = use(params)

  if (!formText[type]) {
    notFound();
  }

  const { title, description } = formText[type];

  return <SingleCard title={title} description={description}>
    <AuthForm name={type}/>
  </SingleCard>
}
