module.exports = {
  apps: [
    {
      name: 'DOBERTO-VCF',
      script: './server.js',
      cwd: '/var/www/DOBERTO-VCF',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3200
      }
    }
  ]
};
