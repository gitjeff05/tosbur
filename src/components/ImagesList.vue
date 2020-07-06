<template>
  <div class="container images-list">
    <div
      v-for="image in images"
      :key="image.id"
      @click="selectContainer(image.imageName)"
      v-bind:class="[
        selected === image.imageName
          ? 'has-background-green'
          : 'has-background-black',
        imageClasses
      ]"
    >
      <article class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <font-awesome-icon
              class="is-size-1 has-text-white"
              :icon="['fab', 'python']"
            ></font-awesome-icon>
          </figure>
        </div>
        <div class="media-content">
          <div class="content">
            <h1 class="title is-size-4 has-text-white">
              {{ image.name }}
            </h1>
            <p class="has-text-white">
              <small>@{{ image.imageName }}</small>
              <br />
              {{ image.description }}
            </p>
          </div>

          <template>
            <section>
              <b-field grouped group-multiline>
                <div
                  class="control"
                  v-for="dep in image.primaryPackages"
                  :key="dep.name"
                >
                  <b-taglist attached>
                    <b-tag type="is-primary-tags">{{ dep.name }}</b-tag>
                    <b-tag type="is-info">{{ dep.version }}</b-tag>
                  </b-taglist>
                </div>
              </b-field>
            </section>
          </template>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  name: 'images-list',
  data() {
    return {
      selected: '',
      imageClasses: 'box image is-radiusless'
    };
  },
  methods: {
    selectContainer(imageName) {
      this.selected = imageName;
      this.$store.dispatch('selectImageAction', imageName);
    }
  },
  computed: {
    images() {
      const primaryPackagesList = [
        'python',
        'pandas',
        'scipy',
        'numpy',
        'jupyterlab',
        'seaborn',
        'scipy',
        'matplotlib-base',
        'notebook',
        'sqlite',
        'pip',
        'nodejs',
        'scikit-learn',
        'bokeh'
      ];
      const verbosePackagesList = [
        'python',
        'jupyter',
        'pandas',
        'scipy',
        'numpy',
        'jupyterlab',
        'jupyterhub',
        'seaborn',
        'scipy',
        'matplotlib',
        'ipython',
        'jupyter_client',
        'jupyter_core',
        'jupyterlab_server',
        'matplotlib-base',
        'notebook',
        'nodejs',
        'sqlite',
        'pip',
        'nbconvert',
        'scikit-image',
        'scikit-learn',
        'conda',
        'bokeh'
      ];
      return this.$store.getters.allImages.map((image) => {
        const verbosePackages = image.installedPackages.filter((dep) =>
          verbosePackagesList.includes(dep.name.toLowerCase())
        );
        const primaryPackages = image.installedPackages.filter((dep) =>
          primaryPackagesList.includes(dep.name.toLowerCase())
        );
        return { ...image, primaryPackages, verbosePackages };
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.images-list {
  padding: 2em 0;
}
.image {
  min-height: 250px;
  width: 50%;
}
.image > article {
  padding-right: 4em;
}
.image > article > .media-content h1 {
  margin-bottom: 0.1em;
}
</style>
