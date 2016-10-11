/*
* @Author: yglin
* @Date:   2016-10-10 17:46:51
* @Last Modified by:   yglin
* @Last Modified time: 2016-10-11 15:53:39
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

    ManualEditorController.$inject = ['Manual', 'Attribute', 'DAG'];

    /* @ngInject */
    function ManualEditorController(Manual, Attribute, DAG) {
        var $ctrl = this;
        $ctrl.title = 'ManualEditor';
        $ctrl.manual = DAG.manuals[$ctrl.manualId];
        $ctrl.Attribute = Attribute;
        $ctrl.newAttr = {};

        $ctrl.addNewAttribute = addNewAttribute;

        $ctrl.$onInit = function () {
        };

        function addNewAttribute() {
            // console.log($ctrl.newAttr);
            $ctrl.manual.addAttribute($ctrl.newAttr);
            $ctrl.newAttr = {};
        }
    }
})();
