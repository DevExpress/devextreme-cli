import React from 'react';
import { CustomStore } from 'devextreme-react/common/data';
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
} from 'devextreme-react/data-grid';
import './tasks.scss';

export function Tasks() {
  return (
    <React.Fragment>
      <h2>Tasks</h2>

      <DataGrid
        className={'dx-card content-block'}
        dataSource={dataSource}
        showBorders={false}
        focusedRowEnabled={true}
        defaultFocusedRowIndex={0}
        columnAutoWidth={true}
        columnHidingEnabled={true}
      >
        <Paging defaultPageSize={10} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={true} />

        <Column dataField={'id'} width={90} hidingPriority={1} />
        <Column
          dataField={'text'}
          width={190}
          caption={'Subject'}
          hidingPriority={6}
        />
        <Column
          dataField={'status'}
          caption={'Status'}
          hidingPriority={4}
        />
        <Column
          dataField={'owner'}
          caption={'Assigned To'}
          allowSorting={false}
          hidingPriority={5}
        />
        <Column
          dataField={'startDate'}
          caption={'Start Date'}
          dataType={'date'}
          hidingPriority={2}
        />
        <Column
          dataField={'dueDate'}
          caption={'Due Date'}
          dataType={'date'}
          hidingPriority={3}
        />
        <Column
          dataField={'priority'}
          caption={'Priority'}
          name={'Priority'}
          hidingPriority={0}
        />
      </DataGrid>
    </React.Fragment>
)}

const dataSource = {
  store: new CustomStore({
    key: 'id',
    async load() {
      try {
        const response = await fetch(`https://js.devexpress.com/Demos/RwaService/api/Employees/AllTasks`);

        const result = await response.json();

        return {
          data: result,
        };
      } catch {
        throw new Error(`Data Loading Error`);
      }
    },
  })
};
