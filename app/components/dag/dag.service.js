/*
* @Author: yglin
* @Date:   2016-07-09 20:00:54
* @Last Modified by:   yglin
* @Last Modified time: 2016-10-10 17:13:21
*/

(function() {
    'use strict';

    angular
    .module('sygimghApp')
    .service('DAG', DAG);

    DAG.$inject = ['lodash', '$log', 'Node', 'Manual'];

    /* @ngInject */
    function DAG(lodash, $log, Node, Manual) {
        var self = this;
        self.nodes = {};
        self.manuals = {};
        self.trace = trace;
        self.hasChild = hasChild;
        self.addChild = addChild;
        self.appendChild = appendChild;
        self.removeChild = removeChild;

        activate();

        ////////////////
        function activate() {
            if (lodash.isEmpty(self.nodes)) {
                var manual = new Manual();
                self.manuals[manual.id] = manual;
                var rootNode = new Node(manual);
                self.nodes[rootNode.id] = rootNode;
                self.rootNodeId = rootNode.id;
                // var secondNode = new Node(manual);
                // self.nodes[secondNode.id] = secondNode;
                // appendChild(self.nodes, rootNode.id, secondNode.id);
            }
        }

        function trace (options) {
            if (!options || !options.nodes || !options.id) {
                $log.error('Bad options for DAG.trace(): ' + JSON.stringify(options));
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

        function addChild(nodes, id) {
            var parentNode = nodes[id];
            var childNode = new Node(parentNode.manual);
            nodes[childNode.id] = childNode;
            parentNode.appendChild(childNode);
            childNode.appendParent(parentNode);
            return childNode;
        }

        function appendChild(nodes, id, childID) {
            var parentNode = nodes[id];
            var childNode = nodes[childID];

            parentNode.appendChild(childNode);
            childNode.appendParent(parentNode);

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
            var childNode = nodes[childID];
            parentNode.removeChild(childNode);
            childNode.removeParent(parentNode);
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
