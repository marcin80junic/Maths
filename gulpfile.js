
const { task } = require('gulp');

const gulp = require('gulp'),
      sass = require('gulp-sass'),
      cssprefix = require('gulp-autoprefixer'),
      ts = require('gulp-typescript'),
      browserSync = require('browser-sync').create();

// Process `scss` files to `css` and autoprefix them
function style() {
    return gulp.src('css/sass/styles.scss')
        .pipe(sass()
            .on('error', (err) => {
                console.log(`Error: ${err.message} on line: ${err.lineNumber} in: ${err.fileName}`)
            }))
        .pipe(cssprefix('last 2 versions')
            .on('error', (err) => {
                console.log(`Error: ${err.message} on line: ${err.lineNumber} in: ${err.fileName}`)
            }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.stream());
}
 
// Process `ts` files to `js`
function javascript() {
    return gulp.src('js/ts/*.ts')
        .pipe(ts({
            noImplicitAny: true,
            outFile: 'scripts.js'
        }))
        .pipe(gulp.dest('js/'));
}

function watch() {
    style();
    javascript();
    browserSync.init({
       server: {
          baseDir: './'
       }
    });
    gulp.watch('css/sass/*.scss', style);
    gulp.watch('js/ts/*.ts', javascript);
    gulp.watch('./*.html').on('change', browserSync.reload);
 }

 task('watch', watch);