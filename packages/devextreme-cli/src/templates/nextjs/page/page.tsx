import React from 'react';
import './<%=pageName%>.scss';

export default function Page() {
  return <React.Fragment>
    <h2><%=title%></h2>
    <div className={'content-block'}>
      <div className={'dx-card responsive-paddings'}>
        Put your content here
      </div>
    </div>
  </React.Fragment>
};
