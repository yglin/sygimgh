/*
* @Author: yglin
* @Date:   2017-01-07 16:01:25
* @Last Modified by:   yglin
* @Last Modified time: 2017-01-16 17:04:16
*/

'use strict';

(function() {
  angular
  .module('sygimghApp')
  .controller('MamaEditDialogController', EditDialogController);

  EditDialogController.$inject = ['$mdDialog'];

  /* @ngInject */
  function EditDialogController($mdDialog) {
    var $ctrl = this;
    // $ctrl.title = 'EditDialog';
    $ctrl.cancel = cancel;
    $ctrl.submit = submit;

    activate();

    ////////////////

    function activate() {
      $ctrl.naggingSource = extractFunctionBody($ctrl.mama.nagging);
      $ctrl.reduceSource = extractFunctionBody($ctrl.mama.reduce);
    }

    function cancel() {
      $mdDialog.cancel();
    }

    function submit() {
      $ctrl.mama.nagging = new Function('node', $ctrl.naggingSource);
      $ctrl.mama.reduce = new Function('reducedValues', $ctrl.reduceSource);
      $mdDialog.hide($ctrl.mama);
    }

    function extractFunctionBody(func) {
      var matches = func.toString().match(/function.*\{([\s\S]*)\}/mi);
      if (matches && matches.length && matches.length > 1) {
        return matches[1];
      }
      else {
        return '';
      }
    }
  }
})();