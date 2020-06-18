<template>
  <div class="container">
    <b-table
      :data="allContainers"
      :narrowed="true"
      :columns="columns"
    ></b-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  data() {
    return {
      columns: [
        {
          field: 'id',
          label: 'ID',
          width: '40',
          numeric: true
        },
        {
          field: 'name',
          label: 'Name'
        },
        {
          field: 'State',
          label: 'State'
        },
        {
          field: 'Status',
          label: 'Status'
        }
      ]
    };
  },
  computed: {
    // mix the getters into computed with object spread operator
    ...mapGetters(['allContainers'])
  }
};
</script>
