var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    clean = require('gulp-clean'),
    stylus = require('gulp-stylus'),
    browserSync = require('browser-sync'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');


gulp.task('css', function () {
    gulp.src(['./styl/*.styl'])
        .pipe(stylus({ onError: function (e) { console.log(e); } }))
        //.pipe(gulp.dest(function(file) { return file.base; }))
        .pipe(gulp.dest('./css/'))
        .pipe(browserSync.reload({ stream: true }));
});


gulp.task('js', function () {
    browserSync.reload({ stream: true });
});


gulp.task('html', function () {
    browserSync.reload({ stream: true });
});


gulp.task('serve', ['html', 'css', 'js'], function () {
    browserSync({
        server: {
            baseDir: './'
        }
    });

    gulp.watch('./*/*.styl', ['css'])
    gulp.watch('./*/*.js', ['js'])
    gulp.watch('./*/*.html', ['html'])
});
