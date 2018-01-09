const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

gulp.task('build', () => {
  return gulp.src('src/*.js')
    .pipe(babel({
        presets: ['env', 'es2015']
      }))
    .pipe(uglify())
    .pipe(gulp.dest('build'))
});
gulp.task('debug', () => {
  return gulp.src('src/*.js')
    .pipe(babel({
        presets: ['env', 'es2015']
      }))
    .pipe(gulp.dest('debug'))
});
gulp.task('watch', () => {gulp.watch('src/*.js', ['build', 'debug']);});
gulp.task('default', ['build', 'debug']);