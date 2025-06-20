'use client'
import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DropDownButton from 'devextreme-react/drop-down-button';
import List from 'devextreme-react/list';
import { signOut } from '@/app/actions/auth';
import './UserPanel.scss';
<%=#isTypeScript%>import type { UserPanelProps } from '@/types';<%=/isTypeScript%>

export default function UserPanel({ menuMode }<%=#isTypeScript%>: UserPanelProps<%=/isTypeScript%>) {
  const router = useRouter();

  const navigateToProfile = useCallback(() => {
    router.push("/pages/profile");
  }, [router]);

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
  ]), [navigateToProfile]);

  const dropDownButtonAttributes = {
    class: 'user-button'
  };

  const buttonDropDownOptions = {
    width: '150px'
  };

  return (
    <div className='user-panel'>
      {menuMode === 'context' && (
        <DropDownButton
            stylingMode='text'
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
