const { contextBridge } = require('electron');
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
      `${process.env.DOCKER_IPC_SOCKET}/containers/json`
    );
    console.log(response.body);
    return JSON.parse(response.body);
  } catch (error) {
    handleError(error);
  }
}

contextBridge.exposeInMainWorld('tosbur', {
  getImages,
  getContainers,
  title: 'Tosbur'
});
