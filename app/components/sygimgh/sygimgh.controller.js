/*
* @Author: yglin
* @Date:   2016-04-17 10:32:56
* @Last Modified by:   yglin
* @Last Modified time: 2016-10-10 15:34:17
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
        $ctrl.nodes = [];
        $ctrl.links = [];
        $ctrl.selected = [];
        $ctrl.rootNodeId = DAG.rootNodeId;

        $ctrl.onClickBackground = onClickBackground;
        $ctrl.onClickNode = onClickNode;
        $ctrl.onDoubleclickNode = onDoubleclickNode;
        $ctrl.isSelected = isSelected;
        // $ctrl.onMouseDown = onMouseDown;
        // $ctrl.onMouseUp = onMouseUp;
        // $ctrl.onMouseLeave = onMouseLeave;

        // $ctrl.save = FileIO.save;
        // $ctrl.openFileSelector = openFileSelector;
        // $ctrl.openFile = openFile;
        // $ctrl.reduce = reduce;
        $ctrl.addChild = addChild;
        $ctrl.appendChild = appendChild;

        var nodeVisualDefaults = {};
        var forceLayout;
        var colorCategory = ['coral', 'burlywood', 'hotpink', 'deeppink', 'orange', 'gold', 'lightsalmon', 'mistyrose'];
        
        $ctrl.$onInit = function () {
            $ctrl.graph.width = '960';
            $ctrl.graph.height = '600';

            $ctrl.screen.width = '800';
            $ctrl.screen.height = '480';
            $ctrl.screen.bgColor = 'palegreen';

            nodeVisualDefaults.x = $ctrl.screen.width / 2;
            nodeVisualDefaults.y = $ctrl.screen.height / 2;
            nodeVisualDefaults.r = Math.max($ctrl.screen.height / 10, 50);
            nodeVisualDefaults.collapse = false;
            
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

            angular.element(document.getElementById('input-file-selector'))
            .bind('change', $ctrl.openFile);

            // Setup d3 force layout
            forceLayout = d3.layout.force()
            .charge(-1000)
            .linkDistance(200)
            .size([$ctrl.graph.width, $ctrl.graph.height]);

            redraw();
        };

        function onClickBackground() {
            clearSelected();
        }

        function onClickNode(event, index) {
            if (event.ctrlKey || event.metaKey) {
                toggleSelect(index);
            }
            else {
                select(index);
            }
        }

        function onDoubleclickNode(event, index) {
            triggerCollapes(index);
        }

        function isSelected(index) {
            return $ctrl.selected.indexOf(index) >= 0;
        }

        function select(index) {
            clearSelected();
            $ctrl.selected.push(index);
        }

        function toggleSelect(index) {
            if (isSelected(index)) {
                // Already selected, remove selection
                $ctrl.selected.splice($ctrl.selected.indexOf(index), 1);
            }
            else {
                // Add to selected
                $ctrl.selected.push(index);
            }
        }

        function clearSelected() {
            $ctrl.selected.length = 0;            
        }

        function addChild(index) {
            var parentNode = $ctrl.nodes[index];
            var childNode = DAG.addChild(DAG.nodes, parentNode.id);
            console.log(childNode);
            if (!childNode) {
                return;
            }

            // Set visual properties of new child node
            childNode.x = parentNode.x;
            childNode.y = parentNode.y;
            childNode.r = 50;
            childNode.collapse = false;

            // Visually expand parent node after adding child
            parentNode.collapse = false;

            redraw();
        }

        function appendChild(index, childIndex) {
            var id = $ctrl.nodes[index].id;
            var childID = $ctrl.nodes[childIndex].id;
            childID = DAG.appendChild(DAG.nodes, id, childID);
            if (childID < 0) {
                return;
            }
            redraw();
        }

        function accumulate(id, field) {
            if (DAG.hasChild(DAG.nodes, id)) {
                var node = DAG.nodes[id];
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
            var node = DAG.nodes[id];
            if (!node[field]) {
                node[field] = 0;
            }
            
            if (DAG.hasChild(DAG.nodes, id)) {
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
        //         var node = DAG.nodes[id];
        //         for (var i = 0; i < node.children.length; i++) {
        //             trace(node.children[i], beforeFunc, deepInto, afterFunc);
        //         }                
        //     }
        //     afterFunc(id);
        // }
        // 

        function draw(nodes, id) {
            var node = nodes[id];
            for (var key in nodeVisualDefaults) {
                if (!(key in node)) {
                    node[key] = nodeVisualDefaults[key];
                }
            }
            if (!('color' in node)) {
                var index = hashString(node.id) % colorCategory.length;
                node.color = colorCategory[index];
            }
            $ctrl.nodes.push(node);
        }

        function link(nodes, id, fromID) {
            var sourceNode = nodes[fromID];
            var targetNode = nodes[id];
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
            $ctrl.nodes.length = 0;
            $ctrl.links.length = 0;
            DAG.trace({
                nodes: DAG.nodes,
                id: $ctrl.rootNodeId,
                linkFunc: link,
                beforeFunc: draw,
                isDeeperFunc: function (nodes, id) {
                    return !nodes[id].collapse;
                }
            });

            forceLayout
            .nodes($ctrl.nodes)
            .links($ctrl.links)
            .on("tick", function(){$scope.$apply()})
            .start();            
        }

        function triggerCollapes(index) {
            $ctrl.nodes[index].collapse = !($ctrl.nodes[index].collapse);
            redraw();
        }

        function onMouseDown(id) {
            DAG.nodes[id].isPressed = true;
            startPressEffect(id);
            if ($ctrl.timeoutAddChild) {
                $timeout.cancel($ctrl.timeoutAddChild);
            }
            $ctrl.timeoutAddChild = $timeout(function () {
                addChild(id);
            }, 500);
        }

        function onMouseUp(id) {
            DAG.nodes[id].isPressed = false;
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
            DAG.nodes[id].isPressed = false;
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
                    DAG.nodes = data;
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
            var rootNode = DAG.nodes[$ctrl.rootNodeIndex];
            var reducer = getReducer(rootNode.attributes[attribute].reducer, attribute);

            var leaves = [];
            for (var id in DAG.nodes) {
               if (DAG.nodes[id].children.length == 0) {
                    DAG.nodes[id].animTarget = DAG.nodes[id].attributes[attribute].value;
                    DAG.nodes[id].attributes[attribute].value = 0;
                    leaves.push(DAG.nodes[id]);
               }
            }

            DAG.trace({
                nodes: DAG.nodes,
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
                    nodes: DAG.nodes,
                    id: $ctrl.rootNodeIndex,
                    beforeFunc: lodash.noop,
                    afterFunc: reducer
                });

                if (allDone) {
                    $interval.cancel($ctrl.routineRenew);
                }
            }, 10);
        }

        function hashString(str){
            var hash = 0;
            if (str.length === 0) {
                return hash;
            }
            for (var i = 0; i < str.length; i++) {
                var char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash);
        }
    }
})();