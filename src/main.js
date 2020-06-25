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

/**
 * Iterate through the containers and execute a command
 * (jupyter --version)
 * This helps us differentiate between containers running
 * jupyter and those that are not.
 */
const getContainersWithInfo = async () => {
  const containers = await tosbur.getContainers();
  return Promise.all(
    containers.map(async (c) => {
      if (c.State !== 'running') {
        return c;
      }
      const contents = await tosbur.getJupyterInfo(c);
      return {
        ...c,
        hasJupyter: contents.indexOf('jupyter-notebook') > 0 ? true : false
      };
    })
  ).catch((e) => {
    console.error(`There was an error fetching containers ${e}`);
  });
};

const store = new Vuex.Store({
  strict: process.env.NODE_ENV == 'development',
  state: {
    images: [],
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
    async getContainersAction(context) {
      const { commit } = context;
      commit('saveContainers', await getContainersWithInfo());
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
    async removeContainer({ commit }, container) {
      try {
        commit('containerRemoved', await tosbur.removeContainer(container));
        commit('saveContainers', await getContainersWithInfo());
      } catch (error) {
        console.error('Remove Container failed');
        console.error(error);
      }
    },
    async createContainerAction({ commit }) {
      try {
        const createContainer = await tosbur.createContainer();
        const container = await tosbur.startContainer(createContainer);
        commit('containerStarted', container);
        commit('saveContainers', await getContainersWithInfo());
      } catch (error) {
        console.error('Create Container failed');
        console.error(error);
      }
    }
  }
});

new Vue({
  render: (h) => h(App),
  store
}).$mount('#app');
