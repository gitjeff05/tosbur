const { readFileSync } = require('fs');

const readConfig = () => {
  const data = readFileSync('./jest.config.js', 'utf8');
  return data;
};

console.log('hello preload');

console.log(window);
window.readConfig = readConfig;
