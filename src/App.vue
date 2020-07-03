<template>
  <div class="container is-fluid is-paddingless">
    <section
      id="app"
      class="section top-nav is-paddingless py-1 has-background-dark"
    >
      <div class="container is-fluid tosbur-nav">
        <!-- Main container -->
        <nav class="level">
          <!-- Left side -->
          <div class="level-left">
            <div class="level-item">
              <h1 class="title is-size-5 has-text-weight-light has-text-light">
                Tosbur
              </h1>
            </div>
          </div>

          <!-- Right side -->
          <div class="level-right">
            <div v-if="notebookLoaded" class="level-item">
              <b-button
                @click="closeContainer"
                class="is-small"
                type="is-bright"
                >Close Container</b-button
              >
            </div>
            <div class="level-item">
              <b-button
                @click="createContainer"
                class="is-small"
                type="is-bright"
                >Launch Container</b-button
              >
            </div>
            <div v-if="dockerVersion" class="level-item">
              <docker-info></docker-info>
            </div>
          </div>
        </nav>
      </div>
    </section>
    <section v-if="!dockerRunning"><DockerStatusToast /></section>

    <section
      v-else-if="!notebookLoaded && allContainers.length == 0"
      class="section"
    >
      <StartupFlow />
    </section>
    <section v-else-if="!notebookLoaded" class="section">
      <ContainerTable />
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import ContainerTable from './components/ContainerTable';
import DockerInfo from './components/DockerInfo';
import DockerStatusToast from './components/DockerStatusToast';
import StartupFlow from './components/StartupFlow';

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
  created: function () {
    this.$store.dispatch('getDockerVersionAction');
    this.$store.dispatch('getContainersAction');
  },
  /**
   * The difference between methods and computeds:
   * computed properties are cached based on their reactive dependencies
   */
  methods: {
    getImages: function () {
      this.$store.dispatch('getImagesAction');
    },
    getContainers: function () {
      this.$store.dispatch('getContainersAction');
    },
    createContainer: function () {
      this.$store.dispatch('createContainerAction');
    },
    closeContainer: function () {
      this.$store.dispatch('closeContainerAction');
    }
  },
  computed: {
    // mix the getters into computed with object spread operator
    ...mapGetters([
      'allImages',
      'allContainers',
      'notebookLoaded',
      'dockerVersion',
      'dockerRunning'
    ])
  },
  components: {
    ContainerTable,
    DockerInfo,
    DockerStatusToast,
    StartupFlow
  }
};
</script>

<style lang="scss">
// Import Bulma's core
@import '~bulma/sass/utilities/_all';

#app .tosbur-nav.is-fluid {
  padding: 0 1em;
}

/* SCSS HEX 
https://coolors.co/4d8b31-f2bb05-1e2d2f-fbf5f3-bb342f
*/
$maximum-green: #4d8b31ff;
$orange-yellow: #f2bb05ff;
$primary: #1e2d2fff;
$primary-invert: findColorInvert($primary);
$primary-dark: #18231dff;
$primary-tags: #30484bff;
$sap-green: #43792aff;
$snow: #fbf5f3ff;
$international-orange-golden-gate-bridge: #bb342fff;

// Setup $colors to use as bulma classes (e.g. 'is-twitter')
/* eslint-disable prettier/prettier */
$colors: (
    "white": ($white, $black),
    "black": ($black, $white),
    "light": ($snow, $primary),
    "dark": ($primary-dark, $snow),
    "primary": ($primary, $primary-invert),
    "primary-tags": ($primary-tags, $primary-invert),
    "info": ($info, $info-invert),
    "green": ($maximum-green, $snow),
    "green-selected": ($sap-green, $snow),
    "success": ($success, $success-invert),
    "warning": ($orange-yellow, $warning-invert),
    "danger": ($international-orange-golden-gate-bridge, $danger-invert)
);
/* eslint-enable */

// Links
$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;
$button-hover-bright: $white;

body {
  background-color: $snow;
}

// Import Bulma and Buefy styles
@import '~bulma';
@import '~buefy/src/scss/buefy';
</style>
