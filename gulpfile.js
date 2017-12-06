var gulp = require('gulp');
var base64 = require('./index');

var options = {
    cheerio: {
        xmlMode: true,
        lowerCaseTags: false
    }
}

gulp.task('default', function(){
    return gulp.src(['test/files/*.html'])
    .pipe(base64(options))
    .pipe(gulp.dest('test/dist/'));
});