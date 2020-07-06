<template>
  <div class="container">
    <h1>You are all set, select launch to fire up your lab</h1>
    <div class="buttons">
      <b-button @click="launch" type="is-primary" expanded>Launch</b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'launch-party',
  methods: {
    launch() {
      this.$store.dispatch('createContainerAction');
    }
  }
};
</script>

<style lang="scss" scoped></style>
