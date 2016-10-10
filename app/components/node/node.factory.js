/*
* @Author: yglin
* @Date:   2016-10-10 11:23:47
* @Last Modified by:   yglin
* @Last Modified time: 2016-10-10 20:25:25
*/

'use strict';

(function() {

    angular
    .module('sygimghApp')
    .factory('Node', NodeProvider);

    NodeProvider.$inject = ['Manual', '$log', 'uuid'];

    /* @ngInject */
    function NodeProvider(Manual, $log, uuid) {
        function Node(manual) {
            if (!Manual.isManual(manual)) {
                throw(new Error('Node constructor needs a valid manual as parameter. Given parameter is ' + manual));
                return;
            }
            this.id = uuid.v4();
            this.manual = manual;
            this.parents = [];
            this.children = [];
            this.attributes = manual.initAttributes();
        }

        ///////////////// Instance Methods ///////////////////
        Node.prototype = {
            getLabel: getLabel,
            appendChild: appendChild,
            appendParent: appendParent,
            removeChild: removeChild,
            removeParent: removeParent
        }

        function getLabel() {
            var attrHtml = '';
            for (var key in this.attributes) {
                attrHtml += JSON.stringify(this.attributes[key]) + ' | ';
            }
            return attrHtml;
        }

        function appendChild(node) {
            this.children.push(node.id);
        }

        function appendParent(node) {
            this.parents.push(node.id);
        }

        function removeChild(node) {
            this.children.splice(this.children.indexOf(node.id), 1);
        }

        function removeParent(node) {
            this.parents.splice(this.parents.indexOf(node.id), 1);
        }
        

        return Node;
    }
})();
