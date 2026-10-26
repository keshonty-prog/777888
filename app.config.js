// app.json remains the shared configuration for development and native builds.
// Project Pages serves this repository from /777888 rather than the host root.
module.exports = ({ config }) => {
  if (process.env.GITHUB_PAGES !== 'true') return config;

  return {
    ...config,
    experiments: {
      ...config.experiments,
      baseUrl: '/777888',
    },
  };
};
