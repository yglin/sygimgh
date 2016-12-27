/*
* @Author: yglin
* @Date:   2016-12-27 12:00:19
* @Last Modified by:   yglin
* @Last Modified time: 2016-12-27 16:44:43
*/

'use strict';

(function() {
  angular
  .module('sygimghApp')
  .service('Node', Node);

  Node.$inject = ['$q', 'uuid', 'lodash'];

  /* @ngInject */
  function Node($q, uuid, lodash) {
    var self = this;
    self.genRandomNode = genRandomNode;

    ////////////////

    function genRandomNode() {
      var node = {};
      node.id = uuid.v4();
      node.title = randomTitle();
      node.description = randomDescription(node.title);
      node.assignee = randomAssignee();
      node.progress = Math.random() * 100;
      return node;
    }

    function randomTitle() {
      return lodash.sample([
        '侵略',
        '救援',
        '斷交',
        '建交',
        '貿易制裁',
        '販售武器給',
        '丟一顆核彈到'
      ]) + lodash.sample([
        '終國',
        '鎂國',
        '日苯',
        '得國',
        '餓螺絲',
        '天空之城'
      ]);
    }

    function randomDescription(title) {
      return '基於——' + lodash.sample([
        '人道主義',
        '世界和平',
        '資本主義',
        '環境永續',
        '自由貿易',
        '性別平權',
        '公平正義',
        '林北北宋',
      ]) + '——的精神，決定實施——' + title; 
    }

    function randomAssignee() {
      return lodash.sample([
        '習禁瓶',
        '穿哺',
        '蹼叮',
        '氨被淨三',
        '沒課耳',
        'ムスカ大佐'
      ]);
    }
  }
})();

