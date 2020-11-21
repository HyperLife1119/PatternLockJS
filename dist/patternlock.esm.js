class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    getDistance(x, y) {
        const _x = x - this.x, _y = y - this.y;
        return Math.sqrt((_x * _x) + (_y * _y));
    }
    ;
    isOnLine(x1, y1, x2, y2) {
        if (this.y >= Math.min(y1, y2) && this.y <= Math.max(y1, y2) && this.x >= Math.min(x1, x2) && this.x <= Math.max(x1, x2)) {
            const precision = (this.x - x1) * (y1 - y2) - (x1 - x2) * (this.y - y1);
            if (precision < 2e-10 && precision > -2e-10) {
                return true;
            }
        }
        return false;
    }
}

class Dot extends Vector {
    constructor(x, y, value, isActive = false) {
        super(x, y);
        this.value = value;
        this.isActive = isActive;
    }
}

class Css {
    static addStyle(style) {
        const element = document.createElement('style');
        element.innerHTML = style;
        document.head.appendChild(element);
        return element;
    }
}

class Svg {
    static createElement(name, attrObj) {
        const element = document.createElementNS(Svg.namespace, name);
        for (const key in attrObj) {
            element.setAttribute(key, attrObj[key] + '');
        }
        return element;
    }
    static createSvgElement() {
        return Svg.createElement('svg', {
            xmlns: Svg.namespace,
            version: Svg.version
        });
    }
}
Svg.namespace = 'http://www.w3.org/2000/svg';
Svg.version = '1.1';

function debounce(fn, delay) {
    let timer = null;
    return function () {
        timer && clearTimeout(timer);
        timer = window.setTimeout(fn, delay);
    };
}

class PatternLock {
    constructor(selectors, callback) {
        this.dotsPos = [];
        this.container = document.querySelector(selectors);
        this.callback = callback;
        this.svg = Svg.createSvgElement();
        this.svg.style.width = this.svg.style.height = '100%';
        this.container.appendChild(this.svg);
        this.init();
        for (const dot of this.dotsPos) {
            dot.element = this.drawDot(dot.x, dot.y, this.radius, '#eee', 'dot');
            this.addClickEventListener(dot);
        }
        this.addTouchMoveEventListener();
        this.addTouchCompleteEventListener();
    }
    init() {
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
    }
    addClickEventListener(dot) {
        const listener = () => {
            if (this.isDirty || dot.isActive) {
                return;
            }
            this.isDirty = true;
            dot.isActive = true;
            dot.element.setAttribute('fill', '#a7ffeb');
            this.drawDot(dot.x, dot.y, this.radius / 2.5, '#1de9b6', 'inner-dot');
            this.lastPos = new Vector(dot.x, dot.y);
            this.currentPos = new Vector(dot.x, dot.y);
            this.points = `${dot.x} ${dot.y} `;
            this.polyline = Svg.createElement('polyline', {
                points: this.points,
                'stroke-linejoin': 'round',
                'stroke-linecap': 'round',
                stroke: '#1de9b6',
                style: `fill:none;stroke-width:${this.radius / 4}`
            });
            this.svg.appendChild(this.polyline);
            this.value = `${dot.value}`;
        };
        if ('ontouchstart' in document.documentElement) {
            dot.element.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                e.touches.length === 1 && listener();
            });
        }
        else {
            dot.element.addEventListener('mousemove', (e) => {
                e.buttons === 1 && listener();
            });
        }
    }
    addTouchMoveEventListener() {
        const listener = (x, y, e) => {
            e.preventDefault();
            if (!this.polyline) {
                return;
            }
            x = x - this.container.offsetLeft;
            y = y - this.container.offsetTop;
            for (const dot of this.dotsPos) {
                if (!dot.isActive && dot.getDistance(x, y) <= this.radius * .85) {
                    this.lastPos.x = this.currentPos.x;
                    this.lastPos.y = this.currentPos.y;
                    this.currentPos = new Vector(dot.x, dot.y);
                    this.points = this.points + `${dot.x} ${dot.y} `;
                    dot.element.setAttribute('fill', '#a7ffeb');
                    dot.isActive = true;
                    this.drawDot(dot.x, dot.y, this.radius / 2.5, '#1de9b6', 'inner-dot');
                    for (const d of this.dotsPos) {
                        if (!d.isActive && d.isOnLine(this.lastPos.x, this.lastPos.y, this.currentPos.x, this.currentPos.y)) {
                            d.element.setAttribute('fill', '#a7ffeb');
                            d.isActive = true;
                            this.drawDot(d.x, d.y, this.radius / 2.5, '#1de9b6', 'inner-dot');
                            this.value += d.value;
                        }
                    }
                    this.value += dot.value;
                }
                this.polyline.setAttribute('points', this.points + `${x} ${y} `);
            }
        };
        if ('ontouchmove' in document.documentElement) {
            this.svg.addEventListener('touchmove', (e) => {
                listener(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e);
            });
        }
        else {
            document.addEventListener('mousemove', (e) => {
                (e.buttons === 1 && this.container.style.pointerEvents !== 'none') && listener(e.clientX, e.clientY, e);
            });
        }
    }
    addTouchCompleteEventListener() {
        const complete = () => {
            if (!this.isDirty) {
                return;
            }
            this.container.style.pointerEvents = 'none';
            this.polyline && this.polyline.setAttribute('points', this.points);
            this.verify();
            this.callback.complete && this.callback.complete(this.value);
            setTimeout(() => {
                this.reset();
                this.container.style.pointerEvents = 'auto';
            }, 1000);
        };
        if ('ontouchend' in document.documentElement) {
            this.svg.addEventListener('touchend', () => complete());
            this.svg.addEventListener('touchcancel', () => complete());
        }
        else {
            document.addEventListener('mouseup', () => complete());
        }
    }
    resize() {
        window.addEventListener('resize', debounce(() => this.init(), 250));
    }
    verify() {
        if (!this.callback.verify(this.value)) {
            this.polyline && this.polyline.setAttribute('stroke', '#ff5252');
            for (const dot of this.dotsPos) {
                dot.isActive && dot.element.setAttribute('fill', '#ffcdd2');
            }
            const innerDots = document.querySelectorAll('.inner-dot');
            for (let i = 0; i < innerDots.length; i++) {
                innerDots[i].setAttribute('fill', '#ff5252');
            }
            'vibrate' in window.navigator && window.navigator.vibrate(150);
        }
    }
    reset() {
        this.points = '';
        this.value = '';
        this.isDirty = false;
        if (this.polyline) {
            this.svg.removeChild(this.polyline);
            this.polyline = null;
        }
        const innderDots = this.svg.querySelectorAll('.inner-dot');
        for (const innerDot of innderDots) {
            this.svg.removeChild(innerDot);
        }
        for (const dot of this.dotsPos) {
            if (dot.isActive) {
                dot.isActive = false;
            }
            dot.element.getAttribute('fill') !== '#eee' && dot.element.setAttribute('fill', '#eee');
        }
        this.callback.reset && this.callback.reset();
    }
    drawDot(cx, cy, r, fill, className) {
        const dotElement = Svg.createElement('circle', {
            cx: cx,
            cy: cy,
            r: r,
            fill: fill,
            class: className
        });
        this.svg.appendChild(dotElement);
        return dotElement;
    }
}

export default PatternLock;
//# sourceMappingURL=patternlock.esm.js.map
