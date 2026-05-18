// pm2 process config for the OBM admin
// Run: pm2 start ecosystem.config.js && pm2 save && pm2 startup
module.exports = {
  apps: [
    {
      name: 'obm-admin',
      script: 'server.js',
      cwd: '/var/www/obm-admin',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/obm-admin/error.log',
      out_file: '/var/log/obm-admin/out.log',
      time: true,
    },
  ],
};
