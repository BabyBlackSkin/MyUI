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

    this.beforeClose = function (opt){
        console.log(opt)
        opt.instance.confirmButtonLoading = true
        message.success("修改成功");
        // setTimeout(()=>{
        //     // opt.done()
        // }, 3000)
    }
    this.showMessage = function() {
        message.success("修改成功");
    }
    // 显示Info消息
    this.showPrompt = function() {

        messageBox.prompt('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            confirmButtonType: 'primary',
            input:{
                pattern:/^[A-Za-z]+$/
            },
            beforeClose:this.beforeClose
        }).then(data=>{
            console.log('confirm', data)
        }).catch(data=>{
            console.log('catch', data)
        });
    };

}

app
    .controller('MessageBoxCtrl', ['$scope', 'messageBox', 'message', '$interval', controller]);
