module.exports = {
  apps: [
    {
      name: 'soundwave-web',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: 'apps/web',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'soundwave-api',
      script: 'node dist/main',
      cwd: 'apps/api',
      instances: 2,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
}