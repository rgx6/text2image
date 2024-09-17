var gulp        = require('gulp');
var pug         = require('gulp-pug');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var cleanCss    = require('gulp-clean-css');
var del         = require('del');
var browserSync = require('browser-sync');
var sourcemaps  = require('gulp-sourcemaps');
var lec         = require('gulp-line-ending-corrector');

gulp.task('js', function (done) {
    gulp.src([
            'src/js/lib/_jquery-2.1.1.min.js',
            'src/js/lib/jquery.blockUI.min.js',
            'src/js/lib/bootstrap.min.js',
            'src/js/lib/bootstrap-slider.js',
            'src/js/lib/fontdetect.js',
            'src/js/lib/analytics.js',
            'src/js/**/*.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('client.js'))
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(sourcemaps.write('.'))
        .pipe(lec({ verbose: false, eolc: 'LF' }))
        .pipe(gulp.dest('src/public/js'));
    done();
});

gulp.task('css', function (done) {
    gulp.src('src/css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(concat('style.css'))
        .pipe(cleanCss())
        .pipe(sourcemaps.write('.'))
        .pipe(lec({ verbose: false, eolc: 'LF' }))
        .pipe(gulp.dest('src/public/css'));
    done();
});

gulp.task('img', function (done) {
    gulp.src('src/img/**/*.*', { encoding: false })
        .pipe(gulp.dest('src/public/img'));
    done();
});

gulp.task('pug', function (done) {
    gulp.src(['src/views/**/*.pug', '!src/views/**/_*.pug'])
        .pipe(pug({
            pretty: true,
            basedir: 'src/views'
        }))
        .pipe(lec({ verbose: false, eolc: 'LF' }))
        .pipe(gulp.dest('src/public'));
    done();
});

gulp.task('release', function (done) {
    console.log('not implemented');
    done();
});

gulp.task('clean', function (done) {
    del('dist/**/*');
    done();
});

gulp.task('build', gulp.series(gulp.parallel('pug', 'js', 'css', 'img'), function (done) {
    gulp.src(['src/public/js/*.js', 'src/public/js/*.map'])
        .pipe(gulp.dest('dist/js'));

    gulp.src(['src/public/css/*.css', 'src/public/css/*.map'])
        .pipe(gulp.dest('dist/css'));

    gulp.src('src/public/img/**/*.*', { encoding: false })
        .pipe(gulp.dest('dist/img'));

    gulp.src('src/public/**/*.html')
        .pipe(gulp.dest('dist/'));

    done();
}));

gulp.task('watch', function () {
    browserSync.init({
        server: 'src/public',
        index: 'index.html'
    });

    gulp.watch('src/js/**/*.js', gulp.series('js', browserSync.reload));
    gulp.watch('src/css/**/*.css', gulp.series('css', browserSync.reload));
    gulp.watch('src/img/**/*.*', gulp.series('img', browserSync.reload));
    gulp.watch('src/views/**/*.pug', gulp.series('pug', browserSync.reload));
});

gulp.task('default', gulp.series('watch'));
