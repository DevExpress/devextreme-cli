import React from 'react';
import ScrollView from 'devextreme-react/scroll-view';
import './single-card.scss';

export default ({ children }) => (
  <ScrollView height={'100%'} width={'100%'} className={'with-footer single-card'}>
    <div className={'dx-card content'}>{children}</div>
  </ScrollView>
);
