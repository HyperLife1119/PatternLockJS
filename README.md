# PatternLockJS
一个运行在浏览器上的图案锁，同时支持桌面端和移动端。

A pattern lock running on the browser, supporting both desktop and mobile.
> 特点：基于SVG实现，简单，灵活且易用。

---

#### 用法 (Usage)：
1. 设置一个空元素，作为PatternLock图案锁的容器
```
<div id="lock"></div>
```
2. 为其设置尺寸（宽高）
```
#lock {
    width: 45vh;
    height: 45vh;
}
```
3. 引入patternlock.js
```
<script src="(Your Path)/patternlock.min.js"></script>
```
4. 实例化PatternLock，共有两个参数。
    * 参数一：`selectors` 选择器，通过选择器找到元素作为PatternLock图案锁的容器。
    * 参数二：`callback` 一个包含回调函数的对象。
        * `verify`：接收一个参数，值为用户操作PatternLock图案锁得出的密码。在PatternLock图案锁进行密码验证时触发，该函数必须返回一个布尔值。（必须）
        * `complete`：接收一个参数，值为用户操作PatternLock图案锁得出的密码。在PatternLock图案锁进行密码验证完成时触发。（非必须）
        * `reset`：在PatternLock图案锁重置时触发。（非必须）
```
const lock = new PatternLock('#lock', {
    complete: (value) => {
        console.log('complete: ' + value);
    },
    reset: () => {
        console.log('reset');
    },
    verify: (value) => {
        if (value == pwd) {
            alert('密码正确！');
            return true;
        } else {
            return false;
        }
    }
});
```
5. 小贴士：添加 `overscroll-behavior-y: contain;` 到body元素，可阻止部分移动端浏览器下拉刷新等默认行为（这些浏览器默认行为可能会干扰用户操作PatternLock图案锁）。
```
body {
    overscroll-behavior-y: contain;
}
```
> 具体代码可参考`index.html`