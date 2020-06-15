const { contextBridge, ipcRenderer } = require('electron');
const got = require('got');

const handleError = error => {
  const { response } = error;
  const body = JSON.parse(response.body);
  const errorMsg = `${body.message} ${response.url}`;
  console.error(`API error ${errorMsg}`);
  throw new Error(errorMsg);
};

async function getImages() {
  try {
    const response = await got(`${process.env.DOCKER_IPC_SOCKET}/images/json`);
    return JSON.parse(response.body);
  } catch (error) {
    handleError(error);
  }
}

async function getContainers() {
  try {
    const response = await got(
      `${process.env.DOCKER_IPC_SOCKET}/containers/json?all=true`
    );
    console.log(response.body);
    return JSON.parse(response.body);
  } catch (error) {
    handleError(error);
  }
}

// docker run --rm -it -p 8888:8888 -e RESTARTABLE=yes -e JUPYTER_ENABLE_LAB=yes jupyter/minimal-notebook:latest

const imageSettings = {
  AttachStdin: false,
  AttachStdout: true,
  AttachStderr: true,
  ExposedPorts: {
    '8888:8888/tcp': {}
  },
  Tty: false,
  OpenStdin: false,
  StdinOnce: false,
  Env: ['JUPYTER_ENABLE_LAB=yes'],
  ArgsEscaped: true,
  Image: 'jupyter/minimal-notebook:latest',
  Labels: {
    property1: 'string',
    property2: 'string'
  }
};

async function createContainer() {
  try {
    console.log('attempt to create container', imageSettings);
    const { body } = await got.post(
      `${process.env.DOCKER_IPC_SOCKET}/containers/create`,
      {
        json: imageSettings
      }
    );
    console.log(body);
    console.log(JSON.parse(body));
    return JSON.parse(body);
  } catch (error) {
    handleError(error);
  }
}

async function startContainer({ containerId }) {
  try {
    console.log('attempt to create container', imageSettings);
    const { body } = await got.post(
      `${process.env.DOCKER_IPC_SOCKET}/containers/${containerId}/start`
    );
    console.log(body);
    console.log(JSON.parse(body));
    return JSON.parse(body);
  } catch (error) {
    handleError(error);
  }
}

function sendPing() {
  ipcRenderer.send('asynchronous-message', 'ping');
}

contextBridge.exposeInMainWorld('tosbur', {
  getImages,
  getContainers,
  sendPing,
  createContainer,
  startContainer,
  title: 'Tosbur'
});
