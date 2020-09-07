
const { task } = require('gulp');

const gulp = require('gulp'),
      sass = require('gulp-sass'),
      cssprefix = require('gulp-autoprefixer'),
      ts = require('gulp-typescript'),
      browserSync = require('browser-sync').create();

// Process `scss` files to `css` and autoprefix them
function style() {
    return gulp.src('src/sass/styles.scss')
        .pipe(sass()
            .on('error', (err) => {
                console.log(`Error: ${err.message} on line: ${err.lineNumber} in: ${err.fileName}`)
            }))
        .pipe(cssprefix('last 2 versions')
            .on('error', (err) => {
                console.log(`Error: ${err.message} on line: ${err.lineNumber} in: ${err.fileName}`)
            }))
        .pipe(gulp.dest('src/css/'))
        .pipe(browserSync.stream());
}
 
// Process `ts` files to `js`
function javascript() {
    return gulp.src('src/ts/*.ts')
        .pipe(ts({
            noImplicitAny: true,
            module: 'amd',
        //    outFile: 'scripts.js',
            lib: ["es2017", "dom"],
            target: "es2017"
        }))
        .pipe(gulp.dest('src/js/'));
}

function watch() {
    style();
    javascript();
    browserSync.init({
       server: {
          baseDir: './'
       }
    });
    gulp.watch('src/sass/*.scss', style);
    gulp.watch('src/ts/*.ts', javascript);
    gulp.watch(['*.html', 'src/css/*.css', 'src/js/*.js']).on('change', browserSync.reload);
 }

 task('watch', watch);