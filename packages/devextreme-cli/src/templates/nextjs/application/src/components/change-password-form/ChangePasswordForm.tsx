'use client'
import <%=#isTypeScript%>React, <%=/isTypeScript%>{ useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Form, {
  Item,
  Label,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  CustomRule,
} from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import notify from 'devextreme/ui/notify';
<%=#isTypeScript%>import { ValidationCallbackData } from 'devextreme-react/common';<%=/isTypeScript%>
import { changePassword } from '@/app/actions/auth';

export default function ChangePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const formData = useRef({ password: '' });

  const onSubmit = useCallback(async (e<%=#isTypeScript%>: React.FormEvent<HTMLFormElement><%=/isTypeScript%>) => {
  e.preventDefault();
  const { password } = formData.current;
  setLoading(true);

  const result = await changePassword(password);
  setLoading(false);

  if (result.isOk) {
    router.push('/login');
  } else {
    notify(result.message, 'error', 2000);
  }
}, [router]);

const confirmPassword = useCallback(
  ({ value }<%=#isTypeScript%>: ValidationCallbackData<%=/isTypeScript%>) => value === formData.current.password,
  []
);

return (
  <form onSubmit={onSubmit}>
    <Form formData={formData.current} disabled={loading}>
      <Item
        dataField={'password'}
        editorType={'dxTextBox'}
        editorOptions={passwordEditorOptions}
      >
        <RequiredRule message="Password is required" />
        <Label visible={false} />
      </Item>
      <Item
        dataField={'confirmedPassword'}
        editorType={'dxTextBox'}
        editorOptions={confirmedPasswordEditorOptions}
      >
        <RequiredRule message="Password is required" />
        <CustomRule
          message={'Passwords do not match'}
          validationCallback={confirmPassword}
        />
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
                  : 'Continue'
              }
            </span>
        </ButtonOptions>
      </ButtonItem>
    </Form>
  </form>
);
}

const passwordEditorOptions = { stylingMode: 'filled', placeholder: 'Password', mode: 'password' };
const confirmedPasswordEditorOptions = { stylingMode: 'filled', placeholder: 'Confirm Password', mode: 'password' };
