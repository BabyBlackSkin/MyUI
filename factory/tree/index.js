app
    .factory('Tree', ['$compile', function ($compile) {
        return {
            transformTree: function (setting, nodes) {
                if (!nodes) {
                    return []
                }
                if (!Array.isArray(nodes)) {
                    return [nodes]
                }
                let key = setting.nodeKey || "id"
                let parentKey = setting.parentId || "parentId"
                let childExpandLoad = setting.childExpandLoad || false // 子节点展开时是否需要加载

                let nodeList = [];
                let tmpMap = {};
                for (let n of nodes) {
                    n.leaf = childExpandLoad
                    tmpMap[n[key]] = n;
                }
                for (let n of nodes) {
                    let p = tmpMap[n[parentKey]];
                    if (p && n[key] !== n[parentKey]) {
                        let children = this.nodeChildren(setting, p);
                        if (!children) {
                            children = this.nodeChildren(setting, p, []);
                        }
                        children.push(n);
                    }
                    else {
                        nodeList.push(n);
                    }
                }
                return nodeList;
            },
            nodeChildren: function (setting, node, newChildren) {
                if (!node) {
                    return null;
                }
                let key = setting.children || "children";
                if (typeof newChildren !== 'undefined') {
                    node[key] = newChildren;
                }
                return node[key];
            }
        }
    }])
