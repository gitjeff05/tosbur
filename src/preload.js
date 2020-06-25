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
  'HTTPError',
  'MaxRedirectsError'
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
  console.error('Handling error in preload.js');
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
  console.log(`Attempt to fetch containers from ${endpoint}`);
  try {
    const body = await got(endpoint).json();
    return body;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Settings for create image.
 * It is unclear what effect some of these parameters (e.g., AttachStdin)
 * since we are invoking this via REST.
 * https://docs.docker.com/engine/api/v1.40/#operation/ContainerCreate
 * The ExposedPorts and HostConfig may require changing per container.
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
    const requestUrl = `${process.env.DOCKER_IPC_SOCKET}/containers/create`;
    const body = await got.post(requestUrl, { json: imageSettings }).json();
    return body;
  } catch (error) {
    handleError(error);
  }
}

async function removeContainer({ Id }) {
  try {
    console.log('attempt to remove container', Id);
    await got.delete(
      `${process.env.DOCKER_IPC_SOCKET}/containers/${Id}?force=1`
    );
  } catch (error) {
    handleError(error);
  }
}

async function getDockerVersion() {
  try {
    console.log(`Getting docker version`);
    const requestUrl = `${process.env.DOCKER_IPC_SOCKET}/version`;
    const { body, statusCode } = await got(requestUrl, {
      responseType: 'json'
    });
    if (statusCode === 200 && body) {
      return body;
    }
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
    const response = await got(
      `${process.env.DOCKER_IPC_SOCKET}/containers/${Id}/logs?stdout=1`
    );
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
    // Do not parse the body as json because this is console output.
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

contextBridge.exposeInMainWorld('tosbur', {
  getImages,
  getContainers,
  createContainer,
  startContainer,
  getContainerLogs,
  attachToContainer,
  removeContainer,
  getDockerVersion,
  title: 'Tosbur'
});
