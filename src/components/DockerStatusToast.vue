<template>
  <div></div>
</template>

<script>
export default {
  name: 'DockerStatusToast',
  mounted() {
    console.log(`mounted ${this.$store.state.dockerRunning}`);
    this.$buefy.snackbar.open({
      message:
        'Uh-oh, unable to connect to Docker on your system. Please start Docker Desktop and try again.',
      type: 'is-warning',
      position: 'is-top',
      actionText: 'Retry',
      indefinite: true,
      onAction: () => {
        this.$store.dispatch('getDockerVersionAction');
      }
    });
  }
};
</script>

<style lang="scss">
.notices.is-top {
  top: 25px;
}
</style>
