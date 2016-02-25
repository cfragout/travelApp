var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var inject = require('gulp-inject');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// The place where our index.html is placed
var target = gulp.src('app/index.html');

// Compiles sass into css
gulp.task('sass', function() {
	return sass('app/assets/scss/main.scss')
		.pipe(gulp.dest('app/assets/css'))
		.pipe(reload({ stream:true }));
});

// Injects  <link> into index.html
gulp.task('build-styles', function(){
	var stylesInjectionTag = '<!-- inject:styles -->';
	var stylesSrc = gulp.src([
								'app/assets/css/*.css',
								'app/vendor/**/*.css',
								'app/vendor/**/css/*.css'
							 ], {read: false});

	return target.pipe(inject(stylesSrc, {ignorePath:'/app/', starttag: stylesInjectionTag}))
				 .pipe(gulp.dest('app'));
});

// Injects <script> tags with user scripts into index.html
gulp.task('build-user-scripts', function(){
	var userScriptsInjectionTag = '<!-- inject:user-scripts -->';
	var userScriptsSrc = gulp.src('app/js/*.js', {read: false});

	return target.pipe(inject(userScriptsSrc, {ignorePath:'/app/', starttag: userScriptsInjectionTag}))
				 .pipe(gulp.dest('app'));
});

// Injects <script> tags with vendor scripts into index.html
gulp.task('build-vendor-scripts', function(){
	var vendorScriptsInjectionTag = '<!-- inject:vendor-scripts -->';
	var vendorScriptsSrc = gulp.src('app/vendor/**/*.js', {read: false});

	return target.pipe(inject(vendorScriptsSrc, {ignorePath:'/app/', starttag: vendorScriptsInjectionTag}))
				 .pipe(gulp.dest('app'));
});

// Injects <script> and <link> into index.html
gulp.task('build', [
					'build-styles',
					'build-vendor-scripts',
					'build-user-scripts'
				   ], function() {
	return;
});

// Watch files for changes and reload
gulp.task('serve', ['sass', 'build'], function() {
	browserSync({
			server: {
			baseDir: 'app'
		}
	});

	gulp.watch('app/assets/scss/*.scss', ['sass']);
	gulp.watch(['*.html',
				'assets/**/*.css',
				'js/*.js',
				], {cwd: 'app'}, reload);
});