import React, { useState, useRef, useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Form, {
  Item,
  Label,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  EmailRule
} from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import { useAuth } from '../../contexts/auth';
import './login-form.scss';

export default function (props) {
  const history = useHistory();
  const { logIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const formData = useRef({});

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { email, password } = formData.current;
    setIsLoading(true);

    await logIn(email, password);
  }, [logIn]);

  const onCreateAccountClick = useCallback(() => {
    history.push('/create-account');
  }, [history]);

  return (
    <form className={'login-form'} onSubmit={onSubmit}>
      <Form formData={formData.current} disabled={isLoading}>
        <Item
          dataField={'email'}
          editorType={'dxTextBox'}
          editorOptions={emailEditorOptions}
        >
          <RequiredRule message="Email is required" />
          <EmailRule message="Email is invalid" />
          <Label visible={false} />
        </Item>
        <Item
          dataField={'password'}
          editorType={'dxTextBox'}
          editorOptions={passwordEditorOptions}
        >
          <RequiredRule message="Email is required" />
          <Label visible={false} />
        </Item>
        <Item
          dataField={'rememberMe'}
          editorType={'dxCheckBox'}
          editorOptions={rememberMeEditorOptions}
        >
          <Label visible={false} />
        </Item>
        <ButtonItem>
          <ButtonOptions
            width={'100%'}
            type={'default'}
            useSubmitBehavior={true}
          >
            <span className="dx-button-text">
              {
                isLoading
                  ? <LoadIndicator width={'24px'} height={'24px'} visible={isLoading} />
                  : 'Sign in'
              }
            </span>
          </ButtonOptions>
        </ButtonItem>
        <Item>
          <div className={'link'}>
            <Link to={'/reset-password'}>Forgot password?</Link>
          </div>
        </Item>
        <ButtonItem>
          <ButtonOptions
            text={'Create an account'}
            width={'100%'}
            onClick={onCreateAccountClick}
          />
        </ButtonItem>
      </Form>
    </form>
  );
}

const emailEditorOptions = { stylingMode: 'filled', placeholder: 'Email', mode: 'email' };
const passwordEditorOptions = { stylingMode: 'filled', placeholder: 'Password', mode: 'password' };
const rememberMeEditorOptions = { text: 'Remember me', elementAttr: { class: 'form-text' } };
