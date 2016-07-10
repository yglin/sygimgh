/*
* @Author: yglin
* @Date:   2016-07-09 20:00:54
* @Last Modified by:   yglin
* @Last Modified time: 2016-07-10 11:59:38
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

        ////////////////

        function trace (options) {
            if (!options || !options.nodes || !options.id) {
                return;
            }
            options.beforeFunc = typeof options.beforeFunc === 'function' ? options.beforeFunc : lodash.noop;
            options.afterFunc = typeof options.afterFunc === 'function' ? options.afterFunc : lodash.noop;
            options.isDeeperFunc = typeof options.isDeeperFunc === 'function' ? options.isDeeperFunc : lodash.constant(true);

            recursive(options.nodes, options.id);

            function recursive(nodes, id) {
                // console.log('hit node ' + id);
                options.beforeFunc(nodes, id);
                if(self.hasChild(nodes, id) && options.isDeeperFunc(nodes, id)){
                    var thisNode = nodes[id];
                    for (var i = 0; i < thisNode.children.length; i++) {
                        recursive(nodes, thisNode.children[i]);
                    }                
                }
                options.afterFunc(nodes, id);            
            }

        }

        function hasChild(nodes, id) {
            return nodes[id] && nodes[id].children && typeof nodes[id].children.length && nodes[id].children.length > 0;
        }

        function appendChild(nodes, id, childID) {
            var parentNode = nodes[id];
            if (typeof childID !== 'number') {
            // Append new node
                childID = Math.max.apply(null, Object.keys(nodes)) + 1;
                nodes[childID] = {
                    id: childID,
                    parent: id,
                    children: [],
                };
            }

            parentNode.children.push(childID);
            
            if (validate(nodes, childID)) {
                return childID;
            }
            else {
                console.error('Can not append child ' + childID + ' to ' + id + ', failed DAG validation');
                parentNode.children.pop();
                return -1;
            }
        }

        // Validate DAG structure
        function validate(nodes, id) {
            
            // Check acyclic
            var records = [];
            var gotALoop = false;
            function touch(nodes, id) {
                if (records.indexOf(id) >= 0) {
                    console.error("Found a loop in DAG: " + records.toString());
                    gotALoop = true;
                }
                else {
                    records.push(id);
                }
            }

            function loopNotFound(nodes, id) {
                return !gotALoop;
            }

            trace({
                nodes: nodes,
                id: id,
                beforeFunc: touch,
                isDeeperFunc: loopNotFound
            });

            return !gotALoop;
        }
    }
})();
