import React, { useState, useRef, useCallback } from 'react';
import { useHistory } from "react-router-dom";
import Form, {
  Item,
  Label,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  EmailRule
} from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import notify from 'devextreme/ui/notify';

const notificationText = 'Check your email for a message with a link to update your password';

export default function (props) {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const formData = useRef({});

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { email } = formData.current;
    setIsLoading(true);

    // Send reset password request
    console.log(email);

    history.push('/login');
    notify(notificationText, 'success', 2500);
  }, [history]);

  return (
    <form onSubmit={onSubmit}>
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
                  : 'Reset my password'
              }
            </span>
          </ButtonOptions>
        </ButtonItem>
      </Form>
    </form>
  );
}

const emailEditorOptions = { stylingMode: 'filled', placeholder: 'Email', mode: 'email' };
