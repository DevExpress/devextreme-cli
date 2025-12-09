import <%=#isTypeScript%>React, <%=/isTypeScript%>{ useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Form, {
  Item,
  Label,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  EmailRule,<%=#isTypeScript%>
  type FormTypes,<%=/isTypeScript%>
} from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { useAuth } from '../../contexts/auth-hooks';

import './LoginForm.scss';

export default function LoginForm() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const onFieldDataChanged = useCallback((e<%=#isTypeScript%>: FormTypes.FieldDataChangedEvent<%=/isTypeScript%>) => {
    const { dataField, value } = e;

    if (dataField) {
      setFormData(formData => ({
        ...formData,
        [dataField]: value,
      }));
    }
  }, []);

  const onSubmit = useCallback(async (e<%=#isTypeScript%>: React.FormEvent<HTMLFormElement><%=/isTypeScript%>) => {
    e.preventDefault();
    const { email, password } = formData;
    setLoading(true);

    const result = await signIn(email, password);
    if (!result.isOk) {
      setLoading(false);
      notify(result.message, 'error', 2000);
    }
  }, [signIn, formData]);

  const onCreateAccountClick = useCallback(() => {
    navigate('/create-account');
  }, [navigate]);

  return (
    <form className={'login-form'} onSubmit={onSubmit}>
      <Form formData={formData} disabled={loading} onFieldDataChanged={onFieldDataChanged}>
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
          <RequiredRule message="Password is required" />
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
                loading
                  ? <LoadIndicator width={'24px'} height={'24px'} visible={true} />
                  : 'Sign In'
              }
            </span>
          </ButtonOptions>
        </ButtonItem>
      </Form>
      <div className={'link'}>
        <Link to={'/reset-password'}>Forgot password?</Link>
      </div>
      <Button
        text={'Create an account'}
        stylingMode={ 'outlined' }
        width={'100%'}
        onClick={onCreateAccountClick}
      />
    </form>
  );
}

const emailEditorOptions = { stylingMode: 'filled', placeholder: 'Email', mode: 'email' };
const passwordEditorOptions = { stylingMode: 'filled', placeholder: 'Password', mode: 'password' };
const rememberMeEditorOptions = { text: 'Remember me', elementAttr: { class: 'form-text' } };
