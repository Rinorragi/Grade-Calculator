var gulp = require('gulp');var bless = require('gulp-bless');var sass = require('gulp-ruby-sass');
var livereload = require('gulp-livereload');
var del = require('del');
var runSequence = require('run-sequence');
var colors = require('colors/safe');

var configfile = process.env.configfile || 'env.debug.js';

function getConvertedDate(date) {    function addLeadingZero(num) {        return (num < 10 ? '0'+num : num);    }    return addLeadingZero(date.getDate()) + '.' + addLeadingZero(date.getMonth()+1) + '.' + date.getFullYear() + ' ' + addLeadingZero(date.getHours()) + ':' + addLeadingZero(date.getMinutes()) + ':' + addLeadingZero(date.getSeconds());};

console.log('\n\n ' + getConvertedDate(new Date()) + ' >> Using configuration file:', colors.green(configfile + '\n\n'));
var config = require('./environments/' + configfile);

var basedir = '../';

// cache with gulp-ruby-sass is working, so to (partially) speed up development we can skip del when debug is enabled
gulp.task('clean', function() {    var paths = [        basedir + 'static/css/*.css',        basedir + 'static/css/*.map',        basedir + 'static/css/gadget/*.css',        basedir + 'static/css/gadget/*.map',        basedir + 'static/bundle-css/*.css',        basedir + 'static/bundle-css/*.map',        basedir + 'static/bundle-css/gadget/*.css',        basedir + 'static/bundle-css/gadget/*.map',        basedir + 'static/bundle-css/components/*.css',        basedir + 'static/bundle-css/components/*.map'    ];
    return del(paths, { read: false, force: true });
});

gulp.task('sass', function () {    var sources = [basedir + 'static/sass/*.scss', basedir + 'static/sass/**/*.scss', basedir + 'static/sass/**/**/*.scss'];    if (!config.debug) {        console.log('\n\n ' + getConvertedDate(new Date()) + ' >> Running clearCache to SASS temp-dir:', colors.green(config.sassTempDir + '\n\n'));        sass.clearCache(config.sassTempDir); // clear cache when not debugging    }
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

gulp.task('build', function (callback) {    var buildDate = getConvertedDate(new Date());    if (config.debug) {        console.log('\n\n ' + buildDate + ' >> Running task-sequence:', colors.green('sass -> bless\n\n'));        runSequence('sass', 'bless', 'reload', callback);    } else {        console.log('\n\n ' + buildDate + ' >> Running task-sequence:', colors.green('clean -> sass -> bless\n\n'));        runSequence('clean', 'sass', 'bless', 'reload', callback);    }    
});

gulp.task('watch', ['build'], function() {
    livereload.listen();    gulp.watch([        basedir + 'static/sass/*.scss',        basedir + 'static/sass/**/*.scss',        basedir + 'static/sass/**/**/*.scss'    ],    ['build']);

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