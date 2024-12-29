// https://www.cnblogs.com/echolun/p/11564103.html
const demoDirective = [function () {
    return {
        restrict: String, // restrict表示指令在DOM中能以哪种形式被声明，是一个可选值，可选值范围有E(元素)A(属性)C(类名)M(注释)四个值，如果不使用此属性则默认值为EA，以下四种表现相同：
        priority: Number, // priority值为数字，表示指令的优先级，若一个DOM上存在多个指令时，优先级高的指令先执行，注意此属性只在指令作为DOM属性时起作用
        terminal: Boolean, // terminal值为布尔值，用于决定优先级低于自己的指令是否还执行，例如上方例子中，我们为demo指令添加terminal:true，可以看到echo指令不会执行：
        template: ' String or Template Function', // template的值是一段HTML文本或一个函数，HTML文本的例子上文已有展示，这里简单说下值为函数的情况, ，tElement和tAttrs，这里我们分别输出两个属性，可以看到tElement表示正在使用此指令的DOM元素，而tAttrs包含了使用此指令DOM元素上的所有属性。
        templateUrl: String,
        replace: 'Boolean or String', // replace值为布尔值，用于决定指令模板是否替换声明指令的DOM元素，

        // scope属性用于决定指令作用域与父级作用域的关系，可选值有布尔值或者一个对象
        // 当 scope:false 时，表示指令不创建额外的作用域，默认继承使用父级作用域，所以指令中能正常使用和修改父级中所有变量和方法
        // 当 scope:true 时表示指令创建自己的作用域，但仍然会继承父作用域，说直白点就是，指令自己有的用自己的，没有的找父级拿，同一份数据父级能影响指令，但指令却无法反向影响父级，这就是继承但隔离。
        // 当 scope:{} 时，表示指令创建一个隔离作用域，此时指令作用域不再继承父作用域，两边的数据不再互通：
        // angularjs中directive的绑定策略分为三种，@，=，和&
        // @通常用于传递字符串，注意，使用@传递过去的一定得是字符串，而且@属于单向绑定，即父修改能影响指令，但指令修改不会反向影响父，
        // = 用于传递各类数据，字符串，对象，数组等等，而且是双向绑定，
        // & 用于传递父作用域中声明的方法，
        scope: 'Boolean or Object',
        transclude: Boolean,
        // controller的值可以是一个函数，或者一个字符串，如果是字符串指令会在应用中查找与字符串同名的构造函数作为自己的控制器函数，
        // $scope：指令当前的作用域，所有在scope上绑定的属性方法
        // element：使用指令的当前元素，
        // $attr：使用指令当前元素上的属性
        // $transclude：链接函数，用于克隆和操作DOM元素，如果要使用此方法得保证transclude属性值为true
        controller: function (scope, element, attrs, transclude, otherInjectables) {},
        // controllerAs用于设置控制器的别名，
        controllerAs: String,
        // 对于指令开发，link函数和controller中都可以定义指令需要的属性或方法，但如果这个属性或方法只是本指令使用，你可以定义在指令的link函数中，但如果这个属性方法你想在别的指令中也使用，推荐定义在controller中。
        // 而require属性就是用来引用其它指令的controller，require的值可以是一个字符串或者一个数组，字符串就是其它指令名字，而数组就是包含多个指令名的数组
        // 如果没有前缀，指令将会在自身所提供的控制器中进行查找，如果没有找到任何控制器（或具有指定名字的指令）就抛出一个错误。
        // 如果添加了^前缀，指令会在自身以及父级指令链中查找require参数所指定的指令的控制器，如果没找到报错。
        // 同样是在当前指令中找，如果没找到会将null传给link函数的第四个参数。与不加前缀的区别是提供null从而不报错。
        // ?与^的组合，从当前找，如果没找到去上层找，如果没找到就提供null。
        // Angular 1.5.6版本之后新增，表示跳过自身直接从父级开始找，找不到报错。
        require: String,
        // ，在link函数中我们也能像在controller中一样为模板绑定事件，更新视图等
        // link函数拥有四个参数，scope表示指令的作用域，在scope上绑定的数据在模板上都能直接访问使用。elem表示当前使用指令的DOM元素，attrs表示当前使用指令DOM元素上的属性，这三点与前面介绍指令controller参数一致。
        // 第四个参数controller表示指令中require的指令的controller，前面已经有例子展示，注意，如果指令没有require其它指令，那么第四个参数就是指令自身的作用域，
        link: function (scope, iElement, iAttrs) {},
        // 如果你想在指令模板编译之前操作DOM，那么compile函数将会起作用，但出于安全问题一般不推荐这么做。同样不推荐在compile中进行DOM方法绑定与数据监听，这些行为最好都交给link或者controller来完成。
        // 其次compile和link互斥，如果你在一个指令同时使用了compile和link，那么link函数不会执行。
        compile: function (tElement, tAttrs, transclude) {
            return {
                pre: function (scope, iElement, iAttrs, controller) {},
                post: function (scope, iElement, iAttrs, controller) {}
            };
            //或 return function postLink() {}
        }
    };
}]
app.directive('demoDirective', demoDirective);
