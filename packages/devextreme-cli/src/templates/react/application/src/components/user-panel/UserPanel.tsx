import React, { useMemo, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import DropDownButton from 'devextreme-react/drop-down-button';
import List from 'devextreme-react/list';
import { useAuth } from '../../contexts/auth';
import './UserPanel.scss';
<%=#isTypeScript%>import type { UserPanelProps } from '../../types';<%=/isTypeScript%>

export default function UserPanel({ menuMode }<%=#isTypeScript%>: UserPanelProps<%=/isTypeScript%>) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const navigateToProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const menuItems = useMemo(() => ([
    {
      text: 'Profile',
      icon: 'user',
      onClick: navigateToProfile
    },
    {
      text: 'Logout',
      icon: 'runner',
      onClick: signOut
    }
  ]), [navigateToProfile, signOut]);

  const dropDownButtonAttributes = {
    class: 'user-button'
  };

  const buttonDropDownOptions = {
    width: '150px'
  };

  return (
    <div className='user-panel'>
      {menuMode === 'context' && (
        <DropDownButton stylingMode='text'
                        icon='https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/06.png'
                        showArrowIcon={false}
                        elementAttr={dropDownButtonAttributes}
                        dropDownOptions={buttonDropDownOptions}
                        items={menuItems}>
        </DropDownButton>
      )}
      {menuMode === 'list' && (
        <List items={menuItems} />
      )}
    </div>
  );
}
