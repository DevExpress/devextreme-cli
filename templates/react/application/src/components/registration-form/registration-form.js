import React, { useState } from 'react';
import TextBox from 'devextreme-react/text-box';
import ValidationGroup from 'devextreme-react/validation-group';
import Validator, { RequiredRule, CompareRule, EmailRule } from 'devextreme-react/validator';
import Button from 'devextreme-react/button';
import CheckBox from 'devextreme-react/check-box';
import { Link, useHistory } from 'react-router-dom';

export default function RegistrationForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [comparison, setComparison] = useState(false);

  const history = useHistory();

  function emailChanged(e) {
    setEmail(e.value);
  };

  function passwordChanged(e) {
    setPassword(e.value);
  };

  function confirmPasswordChanged(e) {
    setConfirmPassword(e.value);
  };

  function onCreateClick(args) {
    if (!args.validationGroup.validate().isValid) {
      return;
    }

    args.validationGroup.reset();
    history.push('/home');
  };

  return (
    <ValidationGroup>
      <div className={'login-header'}>
        <div className={'title'}>Sign Up</div>
      </div>
      <div className={'dx-field'}>
        <TextBox
          value={email}
          onValueChanged={emailChanged}
          placeholder={'Email'}
          width={'100%'}
        >
          <Validator>
            <RequiredRule message='Email is required' />
            <EmailRule message="Email is invalid" />
          </Validator>
        </TextBox>
      </div>
      <div className={'dx-field'}>
        <TextBox
          mode={'password'}
          value={password}
          onValueChanged={passwordChanged}
          placeholder={'Password'}
          width={'100%'}
        >
          <Validator>
            <RequiredRule message='Password is required' />
          </Validator>
        </TextBox>
      </div>
      <div className={'dx-field'}>
        <TextBox
          mode={'password'}
          value={confirmPassword}
          onValueChanged={confirmPasswordChanged}
          placeholder={'Re-type Your Password'}
          width={'100%'}
        >
          <Validator>
            <RequiredRule message="Confirm Password is required" />
            <CompareRule message='Both passwords need to be the same' comparisonTarget={() => { return password }} />
          </Validator>
        </TextBox>
      </div>
      <div className={'dx-field'}>
        <CheckBox
          defaultValue={comparison}
          onClick={(e) => { setComparison(e.value) }}
        >
          <Validator>
            <CompareRule message='You must agree to the Terms and Conditions' comparisonTarget={() => { return true }} />
          </Validator>
        </CheckBox>
        <span> I agree with the <Link > Terms of Use and Privacy Policy</Link></span>
      </div>
      <div className={'dx-field'}>
        <Button
          type={'normal'}
          text='Create a new account'
          width={'100%'}
          onClick={onCreateClick}
        />
      </div>
      <div className={'dx-field'}>
        Have an account? <Link to={'/home'}> Sign In</Link>
      </div>
    </ValidationGroup>
  );
}
