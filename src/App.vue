<template>
  <div class="container is-fluid is-paddingless">
    <section
      id="app"
      class="section top-nav is-paddingless py-1 has-background-dark"
    >
      <div class="container">
        <!-- Main container -->
        <nav class="level">
          <!-- Left side -->
          <div class="level-left">
            <div class="level-item">
              <h1 class="title has-text-weight-light has-text-bright">
                Tosbur
              </h1>
            </div>
          </div>

          <!-- Right side -->
          <div class="level-right">
            <div class="level-item">
              <b-button
                @click="closeContainer"
                class="is-small"
                type="is-bright"
                >Close Container</b-button
              >
            </div>
            <div class="level-item">
              <b-field>
                <b-select placeholder="Select an image" size="is-small">
                  <option
                    v-for="option in allImages"
                    :value="option.id"
                    :key="option.id"
                  >
                    {{ option.name }}
                  </option>
                </b-select>
              </b-field>
            </div>
            <div class="level-item">
              <b-button
                @click="createContainer"
                class="is-small"
                type="is-bright"
                >Launch Container</b-button
              >
            </div>
            <div class="level-item">
              <b-button class="is-small" @click="getContainers"
                >Get Containers</b-button
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
    DockerStatusToast
  }
};
</script>

<style lang="scss">
// Import Bulma's core
@import '~bulma/sass/utilities/_all';

// Set your colors
$primary: #2c003e;
$primary-invert: findColorInvert($primary);
$twitter: #4099ff;
$twitter-invert: findColorInvert($twitter);
$dark: #512b58;
$dark-invert: findColorInvert($dark);
$bright: #fe346e;
$bright-invert: findColorInvert($bright);

// Setup $colors to use as bulma classes (e.g. 'is-twitter')
$colors: (
  'bright': (
    $bright,
    $primary
  ),
  'white': (
    $white,
    $black
  ),
  'black': (
    $black,
    $white
  ),
  'light': (
    $light,
    $light-invert
  ),
  'dark': (
    $dark,
    $dark-invert
  ),
  'primary': (
    $primary,
    $primary-invert
  ),
  'info': (
    $info,
    $info-invert
  ),
  'success': (
    $success,
    $success-invert
  ),
  'warning': (
    $warning,
    $warning-invert
  ),
  'danger': (
    $danger,
    $danger-invert
  ),
  'twitter': (
    $twitter,
    $twitter-invert
  )
);

// Links
$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;
$button-hover-bright: $white;

// Import Bulma and Buefy styles
@import '~bulma';
@import '~buefy/src/scss/buefy';
</style>
