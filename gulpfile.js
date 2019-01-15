var gulp = require('gulp');
var sass = require('gulp-sass');
var size = require('gulp-size'); //shows the size of the entire project or files
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber'); //gulp stuff (no watch breaking on errors)
var browserSync = require('browser-sync').create();

var outputDir = 'build';

// css
gulp.task('css', function() {
    gulp.src('src/css/*.scss')
        .pipe(plumber())
        .pipe(sass({outputStyle: ''})
            .on('>>> SASS COMPILING ERROR: ', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
        }))
        .pipe(size())
        .pipe(gulp.dest(outputDir + '/css'))
        .pipe(browserSync.stream());
});

// js
gulp.task('js', function() {
    gulp.src(['src/js/jquery-3.3.1.min.js', 'src/js/two.js', 'src/js/physics.js', 'src/js/main.js'])
        .pipe(plumber())
        .pipe(concat('main.js'))
        // .pipe(uglify())
        .pipe(size())
        .pipe(gulp.dest(outputDir + '/js'))
        .pipe(browserSync.stream());
});

// app
gulp.task('app', function() {
    gulp.src(['src/**/*.php', 'src/.htaccess'])
        .pipe(plumber())
        .pipe(gulp.dest(outputDir))
        .pipe(browserSync.stream());
});

// img
gulp.task('img', function() {
    gulp.src('src/img/**')
    .pipe(gulp.dest(outputDir + '/img'));
});

// data
gulp.task('data', function() {
    gulp.src('src/data/**')
        .pipe(gulp.dest(outputDir + '/data'));
});

gulp.task('watch', function () {
    browserSync.init({
        // server: outputDir,
        proxy: "visualword.dev",
        notify: false
    });

    gulp.watch(['src/app/**', 'src/.htaccess', 'src/index.php'], ['app']),
        gulp.watch('src/css/**', ['css']),
        gulp.watch('src/js/**', ['js']),
        gulp.watch('src/img/**',['img']),
        gulp.watch('src/data/**',['data']);
});

gulp.task('compile', ['css', 'js', 'img', 'app', 'data']);

gulp.task('default', ['compile', 'watch']);