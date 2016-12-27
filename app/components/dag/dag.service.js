/*
* @Author: yglin
* @Date:   2016-07-09 20:00:54
* @Last Modified by:   yglin
* @Last Modified time: 2016-12-27 16:49:17
*/

(function() {
    'use strict';

    angular
        .module('sygimghApp')
        .service('DAG', DAG);

    DAG.$inject = ['lodash', 'Node'];

    /* @ngInject */
    function DAG(lodash, Node) {
        var self = this;

        self.trace = trace;
        self.hasChild = hasChild;
        self.appendChild = appendChild;
        self.removeChild = removeChild;
        self.genRandomGraph = genRandomGraph;

        ////////////////

        function trace (rootNode, options) {
            if (!rootNode) {
                return;
            }

            options = options || {};
            options.linkFunc = typeof options.linkFunc === 'function' ? options.linkFunc : lodash.noop;
            options.beforeFunc = typeof options.beforeFunc === 'function' ? options.beforeFunc : lodash.noop;
            options.afterFunc = typeof options.afterFunc === 'function' ? options.afterFunc : lodash.noop;
            options.isDeeperFunc = typeof options.isDeeperFunc === 'function' ? options.isDeeperFunc : self.hasChild;
            options.onLoopDetected = typeof options.onLoopDetected === 'function' ? options.onLoopDetected : lodash.noop;

            var touched = [];
            recursive(rootNode, null);

            function recursive(node, parent) {
                options.linkFunc(node, parent);

                if (touched.indexOf(node) >= 0) {
                    options.onLoopDetected(node);
                    return;
                }

                options.beforeFunc(node);
                if(options.isDeeperFunc(node)){
                    for (var i = 0; i < node.children.length; i++) {
                        recursive(node.children[i], node);
                    }                
                }
                options.afterFunc(node);            
                touched.push(node);
            }

        }

        function hasChild(node) {
            return node && node.children && node.children.length > 0;
        }

        function appendChild(parent, child) {
            if (!(parent && child)) {
                return;
            }

            if (!parent.children) {
                parent.children = [];
            }
            parent.children.push(child);

            if (!child.parents) {
                child.parents = [];
            }
            child.parents.push(parent);
        }

        function removeChild(parent, child) {
            if (!(parent && child)) {
                return;
            }

            parent.children.splice(parent.children.indexOf(child), 1);
            child.parents.splice(child.parents.indexOf(parent), 1);
        }

        // // Validate DAG structure
        // function validate(nodes, id) {
            
        //     // Check acyclic
        //     var recordStack = [];
        //     var gotALoop = false;
            
        //     function touch(nodes, id) {
        //         if (recordStack.indexOf(id) >= 0) {
        //             console.error("Found a loop in DAG: " + recordStack.toString() + " --> " + id);
        //             gotALoop = true;
        //         }
        //         recordStack.push(id);
        //     }

        //     function leave(nodes, id) {
        //         recordStack.pop();
        //     }

        //     function loopNotFound(nodes, id) {
        //         return !gotALoop;
        //     }

        //     trace({
        //         nodes: nodes,
        //         id: id,
        //         beforeFunc: touch,
        //         isDeeperFunc: loopNotFound,
        //         afterFunc: leave
        //     });

        //     return !gotALoop;
        // }

        function genRandomGraph(nodeCount) {
            nodeCount = nodeCount || 10;
            var nodes = [];
            var rootNode = Node.genRandomNode();
            nodes.push(rootNode);
            for (var i = 0; i < nodeCount; i++) {
                var newNode = Node.genRandomNode();
                appendChild(lodash.sample(nodes), newNode);
                nodes.push(newNode);
            }
            return rootNode;
        }
    }
})();
