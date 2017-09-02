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
    reporters: ['coverage', 'progress'],
    coverageReporter: {
      reporters: [
        // generates ./coverage/lcov.info
        {type:'lcovonly', subdir: '.'},
        // generates ./coverage/coverage-final.json
        {type:'json', subdir: '.'},
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
