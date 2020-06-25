import Vue from 'vue';
import 'es6-promise/auto';
import Vuex from 'vuex';
import App from './App.vue';
import Buefy from 'buefy';

Vue.use(Vuex);
Vue.use(Buefy);

Vue.config.productionTip = false;

const { tosbur } = window;

const logger = (msg, obj) => {
  if (process.env.NODE_ENV == 'development') {
    console.log(msg);
    console.log(obj);
  }
};

async function delay(x) {
  await new Promise((resolve) => setTimeout(resolve, x));
}

const store = new Vuex.Store({
  state: {
    images: [],
    starting: false,
    containers: [],
    imageOptions: [
      { name: 'jupyter/minimal-notebook', id: 0 },
      { name: 'jupyter/scipy-notebook', id: 1 }
    ],
    version: null
  },
  getters: {
    allImages: (state) => state.imageOptions,
    allContainers: (state) =>
      state.containers.map((c) => ({
        ...c,
        name: c.Names[0],
        id: c.Id.slice(0, 10)
      })),
    imagesCount: (state, getters) => getters.allImages.length,
    containersCount: (state, getters) => getters.allContainers.length,
    containerStarting: (state) => state.starting,
    dockerVersion: (state) => state.version,
    notebookLoaded: (state) => state.attached
  },
  mutations: {
    saveImages(state, images) {
      state.images = images;
    },
    saveContainers(state, containers) {
      state.containers = containers;
    },
    containerCreated(state, container) {
      state.starting = true;
      state.startingContainer = container;
    },
    containerStarted(state, container) {
      state.started = container.Id;
    },
    containerAttached(state, container) {
      state.attached = container;
    },
    containerRemoved(state, container) {
      state.removed = container;
    },
    dockerVersion(state, info) {
      state.version = info;
    }
  },
  actions: {
    getImagesAction({ commit }) {
      return tosbur
        .getImages()
        .then((f) => {
          logger('fetched images', f);
          commit('saveImages', f);
        })
        .catch((e) => {
          console.error(`There was an error fetching images ${e}`);
        });
    },
    getContainersAction({ commit }) {
      return tosbur
        .getContainers()
        .then((f) => {
          logger('fetched containers', f);
          commit('saveContainers', f);
        })
        .catch((e) => {
          console.error(`There was an error fetching containers ${e}`);
        });
    },
    getDockerVersionAction({ commit }) {
      return tosbur
        .getDockerVersion()
        .then((f) => {
          logger('fetched docker version', f);
          commit('dockerVersion', f);
        })
        .catch((e) => {
          console.error(`There was an error getting version ${e}`);
        });
    },
    attachToContainer({ commit }, container) {
      return tosbur.attachToContainer(container).then((f) => {
        logger('attached to container', container);
        commit('containerAttached', f);
      });
    },
    removeContainer({ commit }, container) {
      return tosbur
        .removeContainer(container)
        .then((f) => {
          logger('container removed', container);
          commit('containerRemoved', f);
        })
        .then(delay.bind(null, 2000))
        .then(tosbur.getContainers)
        .then((f) => {
          logger('fetched containers', f);
          commit('saveContainers', f);
        });
    },
    createContainerAction({ commit }) {
      return tosbur
        .createContainer()
        .then((f) => {
          logger('container created', f);
          commit('containerCreated', f);
          return f;
        })
        .then(tosbur.startContainer)
        .then((f) => {
          logger('container started', f);
          commit('containerStarted', f);
          return f;
        })
        .then(delay.bind(null, 1000))
        .then(tosbur.getContainers)
        .then((f) => {
          logger('fetched containers', f);
          commit('saveContainers', f);
        })
        .catch((e) => {
          console.error(`There was an error creating container ${e}`);
        });
    }
  }
});

new Vue({
  render: (h) => h(App),
  store
}).$mount('#app');
