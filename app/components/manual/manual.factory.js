/*
* @Author: yglin
* @Date:   2016-10-10 11:40:13
* @Last Modified by:   yglin
* @Last Modified time: 2016-10-10 13:14:17
*/

'use strict';

(function() {
    'use strict';

    angular
    .module('sygimghApp')
    .factory('Manual', ManualProvider);

    ManualProvider.$inject = ['lodash', 'uuid'];

    /* @ngInject */
    function ManualProvider(lodash, uuid) {

        function Manual(manual) {
            this.id = uuid.v4();
            this.attributes = [];
        }

        Manual.isManual = isManual;

        function isManual(obj) {
            if (!lodash.isArray(obj.attributes)) {
                return false;
            }
            return true;
        }

        return Manual;
    }
})();
