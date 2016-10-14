var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    clean = require('gulp-clean'),
    stylus = require('gulp-stylus'),
    browserSync = require('browser-sync'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');


gulp.task('css', function () {
    gulp.src(['./css/*.styl'])
        .pipe(stylus({ onError: function (e) { console.log(e); } }))
        .pipe(gulp.dest('./css/'))
        .pipe(browserSync.reload({ stream: true }));
});


gulp.task('img', function () {
    browserSync.reload({ stream: true });
});


gulp.task('html', function () {
    browserSync.reload({ stream: true });
});


gulp.task('serve', ['html', 'css', 'img'], function () {
    browserSync({
        server: {
            baseDir: './'
        }
    });

    gulp.watch('./css/*.styl', ['css'])
    gulp.watch('./img/*.*', ['img'])
    gulp.watch('./index.html', ['html'])
});
