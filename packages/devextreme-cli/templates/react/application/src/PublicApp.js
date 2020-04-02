import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { SingleCard } from './layouts';
import { LoginForm, ResetPasswordForm, CreateAccountForm } from './components';

export default function () {
  return (
    <Switch>
      <Route exact path='/login' >
        <SingleCard title="Sign In">
          <LoginForm />
        </SingleCard>
      </Route>
      <Route exact path='/create-account' >
        <SingleCard title="Sign Up">
          <CreateAccountForm />
        </SingleCard>
      </Route>
      <Route exact path='/reset-password' >
        <SingleCard
          title="Password reset"
          description="Enter your email address and we will send you a password reset link"
        >
          <ResetPasswordForm />
        </SingleCard>
      </Route>
      <Redirect to={'/login'} />
    </Switch>
  );
}
