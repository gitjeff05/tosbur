import Vue from 'vue';
import 'es6-promise/auto';
import Vuex from 'vuex';
import App from './App.vue';

Vue.use(Vuex);

Vue.config.productionTip = false;

const { tosbur } = window;

const store = new Vuex.Store({
  state: {
    images: [],
    starting: false,
    containers: []
  },
  getters: {
    allImages: state => state.images,
    allContainers: state => state.containers,
    imagesCount: (state, getters) => getters.allImages.length,
    containersCount: (state, getters) => getters.allContainers.length,
    containerStarting: state => state.starting
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
    }
  },
  actions: {
    getImagesAction({ commit }) {
      return tosbur
        .getImages()
        .then(f => {
          console.log(f);
          commit('saveImages', f);
        })
        .catch(e => {
          console.error(`There was an error fetching images ${e}`);
        });
    },
    getContainersAction({ commit }) {
      return tosbur
        .getContainers()
        .then(f => {
          commit('saveContainers', f);
        })
        .catch(e => {
          console.error(`There was an error fetching containers ${e}`);
        });
    },
    sendTestMsg() {
      return tosbur.sendPing();
    },
    createContainerAction({ commit }) {
      return tosbur
        .createContainer()
        .then(f => {
          commit('containerCreated', f);
        })
        .catch(e => {
          console.error(`There was an error creating container ${e}`);
        });
    }
  }
});

new Vue({
  render: h => h(App),
  store
}).$mount('#app');
