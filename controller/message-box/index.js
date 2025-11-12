function controller($scope, messageBox) {
    const _that = this;

    // 显示基础Alert
    this.showAlert = function () {
        messageBox.alert('这是一段内容', '标题', {
            confirmButtonText: "ok",
        }).then((action) => {
            console.log(action)
        });
    };

    // 显示Info消息
    this.showConfirm = function() {

        messageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            confirmButtonType: 'primary'
        }).then(data=>{
            console.log('confirm', data)
        }).catch(data=>{
            console.log('catch', data)
        });
    };

    // 显示Info消息
    this.showPrompt = function() {

        messageBox.prompt('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            confirmButtonType: 'primary',
            input:{
                pattern:/^[A-Za-z]+$/
            }
        }).then(data=>{
            console.log('confirm', data)
        }).catch(data=>{
            console.log('catch', data)
        });
    };

}

app
    .controller('MessageBoxCtrl', ['$scope', 'messageBox', controller]);
