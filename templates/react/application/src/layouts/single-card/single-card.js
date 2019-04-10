import React from 'react';
import ScrollView from 'devextreme-react/scroll-view';
import './single-card.scss';

export default ({ children }) => (
  <ScrollView height={'auto'} className={'dx-card single-card'}>
    <div className={'content'}>{children}</div>
  </ScrollView>
);
