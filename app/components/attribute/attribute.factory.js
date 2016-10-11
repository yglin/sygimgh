/*
* @Author: yglin
* @Date:   2016-10-10 20:03:34
* @Last Modified by:   yglin
* @Last Modified time: 2016-10-11 13:33:45
*/

'use strict';

(function() {
    angular
    .module('sygimghApp')
    .factory('Attribute', AttributeProvider);

    AttributeProvider.$inject = [];

    /* @ngInject */
    function AttributeProvider() {
        function Attribute(options) {
            options = typeof options === 'undefined' ? {} : options;
            this.label = options.label || 'NO NAME';
            this.type = options.type || Attribute.TYPES.UNKNOWN;
            this.default = this.type.default;
        }

        // Class properties/methods
        Attribute.TYPES = {
            STRING: {
                label: '文字',
                default: 'This is string default',
            },
            HTML: {
                label: 'HTML',
                default: 'This is html default',
            },
            DATE: {
                label: '日期',
                default: function () {
                    return new Date();
                }
            },
            UNKNOWN: {
                label: '未知類型'
            }
        };

        return Attribute;
    }
})();
