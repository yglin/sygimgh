/*
* @Author: yglin
* @Date:   2016-04-17 10:32:56
* @Last Modified by:   yglin
* @Last Modified time: 2016-07-10 17:08:14
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
        $ctrl.selectedNodes = [];

        $ctrl.onClickBackground = onClickBackground;
        $ctrl.onClickNode = onClickNode;
        $ctrl.onDoubleclickNode = triggerCollapes;
        $ctrl.onMouseDown = onMouseDown;
        $ctrl.onMouseUp = onMouseUp;
        $ctrl.onMouseLeave = onMouseLeave;

        $ctrl.save = FileIO.save;
        $ctrl.openFileSelector = openFileSelector;
        $ctrl.openFile = openFile;
        $ctrl.reduce = reduce;
        $ctrl.addChild = addChild;
        $ctrl.appendChild = appendChild;

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
                parents: [],
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
                parents: [1],
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

        function onClickBackground() {
            clearSelect();
        }

        function onClickNode(event, id) {
            if (event.ctrlKey || event.metaKey) {
                addSelect(id);
            }
            else {
                select(id);
            }
        }

        function toggleSelectDisplay(id, isSelected) {
            var node = $ctrl.nodes[id];
            if (isSelected) {
                node.strokeColor = 'blue';
                node.strokeWidth = 3;
            }
            else {
                node.strokeWidth = 0;
            }
        }

        function select(id) {
            clearSelect();
            $ctrl.selectedNodes.push(id);
            toggleSelectDisplay(id, true);
        }

        function addSelect(id) {
            if ($ctrl.selectedNodes.indexOf(id) >= 0) {
            // Already selected, remove selection
                $ctrl.selectedNodes.splice($ctrl.selectedNodes.indexOf(id), 1);
                toggleSelectDisplay(id, false);
            }
            else {
            // Add to selection
                $ctrl.selectedNodes.push(id);
                toggleSelectDisplay(id, true);
            }
        }

        function clearSelect() {
            for (var i = 0; i < $ctrl.selectedNodes.length; i++) {
                toggleSelectDisplay($ctrl.selectedNodes[i], false);
            }
            $ctrl.selectedNodes.length = 0;            
        }

        function addChild(id) {
            var childID = DAG.appendChild($ctrl.nodes, id);
            if (childID < 0) {
                return;
            }

            var parentNode = $ctrl.nodes[id];
            var childNode = $ctrl.nodes[childID];

            childNode.title = 'new';
            childNode.x = parentNode.x;
            childNode.y = parentNode.y;
            childNode.r = 50;

            childNode.color = colorCategory[colorCategoryIndex];
            colorCategoryIndex = (colorCategoryIndex + 1) % colorCategory.length;

            childNode.collapse = false;

            childNode.attributes = angular.copy(parentNode.attributes);
            for (var key in childNode.attributes) {
                childNode.attributes[key].value = childNode.attributes[key].default;                
            }

            // XXX Generate random value for completion
            childNode.attributes.completion.value = Math.random() * 100;

            // Visually expand parent node after adding child
            parentNode.collapse = false;

            redraw();
        }

        function appendChild(id, childID) {
            childID = DAG.appendChild($ctrl.nodes, id, childID);
            if (childID < 0) {
                return;
            }
            redraw();
        }

        function accumulate(id, field) {
            if (DAG.hasChild($ctrl.nodes, id)) {
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

        function average(id, field) {
            var node = $ctrl.nodes[id];
            if (!node[field]) {
                node[field] = 0;
            }
            
            if (DAG.hasChild($ctrl.nodes, id)) {
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
            if (node.parents.length > 0) {
                for (var i = 0; i < node.parents.length; i++) {
                    var parentID = node.parents[i]
                }
            }
        }

        function link(nodes, id, fromID) {
            var sourceNode = $ctrl.nodes[fromID];
            var targetNode = $ctrl.nodes[id];
            if (sourceNode && targetNode) {
                $ctrl.links.push({
                    source: sourceNode,
                    target: targetNode,
                    color: 'darkgreen',
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
                linkFunc: link,
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
                return function (nodes, id) {
                    var node = nodes[id];
                    if (DAG.hasChild(nodes, id)) {
                        var sum = 0;
                        for (var i = 0; i < node.children.length; i++) {
                            var childNode = nodes[node.children[i]];
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