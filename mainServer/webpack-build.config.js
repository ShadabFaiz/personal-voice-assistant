const path = require('node:path');
const webpack = require('webpack');
const { IgnorePlugin } = webpack;

module.exports = function (options) {
  return {
    ...options,
    entry: './src/main.ts',
    target: 'node',
    externals: {
      'playwright': 'commonjs playwright',
      'playwright-core': 'commonjs playwright-core',
      '@whiskeysockets/baileys': 'commonjs @whiskeysockets/baileys',
      'sharp': 'commonjs sharp',
      'jimp': 'commonjs jimp',
    },
    stats: 'errors-only',
    module: {
      ...options.module,
      rules: [
        ...(options.module?.rules || []),
        {
          test: /\.md$/,
          type: 'asset/source',
        },
      ],
    },
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
