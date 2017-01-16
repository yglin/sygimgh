/*
* @Author: yglin
* @Date:   2017-01-16 11:14:12
* @Last Modified by:   yglin
* @Last Modified time: 2017-01-16 13:02:28
*/

'use strict';

(function() {
  angular
  .module('sygimghApp')
  .directive('sygChromosome', Chromosome);

  Chromosome.$inject = [];

  /* @ngInject */
  function Chromosome() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: 'components/DNA/chromosome.tpl.html',
      bindToController: true,
      controller: ChromosomeController,
      controllerAs: '$ctrl',
      link: link,
      restrict: 'A',
      scope: {
        size: '@',
        value: '<'
      }
    };
    return directive;

    function link(scope, element, attrs) {
    }
  }

  /* @ngInject */
  ChromosomeController.$inject = ['$interval'];
  function ChromosomeController($interval) {
    var $ctrl = this;

    $ctrl.animatePercentage = animatePercentage;

    function animatePercentage() {
      if (!$ctrl.value) {
        return;
      }
      var target = $ctrl.value;
      $ctrl.value = 0;
      var anim = $interval(function () {
        $ctrl.value += 1;
        if ($ctrl.value >= target) {
          $ctrl.value = target;
          $interval.cancel(anim);
        }
      }, 10, 100);
    }
  }
})();
