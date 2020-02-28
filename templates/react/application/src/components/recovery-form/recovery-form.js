import React, { useState } from 'react';
import TextBox from 'devextreme-react/text-box';
import ValidationGroup from 'devextreme-react/validation-group';
import Validator, { RequiredRule, EmailRule } from 'devextreme-react/validator';
import Button from 'devextreme-react/button';
import { useHistory } from 'react-router-dom';

export default function RecoveryForm() {
  const [email, setEmail] = useState()
  const history = useHistory();

  function emailChanged(e) {
    setEmail(e.value);
  };

  function onResetClick(args) {
    if (!args.validationGroup.validate().isValid) {
      return;
    }

    args.validationGroup.reset();
    history.push('/home');
  };

  return (
    <ValidationGroup>
      <div className={'login-header'}>
        <div className={'title'}>Password Reset</div>
        <div>Enter your email address and we will send you a password reset link</div>
      </div>
      <div className={'dx-field'}>
        <TextBox
          value={email}
          placeholder={'Email'}
          width={'100%'}
          onChange={(e) => emailChanged(e)}
        >
          <Validator>
            <RequiredRule message='Email is required' />
            <EmailRule message="Email is invalid" />
          </Validator>
        </TextBox>
      </div>
      <div className={'dx-field'}>
        <Button
          type={'normal'}
          text='Reset my password'
          width={'100%'}
          onClick={onResetClick}
        />
      </div>
    </ValidationGroup>
  );
}
