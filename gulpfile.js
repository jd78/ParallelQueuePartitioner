const gulp = require('gulp');
const mocha = require('gulp-mocha');
const gulpSequence = require('gulp-sequence');

gulp.task('partitionerTest', () => {
	return gulp.src(['./Test/partitionerTest.js'], 
        { read: false })
        .pipe(mocha({ reporter: 'spec' }))
        .once('error', function () {
            process.exit(1);
        })
        .once('end', function () {
            
        }
    )
})

gulp.task('applicationTest', () => {
	return gulp.src(['./Test/Application/*.js'], 
        { read: false })
        .pipe(mocha({ reporter: 'spec' }))
        .once('error', function () {
            process.exit(1);
        })
        .once('end', function () {
            
        }
    )
})

gulp.task('servicesTest', () => {
	return gulp.src(['./Test/Services/*.js'], 
        { read: false })
        .pipe(mocha({ reporter: 'spec' }))
        .once('error', function () {
            process.exit(1);
        })
        .once('end', function () {
            
        }
    )
})

gulp.task('test sequence', gulpSequence('applicationTest', 'servicesTest', 'partitionerTest'));

gulp.task('default', ['test sequence'], () =>{
    process.exit();
});