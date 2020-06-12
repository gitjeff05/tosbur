<template>
  <div id="app">
    <h1>{{ title }}</h1>
    <h2 v-if="hasCont">There are some containers running</h2>
    <button @click="getImages">get containers</button>
  </div>
</template>

<script>
const { tosbur } = window;

/**
 * Docker Engine API is a RESTful API accessed by an HTTP client such as wget or curl, or the HTTP library
 */
export default {
  name: 'App',
  data: () => ({
    title: tosbur.title,
    hasCont: false
  }),
  methods: {
    getImages: () => {
      tosbur
        .getImages()
        .then(f => {
          /**
           * Should this be a computed or method?
           * https://vuejs.org/v2/guide/components-dynamic-async.html
           */
          console.log(f);
        })
        .catch(e => {
          console.error(`There was an error fetchin images ${e}`);
        });
    }
  },
  computed: {
    hasRunningContainers: () =>
      tosbur.hasRunningContainers().then(h => {
        /**
         * Is this the right way to update a prop on the model?
         */
        this.hasCont = h;
      })
  }
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
