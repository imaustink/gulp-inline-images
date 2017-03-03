var gulp = require('gulp');
var base64 = require('./index');

gulp.task('default', function(){
    return gulp.src(['test/files/*.html'])
    .pipe(base64())
    .pipe(gulp.dest('test/dist/'));
});