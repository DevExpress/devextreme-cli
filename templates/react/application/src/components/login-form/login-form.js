import React, { useState } from 'react';
import TextBox from 'devextreme-react/text-box';
import ValidationGroup from 'devextreme-react/validation-group';
import Validator, { RequiredRule } from 'devextreme-react/validator';
import Button from 'devextreme-react/button';
import CheckBox from 'devextreme-react/check-box';
import './login-form.scss';
import { Link, useHistory } from 'react-router-dom';
import appInfo from '../../app-info';

export default function LoginForm(props) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const history = useHistory();

  function loginChanged(e) {
    setLogin(e.value);
  };

  function passwordChanged(e) {
    setPassword(e.value);
  };

  function onLoginClick(args) {
    if (!args.validationGroup.validate().isValid) {
      return;
    }

    props.onLoginClick(login, password);

    args.validationGroup.reset();
  };

  return (
    <ValidationGroup>
      <div className={'login-header'}>
        <div className={'title'}>{appInfo.title}</div>
        <div>Sign In to your account</div>
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
        <CheckBox defaultValue={false} text='Remember me' />
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
        <Link to={'recovery'} >Forgot password ?</Link>
      </div>
      <div className={'dx-field'}>
        <Button type={'normal'}
          text={'Create an account'}
          width={'100%'}
          onClick={() => history.push('registration')}
          useSubmitBehavior={true}
        />
      </div>
    </ValidationGroup>
  );
}
