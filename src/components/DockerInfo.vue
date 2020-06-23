<template>
  <div v-bind:class="[{ 'is-active': isActive }, dropdownClass]">
    <div class="dropdown-trigger">
      <button
        class="button is-small is-info is-outlined"
        aria-haspopup="true"
        aria-controls="dropdown-menu2"
        @click="isActive = 'toggle'"
      >
        <span>Docker Info</span>
        <span class="icon is-small">
          <i class="fas fa-angle-down" aria-hidden="true"></i>
        </span>
      </button>
    </div>
    <div class="dropdown-menu" id="dropdown-menu2" role="menu">
      <div class="dropdown-content">
        <div class="dropdown-item">
          <p class="is-size-7 has-text-weight-semibold">
            {{ dockerVersion.Platform.Name }}
          </p>
          <hr class="dropdown-divider" />
          <p class="is-size-7">
            Version:
            <span class="is-family-monospace has-text-weight-semibold">{{
              dockerVersion.Version
            }}</span>
            <br />
            Os:
            <span class="is-family-monospace has-text-weight-semibold">{{
              dockerVersion.Os
            }}</span>
            <br />
            Arch:
            <span class="is-family-monospace has-text-weight-semibold">{{
              dockerVersion.Arch
            }}</span>
            <br />
            ApiVersion:
            <span class="is-family-monospace has-text-weight-semibold">{{
              dockerVersion.ApiVersion
            }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  data() {
    return {
      dropdownClass: 'dropdown',
      showDockerInfo: false
    };
  },
  computed: {
    // mix the getters into computed with object spread operator
    ...mapGetters(['dockerVersion']),
    isActive: {
      get: function () {
        return this.showDockerInfo;
      },
      set: function () {
        this.showDockerInfo = !this.showDockerInfo;
      }
    }
  }
};
</script>
