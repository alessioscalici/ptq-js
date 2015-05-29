module.exports = function(config){
  config.set({

    basePath : './',



    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    reporters : ['dots','coverage'],

    plugins : [
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-coverage'
            ],

    preprocessors: {
        './src/*.js': ['coverage'] // all non-test files in feat folder
    },

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

    coverageReporter: {
        type : 'html',
        dir : '../report',
        subdir : 'coverage',
        includeAllSources: true
    }

  });
};