/*
* @Author: yglin
* @Date:   2016-10-10 11:23:47
* @Last Modified by:   yglin
* @Last Modified time: 2016-10-10 15:10:16
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
            return this.id;
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
