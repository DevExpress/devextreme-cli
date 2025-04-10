'use client'
import { SingleCard } from '@/layouts';
import { ResetPasswordForm } from '@/components';

export default function LoginPage() {
  return <SingleCard
    title="Reset Password"
    description="Please enter the email address that you used to register, and we will send you a link to reset your password via Email."
  >
    <ResetPasswordForm />
  </SingleCard>
}
