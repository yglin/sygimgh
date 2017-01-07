/*
* @Author: yglin
* @Date:   2017-01-07 16:01:25
* @Last Modified by:   yglin
* @Last Modified time: 2017-01-07 17:13:11
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
      $ctrl.postNaggingSource = extractFunctionBody($ctrl.mama.postNagging);
    }

    function cancel() {
      $mdDialog.cancel();
    }

    function submit() {
      $ctrl.mama.postNagging = new Function('node', $ctrl.postNaggingSource);
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