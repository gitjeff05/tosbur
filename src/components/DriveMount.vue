<template>
  <section>
    <b-field
      v-bind:label="isValid ? 'Path' : 'Invalid Path'"
      :type="formType"
      :message="formMessage"
    >
      <b-input v-model="pathToLocal" size="is-large"></b-input>
    </b-field>
  </section>
</template>

<script>
var debounce = require('lodash/fp/debounce');

export default {
  name: 'drive-mount',
  data() {
    return {
      pathToLocal: '',
      validPath: true,
      initialLoad: true
    };
  },
  watch: {
    // whenever pathToLocal changes, this function will run
    pathToLocal: function () {
      this.debouncedCheckPath();
    }
  },
  created() {
    this.debouncedCheckPath = debounce(1000, this.checkPath);
  },
  methods: {
    checkPath() {
      this.initialLoad = false;
      this.$store
        .dispatch('selectMountPath', this.pathToLocal)
        .then(() => {
          this.validPath = true;
        })
        .catch((e) => {
          console.error(e);
          this.validPath = false;
        });
    }
  },
  computed: {
    isValid() {
      return this.validPath;
    },
    formMessage() {
      if (this.initialLoad) {
        return '';
      }
      return this.validPath ? 'valid path' : 'invalid path';
    },
    formType() {
      if (this.initialLoad) {
        return '';
      }
      return this.validPath ? 'is-success' : 'is-danger';
    }
  }
};
</script>

<style lang="scss" scoped></style>
