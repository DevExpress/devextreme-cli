import React from 'react';
import './<%=pageName%>.scss';

export const Page = () => (
  <React.Fragment>
    <h2><%=title%></h2>
    <div className={'content-block'}>
      <div className={'dx-card responsive-paddings'}>
        Put your content here
      </div>
    </div>
  </React.Fragment>
);
