const path = require('path');
const webpack = require('webpack');
const { IgnorePlugin } = webpack;

module.exports = function(options) {
  return {
    ...options,
    entry: './src/main.ts',
    target: 'node',
    externals: [], // Don't externalize anything
    stats: 'errors-only',
    plugins: [
      ...options.plugins,
      new IgnorePlugin({
        checkResource(resource) {
          const lazyImports = [
            '@nestjs/microservices',
            '@nestjs/microservices/microservices-module',
            '@nestjs/websockets/socket-module',
            'cache-manager',
            'class-validator',
            'class-transformer',
          ];
          if (!lazyImports.includes(resource)) {
            return false;
          }
          try {
            require.resolve(resource);
          } catch (err) {
            return true;
          }
          return false;
        },
      }),
    ],
  };
};
