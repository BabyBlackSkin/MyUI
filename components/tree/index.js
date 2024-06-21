function controller($scope, $element, $attrs) {
    // 初始化工作
    this.$onInit = function () {

    }


    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {

    }


    this.$postLink = function () {
    }
}

app
    .component('mobRadioButton', {
        templateUrl: './components/radio-button/mob-radio-button.html',
        require: {
            'radioGroup': '?^mobRadioGroup'
        },
        bindings: {
            // === 属性 ===
            ngModel: "=?",// 双向数据绑定
            data: "<?",// 展示数据
            nodeKey:"<?",// 节点的唯一标识属性，整个树唯一
            label: "<?",
            /**
             * 节点属性
             * label：节点的标签
             * children：子节点
             * disabled：是否禁用
             * isLeaf：是否包含叶子节点。由于在点击节点时才进行该层数据的获取，默认情况下 Tree 无法预知某个节点是否为叶子节点，
             * 所以会为每个节点添加一个下拉按钮，如果节点没有下层数据，则点击后下拉按钮会消失。同时，你也可以提前告知
             * Tree 某个节点是否为叶子节点，从而避免在叶子节点前渲染下拉按钮。
             *
             */
            props:"<?",//节点属性
            renderAfterExpand: "<?",// 	是否在第一次展开某个树节点后才渲染其子节点
            defaultExpandAll:"<?",// 是否默认展开所有节点
            expandOnClickNode:"<?",// 点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
            checkOnClickNode:"<?",// 点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。
            defaultExpandedKeys:"<?", // 默认展开的节点的 key 的数组
            showCheckbox:"<?",// 是否显示多选框
            defaultCheckedKeys:"<?",// 默认勾选的节点的 key 的数组
            currentNodeKey:"=?",// 当前选中节点的 key
            indent:"<?", // 树节点缩进，单位为像素
            // icon-class
            lazy:"<?",// 是否懒加载节点。与load方法结合使用
            // === 方法 ===
            load: "&?", // 加载子节点 Function(node, resolve)
            filterNodeMethod:"&?", // 对树节点进行筛选时执行的方法，返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏 Function(value, data, node)

        },
        controller: controller
    })
