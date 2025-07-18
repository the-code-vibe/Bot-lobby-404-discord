module.exports = {
  apps: [
    {
      name: 'discord-bot',
      script: 'npm',
      args: 'start',
      cwd: './',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'web-server',
      script: 'web.js',
      cwd: './',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
