var gulp = require('gulp');
var inject = require('gulp-inject');
var sass = require('gulp-sass');
var inlinesource = require('gulp-inline-source');
var replace = require('gulp-replace');
var angularFilesort = require('gulp-angular-filesort');
var wiredep = require('gulp-wiredep');
var gls = require('gulp-live-server');
var watch = require('gulp-watch');
var templateCache = require('gulp-angular-templatecache');
var server = gls.static('.', 8000);

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

gulp.task('dev', function () {
  var target = gulp.src('./index.html'); 
  var jsSources = gulp.src(['./app/**/*.js']).pipe(angularFilesort());
  var cssSources = gulp.src(['./*.css']);
  
  gulp.run('sass');
  gulp.run('templatecache');

  return target.pipe(wiredep())
        .pipe(replace(/inline/g, function(s) {
            return replaceAll(s, 'inline', '');
        }))
         .pipe(inject(jsSources))
         .pipe(replace(/><\/script>/g, function(s) {
            return replaceAll(s, '></script>', 'inline></script>');
        })).pipe(replace(/"inline/g, function(s) {
            return replaceAll(s, '"inline', '" inline');
        })).pipe(inject(cssSources))
        .pipe(replace(/<link rel/g, function(s) {
            return replaceAll(s, '<link ', '<link inline ');
        })).pipe(gulp.dest('.'));
});

gulp.task('sass', function () {
  return gulp.src('main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('.'));
});

gulp.task('production', function () {
    // var options = {
    //     compress: true
    // };
    return gulp.src('index.html')
        .pipe(inlinesource({}))
        .pipe(gulp.dest('./build'));
});

gulp.task('server', function() {
	server.start();
});

gulp.task('watch', function() {

	watch('./app/**/*.js', function() {
		gulp.run('dev');
        server.notify.apply(server, []);
	});
	watch('./app/**/*.html', function() {
		gulp.run('dev');
        server.notify.apply(server, []);
	});
	watch(['./app/**/*.scss', 'main.scss'], function() {
		gulp.run('sass');
        server.notify.apply(server, []);
	});
});
//python -m SimpleHTTPServer 8000

gulp.task('templatecache', function(done){
  gulp.src('./app/**/*.html')
  .pipe(templateCache({standalone:true}))
  .pipe(gulp.dest('./app'))
  .on('end', done);
});
