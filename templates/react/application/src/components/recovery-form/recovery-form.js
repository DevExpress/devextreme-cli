import React, { useState } from 'react';
import TextBox from 'devextreme-react/text-box';
import ValidationGroup from 'devextreme-react/validation-group';
import Validator, { RequiredRule } from 'devextreme-react/validator';
import Button from 'devextreme-react/button';

export default function RecoveryForm() {
  const [email, setEmail] = useState()

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
          onChange={(e) => setEmail(e.value)}
        >
          <Validator>
            <RequiredRule message='Login is required' />
          </Validator>
        </TextBox>
      </div>
      <div className={'dx-field'}>
        <Button type={'normal'} text='Reset my password' width={'100%'} />
      </div>
    </ValidationGroup>
  );
}
