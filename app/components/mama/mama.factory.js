/*
* @Author: yglin
* @Date:   2017-01-07 15:31:01
* @Last Modified by:   yglin
* @Last Modified time: 2017-01-07 17:08:15
*/

'use strict';

(function() {
  angular
  .module('sygimghApp')
  .factory('Mama', MamaProvider);

  MamaProvider.$inject = ['$log', '$mdDialog', 'DAG', 'lodash'];

  /* @ngInject */
  function MamaProvider($log, $mdDialog, DAG, lodash) {

    Mama.prototype.nagging = nagging;

    return Mama;

    function Mama(argument) {
      this.preNagging = preNagging;
      this.postNagging = postNagging;
    }

    function preNagging(node) {
      node.loser = false;
    }

    function postNagging(node) {
      node.loser = (Math.random() > 0.5);
    }

    function nagging(node) {
      var self = this;

      $mdDialog.show({
        templateUrl: 'components/mama/edit-dialog.tpl.html',
        controller: 'MamaEditDialogController',
        controllerAs: '$ctrl',
        bindToController: true,
        locals: {
          mama: lodash.clone(this)
        },
        clickOutsideToEscape: true,
      }).then(function (mama) {
        lodash.extend(self, mama);
        DAG.trace(node, {
            beforeFunc: self.preNagging,
            afterFunc: self.postNagging,
            postDelay: 1000
        });
      })
      .catch(function (error) {
        $log.error(error);
      });
    }
  }
})();
