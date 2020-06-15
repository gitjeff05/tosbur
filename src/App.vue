<template>
  <div id="app">
    <h1>{{ title }}</h1>
    <ul id="containers-list">
      <li v-for="item in allImages" :key="item.Id">
        {{ item.Id }}
      </li>
    </ul>
    <h2 v-if="containersCount > 0">Containers</h2>
    <ul id="containers-list">
      <li v-for="item in allContainers" :key="item.Id">
        {{ item.Id.slice(0, 10) }}
      </li>
    </ul>
    <span v-if="containerStarting">Loading</span>
    <button @click="getImages">get images</button>
    <button @click="getContainers">get containers</button>
    <button @click="createContainer">create container</button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
const { tosbur } = window;

/**
 * Docker Engine API is a RESTful API accessed by an HTTP client such as wget or curl, or the HTTP library
 */
export default {
  name: 'App',
  data: () => ({
    title: tosbur.title,
    hasContainers: false,
    hasImages: false
  }),
  /**
   * The difference between methods and computeds:
   * computed properties are cached based on their reactive dependencies
   */
  methods: {
    getImages: function() {
      this.$store.dispatch('getImagesAction');
    },
    getContainers: function() {
      this.$store.dispatch('getContainersAction');
    },
    ping: function() {
      this.$store.dispatch('sendTestMsg');
    },
    createContainer: function() {
      this.$store.dispatch('createContainerAction');
    }
  },
  computed: {
    // mix the getters into computed with object spread operator
    ...mapGetters([
      'allImages',
      'imagesCount',
      'allContainers',
      'containersCount',
      'containerStarting'
    ])
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
