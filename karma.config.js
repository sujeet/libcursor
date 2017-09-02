module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    files: [
      {
        pattern: 'test/*.test.js',
        watched: false
      }
    ],
    frameworks: ['jasmine'],
    preprocessors: {
      'test/*.test.js': ['webpack'],
      'src/*.js': ['coverage']
    },
    plugins: [
      require('karma-coverage'),
      require('karma-jasmine'),
      require('karma-phantomjs-launcher'),
      require('karma-webpack')
    ],
    reporters: [
      'coverage',
      'progress'
    ],
    coverageReporter: {
      reporters: [
        // generates ./coverage/lcov.info
        {type: 'lcovonly', subdir: '.'},
        // generates ./coverage/coverage-final.json
        {type: 'json', subdir: '.'},
        // For a pretty coverage report in the terminal
        {type: 'text'}
      ]
    },
    webpack: {
      module: {
        loaders: [
          {
            test: /\.js/,
            exclude: /node_modules/,
            loader: 'babel-loader?presets[]=es2015'
          },
          {
            test: /\.js/,
            include: /(src)/,
            loader: 'istanbul-instrumenter-loader',
            query: {
              esModules: true
            }
          }
        ]
      },
      watch: true
    },
    webpackServer: {
      noInfo: true
    }
  });
};
