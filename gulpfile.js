var gulp          = require('gulp');
var sass          = require('gulp-sass');
var sourcemaps    = require('gulp-sourcemaps');
var autoprefixer  = require('gulp-autoprefixer');
var browserSync   = require('browser-sync');
var minifyHTML    = require('gulp-minify-html');
var concat        = require('gulp-concat');





var bases = {
    app:  'src/',
    dist: 'dist/',
};

var autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};


gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: "dist/"
        },
        options: {
            reloadDelay: 250
        },
        notify: true
    });
});


gulp.task('sass', function () {
  return gulp
    // Find all `.scss` files from the `stylesheets/` folder
    .src(bases.app+'scss/app.scss')
    .pipe(sourcemaps.init())
    // Run Sass on those files
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(autoprefixerOptions))
    // Write the resulting CSS in the output folder
    .pipe(gulp.dest(bases.dist + 'css'))
    .pipe(browserSync.reload({stream: true}));
});


gulp.task('minify-html', function() {
  var opts = {
    comments:true,
    spare:true
  };

  gulp.src(bases.app + './*.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest(bases.dist))
    .pipe(browserSync.reload({stream: true}))


});

//compiling our Javascripts
gulp.task('scripts', function() {
    //this is where our dev JS scripts are
    return gulp.src(bases.app+'js/**/*')
                //this is the filename of the compressed version of our JS
                //compress :D
                //.pipe(uglify())
                //where we will store our finalized, compressed script

                .pipe(gulp.dest(bases.dist+'js'))
                //notify browserSync to refresh
                .pipe(browserSync.reload({stream: true}));
});



gulp.task('watch', function() {
  gulp.watch(bases.app + 'scss/**/*.scss', ['sass']);
  gulp.watch(bases.app + './*.html', ['minify-html']);
  gulp.watch(bases.app + 'js/', ['scripts']);


});


gulp.task('default', ['browserSync','sass', 'scripts', 'watch']);
gulp.task('prod', function () {
  return gulp
    .src(bases.app)
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest(bases.dist));
});

