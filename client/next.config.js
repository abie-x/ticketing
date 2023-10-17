//inorder to automatically update the code on the browser for next applications.

//!! you might want to restart the pods to make this update, by killing the current client one. refer session 220, time from 3 minute

module.exports = {
    webpack: (config) => {
      config.watchOptions.poll = 300;
      return config;
    },
};
  