/*
* @Author: yglin
* @Date:   2017-01-09 15:24:49
* @Last Modified by:   yglin
* @Last Modified time: 2017-01-15 12:01:46
*/

'use strict';

(function() {
  angular
  .module('sygimghApp')
  .directive('sygMamaNaggingNode', MamaNaggingNode);

  MamaNaggingNode.$inject = ['Mama'];

  /* @ngInject */
  function MamaNaggingNode(Mama) {

    var directive = {
      templateUrl: 'components/mama/mama-nagging-node.tpl.html',
      bindToController: true,
      controller: MamaNaggingNodeController,
      controllerAs: '$ctrl',
      link: link,
      restrict: 'A',
      scope: {
        mama: '<',
        node: '<',
        size: '@'
      }
    };
    return directive;

    function link(scope, element, attrs) {
    }
  }

  /* @ngInject */
  function MamaNaggingNodeController() {

  }
})();
