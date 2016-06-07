/*
* @Author: yglin
* @Date:   2016-05-07 11:46:41
* @Last Modified by:   yglin
* @Last Modified time: 2016-05-10 11:44:44
*/

'use strict';

(function() {
    'use strict';

    angular
        .module('sygimghApp')
        .service('FileIO', FileIO);

    FileIO.$inject = ['$q', 'FileSaver', 'Blob'];

    /* @ngInject */
    function FileIO($q, FileSaver, Blob) {
        var self = this;
        self.open = open;
        self.save = save;

        ////////////////

        function open(file) {
            var onLoaded = $q.defer();
            var reader = new FileReader();
            reader.onload = function (event) {
                onLoaded.resolve(JSON.parse(event.target.result));
            }
            reader.readAsText(file);
            return onLoaded.promise;
        }

        function save(data) {
            var blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
            FileSaver.saveAs(blob, 'mystuff.syg');
        }
    }
})();