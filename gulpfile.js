var gulp = require('gulp'),
	 browserSync = require('browser-sync'); 
gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: 'app' // Директория для сервера - app
        },
        notify: false // Отключаем уведомления
    });
});

gulp.task('watch', ['browser-sync'], function() {
   gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
	  gulp.watch('app/css/**/*.css', browserSync.reload); // Наблюдение за CSS файлами в папке js
    gulp.watch('app/js/**/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js
});