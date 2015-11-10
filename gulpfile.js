


var gulp = require('gulp'),
    sass = require('gulp-sass'),
    jade = require('gulp-jade'),
    watch = require('gulp-watch'),
    plumber = require('gulp-plumber')
    ;




//####################################################################################################################################//
//                                                          TASK FUNCTIONS
//####################################################################################################################################//



var task = {

    sass : function(){
        return gulp.src(['src/sass/main.scss', 'src/sass/ie8.scss'])
            .pipe(plumber())
            .pipe(sass({
                includePaths : ['src/sass/']
            }))
            .pipe(plumber.stop())
            .pipe(gulp.dest('assets/css'));
    },
    jade : function(){
        return gulp.src(['src/*.jade'])
            .pipe(plumber())
            .pipe(jade())
            .pipe(plumber.stop())
            .pipe(gulp.dest('.'));
    }
};


//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//
//                                         BUILD TASKS
//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//



gulp.task('sass', task.sass);
gulp.task('jade', task.jade);
gulp.task('default', ['sass', 'jade']);






//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//
//                                     WATCH TASKS
//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//


var watchMode = false;

gulp.task('watch', function(){

    watchMode = true;


    watch(['src/sass/*.scss'], function(){
        try {
            task.sass()
            .on('end', task.index);
        } catch (e) {
            console.log(e);
        }
    });

    watch(['src/*.jade'], function(){
        try {
            task.jade()
            .on('end', task.index);
        } catch (e) {
            console.log(e);
        }
    });


});
