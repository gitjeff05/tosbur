<template>
  <div class="container">
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>State</th>
          <th>Status</th>
          <th>Attach</th>
          <th>Remove</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="container in allContainers" v-bind:key="container.Id">
          <td>{{ container.id }}</td>
          <td>{{ container.name }}</td>
          <td>{{ container.State }}</td>
          <td>{{ container.Status }}</td>
          <td>
            <button
              class="button"
              v-bind:id="container.Id"
              @click="attachToContainer"
            >
              Attach Container
            </button>
          </td>
          <td>
            <button
              class="button"
              v-bind:id="container.Id"
              @click="removeContainer"
            >
              Remove Container
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  data() {
    return {};
  },
  methods: {
    attachToContainer: function (a) {
      const Id = a.currentTarget.getAttribute('id');
      this.$store.dispatch('attachToContainer', { Id });
    },
    removeContainer: function (a) {
      const Id = a.currentTarget.getAttribute('id');
      this.$store.dispatch('removeContainer', { Id });
    }
  },
  computed: {
    // mix the getters into computed with object spread operator
    ...mapGetters(['allContainers'])
  }
};
</script>
