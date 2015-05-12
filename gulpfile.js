'use strict';

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var browserify = require('browserify');
var babelify = require("babelify");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var js_src = './public/js/src/';
var js_dist = './public/js/dist/';
var js_bundle = ['index.js'];

gulp.task('less', function() {
  lessify();
});

gulp.task('browserify', function() {
  forEach(js_bundle, function(fname) {
    bundlejs(fname);
  });
});

gulp.task('default', function() {
  lessify();
  forEach(js_bundle, function(fname) {
    bundlejs(fname);
  });
  babeljs();
});

gulp.task('watch', function() {
  forEach(js_bundle, function(fname) {
    gutil.log('Watching ' + fname);
    gulp.watch(js_src + fname, function() {
      bundlejs(fname);
    });
  });

  gulp.watch('./public/less/**/*.less', ['less']);
});

gulp.task('babel', function() {
  babeljs();
});

function lessify() {
  gutil.log('Generating CSS files');
  return gulp.src('./public/less/**/*.less')
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(gulp.dest('./public/css'));
}

function babeljs(src, dist) {
  if (typeof src === 'undefined') src = './src/**/*.js';
  if (typeof dist === 'undefined') dist = './dist';

  gutil.log('Generating ES6 -> ES5 files');

  return gulp.src(src)
    .pipe(babel({ stage: 0 }))
    .pipe(gulp.dest(dist));
}

function bundlejs(file, src, dist) {
  if (typeof src === 'undefined') src = js_src;
  if (typeof dist === 'undefined') dist = js_dist;
  src = addSlash(src);
  dist = addSlash(dist);

  var src_full = src + file;
  var dist_full = dist + file;

  if (!fs.existsSync(src_full)) {
    gutil.log('Could not find ' + src_full + ', ignoring')
    return;
  }

  gutil.log('Generating ' + dist_full);

  var b = browserify(src_full, { debug: true });
  return b.bundle()
    .pipe(source(file))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist));
}

function addSlash(path) {
  return path.slice(-1) == '/' ? path : path + '/';
}

function forEach(obj, cb, context) {
  for (var i = 0, len = obj.length; i < len; i++) {
    if (context === undefined) cb(obj[i], i);
    else cb.call(context, obj[i], i);
  }
}