/*
* @Author: yglin
* @Date:   2016-10-10 11:40:13
* @Last Modified by:   yglin
* @Last Modified time: 2016-10-10 20:15:41
*/

'use strict';

(function() {
    'use strict';

    angular
    .module('sygimghApp')
    .factory('Manual', ManualProvider);

    ManualProvider.$inject = ['lodash', 'uuid', 'Attribute'];

    /* @ngInject */
    function ManualProvider(lodash, uuid, Attribute) {

        function Manual(manual) {
            var manualDefaults = {
                title: '任務',
                attributes: {
                    title: new Attribute({
                        label: '標題',
                        type: Attribute.TYPES.STRING
                    }),
                    description: new Attribute({
                        label: '描述',
                        type: Attribute.TYPES.HTML
                    }),
                    startDate: new Attribute({
                        label: '開始日期',
                        type: Attribute.TYPES.DATE
                    })
                }
            };

            if (Manual.isManual(manual)) {
                lodash.merge(this, manual);
            }
            else {
                lodash.merge(this, manualDefaults);
            }

            this.id = uuid.v4();
        }

        // Instance Methods
        Manual.prototype = {
            initAttributes: initAttributes
        }

        // Class Methods
        Manual.isManual = isManual;

        function initAttributes() {
            var attrs = {};
            for (var key in this.attributes) {
                var attrDef = this.attributes[key];
                if (typeof attrDef.default === 'function') {
                    attrs[key] = attrDef.default();
                }
                else if (typeof attrDef.default === 'undefined') {
                    attrs[key] = null;
                }
                else {
                    attrs[key] = attrDef.default;
                }
            }
            return attrs;
        }

        function isManual(obj) {
            if (!obj) {
                return false;
            }
            if (!lodash.isObject(obj.attributes)) {
                return false;
            }
            return true;
        }

        return Manual;
    }
})();
