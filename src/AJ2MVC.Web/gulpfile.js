/// <binding AfterBuild='libs, rxjs, transpiledJSModuleDefinition' Clean='clean' />
var gulp = require('gulp');
var rimraf = require('rimraf');
var concat = require('gulp-concat');
var tap = require('gulp-tap');
// var uglify = require('gulp-uglify');
var sourcemaps = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var exec = require('child_process').exec;

var rhetosPath = 'C:/Projects/2CS/RhetosDEV/Rhetos';

// var minify = require("gulp-minify");

var paths = {
    npm: "./node_modules/",
    lib: "./wwwroot/lib/",
    compiledTS: "./dist/",
    appjs: "./wwwroot/js/"
};

var libs = [
    "scripts/jQuery.js",
    "scripts/jQuery-ui.js",
    paths.npm + "angular2/bundles/angular2.js",
    paths.npm + "angular2/bundles/router.js",
    paths.npm + "angular2/bundles/http.js",
    paths.npm + "angular2/bundles/angular2-polyfills.js",
    paths.npm + "es6-shim/es6-shim.js",
    paths.npm + "zone.js/dist/zone.js",
    paths.npm + "moment/moment.js",
    paths.npm + "reflect-metadata/reflect.js",
    paths.npm + "systemjs/dist/system.js",
    paths.npm + "systemjs/dist/system-polyfills.js",
    paths.npm + "ng2-bootstrap/bundles/ng2-bootstrap.js"
];

gulp.task("libs", function () {
    gulp.src(libs).pipe(gulp.dest(paths.lib));
});

gulp.task("transpiledJSModuleDefinition", function () {

    gulp.src(paths.compiledTS + "scripts/**/*.js")
        .pipe(tap(function (file) {
            console.log(file.path + ' - Module[\'' + file.relative.toString().replace(/\\/g, '/').replace('.js', '') + '\']');
            var originalContent = file.contents.toString('utf8');
            var registerPart = (new Buffer("System.register(")).toString('utf8');
            var registerLocation = originalContent.indexOf(registerPart);

            if (registerLocation >= 0) {
                file.contents = Buffer.concat([
                        new Buffer(originalContent.substr(0, registerLocation)),
                        new Buffer("System.register('" + file.relative.toString().replace(/\\/g, '/').replace('.js', '') + "', "),
                        new Buffer(originalContent.substr(registerLocation + 16))
                ]);
            }

        }))
        //.pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(paths.appjs));
    //.pipe(minify())
    //.pipe(sourcemaps.write("./"))
    //.pipe(gulp.dest(paths.appjs));

    gulp.src(paths.compiledTS + "node_modules/ng2-bootstrap/**/*.js")
        .pipe(tap(function (file) {
            var modulePath = 'ng2-bootstrap/' + file.relative.toString().replace(/\\/g, '/').replace('.js', '');
            var modulePathRoot = modulePath.substr(0, modulePath.lastIndexOf('/'));
            var modulePathRootParent = 'ng2-bootstrap/';
            if (modulePathRoot.indexOf('/') > 0)
                modulePathRootParent = modulePathRoot.substr(0, modulePathRoot.lastIndexOf('/'));
            console.log(file.path + ' - Module[\'' + modulePath + '\'], Last: ' + modulePathRoot);

            var originalContent = file.contents.toString('utf8');
            var registerPart = (new Buffer("System.register(")).toString('utf8');
            var functionExportPart = (new Buffer("function(exports_1)")).toString('utf8');
            var registerLocation = originalContent.indexOf(registerPart);
            var functionExportLocation = originalContent.indexOf(functionExportPart);

            if (registerLocation >= 0) {

                var restReplaced = originalContent.substr(registerLocation + 16);
                restReplaced = restReplaced.substr(0, functionExportLocation - registerLocation - 16)
                            .replace(/\'\.\//g, '\'' + modulePathRoot + '/')
                            .replace(/\'\.\.\//g, '\'' + modulePathRootParent + '/')
                            + restReplaced.substr(functionExportLocation - registerLocation - 16);

                file.contents = Buffer.concat([
                        new Buffer(originalContent.substr(0, registerLocation)),
                        new Buffer("System.register('ng2-bootstrap/" + file.relative.toString().replace(/\\/g, '/').replace('.js', '') + "', "),
                        new Buffer(restReplaced)
                ]);
            }

        }))
        .pipe(concat('ng2-bootstrap.js'))
        .pipe(gulp.dest(paths.lib));
});

gulp.task('rxjs', function () {
    return gulp.src(paths.npm + 'rxjs/**/*.js').pipe(gulp.dest(paths.lib + 'rxjs/'));
});

gulp.task("clean", function (callback) {
    var dummyFun = function (x) { };

    rimraf(paths.appjs, dummyFun);
    rimraf(paths.compiledTS, dummyFun);
    rimraf(paths.lib, callback);
});

gulp.task("compile-rhetos", function (cb) {
    exec(rhetosPath + '/bin/DeployPackages.exe', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});