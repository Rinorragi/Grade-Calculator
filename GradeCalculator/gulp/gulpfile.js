var gulp = require('gulp');
var livereload = require('gulp-livereload');
var del = require('del');
var runSequence = require('run-sequence');
var colors = require('colors/safe');

var configfile = process.env.configfile || 'env.debug.js';

function getConvertedDate(date) {

console.log('\n\n ' + getConvertedDate(new Date()) + ' >> Using configuration file:', colors.green(configfile + '\n\n'));
var config = require('./environments/' + configfile);

var basedir = '../';

// cache with gulp-ruby-sass is working, so to (partially) speed up development we can skip del when debug is enabled
gulp.task('clean', function() {
    return del(paths, { read: false, force: true });
});

gulp.task('sass', function () {
    return sass(sources, {
        noCache: config.enableSassNoCache,
        compass: true,
        style: 'compact',
        // unique temp folder
        tempDir: config.sassTempDir,
        "sourcemap=none": true // passing sourcemap: none creates an error
    })
    .on('error', function (err) { console.log(colors.red(err.message)); })
    .pipe(gulp.dest(basedir + 'static/css/'));
});

gulp.task('bless', function() {
    return gulp.src([basedir + 'static/css/*.css', basedir + 'static/css/**/*.css'])
        .pipe(bless())
        .on('error', function (err) { console.log(colors.red(err.message)); })
        .pipe(gulp.dest(basedir + 'static/css/'))
        .pipe(gulp.dest(basedir + 'static/bundle-css/'));
});

gulp.task('reload', function () {
    livereload.changed('GradeCalculator'); // pass an arbitrary name
});

gulp.task('build', function (callback) {
});

gulp.task('watch', ['build'], function() {
    livereload.listen();

    gulp.watch(
        basedir + 'static/**/*.js',
        ['reload']);

    gulp.watch([
        basedir + '*.Config',
        basedir + '*.config',
        basedir + 'Views/**/*.cshtml'
    ],
    ['reload']);
});

gulp.task('default', ['watch']);