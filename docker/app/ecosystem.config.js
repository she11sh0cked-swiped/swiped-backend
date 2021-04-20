module.exports = {
  apps: [
    {
      env_production: {
        NODE_ENV: 'production',
      },
      name: 'swiped-backend',
      script: 'bundle.js',
    },
  ],
}
