/*
* @Author: yglin
* @Date:   2016-10-10 17:46:51
* @Last Modified by:   yglin
* @Last Modified time: 2016-10-11 13:44:46
*/

'use strict';

(function() {
    angular.module('sygimghApp')
    .component('sygManualEditor',{
        templateUrl: 'components/manual/manual-editor.tpl.html',
        controller: ManualEditorController,
        bindings: {
            manualId: '@'
        }
    });

    ManualEditorController.$inject = ['Manual', 'DAG'];

    /* @ngInject */
    function ManualEditorController(Manual, DAG) {
        var $ctrl = this;
        $ctrl.title = 'ManualEditor';
        $ctrl.manual = DAG.manuals[$ctrl.manualId];

        $ctrl.$onInit = function () {
        };
    }
})();
