/*
* @Author: yglin
* @Date:   2016-07-09 20:00:54
* @Last Modified by:   yglin
* @Last Modified time: 2017-01-15 11:37:19
*/

(function() {
    'use strict';

    angular
        .module('sygimghApp')
        .service('DAG', DAG);

    DAG.$inject = ['$q', '$timeout', 'lodash', 'Node'];

    /* @ngInject */
    function DAG($q, $timeout, lodash, Node) {
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
            options.onLoopDetected = typeof options.onLoopDetected === 'function' ? options.onLoopDetected : lodash.noop;
            options.preTrace = typeof options.preTrace === 'function' ? options.preTrace : lodash.noop;
            options.postTrace = typeof options.postTrace === 'function' ? options.postTrace : lodash.noop;
            options.isFurther = typeof options.isFurther === 'function' ? options.isFurther : self.hasChild;
            options.reduceSelect = (options.reduceSelect in rootNode) ? options.reduceSelect : 'reduced';
            options.reduce = (typeof options.reduce === 'function' && (options.reduceSelect in rootNode)) ? options.reduce : lodash.noop;
            options.assess = typeof options.assess === 'function' ? options.assess : lodash.noop;
            options.delay = typeof options.delay === 'number' ? Math.max(options.delay, 0) : 0;

            var touched = [];
            recursive(rootNode, null);

            function recursive(node) {
                if (touched.indexOf(node) >= 0) {
                    options.onLoopDetected(node);
                    return $q.resolve();
                }

                var done = $q.defer();

                options.preTrace(node);

                var childrenPromises = [];
                if(options.isFurther(node)){
                    for (var i = 0; i < node.children.length; i++) {
                        var childPromise = recursive(node.children[i]);
                        childrenPromises.push(childPromise);
                    }                
                }

                $q.all(childrenPromises)
                .then(function (reducedValues) {
                    $timeout(function () {
                        if (!lodash.isEmpty(reducedValues)) {
                            node[options.reduceSelect] = options.reduce(reducedValues);
                        }
                        options.assess(node);
                        options.postTrace(node);
                        touched.push(node);
                        done.resolve(node[options.reduceSelect]);                        
                    }, options.delay);
                })
                .catch(function (error) {
                    node.error = error;
                    done.reject(error);
                });

                return done.promise;
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
        //         preTrace: touch,
        //         isFurther: loopNotFound,
        //         assess: leave
        //     });

        //     return !gotALoop;
        // }

        function genRandomGraph(nodeCount) {
            nodeCount = nodeCount || 10;
            var nodes = {};
            var rootNode = Node.genRandomNode();
            rootNode.title = '統治世界';
            nodes[rootNode.id] = rootNode;
            for (var i = 0; i < nodeCount; i++) {
                var newNode = Node.genRandomNode();
                appendChild(lodash.sample(nodes), newNode);
                nodes[newNode.id] = newNode;
            }
            return {
                nodes: nodes,
                root: rootNode
            };
        }
    }
})();
