/*
* @Author: yglin
* @Date:   2017-01-09 11:19:16
* @Last Modified by:   yglin
* @Last Modified time: 2017-01-09 14:19:08
*
* A simple angular wrapper for https://github.com/ariutta/svg-pan-zoom
* 
*/

'use strict';

(function() {
  angular
  .module('sygimghApp')
  .directive('svgPanZoom', SvgPanZoom);

  SvgPanZoom.$inject = [];

  /* @ngInject */
  function SvgPanZoom() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      restrict: 'A',
      link: link,
      scope: {
        options: '<',
        ctrl: '=?'
      }
    };
    return directive;

    function link($scope, iElement, iAttrs) {
      var svgElmt = iElement[0];
      svgElmt.addEventListener('load', function () {
        $scope.ctrl = svgPanZoom(svgElmt, $scope.options);
      });
    }
  }
})();
