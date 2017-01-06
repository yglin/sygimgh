/*
* @Author: yglin
* @Date:   2016-04-17 10:32:56
* @Last Modified by:   yglin
* @Last Modified time: 2017-01-06 16:01:11
*/

'use strict';

(function() {
    'use strict';

    angular
        .module('sygimghApp')
        .controller('SygimghController', SygimghController);

    SygimghController.$inject = ['$scope', '$timeout', '$interval', 'lodash', 'FileIO', 'DAG', 'Node'];

    /* @ngInject */
    function SygimghController($scope, $timeout, $interval, lodash, FileIO, DAG, Node) {
        var $ctrl = this;
        $ctrl.title = 'Sygimgh';
        $ctrl.graph = {};
        $ctrl.screen = {};
        $ctrl.nodes = [];
        $ctrl.links = [];
        $ctrl.selectedNodes = [];
        $ctrl.rootNode = undefined;

        $ctrl.onClickBackground = onClickBackground;
        $ctrl.onClickNode = onClickNode;
        $ctrl.triggerCollapes = triggerCollapes;
        // $ctrl.onMouseDown = onMouseDown;
        // $ctrl.onMouseUp = onMouseUp;
        // $ctrl.onMouseLeave = onMouseLeave;

        // $ctrl.lastSelected = lastSelected;
        // $ctrl.save = FileIO.save;
        // $ctrl.openFileSelector = openFileSelector;
        // $ctrl.openFile = openFile;
        // $ctrl.reduce = reduce;
        $ctrl.addChild = addChild;
        // $ctrl.appendChild = appendChild;
        $ctrl.applyMom = applyMom;

        var forceLayout;
        // var colorCategoryIndex = Math.floor(Math.random() * colorCategory.length);

        $ctrl.$onInit = function () {
            $ctrl.graph.width = 960;
            $ctrl.graph.height = 600;
            $ctrl.graph.link = {
                color: 'darkblue',
                width: 3
            };
            $ctrl.graph.node = {
                r: 50,
                x: 480,
                y: 300
            };
            $ctrl.graph.colorCategory = ['coral', 'burlywood', 'hotpink', 'deeppink', 'orange', 'gold', 'lightsalmon', 'mistyrose'];

            $ctrl.screen.width = 800;
            $ctrl.screen.height = 480;
            $ctrl.screen.bgColor = 'palegreen';

            // $ctrl.nodes[1] = {
            //     id: 1,
            //     title: 'ggyy',
            //     x: 10,
            //     y: 10,
            //     r: 50,
            //     color: colorCategory[colorCategoryIndex],
            //     parents: [],
            //     children: [2],
            //     collapse: false,
            //     attributes: {
            //         completion: {
            //             reducer: 'average',
            //             default: 0,
            //             value: 50
            //         }
            //     }
            // };
            // colorCategoryIndex = (colorCategoryIndex + 1) % colorCategory.length;            

            // $ctrl.nodes[2] = {
            //     id: 2,
            //     title: 'yygg',
            //     x: 170,
            //     y: 170,
            //     r: 50,
            //     color: colorCategory[colorCategoryIndex],
            //     parents: [1],
            //     children: [],
            //     collapse: false,
            //     attributes: {
            //         completion: {
            //             reducer: 'average',
            //             default: 0,
            //             value: 50
            //         }
            //     }
            // };

            // colorCategoryIndex = (colorCategoryIndex + 1) % colorCategory.length;            

            // $ctrl.rootNodeIndex = 1;

            // angular.element(document.getElementById('input-file-selector'))
            // .bind('change', $ctrl.openFile);

            // Setup d3 force layout
            forceLayout = d3.layout.force()
            .charge(-2000)
            .linkDistance(function (link) {
                var totalLinks = (link.source.parents && link.source.parents.length || 0) +
                (link.source.children && link.source.children.length || 0) +
                (link.target.children && link.target.children.length || 0) +
                (link.target.children && link.target.children.length || 0);
                var extension = totalLinks * 20;
                return 100 + extension;
            })
            .size([$ctrl.graph.width, $ctrl.graph.height]);

            forceLayout
            .nodes($ctrl.nodes)
            .links($ctrl.links)
            .on("tick", function(){$scope.$apply()});

            $ctrl.rootNode = DAG.genRandomGraph().root;
            $ctrl.rootNode.color = 'white';
            
            redraw();
        };

        function onClickBackground() {
            clearSelect();
        }

        function onClickNode(event, node) {
            if (!(event.ctrlKey || event.metaKey)) {
                clearSelect();
            }
            toggleSelect(node);
        }

        function toggleSelect(node) {
            var index = $ctrl.selectedNodes.indexOf(node);
            if (index < 0) {
                $ctrl.selectedNodes.push(node);
                node.strokeColor = 'blue';
                node.strokeWidth = 3;
            }
            else {
                $ctrl.selectedNodes.splice(index, 1);
                node.strokeWidth = 0;
            }
        }

        function clearSelect() {
            for (var i = 0; i < $ctrl.selectedNodes.length; i++) {
                $ctrl.selectedNodes[i].strokeWidth = 0;
            }
            $ctrl.selectedNodes.length = 0;            
        }

        function addChild(node) {
            var newNode = Node.genRandomNode();
            DAG.appendChild(node, newNode);
            newNode.x = node.x;
            newNode.y = node.y;
            node.collapse = false;
            redraw();
        }

        function applyMom(node) {
            callMom()
            .then(function (mom) {
                if (mom) {
                    $ctrl.mom = mom;
                    $ctrl.mom.startNagging(node)
                    .then(function (result) {
                    }, function (error) {
                    }, function (progress) {
                        $scope.$apply();
                    });
                }
            });
        }

        // function appendChild(id, childID) {
        //     childID = DAG.appendChild($ctrl.nodes, id, childID);
        //     if (childID < 0) {
        //         return;
        //     }
        //     redraw();
        // }

        // function accumulate(id, field) {
        //     if (DAG.hasChild($ctrl.nodes, id)) {
        //         var node = $ctrl.nodes[id];
        //         node[field] = 0;
        //         for (var i = 0; i < node.children.length; i++) {
        //             node[field] += accumulate(node.children[i], field, deepInto);
        //         }
        //         return node[field];                
        //     }
        //     else {
        //         return node[field];
        //     }
        // }

        // function average(id, field) {
        //     var node = $ctrl.nodes[id];
        //     if (!node[field]) {
        //         node[field] = 0;
        //     }
            
        //     if (DAG.hasChild($ctrl.nodes, id)) {
        //         node[field] = 0;
        //         for (var i = 0; i < node.children.length; i++) {
        //             node[field] += average(node.children[i], field, deepInto);
        //         }
        //         node[field] /= node.children.length;
        //         return node[field];                
        //     }
        //     else {
        //         return node[field];
        //     }
        // }

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
        // 

        function draw(node) {
            lodash.defaults(node, $ctrl.graph.node);
            if (!node.color) {
                if (node.parents && node.parents.length && node.parents[0].color) {
                    node.color = node.parents[0].color;
                }
                else{
                    node.color = lodash.sample($ctrl.graph.colorCategory);
                }

                if (node.parents && node.parents.length && node.parents[0] === $ctrl.rootNode) {
                    node.color = lodash.sample($ctrl.graph.colorCategory);                    
                }
            }
            $ctrl.nodes.push(node);
            if (node.parents && node.parents.length) {
                for (var i = 0; i < node.parents.length; i++) {
                    var parent = node.parents[i];
                    $ctrl.links.push({
                        source: parent,
                        target: node,
                        color: $ctrl.graph.link.color,
                        width: $ctrl.graph.link.width
                    });
                }
            }
        }

        // function link(node, parent) {
        //     if (!(node && parent)) {
        //         return;
        //     }
        //     $ctrl.links.push({
        //         source: parent,
        //         target: node,
        //         color: $ctrl.graph.link.color,
        //         width: $ctrl.graph.link.width
        //     });
        // }

        function redraw() {
            $ctrl.links.length = 0;
            $ctrl.nodes.length = 0;
            DAG.trace($ctrl.rootNode, {
                // linkFunc: link,
                beforeFunc: draw,
                isDeeperFunc: function (node) {
                    return DAG.hasChild(node) && !node.collapse;
                }
            });

            forceLayout.start();
        }

        function triggerCollapes(node) {
            // console.log('click on node ' + id);
            node.collapse = !node.collapse;
            redraw();
        }

        // function onMouseDown(id) {
        //     $ctrl.nodes[id].isPressed = true;
        //     startPressEffect(id);
        //     if ($ctrl.timeoutAddChild) {
        //         $timeout.cancel($ctrl.timeoutAddChild);
        //     }
        //     $ctrl.timeoutAddChild = $timeout(function () {
        //         addChild(id);
        //     }, 500);
        // }

        // function onMouseUp(id) {
        //     $ctrl.nodes[id].isPressed = false;
        //     endPressEffect(id);
        //     var noAddChild = true;
        //     if ($ctrl.timeoutAddChild) {
        //         noAddChild = $timeout.cancel($ctrl.timeoutAddChild);
        //     }
        //     if (noAddChild) {
        //         triggerCollapes(id);
        //     }
        // }

        // function onMouseLeave(id) {
        //     $ctrl.nodes[id].isPressed = false;
        //     endPressEffect(id);
        //     var noAddChild = true;
        //     if ($ctrl.timeoutAddChild) {
        //         noAddChild = $timeout.cancel($ctrl.timeoutAddChild);
        //     }
        // }

        // function startPressEffect(id) {
        //     if ($ctrl.intervalPressEffect) {
        //         $interval.cancel($ctrl.intervalPressEffect);
        //         $ctrl.pressEffect.r = 0;
        //         $ctrl.pressEffect.opacity = 0.6;
        //     }
        //     $ctrl.intervalPressEffect = $interval(function () {
        //         $ctrl.pressEffect.r += 5;
        //         $ctrl.pressEffect.opacity -= 0.02;
        //     }, 50, 10);
        // }

        // function endPressEffect(id) {
        //     if ($ctrl.intervalPressEffect) {
        //         $interval.cancel($ctrl.intervalPressEffect);
        //         $ctrl.pressEffect.r = 0;
        //     }            
        // }

        // function flashScreen() {
        //     var prevColor = $ctrl.screen.bgColor;
        //     $ctrl.screen.bgColor = 'white';
        //     $timeout(function () {
        //         $ctrl.screen.bgColor = prevColor;
        //     }, 10);
        // }

        // function openFileSelector() {
        //     document.getElementById('input-file-selector').click();
        // }

        // function openFile(event) {
        //     FileIO.open(event.target.files[0]).then(function (data) {
        //         if (data) {
        //             $ctrl.nodes = data;
        //             redraw();
        //         }
        //     });
        // }

        // function getReducer(reducer, attribute) {
        //     if (reducer == 'average') {
        //         return function (nodes, id) {
        //             var node = nodes[id];
        //             if (DAG.hasChild(nodes, id)) {
        //                 var sum = 0;
        //                 for (var i = 0; i < node.children.length; i++) {
        //                     var childNode = nodes[node.children[i]];
        //                     sum += childNode.attributes[attribute].value;
        //                 }
        //                 node.attributes[attribute].value = sum / node.children.length;
        //             }
        //             node.displayAttribute = attribute;
        //         };
        //     }
        //     else {
        //         return lodash.noop;
        //     }
        // }

        // function reduce(attribute) {
        //     var rootNode = $ctrl.nodes[$ctrl.rootNodeIndex];
        //     var reducer = getReducer(rootNode.attributes[attribute].reducer, attribute);

        //     var leaves = [];
        //     for (var id in $ctrl.nodes) {
        //        if ($ctrl.nodes[id].children.length == 0) {
        //             $ctrl.nodes[id].animTarget = $ctrl.nodes[id].attributes[attribute].value;
        //             $ctrl.nodes[id].attributes[attribute].value = 0;
        //             leaves.push($ctrl.nodes[id]);
        //        }
        //     }

        //     DAG.trace({
        //         nodes: $ctrl.nodes,
        //         id: $ctrl.rootNodeIndex,
        //         beforeFunc: lodash.noop,
        //         afterFunc: reducer
        //     });

        //     $ctrl.routineRenew = $interval(function () {
        //         var allDone = true;
        //         for (var i = 0; i < leaves.length; i++) {
        //             if (leaves[i].attributes[attribute].value >= leaves[i].animTarget) {
        //                 leaves[i].attributes[attribute].value = leaves[i].animTarget;
        //             }
        //             else {
        //                 leaves[i].attributes[attribute].value += 0.1;
        //                 allDone = false;
        //             }
        //         }

        //         DAG.trace({
        //             nodes: $ctrl.nodes,
        //             id: $ctrl.rootNodeIndex,
        //             beforeFunc: lodash.noop,
        //             afterFunc: reducer
        //         });

        //         if (allDone) {
        //             $interval.cancel($ctrl.routineRenew);
        //         }
        //     }, 10);
        // }

        // function lastSelected() {
        //     return lodash.last($ctrl.selectedNodes);
        // }
    }
})();