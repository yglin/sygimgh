/*
* @Author: yglin
* @Date:   2016-07-09 20:00:54
* @Last Modified by:   yglin
* @Last Modified time: 2016-07-10 17:01:38
*/

(function() {
    'use strict';

    angular
        .module('sygimghApp')
        .service('DAG', DAG);

    DAG.$inject = ['lodash'];

    /* @ngInject */
    function DAG(lodash) {
        var self = this;
        self.trace = trace;
        self.hasChild = hasChild;
        self.appendChild = appendChild;
        self.removeChild = removeChild;

        ////////////////

        function trace (options) {
            if (!options || !options.nodes || !options.id) {
                return;
            }
            options.linkFunc = typeof options.linkFunc === 'function' ? options.linkFunc : lodash.noop;
            options.beforeFunc = typeof options.beforeFunc === 'function' ? options.beforeFunc : lodash.noop;
            options.afterFunc = typeof options.afterFunc === 'function' ? options.afterFunc : lodash.noop;
            options.isDeeperFunc = typeof options.isDeeperFunc === 'function' ? options.isDeeperFunc : lodash.constant(true);

            for (var id in options.nodes) {
                options.nodes[id].touched = false;
            }

            recursive(options.nodes, options.id, -1);

            function recursive(nodes, id, fromID) {
                // console.log('hit node ' + id);
                var thisNode = nodes[id];

                options.linkFunc(nodes, id, fromID);

                if (thisNode.touched) {
                    return;
                }

                options.beforeFunc(nodes, id);
                if(self.hasChild(nodes, id) && options.isDeeperFunc(nodes, id)){
                    for (var i = 0; i < thisNode.children.length; i++) {
                        recursive(nodes, thisNode.children[i], id);
                    }                
                }
                options.afterFunc(nodes, id);            
                thisNode.touched = true;
            }

        }

        function hasChild(nodes, id) {
            return nodes[id] && nodes[id].children && typeof nodes[id].children.length && nodes[id].children.length > 0;
        }

        function appendChild(nodes, id, childID) {
            if (typeof childID !== 'number') {
            // Append new node
                childID = Math.max.apply(null, Object.keys(nodes)) + 1;
                nodes[childID] = {
                    id: childID,
                    parents: [],
                    children: [],
                };
            }
            var parentNode = nodes[id];
            var childNode = nodes[childID];

            if (parentNode.children.indexOf(childID) < 0) {
                parentNode.children.push(childID);
            }
            if (childNode.parents.indexOf(id) < 0) {
                childNode.parents.push(id);
            }
            
            if (validate(nodes, childID)) {
                return childID;
            }
            else {
                console.error('Can not append child ' + childID + ' to ' + id + ', failed DAG validation');
                removeChild(nodes, id, childID);
                return -1;
            }
        }

        function removeChild(nodes, id, childID) {
            var parentNode = nodes[id];
            if (parentNode && parentNode.children && parentNode.children.indexOf(childID) >= 0) {
                parentNode.children.splice(parentNode.children.indexOf(childID), 1);
            }
            var childNode = nodes[childID];
            if (childNode && childNode.parents && childNode.parents.indexOf(id) >= 0) {
                childNode.parents.splice(childNode.parents.indexOf(id), 1);
            }
        }

        // Validate DAG structure
        function validate(nodes, id) {
            
            // Check acyclic
            var recordStack = [];
            var gotALoop = false;
            
            function touch(nodes, id) {
                if (recordStack.indexOf(id) >= 0) {
                    console.error("Found a loop in DAG: " + recordStack.toString() + " --> " + id);
                    gotALoop = true;
                }
                recordStack.push(id);
            }

            function leave(nodes, id) {
                recordStack.pop();
            }

            function loopNotFound(nodes, id) {
                return !gotALoop;
            }

            trace({
                nodes: nodes,
                id: id,
                beforeFunc: touch,
                isDeeperFunc: loopNotFound,
                afterFunc: leave
            });

            return !gotALoop;
        }
    }
})();
