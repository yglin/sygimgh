/*
* @Author: yglin
* @Date:   2016-10-10 16:03:51
* @Last Modified by:   yglin
* @Last Modified time: 2016-10-11 13:44:55
*/

'use strict';

(function() {
    angular.module('sygimghApp')
    .component('sygManualList',{
        templateUrl: 'components/manual/manual-list.tpl.html',
        controller: ManualListController,
        bindings: {
        }
    });

    ManualListController.$inject = ['Manual', 'DAG', '$mdDialog'];

    /* @ngInject */
    function ManualListController(Manual, DAG, $mdDialog) {
        var $ctrl = this;
        $ctrl.title = 'ManualList';
        $ctrl.manuals = DAG.manuals;

        $ctrl.openManualEditor = openManualEditor;

        $ctrl.$onInit = function () {
        };

        function openManualEditor(manual) {
            $mdDialog.show({
                template: '<syg-manual-editor manual-id="' + manual.id + '"></syg-manual-editor>',
                clickOutsideToClose: true
            });
        }
    }
})();
