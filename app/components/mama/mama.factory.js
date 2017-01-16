/*
* @Author: yglin
* @Date:   2017-01-07 15:31:01
* @Last Modified by:   yglin
* @Last Modified time: 2017-01-16 11:52:28
*/

'use strict';

(function() {
  angular
  .module('sygimghApp')
  .factory('Mama', MamaProvider);

  MamaProvider.$inject = ['$log', '$mdDialog', 'DAG', 'lodash'];

  /* @ngInject */
  function MamaProvider($log, $mdDialog, DAG, lodash) {

    Mama.prototype.startNagging = startNagging;
    Mama.prototype.isNaggingOn = isNaggingOn;
    Mama.prototype.isLoser = isLoser;

    return Mama;

    function Mama() {
      this.preNagging = preNagging;
      this.nagging = nagging;
      this.postNagging = postNagging;
      this.reduceSelect = undefined;
      this.reduce = lodash.noop;
      this.onNaggingImage = 'https://media.giphy.com/media/l2Je98HyT1H61VBYs/giphy.gif';
      this.loserImage = 'http://www.transinfinity.com/images/simpsons/lisasimpsonloser.jpg';
    }

    function preNagging(node) {
    }

    function nagging(node) {
      return (Math.random() > 0.5);
    }

    function postNagging(node) {
    }

    function isNaggingOn(node) {
      return node.inNagging;
    }

    function isLoser(node) {
      return node.isLoser;
    }

    function startNagging(node) {
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
          preTrace: function (node) {
            node.isLoser = false;
            node.inNagging = true;
            node.showChromosomes = [];
            self.preNagging(node);
          },
          assess: function (node) {
            node.isLoser = self.nagging(node);
          },
          postTrace: function (node) {
            node.inNagging = false;
            self.postNagging(node);
            if (self.reduceSelect) {
              node.showChromosomes.push(self.reduceSelect);
            }
          },
          reduceSelect: self.reduceSelect,
          reduce: self.reduce,
          delay: 1000
        });
      })
      .catch(function (error) {
        $log.error(error);
      });
    }
  }
})();
