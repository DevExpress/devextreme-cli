import React from 'react';
import './<%=pageName%>.scss';

export default () => (
  <React.Fragment>
    <h2 className={'content-block'}><%=title%></h2>
    <div className={'content-block'}>
      <div className={'dx-card responsive-paddings'}>
        Put your content here
      </div>
    </div>
  </React.Fragment>
);
