


var gulp = require('gulp'),
    sass = require('gulp-sass'),
    watch = require('gulp-watch'),
    plumber = require('gulp-plumber')
    ;




//####################################################################################################################################//
//                                                          TASK FUNCTIONS
//####################################################################################################################################//



var task = {

    sass : function(){
        return gulp.src(['assets/sass/*.scss'])
            .pipe(plumber())
            .pipe(sass({
                includePaths : ['assets/sass/']
            }))
            .pipe(plumber.stop())
            .pipe(gulp.dest('assets/css'));
    }
};


//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//
//                                         BUILD TASKS
//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//



gulp.task('sass', task.sass);






//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//
//                                     WATCH TASKS
//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//


var watchMode = false;

gulp.task('watch', function(){

    watchMode = true;


    watch(['assets/sass/*.scss'], function(){
        try {
            task.sass()
            .on('end', task.index);
        } catch (e) {
            console.log(e);
        }
    });


});
