var gulp = require('gulp')
    karma = require('gulp-karma'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jsdoc = require('gulp-jsdoc'),
    jshint = require('gulp-jshint'),
    del = require('del');




var launchKarma = function (browser) {

    var testFiles = [
        'src/!(_*).js',
        'test/*.js'       // then, include the test specs
    ];

    // Be sure to return the stream
    return gulp.src(testFiles, {read:false})
        .pipe(karma({
            configFile: 'karma/' + browser + '.conf.js',
            action: 'run'
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        });

};


gulp.task('test', function(){
    launchKarma('phantomjs');
});

gulp.task('test-firefox', function(){
    launchKarma('firefox');
});

gulp.task('test-chrome', function(){
    launchKarma('chrome');
});

gulp.task('test-safari', function(){
    launchKarma('safari');
});


gulp.task('docs', function(){

    del.sync('./report/docs');
    return gulp.src(['src/!(_*).js'])
        .pipe(jsdoc('./report/docs'));

});


gulp.task('build-prod', ['jshint'], function(){

    var srcFiles = [
        'src/_start.js',
        'src/!(_*).js',
        'src/_end.js'
    ];

    return gulp.src(srcFiles)
        .pipe(concat('ptq.min.js'))
        .pipe(uglify({
            mangle : true
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('build-concat', ['jshint'], function(){
    var srcFiles = [
        'src/_start.js',
        'src/!(_*).js',
        'src/_end.js'
    ];

    return gulp.src(srcFiles)
        .pipe(concat('ptq.js'))
        .pipe(gulp.dest('.'));
});


gulp.task('build', ['build-concat', 'build-prod']);


gulp.task('dev', ['jshint'], function(){

    var srcFiles = [
        'src/!(_*).js',
    ];

    // Be sure to return the stream
    return gulp.src(srcFiles)
        .pipe(concat('ptq.min.js'))
        .pipe(gulp.dest('build'));

});

gulp.task('jshint', function() {

    var testFiles = [
        'src/_start.js',
        'src/!(_*).js',
        'src/_end.js'
    ];

    return gulp.src(testFiles)
       // .pipe(jscs())   // code style check
        .pipe(concat('ptq.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('cool-reporter'))
        .pipe(jshint.reporter('fail'));
});