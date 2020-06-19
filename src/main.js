import Vue from 'vue';
import 'es6-promise/auto';
import Vuex from 'vuex';
import App from './App.vue';
import Buefy from 'buefy';

Vue.use(Vuex);
Vue.use(Buefy);

Vue.config.productionTip = false;

const { tosbur } = window;

const store = new Vuex.Store({
  state: {
    images: [],
    starting: false,
    containers: [],
    imageOptions: [
      { name: 'jupyter/minimal-notebook', id: 0 },
      { name: 'jupyter/scipy-notebook', id: 1 }
    ]
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
    containerStarting: (state) => state.starting
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
    }
  },
  actions: {
    getImagesAction({ commit }) {
      return tosbur
        .getImages()
        .then((f) => {
          console.log(f);
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
          commit('saveContainers', f);
        })
        .catch((e) => {
          console.error(`There was an error fetching containers ${e}`);
        });
    },
    sendTestMsg() {
      return tosbur.sendPing();
    },
    attachToContainer({ commit }, container) {
      console.log('attachToContainer event dispatched');
      console.log(container);
      return tosbur.attachToContainer(container).then((f) => {
        commit('containerAttached', f);
      });
    },
    createContainerAction({ commit }) {
      console.log('createContainerAction');
      return tosbur
        .createContainer()
        .then((f) => {
          commit('containerCreated', f);
          return f;
        })
        .then(tosbur.startContainer)
        .then((f) => {
          console.log('container started');
          console.log(f);
          commit('containerStarted', f);
          return f;
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
