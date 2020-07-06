import Vue from 'vue';
import 'es6-promise/auto';
import Vuex from 'vuex';
import App from './App.vue';
import Buefy from 'buefy';

/**
 * Begin FontAwesome import and configuration.
 */
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
  faUserSecret,
  faAngleDown,
  faInfoCircle,
  faBoxOpen,
  faChevronLeft,
  faChevronRight,
  faHdd,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import { faPython } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
  faPython,
  faUserSecret,
  faAngleDown,
  faInfoCircle,
  faBoxOpen,
  faChevronLeft,
  faChevronRight,
  faHdd,
  faRocket
);
// https://github.com/FortAwesome/vue-fontawesome#processing-i-tags-into-svg-using-font-awesome
// Note that the FontAwesome SVG core does not watch the page for changes
// https://fontawesome.com/how-to-use/javascript-api/setup/getting-started#comparison
dom.watch(); // This will kick of the initial replacement of i to svg tags and configure a MutationObserver
Vue.use(Buefy, { defaultIconPack: 'fas' });
Vue.component('font-awesome-icon', FontAwesomeIcon);
/* end FontAwesome/Buefy config */

/**
 * Use Vuex
 */
Vue.use(Vuex);

import scipyNotebookDependencies from './data/images/scipy-notebook-conda-list-no-pip.json';
import minimalNotebookDependencies from './data/images/minimal-notebook-conda-list-no-pip.json';

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
      {
        name: 'Basic Notebook',
        imageName: 'jupyter/minimal-notebook',
        description:
          'A basic notebook to get you started. Comes with Jupyter, Python and Node.js',
        id: 0,
        installedPackages: minimalNotebookDependencies
      },
      {
        name: 'Machine Learning Notebook',
        imageName: 'jupyter/scipy-notebook',
        description:
          'A full featured notebook environment. Everything you need to analyze data, create visualizations and build machine learning models.',
        id: 1,
        installedPackages: scipyNotebookDependencies
      }
    ],
    startup: {
      image: null,
      mount: null
    },
    version: null,
    dockerRunning: true
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
    notebookLoaded: (state) => state.attached,
    dockerRunning: (state) => state.dockerRunning
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
      console.log('attaching container');
      state.attached = container;
    },
    containerRemoved(state, container) {
      state.removed = container;
    },
    dockerVersion(state, info) {
      state.version = info;
      state.dockerRunning = true;
    },
    dockerNotRunning(state) {
      state.dockerRunning = false;
    },
    imageSelected(state, imageName) {
      state.startup.image = imageName;
    },
    mountSelected(state, mount) {
      state.startup.mount = mount;
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
    async closeContainerAction({ commit }) {
      commit('containerAttached', await tosbur.closeWebView());
    },
    selectImageAction({ commit }, imageName) {
      commit('imageSelected', imageName);
    },
    async selectMountPath({ commit }, path) {
      try {
        logger(`Files in ${path}`, await tosbur.validatePath(path));
        commit('mountSelected', path);
        return path;
      } catch (error) {
        throw new Error(`Not a valid path ${path}`);
      }
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
          if (
            e.message.indexOf('connection refused') > -1 ||
            e.message.indexOf('ECONNREFUSED') > -1
          ) {
            console.warn('docker not running');
            commit('dockerNotRunning');
          }
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
    async createContainerAction({ commit, state }) {
      try {
        const createContainer = await tosbur.createContainer(state.startup);
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
