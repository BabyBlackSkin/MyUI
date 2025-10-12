function controller($scope, messageBox) {
    const _that = this;

    // 显示基础Alert
    this.showAlert = function() {
        messageBox.alert('这是一段内容', '标题');
    };

    // 显示Info消息
    this.showInfo = function() {
        console.log(11)
        messageBox.info('这是一条信息提示', '消息');
    };

    // 显示Success消息
    this.showSuccess = function() {
        messageBox.success('恭喜你，这是一条成功消息', '成功');
    };

    // 显示Warning消息
    this.showWarning = function() {
        messageBox.warning('这是一条警告消息', '警告');
    };

    // 显示Error消息
    this.showError = function() {
        messageBox.error('这是一条错误消息', '错误');
    };

    // 显示确认消息
    this.showConfirm = function() {
        messageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示');
    };

    // 显示自定义按钮的确认消息
    this.showCustomConfirm = function() {
        messageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            confirmButtonType: 'danger',
            cancelButtonType: 'default'
        });
    };

    // 显示带回调的确认消息
    this.showCallback = function() {
        messageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            callback: function(action) {
                if (action === 'confirm') {
                    messageBox.success('删除成功！', '成功');
                } else {
                    messageBox.info('已取消删除', '提示');
                }
            }
        });
    };
}

app
    .controller('MessageBoxCtrl', ['$scope', 'messageBox', controller]);
