var gulp        = require('gulp');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var minifyCSS   = require('gulp-minify-css');
var del         = require('del');
var browserSync = require('browser-sync');

gulp.task('js', function (done) {
    // todo : clean
    gulp.src(['src/js/lib/*.js', 'src/js/script/*.js'])
        .pipe(concat('client.js'))
        .pipe(gulp.dest('src/public/javascripts'));
    done();
});

gulp.task('css', function (done) {
    // todo : clean
    gulp.src('src/css/**/*.css')
        .pipe(concat('style.css'))
        .pipe(gulp.dest('src/public/stylesheets'));
    done();
});

gulp.task('img', function (done) {
    // todo : clean
    gulp.src('src/img/**/*.*')
        .pipe(gulp.dest('src/public/images'));
    done();
});

gulp.task('release', function (done) {
    // todo : clean build
    console.log('not implemented');
    done();
});

gulp.task('clean', function (done) {
    del('dest/**/*');
    done();
});

gulp.task('build', gulp.series(gulp.parallel('js', 'css', 'img'), function (done) {
    gulp.src('src/public/javascripts/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dest/public/javascripts'));

    gulp.src('src/public/stylesheets/*.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest('dest/public/stylesheets'));

    gulp.src('src/public/images/**/*.*')
        .pipe(gulp.dest('dest/public/images'));

    gulp.src('src/views/**/*.pug')
        .pipe(gulp.dest('dest/views'));

    gulp.src(['src/*.js', 'src/*.json'])
        .pipe(gulp.dest('dest'));

    gulp.src('src/log/.gitkeep')
        .pipe(gulp.dest('dest/log'));

    done();
}));

gulp.task('watch', function () {
    browserSync.init({
        proxy: 'localhost:3004'
    });

    gulp.watch('src/js/**/*.js', gulp.series('js', browserSync.reload));
    gulp.watch('src/css/**/*.css', gulp.series('css', browserSync.reload));
    gulp.watch('src/img/**/*.*', gulp.series('img', browserSync.reload));
    gulp.watch('src/views/*.pug', browserSync.reload);
});

gulp.task('default', gulp.series('watch'));
