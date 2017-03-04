# gulp-inline-images

## Why
Although there is other existing plugins for this they only support local files. This Implementation supports remote images over HTTP(s).

## Install
```bash
npm i gulp-inline-images --save-dev
```

## Implement
```javascript
var gulp = require('gulp');
var inlineImages = require('gulp-inline-images');

gulp.task('inline-images', function(){
    return gulp.src(['view/*.html'])
    .pipe(inlineImages({/* options */}))
    .pipe(gulp.dest('/public/'));
});
```

## options
| Name      | Type         | Default          | description                      |
|-----------|--------------|------------------|----------------------------------|
| selector  | ```String``` | ```'img[src]'``` | Selection of elements to process |
| attribute | ```String``` | ```'src'```      | Attribute name for source URL    |

## inline attribute
To limit this plugin to specific img elements add an ```inline``` attribute to only the img tags you want to process, see example below:
```html
<img src="..." inline>
```
These attributes will not be in the output. If no img tags with the ```inline``` attribute are found all img tags will be processed.