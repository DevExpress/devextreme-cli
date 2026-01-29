<template>
  <div>
    <h2>Tasks</h2>

    <dx-data-grid
      class="dx-card content-block"
      :data-source="dataSourceConfig"
      :focused-row-index="0"
      :show-borders="false"
      :focused-row-enabled="true"
      :column-auto-width="true"
      :column-hiding-enabled="true"
    >
      <dx-paging :page-size="10" />
      <dx-pager :show-page-size-selector="true" :show-info="true" />
      <dx-filter-row :visible="true" />

      <dx-column data-field="id" :width="90" :hiding-priority="1" />

      <dx-column
        data-field="text"
        caption="Subject"
        :width="190"
        :hiding-priority="6"
      />

      <dx-column
        data-field="status"
        caption="Status"
        :hiding-priority="4"
      />

      <dx-column
        data-field="owner"
        caption="Assigned To"
        :allow-sorting="false"
        :hiding-priority="5"
      />

      <dx-column
        data-field="startDate"
        caption="Start Date"
        data-type="date"
        :hiding-priority="2"
      />

      <dx-column
        data-field="dueDate"
        caption="Due Date"
        data-type="date"
        :hiding-priority="3"
      />

      <dx-column
        data-field="priority"
        caption="Priority"
        name="Priority"
        :hiding-priority="0"
      />
    </dx-data-grid>
  </div>
</template>

<script>
import { CustomStore } from 'devextreme-vue/common/data';
import DxDataGrid, {
  DxColumn,
  DxFilterRow,
  DxPager,
  DxPaging
} from "devextreme-vue/data-grid";

export default {
  setup() {
    const dataSourceConfig = {
      store: new CustomStore({
        key: 'id',
        async load() {
          try {
            const response = await fetch(`https://js.devexpress.com/Demos/RwaService/api/Employees/AllTasks`);

            const result = await response.json();

            return {
              data: result,
            };
          } catch (err) {
            throw new Error('Data Loading Error');
          }
        },
      }),
    };
    return {
      dataSourceConfig,
    };
  },
  components: {
    DxDataGrid,
    DxColumn,
    DxFilterRow,
    DxPager,
    DxPaging
  }
};
</script>
<style lang="scss">
.dx-datagrid-filter-row {
  background-color: transparent;
}
</style>
