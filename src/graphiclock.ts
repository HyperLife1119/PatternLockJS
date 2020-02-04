class Svg {
    static namespace: string = 'http://www.w3.org/2000/svg';
    static version: string = '1.1';
    /**
     * 创建SVG系列元素
     * @param name 元素名称
     * @param attrObj 属性对象
     */
    static createElement(name: string, attrObj: any): Element {
        const element = document.createElementNS(Svg.namespace, name);
        for (let key in attrObj) {
            element.setAttribute(key, attrObj[key]);
        }
        return element;
    }

    /**
     * 创建SVG元素
     */
    static createSvgElement(): Element {
        return Svg.createElement('svg', {
            xmlns: Svg.namespace,
            version: Svg.version
        });
    }
}

class Vector {
    /** X坐标 */
    x: number;
    /** Y坐标 */
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * 获取该点距离xy坐标的距离
     * @param x
     * @param y
     */
    getDistance(x: number, y: number) {
        const _x = x - this.x, _y = y - this.y;
        return Math.sqrt((_x * _x) + (_y * _y));
    };

    /**
     * 判断该点是否在x1 y1 x2 y2线段上
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     */
    isOnLine(x1: number, y1: number, x2: number, y2: number) {
        if (this.y >= Math.min(y1, y2) && this.y <= Math.max(y1, y2) && this.x >= Math.min(x1, x2) && this.x <= Math.max(x1, x2)) {
            const precision = (this.x - x1) * (y1 - y2) - (x1 - x2) * (this.y - y1);
            if (precision < 2e-10 && precision > -2e-10) { // 实质判断是否接近0
                return true;
            }
        }
        return false;
    }
}
// 圆点
class Dot extends Vector {
    /** 圆点的值 */
    value: string;
    /** 是否被选中 */
    isActive: boolean;
    /** 圆点元素 */
    element: Element | any;

    constructor(x: number, y: number, value: string, isActive: boolean = false) {
        super(x, y);
        this.value = value;
        this.isActive = isActive;
    }
}
class Css {
    /**
     * 添加CSS样式
     * @param style 样式
     */
    static addStyle(style: string): Element {
        const element = document.createElement('style');
        element.innerHTML = style;
        document.head.appendChild(element);
        return element;
    }
}
class GraphicLock {
    /** 图形锁父容器元素 */
    container: Element | any;
    /** 回调函数对象 */
    callback: any;
    /** 图形锁的值 */
    value: string | any;
    /** 图形锁的宽度（宽度将等于高度）*/
    width: number | any;
    /** 圆点的半径 */
    radius: number | any;
    /** 圆点的外边距 */
    margin: number | any;
    /** 图形锁SVG 元素 */
    svg: Element | any;
    /** 储存九个圆点实例的数组 */
    dotsPos: Array<Dot> = [];
    /** 折线元素 */
    polyline: Element | any;
    /** 折线的上一个坐标 */
    lastPos: Vector | any;
    /** 折线的当前坐标 */
    currentPos: Vector | any;
    /** 折线的points属性值 */
    points: string | any;
    /** 图形锁是否被操作过 */
    isDirty: boolean | any;
    /** 图形锁的动画样式 */
    style: Element | any;

    /**
     * 构造函数
     * @param selectors 选择器
     * @param callback
     */
    constructor(selectors: string, callback: any = {}) {
        this.container = document.querySelector(selectors);
        this.callback = callback;

        this.svg = Svg.createSvgElement();
        this.svg.style.width = this.svg.style.height = '100%';
        this.container.appendChild(this.svg);

        this.resize();

        this.init();
    }

    /**
     * 初始化图形锁
     */
    init() {
        // 根据父元素的尺寸计算图形锁的一些尺寸
        this.width = this.container.clientWidth;
        this.radius = this.width / 6 * .7;
        this.margin = (this.width - this.radius * 6) / 4;

        this.style && document.head.removeChild(this.style);
        this.style = Css.addStyle(`
            .inner-dot {
                animation: gl-inner-dot-scale .25s ease-in;
            }
            @keyframes gl-inner-dot-scale {
                0% {
                    r: ${this.radius / 2.5};
                } 50% {
                    r: ${this.radius / 2};
                } 100% {
                    r: ${this.radius / 2.5};
                }
            }
        `);

        if (this.dotsPos.length == 0) {
            const pos = [
                this.radius + this.margin,
                this.radius * 3 + this.margin * 2,
                this.radius * 5 + this.margin * 3
            ];
            this.dotsPos = [
                new Dot(pos[0], pos[0], '1'),
                new Dot(pos[1], pos[0], '2'),
                new Dot(pos[2], pos[0], '3'),
                new Dot(pos[0], pos[1], '4'),
                new Dot(pos[1], pos[1], '5'),
                new Dot(pos[2], pos[1], '6'),
                new Dot(pos[0], pos[2], '7'),
                new Dot(pos[1], pos[2], '8'),
                new Dot(pos[2], pos[2], '9')
            ];

            for (let dot of this.dotsPos) { // 绘制大圆点
                dot.element = this.drawDot(dot.x, dot.y, this.radius, '#eee', 'dot');
            }

            this.addTouchMoveEventListener();
            this.addTouchCompleteEventListener();
        }
    }

    /**
     * 为圆点元素添加ontouchstart或mousemove事件
     * @param dot
     */
    addClickEventListener(dot: Dot) {
        const listener = () => {
            // 如果图形锁已经被操作过 如果该点没有被选中
            if (this.isDirty || dot.isActive) { return; }

            this.isDirty = true;
            dot.isActive = true;
            dot.element.setAttribute('fill', '#a7ffeb');
            this.drawDot(dot.x, dot.y, this.radius / 2.5, '#1de9b6', 'inner-dot'); // 添加小圆点

            this.lastPos = new Vector(dot.x, dot.y);    // 上一个坐标点
            this.currentPos = new Vector(dot.x, dot.y); // 当前坐标点
            this.points = `${dot.x} ${dot.y} `;         // 当前折线的points属性值
            this.polyline = Svg.createElement('polyline', {
                points: this.points,
                stroke: '#1de9b6',
                style: `fill:none;stroke-width:${this.radius / 4}`
            });
            this.svg.appendChild(this.polyline);

            this.value = `${dot.value}`;
        }

        if ('ontouchstart' in document.documentElement) {
            dot.element.addEventListener('touchstart', (e: any) => {
                e.stopPropagation(); // 阻止冒泡
                // 如果触摸点大于一
                if (e.touches.length == 1) { listener(); }
            });
        } else {
            dot.element.addEventListener('mousemove', (e: any) => {
                // 如果鼠标移动时按下左键
                if (e.buttons == 1) { listener(); }
            });
        }

    }

    /**
     * 为图形锁SVG元素添加ontouchmove事件
     */
    addTouchMoveEventListener() {
        const listener = (x: number, y: number, e: any) => {
            e.preventDefault(); // 防止浏览器下拉
            if (!this.polyline) { return; } // 如果折线不存在

            x = x - this.container.offsetLeft;
            y = y - this.container.offsetTop;

            for (let dot of this.dotsPos) {
                // 如果这个点没有被选中而且当前坐标在圆内
                if (!dot.isActive && dot.getDistance(x, y) <= this.radius * .85) {
                    // 让上一个坐标点等于上一次的当前坐标点
                    this.lastPos.x = this.currentPos.x;
                    this.lastPos.y = this.currentPos.y;

                    this.currentPos = new Vector(dot.x, dot.y); //让上一次的当前坐标点等于选择的坐标点

                    this.points = this.points + `${dot.x} ${dot.y} `;
                    dot.element.setAttribute('fill', '#a7ffeb');
                    dot.isActive = true;
                    this.drawDot(dot.x, dot.y, this.radius / 2.5, '#1de9b6', 'inner-dot'); //添加小圆点

                    for (let d of this.dotsPos) {
                        if (!d.isActive && d.isOnLine(this.lastPos.x, this.lastPos.y, this.currentPos.x, this.currentPos.y)) {
                            d.element.setAttribute('fill', '#a7ffeb');
                            d.isActive = true;
                            this.drawDot(d.x, d.y, this.radius / 2.5, '#1de9b6', 'inner-dot'); //添加小圆点

                            this.value += d.value;
                        }
                    }

                    this.value += dot.value;
                }
                this.polyline.setAttribute('points', this.points + `${x} ${y} `);
            }
        }

        if ('ontouchmove' in document.documentElement) {
            this.svg.addEventListener('touchmove', (e: any) => {
                listener(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e);
            })
        } else {
            document.addEventListener('mousemove', (e: any) => {
                // 如果鼠标移动时按下左键
                if (e.buttons == 1) { listener(e.clientX, e.clientY, e); }
            });
        }
    }

    /**
     * 为图形锁SVG元素添加ontouchend和ontouchcancel事件
     */
    addTouchCompleteEventListener() {
        const complete = () => {
            if (!this.isDirty) { return; }
            this.container.style.pointerEvents = 'none'; // 禁止触摸
            this.polyline && this.polyline.setAttribute('points', this.points); // 截断被手指拉长的那段线
            this.verify();
            this.callback.complete && this.callback.complete(this.value);
            setTimeout(() => {
                this.reset();
                this.container.style.pointerEvents = 'auto';
            }, 1000);
        }

        if ('ontouchend' in document.documentElement) {
            this.svg.addEventListener('touchend', () => {
                complete();
            });

            this.svg.addEventListener('touchcancel', () => { // 当触摸事件被意外中断时
                complete();
            });
        } else {
            document.addEventListener('mouseup', () => { // 当鼠标松开时
                complete();
            });
        }
    }

    resize() {
        window.addEventListener('resize', this.debounce(() => {
            this.init();

            const pos = [
                this.radius + this.margin,
                this.radius * 3 + this.margin * 2,
                this.radius * 5 + this.margin * 3
            ];
            const dotsPos = [
                new Dot(pos[0], pos[0], '1'),
                new Dot(pos[1], pos[0], '2'),
                new Dot(pos[2], pos[0], '3'),
                new Dot(pos[0], pos[1], '4'),
                new Dot(pos[1], pos[1], '5'),
                new Dot(pos[2], pos[1], '6'),
                new Dot(pos[0], pos[2], '7'),
                new Dot(pos[1], pos[2], '8'),
                new Dot(pos[2], pos[2], '9')
            ];

            for (let i = 0; i < dotsPos.length; i++) { // 给圆点实例重新赋值
                this.dotsPos[i].x = this.dotsPos[i].element.style.cx = dotsPos[i].x;
                this.dotsPos[i].y = this.dotsPos[i].element.style.cy = dotsPos[i].y;
                this.dotsPos[i].element.style.r = this.radius;
            }
        }, 250));
    }

    /**
     * 验证图形密码
     */
    verify() {
        if (!this.callback.verify || !this.callback.verify(this.value)) {
            this.polyline && this.polyline.setAttribute('stroke', '#ff5252');
            for (let dot of this.dotsPos) {
                if (dot.isActive) {
                    dot.element.setAttribute('fill', '#ffcdd2');
                }
            }
            const innerDots: NodeListOf<Element> = document.querySelectorAll('.inner-dot');
            for (let i = 0; i < innerDots.length; i++) {
                innerDots[i].setAttribute('fill', '#ff5252');
            }
            // 震动150毫秒
            if ('vibrate' in window.navigator) { window.navigator.vibrate(150); }
        }
    }

    /**
     * 重置图形锁
     */
    reset() {
        this.points = '';
        this.value = '';
        this.isDirty = false;

        if (this.polyline) {
            this.svg.removeChild(this.polyline);
            this.polyline = null;
        }

        const innderDots = this.svg.querySelectorAll('.inner-dot');

        for (let innerDot in innderDots) { // 清除所有小圆点
            this.svg.removeChild(innerDot);
        }

        for (let dot of this.dotsPos) { // 绘制大圆点
            if (dot.isActive) { dot.isActive = false; } // 取消选中
            if (dot.element.style.fill != '#eee') { dot.element.style.fill = '#eee'; } // 恢复默认颜色
            this.addClickEventListener(dot);
        }

        this.callback.reset && this.callback.reset();
    }

    /**
     * 绘制图形锁的圆点
     * @param cx 圆点X坐标
     * @param cy 圆点Y坐标
     * @param r 圆点半径
     * @param fill 填充颜色
     * @param className 类名
     */
    drawDot(cx: number, cy: number, r: number, fill: string, className: string) {
        const dotElement = Svg.createElement('circle', {
            cx: cx, cy: cy, r: r, fill: fill, class: className
        });
        this.svg.appendChild(dotElement);

        return dotElement;
    }

    /**
     * 防抖函数
     * @param fn 需要进行防抖的函数
     * @param delay 防抖时间
     */
    debounce(fn: Function, delay: number) {
        let timer: any = null;
        return (...args: Array<any>) => {
            timer && clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        }
    }
}