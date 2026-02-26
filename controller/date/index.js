app.controller('DateCtrl', ['$scope', function DateController($scope) {
    // 单选日期

    this.count = 0;
    this.typeMap = {0:'date',1:'year',2:'month'}
    this.type = 'date'
    this.switchType = function (){
        this.count = this.count + 1
        this.type = this.typeMap[this.count %3]
    }

    this.ngModelOne = '2026-02-25'
    this.ngModelTwo = '2025'
    this.ngModelThree = '2024-03'
}])
