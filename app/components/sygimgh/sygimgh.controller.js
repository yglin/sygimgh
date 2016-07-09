/*
* @Author: yglin
* @Date:   2016-04-17 10:32:56
* @Last Modified by:   yglin
* @Last Modified time: 2016-07-09 20:48:35
*/

'use strict';

(function() {
    'use strict';

    angular
        .module('sygimghApp')
        .controller('SygimghController', SygimghController);

    SygimghController.$inject = ['$scope', '$timeout', '$interval', 'lodash', 'FileIO', 'DAG'];

    /* @ngInject */
    function SygimghController($scope, $timeout, $interval, lodash, FileIO, DAG) {
        var $ctrl = this;
        $ctrl.title = 'Sygimgh';
        $ctrl.graph = {};
        $ctrl.screen = {};
        $ctrl.nodes = {};
        $ctrl.displayNodes = [];
        $ctrl.links = [];
        $ctrl.selectedNodes = {};

        $ctrl.onClickNode = selectNode;
        $ctrl.onDoubleclickNode = triggerCollapes;
        $ctrl.onClickBackground = selectNode;
        $ctrl.onMouseDown = onMouseDown;
        $ctrl.onMouseUp = onMouseUp;
        $ctrl.onMouseLeave = onMouseLeave;

        $ctrl.save = FileIO.save;
        $ctrl.openFileSelector = openFileSelector;
        $ctrl.openFile = openFile;
        $ctrl.reduce = reduce;
        $ctrl.addChild = addChild;

        var forceLayout;
        var colorCategory = ['coral', 'burlywood', 'hotpink', 'deeppink', 'orange', 'gold', 'lightsalmon', 'mistyrose'];
        var colorCategoryIndex = Math.floor(Math.random() * colorCategory.length);

        $ctrl.$onInit = function () {
            $ctrl.graph.width = '960';
            $ctrl.graph.height = '600';

            $ctrl.screen.width = '800';
            $ctrl.screen.height = '480';
            $ctrl.screen.bgColor = 'palegreen';

            $ctrl.pressEffect = {
                r: 0,
                opacity: 0.6,
            };

            $ctrl.nodeActions = [
                {
                    name: 'addChild'
                },
                {
                    name: 'delete'
                },
                {
                    name: 'edit'
                }
            ];

            for (var i = 0; i < $ctrl.nodeActions.length; i++) {
                $ctrl.nodeActions[i].x = 50 * Math.cos(0.785 * i);
                $ctrl.nodeActions[i].y = 50 * Math.sin(0.785 * i);
            }

            $ctrl.nodes[1] = {
                id: 1,
                title: 'ggyy',
                x: 10,
                y: 10,
                r: 50,
                color: colorCategory[colorCategoryIndex],
                parent: -1,
                children: [2],
                collapse: false,
                attributes: {
                    completion: {
                        reducer: 'average',
                        default: 0,
                        value: 50
                    }
                }
            };
            colorCategoryIndex = (colorCategoryIndex + 1) % colorCategory.length;            

            $ctrl.nodes[2] = {
                id: 2,
                title: 'yygg',
                x: 170,
                y: 170,
                r: 50,
                color: colorCategory[colorCategoryIndex],
                parent: 1,
                children: [],
                collapse: false,
                attributes: {
                    completion: {
                        reducer: 'average',
                        default: 0,
                        value: 50
                    }
                }
            };

            colorCategoryIndex = (colorCategoryIndex + 1) % colorCategory.length;            

            $ctrl.rootNodeIndex = 1;

            angular.element(document.getElementById('input-file-selector'))
            .bind('change', $ctrl.openFile);

            // Setup d3 force layout
            forceLayout = d3.layout.force()
            .charge(-1000)
            .linkDistance(200)
            .size([$ctrl.graph.width, $ctrl.graph.height]);

            forceLayout
            .nodes($ctrl.displayNodes)
            .links($ctrl.links)
            .on("tick", function(){$scope.$apply()});
            
            redraw();
        };

        function selectNode(id) {
            if (!id) {
                for (var key in $ctrl.selectedNodes) {
                    $ctrl.selectedNodes[key].strokeWidth = 0;
                    delete $ctrl.selectedNodes[key];
                }
                $ctrl.lastSelectedNode = null;
                return;
            }

            if ($ctrl.selectedNodes[id]) {
                return;
            }
            else {
                for (var key in $ctrl.selectedNodes) {
                    $ctrl.selectedNodes[key].strokeWidth = 0;
                    delete $ctrl.selectedNodes[key];
                }
            }

            var node = $ctrl.nodes[id];
            node.strokeColor = 'blue';
            node.strokeWidth = 3;
            $ctrl.selectedNodes[id] = node;
            $ctrl.lastSelectedNode = id;
        }

        function addChild(id) {
            var parentNode = $ctrl.nodes[id];
            var lastIndex = Object.keys($ctrl.nodes).length + 1;
            var newNode = $ctrl.nodes[lastIndex] = {
                id: lastIndex,
                title: 'new',
                x: parentNode.x,
                y: parentNode.y,
                r: 50,
                color: colorCategory[colorCategoryIndex],
                parent: id,
                children: [],
                collapse: false,
            };

            newNode.attributes = angular.copy(parentNode.attributes);
            for (var key in newNode.attributes) {
                newNode.attributes[key].value = newNode.attributes[key].default;                
            }
            // XXX Generate random value for completion
            newNode.attributes.completion.value = Math.random() * 100;

            colorCategoryIndex = (colorCategoryIndex + 1) % colorCategory.length;
            parentNode.children.push(lastIndex);
            parentNode.collapse = false;

            flashScreen();
            redraw();
        }

        function hasChildren(id) {
            var node = $ctrl.nodes[id];
            return node.children.length > 0;            
        }

        function accumulate(id, field, deepInto) {
            deepInto = deepInto ? deepInto : hasChildren;

            if (deepInto(id)) {
                var node = $ctrl.nodes[id];
                node[field] = 0;
                for (var i = 0; i < node.children.length; i++) {
                    node[field] += accumulate(node.children[i], field, deepInto);
                }
                return node[field];                
            }
            else {
                return node[field];
            }
        }

        function average(id, field, deepInto) {
            deepInto = deepInto ? deepInto : hasChildren;

            var node = $ctrl.nodes[id];
            if (!node[field]) {
                node[field] = 0;
            }
            
            if (deepInto(id)) {
                node[field] = 0;
                for (var i = 0; i < node.children.length; i++) {
                    node[field] += average(node.children[i], field, deepInto);
                }
                node[field] /= node.children.length;
                return node[field];                
            }
            else {
                return node[field];
            }
        }

        // function trace(id, beforeFunc, deepInto, afterFunc) {
        //     beforeFunc(id);
        //     if(deepInto(id)){
        //         var node = $ctrl.nodes[id];
        //         for (var i = 0; i < node.children.length; i++) {
        //             trace(node.children[i], beforeFunc, deepInto, afterFunc);
        //         }                
        //     }
        //     afterFunc(id);
        // }

        function draw(nodes, id) {
            var node = nodes[id];
            $ctrl.displayNodes.push(node);
            if (node.parent >= 0) {
                $ctrl.links.push({
                    source: nodes[node.parent],
                    target: nodes[id],
                    color: 'blue',
                    width: 2
                });
            }
        }

        function redraw() {
            $ctrl.links.length = 0;
            $ctrl.displayNodes.length = 0;
            DAG.trace({
                nodes: $ctrl.nodes,
                id: $ctrl.rootNodeIndex,
                beforeFunc: draw,
                isDeeperFunc: function (nodes, id) {
                        return !nodes[id].collapse;
                }
            });
            forceLayout.start();            
        }

        function triggerCollapes(id) {
            // console.log('click on node ' + id);
            $ctrl.nodes[id].collapse = !$ctrl.nodes[id].collapse;
            redraw();
        }

        function onMouseDown(id) {
            $ctrl.nodes[id].isPressed = true;
            startPressEffect(id);
            if ($ctrl.timeoutAddChild) {
                $timeout.cancel($ctrl.timeoutAddChild);
            }
            $ctrl.timeoutAddChild = $timeout(function () {
                addChild(id);
            }, 500);
        }

        function onMouseUp(id) {
            $ctrl.nodes[id].isPressed = false;
            endPressEffect(id);
            var noAddChild = true;
            if ($ctrl.timeoutAddChild) {
                noAddChild = $timeout.cancel($ctrl.timeoutAddChild);
            }
            if (noAddChild) {
                triggerCollapes(id);
            }
        }

        function onMouseLeave(id) {
            $ctrl.nodes[id].isPressed = false;
            endPressEffect(id);
            var noAddChild = true;
            if ($ctrl.timeoutAddChild) {
                noAddChild = $timeout.cancel($ctrl.timeoutAddChild);
            }
        }

        function startPressEffect(id) {
            if ($ctrl.intervalPressEffect) {
                $interval.cancel($ctrl.intervalPressEffect);
                $ctrl.pressEffect.r = 0;
                $ctrl.pressEffect.opacity = 0.6;
            }
            $ctrl.intervalPressEffect = $interval(function () {
                $ctrl.pressEffect.r += 5;
                $ctrl.pressEffect.opacity -= 0.02;
            }, 50, 10);
        }

        function endPressEffect(id) {
            if ($ctrl.intervalPressEffect) {
                $interval.cancel($ctrl.intervalPressEffect);
                $ctrl.pressEffect.r = 0;
            }            
        }

        function flashScreen() {
            var prevColor = $ctrl.screen.bgColor;
            $ctrl.screen.bgColor = 'white';
            $timeout(function () {
                $ctrl.screen.bgColor = prevColor;
            }, 10);
        }

        function openFileSelector() {
            document.getElementById('input-file-selector').click();
        }

        function openFile(event) {
            FileIO.open(event.target.files[0]).then(function (data) {
                if (data) {
                    $ctrl.nodes = data;
                    redraw();
                }
            });
        }

        function getReducer(reducer, attribute) {
            if (reducer == 'average') {
                return function (id) {
                    var node = $ctrl.nodes[id];
                    if (hasChildren(id)) {
                        var sum = 0;
                        for (var i = 0; i < node.children.length; i++) {
                            var childNode = $ctrl.nodes[node.children[i]];
                            sum += childNode.attributes[attribute].value;
                        }
                        node.attributes[attribute].value = sum / node.children.length;
                    }
                    node.displayAttribute = attribute;
                };
            }
            else {
                return lodash.noop;
            }
        }

        function reduce(attribute) {
            var rootNode = $ctrl.nodes[$ctrl.rootNodeIndex];
            var reducer = getReducer(rootNode.attributes[attribute].reducer, attribute);

            var leaves = [];
            for (var id in $ctrl.nodes) {
               if ($ctrl.nodes[id].children.length == 0) {
                    $ctrl.nodes[id].animTarget = $ctrl.nodes[id].attributes[attribute].value;
                    $ctrl.nodes[id].attributes[attribute].value = 0;
                    leaves.push($ctrl.nodes[id]);
               }
            }

            DAG.trace({
                nodes: $ctrl.nodes,
                id: $ctrl.rootNodeIndex,
                beforeFunc: lodash.noop,
                afterFunc: reducer
            });

            $ctrl.routineRenew = $interval(function () {
                var allDone = true;
                for (var i = 0; i < leaves.length; i++) {
                    if (leaves[i].attributes[attribute].value >= leaves[i].animTarget) {
                        leaves[i].attributes[attribute].value = leaves[i].animTarget;
                    }
                    else {
                        leaves[i].attributes[attribute].value += 0.1;
                        allDone = false;
                    }
                }

                DAG.trace({
                    nodes: $ctrl.nodes,
                    id: $ctrl.rootNodeIndex,
                    beforeFunc: lodash.noop,
                    afterFunc: reducer
                });

                if (allDone) {
                    $interval.cancel($ctrl.routineRenew);
                }
            }, 10);
        }
    }
})();