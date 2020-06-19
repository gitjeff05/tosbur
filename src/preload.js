const { contextBridge, ipcRenderer } = require('electron');
const got = require('got');

/**
 * Generate a generic error in the format that handleError expects
 * @param {String} message
 * @param {String} url
 */
const generateError = (message, url) =>
  JSON.stringify({
    response: {
      url,
      body: JSON.stringify({
        message
      })
    }
  });

const gotErrors = [
  'TimeoutError',
  'CancelError',
  'UnsupportedProtocolError',
  'CacheError',
  'RequestError',
  'ReadError',
  'ParseError',
  'HTTPError'
];

const handleGotError = (error) => {
  let errorMsg = `${error.name} ${error.message}`;
  errorMsg = error.response ? `${errorMsg} ${error.response.body}` : errorMsg;
  throw new Error(errorMsg);
};

/**
 * Print out a nice error from the response object and rethrow
 * @param {Object} error
 */
const handleError = (error) => {
  debugger;
  if (error.options && gotErrors.includes(error.name)) {
    return handleGotError(error);
  }
  let response = error.response
    ? error.response
    : JSON.parse(error.message).response;
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
  const endpoint = `${process.env.DOCKER_IPC_SOCKET}/containers/json?all=true`;
  console.log(endpoint);
  try {
    const response = await got(endpoint);
    console.log(response.body);
    return JSON.parse(response.body);
  } catch (error) {
    handleError(error);
  }
}

// docker run --rm -it -p 8888:8888 -e RESTARTABLE=yes -e JUPYTER_ENABLE_LAB=yes jupyter/minimal-notebook:latest

/**
 * Settings for create image.
 * It is unclear what effect some of these parameters (e.g., AttachStdin)
 * since we are invoking this via REST.
 * https://docs.docker.com/engine/api/v1.40/#operation/ContainerCreate
 */
const imageSettings = {
  AttachStdin: false,
  AttachStdout: true,
  AttachStderr: true,
  ExposedPorts: {
    '8888/tcp': {}
  },
  HostConfig: {
    PortBindings: {
      '8888/tcp': [
        {
          HostIp: '127.0.0.1',
          HostPort: '8888'
        }
      ]
    }
  },
  Tty: true,
  OpenStdin: false,
  StdinOnce: false,
  Env: ['JUPYTER_ENABLE_LAB=yes'],
  Image: 'jupyter/scipy-notebook:latest',
  Labels: {
    'com.optowealth.version': '0.1'
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
    return JSON.parse(body);
  } catch (error) {
    handleError(error);
  }
}

async function startContainer(container) {
  const { Id } = container;
  try {
    console.log(`starting container: ${Id}`);
    const { statusCode, complete, requestUrl } = await got.post(
      `${process.env.DOCKER_IPC_SOCKET}/containers/${Id}/start`
    );
    if (statusCode === 204 && complete) {
      return { Id, statusCode, complete };
    }
    throw new Error(
      generateError(`Start container returned status ${statusCode}`, requestUrl)
    );
  } catch (error) {
    handleError(error);
  }
}

/**
 * This attempts to get the containers logs
 * @param {String} container
 * Documentation indicates that on 200 a stream is returned in response body.
 * https://docs.docker.com/engine/api/v1.40/#operation/ContainerLogs
 */
async function getContainerLogs(container) {
  let { Id } = container;
  console.log(`attempt to get container logs ${Id}`);
  try {
    console.log('attempt to get container logs');
    const response = await got(
      `${process.env.DOCKER_IPC_SOCKET}/containers/${Id}/logs?stdout=1`
    );
    console.log(response);
    return response.body;
  } catch (error) {
    handleError(error);
  }
}

const getLocalJupyterURL = (str) => {
  const matches = str.match(
    /http:\/\/(?:[0-9]{1,3}\.){3}[0-9]{1,3}:8888\/\?token.*/gm
  );
  console.log(matches);
  if (!matches) {
    console.info(str);
    throw new Error('Could not extract Jupyter IP address');
  }
  return matches[0];
};

/**
 * Attach to container
 * @param {String} container
 */
async function attachToContainer(container) {
  let { Id } = container;
  try {
    console.log(`attempt to attach container ${Id}`);
    const endpoint = `${process.env.DOCKER_IPC_SOCKET}/containers/${Id}/attach?logs=true&stdout=true`;
    const response = await got.post(endpoint);
    if (response.body) {
      const ip = getLocalJupyterURL(response.body);
      ipcRenderer.send('open-jupyter', JSON.stringify({ ...container, ip }));
    }
    return response;
  } catch (error) {
    handleError(error);
  }
}

async function openNewBrowserInstance(container) {
  ipcRenderer.send('open-jupyter', JSON.stringify(container));
}

contextBridge.exposeInMainWorld('tosbur', {
  getImages,
  getContainers,
  openNewBrowserInstance,
  createContainer,
  startContainer,
  getContainerLogs,
  attachToContainer,
  title: 'Tosbur'
});
