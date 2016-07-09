/*
* @Author: yglin
* @Date:   2016-07-09 20:00:54
* @Last Modified by:   yglin
* @Last Modified time: 2016-07-09 20:47:30
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
                console.log('hit node ' + id);
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
            return typeof nodes[id].children.length && nodes[id].children.length > 0;
        }
    }
})();
