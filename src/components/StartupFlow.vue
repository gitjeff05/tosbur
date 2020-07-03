<template>
  <section>
    <b-steps type="is-success" icon-pack="fas" size="is-large">
      <b-step-item label="Container" icon="box-open">
        <div class="container">
          <h1 class="title">Select a container</h1>
          <p>
            We are adding more containers and you can add additional software
            packages.
          </p>
        </div>
        <ImagesList />
      </b-step-item>
      <b-step-item label="Mount" icon="hdd"><DriveMount /></b-step-item>
      <b-step-item label="Launch" icon="rocket"></b-step-item>
      <template
        v-if="customNavigation"
        slot="navigation"
        slot-scope="{ previous, next }"
      >
        <div class="container">
          <b-button
            outlined
            type="is-danger"
            icon-pack="fas"
            icon-left="chevron-left"
            :disabled="previous.disabled"
            @click.prevent="previous.action"
          >
            Previous
          </b-button>
          <b-button
            outlined
            type="is-success"
            icon-pack="fas"
            icon-right="chevron-right"
            :disabled="next.disabled"
            @click.prevent="next.action"
          >
            Next
          </b-button>
        </div>
      </template>
    </b-steps>
  </section>
</template>

<script>
// import { mapGetters } from 'vuex';
import ImagesList from '../components/ImagesList.vue';
import DriveMount from '../components/DriveMount.vue';

export default {
  name: 'startup-flow',
  data() {
    return {
      activeStep: 0,

      showSocial: false,
      isAnimated: true,
      isRounded: true,
      isStepsClickable: false,

      hasNavigation: true,
      customNavigation: true,
      isProfileSuccess: false,
      'icon-pack': 'fas',
      prevIcon: 'info-circle',
      nextIcon: 'chevron-right',
      labelPosition: 'bottom',
      mobileMode: 'minimalist'
    };
  },
  components: {
    ImagesList,
    DriveMount
  }
};
</script>

<style lang="scss" scoped></style>
