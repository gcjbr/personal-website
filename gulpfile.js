var gulp          = require('gulp');
var sass          = require('gulp-sass');
var sourcemaps    = require('gulp-sourcemaps');
var autoprefixer  = require('gulp-autoprefixer');
var browserSync   = require('browser-sync');
var minifyHTML    = require('gulp-minify-html');
var concat        = require('gulp-concat');
var cleanCSS      = require('gulp-clean-css');
var imagemin      = require('gulp-imagemin');
var plumber       = require('gulp-plumber');
var gutil         = require('gulp-util');
var uglify        = require('gulp-uglify');
var shell         = require('gulp-shell');
var gulpSequence  = require('gulp-sequence').use(gulp);


/*----------  CONFIGURATION  -- PATHS  ----------*/

var src           = 'src/';
var work         = 'work/';
var dist          = 'dist/';



/*----------  CONFIGURATION -- TASKS  ----------*/
/* An object holding all configuration for tasks*/


var configs = {

    browserSync: {
        server: {
            baseDir: dist
        },
        options: {
            reloadDelay: 250
        },
        notify: true
    },
    img_options: {
      optimizationLevel: 5,
      progessive: true,
      interlaced: true
    },
    autoprefixer: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
    miniHTML:{
        comments:false,
        spare:true
    }
};





/**
 *
 * TASKS
 *
 */



/*----------  Browser Sync  ----------*/

gulp.task('browserSync', function() {
    browserSync(configs.browserSync);
});


/*----------  Compiling JS ----------*/

gulp.task('scripts', function() {
    //this is where our dev JS scripts are
    return gulp.src([src+'js/libs/**/*.js', src+'js/**/*.js'])
                //prevent pipe breaking caused by errors from gulp plugins
                .pipe(plumber())
                //this is the filename of the compressed version of our JS
                .pipe(concat('app.js'))
                //catch errors
                .on('error', gutil.log)
                //compress :D
                .pipe(uglify())
                //where we will store our finalized, compressed script
                .pipe(gulp.dest(dist+'js'))
                //notify browserSync to refresh
                .pipe(browserSync.reload({stream: true}));
});


// Javascripts for deployment
gulp.task('scripts-deploy', function() {
    //this is where our dev JS scripts are
    return gulp.src([dist+'js/**/*.js'])
                //prevent pipe breaking caused by errors from gulp plugins
                .pipe(plumber())

                .pipe(gulp.dest(work+'js'));
});



/*----------  Compiling CSS ----------*/

gulp.task('styles', function() {
    //the initializer / master SCSS file, which will just be a file that imports everything
    return gulp.src(src+'scss/app.scss')
                //prevent pipe breaking caused by errors from gulp plugins
                .pipe(plumber({
                  errorHandler: function (err) {
                    console.log(err);
                    this.emit('end');
                  }
                }))

                .pipe(sourcemaps.init())
                // Run Sass on those files
                .pipe(sass())
                .pipe(sourcemaps.write())
                .pipe(autoprefixer({
                   browsers: configs.autoprefixer,
                   cascade:  true
                }))
                //catch errors
                .on('error', gutil.log)
                //the final filename of our combined css file
                .pipe(concat('app.css'))

                //where to save our final, compressed css file
                .pipe(gulp.dest(dist+'css'))
                //notify browserSync to refresh
                .pipe(browserSync.reload({stream: true}));
});

// SCSS files for deployment
gulp.task('styles-deploy', function() {
    //the initializer / master SCSS file, which will just be a file that imports everything
    return gulp.src(src+'scss/app.scss')
                .pipe(plumber())
                .pipe(sass())
                .pipe(autoprefixer({
                  browsers: configs.autoprefixer,
                  cascade:  true
                }))
                //the final filename of our combined css file
                .pipe(cleanCSS({compatibility: 'ie8'}))
                //where to save our final, compressed css file
                .pipe(gulp.dest(work+'css'));
});




/*----------  Image optimization ----------*/

gulp.task('images', function() {
  return gulp.src(src+"img/**/*.{jpg,jpeg,png,gif}")
    .pipe(imagemin(configs.img_option))
    .pipe(gulp.dest(dist+"img"));

});

//compressing images & handle SVG files
gulp.task('images-deploy', function() {
    gulp.src([dist+'img/**/*'])
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest(work+'img'));
});


/*----------  HTML OPTIMIZATION ----------*/
gulp.task('html', function() {
    //watch any and all HTML files and refresh when something changes
        gulp.src(src+'*.html')
        .pipe(plumber())
        .pipe(minifyHTML(configs.miniHTML))
        .pipe(gulp.dest(dist))
        .on('error', gutil.log)
        .pipe(browserSync.reload({stream: true}));

});

gulp.task('fonts', function(){
    gulp.src(src+'fonts/*')
    .pipe(plumber())
    .pipe(gulp.dest(dist+'fonts'))
    .pipe(gulp.dest(work+'fonts'));
});



//migrating over all HTML files for deployment
gulp.task('html-deploy', function() {
    //grab everything, which should include htaccess, robots, etc
    gulp.src(dist+'*')
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest(work));

    //grab any hidden files too
    gulp.src(dist+'.*.html')
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest(work));


});


/*----------  Clear dist folder  ----------*/

gulp.task('clean', shell.task([
  'rm -rf '+ work,
  'rm -rf '+ dist

]));


/*----------  Scaffold dist folder  ----------*/
gulp.task('scaffold', shell.task([
      'mkdir '+ work,
      'mkdir '+ work +'fonts',
      'mkdir '+ work +'img',
      'mkdir '+ work +'js',
      'mkdir '+ work +'css'

]));








/*----------  Default task  ----------*/


gulp.task('default', ['browserSync', 'html', 'scripts', 'styles'], function() {
    //a list of watchers, so it will watch all of the following files waiting for changes
    gulp.watch(src+'js/**', ['scripts']);
    gulp.watch(src+'scss/**', ['styles']);
    gulp.watch(src+'img/**', ['images']);
    gulp.watch(src+'*.html', ['html']);
    gulp.watch(src+'fonts/*', ['fonts']);
});


/*----------  Deploy  ----------*/


gulp.task('deploy', gulpSequence('clean', 'scaffold', 'scripts', 'styles', 'images', 'html', 'fonts', 'scripts-deploy', 'styles-deploy', 'images-deploy', 'html-deploy'));



// var autoprefixerOptions = {
//   browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
// };

// var autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];


// gulp.task('optimizeimages', function() {
//   return gulp.src(bases.app+"img/**/*.{jpg,jpeg,png,gif}")
//     .pipe(imagemin(bases.img_options))
//     .pipe(gulp.dest(bases.dist+"img"));

// });


// gulp.task('browserSync', function() {
//     browserSync({
//         server: {
//             baseDir: "dist/"
//         },
//         options: {
//             reloadDelay: 250
//         },
//         notify: true
//     });
// });


// gulp.task('sass', function () {
//   return gulp
//     // Find all `.scss` files from the `stylesheets/` folder
//     .src(bases.app+'scss/app.scss')
//     .pipe(sourcemaps.init())
//     // Run Sass on those files
//     .pipe(sass())
//     .pipe(sourcemaps.write())
//       .pipe(autoprefixer({
//                   browsers: autoPrefixBrowserList,
//                   cascade:  true
//                 }))
//     // Write the resulting CSS in the output folder
//     .pipe(cleanCSS())
//     .pipe(gulp.dest(bases.dist + 'css'))
//     .pipe(browserSync.reload({stream: true}));
// });


// gulp.task('minify-html', function() {
//   var opts = {
//     comments:true,
//     spare:true
//   };

//   gulp.src(bases.app + './*.html')
//     .pipe(minifyHTML(opts))
//     .pipe(gulp.dest(bases.dist))
//     .pipe(browserSync.reload({stream: true}))


// });


// gulp.task('minify-css', function() {
//   return gulp.src('styles/*.css')
//     .pipe(cleanCSS({compatibility: 'ie8'}))
//     .pipe(gulp.dest('dist'));
// });


// //compiling our Javascripts
// gulp.task('scripts', function() {
//     //this is where our dev JS scripts are
//     return gulp.src(bases.app+'js/**/*')
//                 //this is the filename of the compressed version of our JS
//                 //compress :D
//                 //.pipe(uglify())
//                 //where we will store our finalized, compressed script

//                 .pipe(gulp.dest(bases.dist+'js'))
//                 //notify browserSync to refresh
//                 .pipe(browserSync.reload({stream: true}));
// });



// gulp.task('watch', function() {
//   gulp.watch(bases.app + 'scss/**/*.scss', ['sass']);
//   gulp.watch(bases.app + './*.html', ['minify-html']);
//   gulp.watch(bases.app + 'js/*.js', ['scripts']);


// });


// gulp.task('default', ['browserSync','sass', 'scripts', 'watch']);
// gulp.task('prod', function () {
//   return gulp
//     .src(bases.app)
//     .pipe(sass({ outputStyle: 'compressed' }))
//     .pipe(autoprefixer(autoprefixerOptions))
//     .pipe(gulp.dest(bases.dist));
// });

