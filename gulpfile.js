const { src, dest } = require('gulp');
const gulpBabel = require('gulp-babel');
const gulpConcat = require('gulp-concat');
const gulpRename = require('gulp-rename');
const gulpUglify = require('gulp-uglify');
const browserify = require('browserify');
const tap = require('gulp-tap');
const buffer = require('gulp-buffer');
const babelify    = require("babelify");

const sourceFiles = [
    'src/me-forms-manage.js',
    'src/me-form-base.js',
];
const distPath = 'dist/';

const assetsFiles = [
    'demos/js/esm/me-form-view.js',
    'demos/js/esm/me-form-accessible-view.js',
    'demos/js/esm/me-form-accessible-extra-view.js',
];

function js() {
    return src(sourceFiles)
        .pipe(gulpConcat('me-forms.js'))
        .pipe(gulpBabel())
        .pipe(dest(distPath))
        .pipe(gulpUglify())
        .pipe(gulpRename({ suffix: '.min' }))
        .pipe(dest(distPath));
}

exports.build = js;