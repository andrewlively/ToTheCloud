app.filter('byteFilter', function () {
    return function (bytes) {
        var units = ' B';
        var divisor = 1;
        
        if (bytes < 1000000) {
            units = ' KB';
            divisor = 1000;
        } else if (bytes < 1000000000) {
            units = ' MB';
            divisor = 1000000;
        }
        
        return (bytes / divisor).toFixed(1) + units;
    };
});