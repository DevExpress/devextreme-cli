import React, { useState } from 'react';
import TextBox from 'devextreme-react/text-box';
import ValidationGroup from 'devextreme-react/validation-group';
import Validator, { RequiredRule, CompareRule } from 'devextreme-react/validator';
import Button from 'devextreme-react/button';
import CheckBox from 'devextreme-react/check-box';
import { Link } from 'react-router-dom';

export default function LoginForm(props) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  function loginChanged(e) {
    setLogin(e.value);
  };

  function passwordChanged(e) {
    setPassword(password);
  };

  return (
    <ValidationGroup>
      <div className={'login-header'}>
        <div className={'title'}>Sign Up</div>
      </div>
      <div className={'dx-field'}>
        <TextBox
          value={login}
          onValueChanged={loginChanged}
          placeholder={'Login'}
          width={'100%'}
        >
          <Validator>
            <RequiredRule message='Login is required' />
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
          value={password}
          onValueChanged={passwordChanged}
          placeholder={'Re-type Your Password'}
          width={'100%'}
        >
          <Validator>
            <RequiredRule message='Both passwords need to be the same' />
          </Validator>
        </TextBox>
      </div>
      <div className={'dx-field'}>
        <CheckBox
          defaultValue={false}
        >
          <Validator>
            <CompareRule message='You must agree to the Terms and Conditions' />
          </Validator>
        </CheckBox>
        {` `} I agree with the <Link > Terms of Use and Privacy Policy</Link>
      </div>

      <div className={'dx-field'}>
        <Button
          type={'default'}
          text={'Login'}
          onClick={onLoginClick}
          width={'100%'}
        />
      </div>
      <div className={'dx-field'}>
        Have an account? <Link to={'/home'}> Sign In</Link>
      </div>
      <div className={'dx-field'}>
        <Button type={'normal'} text='Create a new account' width={'100%'} />
      </div>
    </ValidationGroup>
  );
}

function onLoginClick(args) {
  args.validationGroup.reset();
};
