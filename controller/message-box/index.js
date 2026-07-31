function controller($scope, messageBox, message, $interval) {
    const _that = this;

    // 显示基础Alert
    this.showAlert = function () {
        messageBox.alert('这是一段内容', '标题', {
            confirmButtonText: "ok",
        }).then((action) => {
            console.log(action)
        });
    };

    // HTML 正文：静态 mob-progress
    this.showHtmlMessage = function () {
        messageBox.alert(
            '<p style="margin: 0 0 12px;">文件正在上传，请稍候...</p>' +
            '<mob-progress percentage="0.5" stroke-width="8"></mob-progress>',
            '上传进度',
            {
                dangerouslyUseHTMLString: true,
                closeOnClickModal: false,
                closeOnPressEscape: false,
            }
        );
    };

    // HTML 正文：动态 mob-progress（通过 messageContext 绑定数据）
    this.showHtmlProgressMessage = function () {
        const ctx = {status:'primary', progressValue: 0 };
        let timer;

        messageBox.confirm(
            `
            <mob-progress percentage="progressValue" status="status" stroke-width="8"></mob-progress>
<p ng-if="status == 'exception'"  style="margin: 0 0 12px;">正在处理数据，是否继续等待？</p>`,
            '处理进度',
            {
                dangerouslyUseHTMLString: true,
                messageContext: ctx,
                closeOnClickModal: false,
                confirmButtonText: '完成',
                cancelButtonText: '取消',
            }
        ).finally(function () {
            if (timer) {
                $interval.cancel(timer);
            }
        });

        timer = $interval(function () {
            ctx.progressValue += 0.1;
            if (ctx.progressValue >= 0.5) {
                ctx.status = 'exception'
                $interval.cancel(timer);
            }
            // if (ctx.progressValue >= 100) {
            //     $interval.cancel(timer);
            //     timer = null;
            // }
        }, 400);
    };

    this.showSuccess = function () {
        messageBox.success('数据保存成功').then(() => { /* 用户已确认 */ });
    };
    this.showWarning = function () {
        messageBox.warning('剩余空间不足，请及时清理');
    };
    this.showError = function () {
        messageBox.error('网络连接失败，请重试');
    };

    this.showMessage = function () {
        message.success('修改成功');
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

    // 确认时模拟网络请求：按钮 loading，请求完成后关闭
    this.showConfirmAsync = function () {
        messageBox.confirm('确认提交修改吗？', '提示', {
            beforeClose: function (opt) {
                if (opt.action !== 'confirm') {
                    opt.done();
                    return;
                }
                setTimeout(function () {
                    message.success('修改成功');
                    opt.done();
                }, 1500);
            }
        });
    };

    // 取消时二次确认：先结束 loading，弹出确认框后再决定是否关闭
    this.showConfirmCancelConfirm = function () {
        messageBox.confirm('确认保存当前内容吗？', '提示', {
            beforeClose: function (opt) {
                if (opt.action !== 'cancel') {
                    opt.done();
                    return;
                }
                opt.done(false);
                messageBox.confirm('未保存的内容将丢失，确定取消吗？', '提示', {
                    confirmButtonType: 'danger'
                }).then(function () {
                    opt.instance.options.deferred.reject({action: 'cancel'});
                    opt.instance.closeHandle();
                });
            }
        });
    };

    // 基础 Prompt
    this.showPrompt = function () {
        messageBox.prompt('请输入您的姓名', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            confirmButtonType: 'primary',
            input: {
                pattern: /^[A-Za-z]+$/
            }
        }).then(function (data) {
            console.log('confirm', data);
        }).catch(function (data) {
            console.log('catch', data);
        });
    };

    // Prompt 异步提交：确认后 loading，提交成功再关闭并返回输入值
    this.showPromptAsync = function () {
        messageBox.prompt('请输入新名称', '重命名', {
            input: {
                placeholder: '仅支持英文字母',
                pattern: /^[A-Za-z]+$/
            },
            beforeClose: function (opt) {
                if (opt.action !== 'confirm') {
                    opt.done();
                    return;
                }
                setTimeout(function () {
                    message.success('已保存：' + opt.data);
                    opt.done(false);
                }, 1500);
            }
        }).then(function (data) {
            console.log('saved', data);
        });
    };

}

app
    .controller('MessageBoxCtrl', ['$scope', 'messageBox', 'message', '$interval', controller]);
