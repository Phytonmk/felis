const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const concat = require('gulp-concat');

gulp.task('web', () => {
  return gulp.src('src/index.js')
    .pipe(babel({
        presets: ['env', 'es2015']
      }))
    .pipe(uglify())
    .pipe(gulp.dest('build'))
});
gulp.task('exports', () => {
  return gulp.src(['src/exports.txt', 'src/index.js'])
    .pipe(concat('entry.js', {newLine: ''}))
    .pipe(babel({
        presets: ['env', 'es2015']
      }))
    .pipe(uglify())
    .pipe(gulp.dest('build'))
});
gulp.task('debug', () => {
  return gulp.src(['src/exports.txt', 'src/index.js'])
    .pipe(concat('index.js', {newLine: ''}))
    .pipe(babel({
        presets: ['env', 'es2015']
      }))
    .pipe(gulp.dest('debug'))
});
gulp.task('watch', () => {gulp.watch('src/*.js', ['web', 'exports', 'debug']);});
gulp.task('default', ['web', 'exports', 'debug']);