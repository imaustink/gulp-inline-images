# gulp-inline-images

## Why
If you've ever run [Google PageSeed Insights](https://developers.google.com/speed/pagespeed/insights/) or similar tests, you might have seen a warning about above-the-fold content not being delivered in the first request. What if said content is an image? Inline it!

Although there is other existing plugins for this, they only support local files. This Implementation supports remote images from the web. In addition, it gives you control over what images in each file are processed.

## Install
$ ```npm i gulp-inline-images --save-dev```

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
| basedir   | ```String``` | Source file dir  | Base directory of local images   |
| getHTTP   | ```Boolean```| false            | Inline 'http' images             |

## inline attribute
To limit this plugin to specific img elements add an ```inline``` attribute to only the img tags you want to process.
```html
<img src="..." inline>
```
To prevent the plugin from processing certain img elements add an ```!inline``` attribute.
```html
<img src="..." !inline>
```
These attributes will not be in the output. If no img tags with the ```inline``` attribute are found, all img tags will be processed, unless the ```!inline``` tag is present.