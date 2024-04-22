app
    .factory('position', ['uuId', 'floating', function (uuId, floating) {

        return {
            mousePosition: function (event, target) {
                let x = event.clientX; // 鼠标所在位置
                let y = event.clientY;// 鼠标所在位置
                let {offsetLeft, offsetTop, offsetWidth, offsetHeight} = target;
                let left = offsetLeft;
                let top = offsetTop;
                let right = left + offsetWidth;
                let bottom = top + offsetHeight
                if (left <= x <= right && top <= y <= bottom) {
                    console.log('我在上面')
                    return true
                }
                return false
            }
        }
    }])
