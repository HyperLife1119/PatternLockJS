"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Svg = (function () {
    function Svg() {
    }
    Svg.createElement = function (name, attrObj) {
        var element = document.createElementNS(Svg.namespace, name);
        for (var key in attrObj) {
            element.setAttribute(key, attrObj[key]);
        }
        return element;
    };
    Svg.createSvgElement = function () {
        return Svg.createElement('svg', {
            xmlns: Svg.namespace,
            version: Svg.version
        });
    };
    Svg.namespace = 'http://www.w3.org/2000/svg';
    Svg.version = '1.1';
    return Svg;
}());
var Vector = (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector.prototype.getDistance = function (x, y) {
        var _x = x - this.x, _y = y - this.y;
        return Math.sqrt((_x * _x) + (_y * _y));
    };
    ;
    Vector.prototype.isOnLine = function (x1, y1, x2, y2) {
        if (this.y >= Math.min(y1, y2) && this.y <= Math.max(y1, y2) && this.x >= Math.min(x1, x2) && this.x <= Math.max(x1, x2)) {
            var precision = (this.x - x1) * (y1 - y2) - (x1 - x2) * (this.y - y1);
            if (precision < 2e-10 && precision > -2e-10) {
                return true;
            }
        }
        return false;
    };
    return Vector;
}());
var Dot = (function (_super) {
    __extends(Dot, _super);
    function Dot(x, y, value, isActive) {
        if (isActive === void 0) { isActive = false; }
        var _this = _super.call(this, x, y) || this;
        _this.value = value;
        _this.isActive = isActive;
        return _this;
    }
    return Dot;
}(Vector));
var Css = (function () {
    function Css() {
    }
    Css.addStyle = function (style) {
        var element = document.createElement('style');
        element.innerHTML = style;
        document.head.appendChild(element);
        return element;
    };
    return Css;
}());
var PatternLock = (function () {
    function PatternLock(selectors, callback) {
        if (callback === void 0) { callback = {}; }
        this.dotsPos = [];
        this.container = document.querySelector(selectors);
        this.callback = callback;
        this.svg = Svg.createSvgElement();
        this.svg.style.width = this.svg.style.height = '100%';
        this.container.appendChild(this.svg);
        this.resize();
        this.init();
    }
    PatternLock.prototype.init = function () {
        this.width = this.container.clientWidth;
        this.radius = this.width / 6 * .7;
        this.margin = (this.width - this.radius * 6) / 4;
        this.style && document.head.removeChild(this.style);
        this.style = Css.addStyle("\n            .inner-dot {\n                animation: gl-inner-dot-scale .25s ease-in;\n            }\n            @keyframes gl-inner-dot-scale {\n                0% {\n                    r: " + this.radius / 2.5 + ";\n                } 50% {\n                    r: " + this.radius / 2 + ";\n                } 100% {\n                    r: " + this.radius / 2.5 + ";\n                }\n            }\n        ");
        if (this.dotsPos.length == 0) {
            var pos = [
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
            for (var _i = 0, _a = this.dotsPos; _i < _a.length; _i++) {
                var dot = _a[_i];
                dot.element = this.drawDot(dot.x, dot.y, this.radius, '#eee', 'dot');
                this.addClickEventListener(dot);
            }
            this.addTouchMoveEventListener();
            this.addTouchCompleteEventListener();
        }
    };
    PatternLock.prototype.addClickEventListener = function (dot) {
        var _this = this;
        var listener = function () {
            if (_this.isDirty || dot.isActive) {
                return;
            }
            _this.isDirty = true;
            dot.isActive = true;
            dot.element.setAttribute('fill', '#a7ffeb');
            _this.drawDot(dot.x, dot.y, _this.radius / 2.5, '#1de9b6', 'inner-dot');
            _this.lastPos = new Vector(dot.x, dot.y);
            _this.currentPos = new Vector(dot.x, dot.y);
            _this.points = dot.x + " " + dot.y + " ";
            _this.polyline = Svg.createElement('polyline', {
                points: _this.points,
                stroke: '#1de9b6',
                style: "fill:none;stroke-width:" + _this.radius / 4
            });
            _this.svg.appendChild(_this.polyline);
            _this.value = "" + dot.value;
        };
        if ('ontouchstart' in document.documentElement) {
            dot.element.addEventListener('touchstart', function (e) {
                e.stopPropagation();
                if (e.touches.length == 1) {
                    listener();
                }
            });
        }
        else {
            dot.element.addEventListener('mousemove', function (e) {
                if (e.buttons == 1) {
                    listener();
                }
            });
        }
    };
    PatternLock.prototype.addTouchMoveEventListener = function () {
        var _this = this;
        var listener = function (x, y, e) {
            e.preventDefault();
            if (!_this.polyline) {
                return;
            }
            x = x - _this.container.offsetLeft;
            y = y - _this.container.offsetTop;
            for (var _i = 0, _a = _this.dotsPos; _i < _a.length; _i++) {
                var dot = _a[_i];
                if (!dot.isActive && dot.getDistance(x, y) <= _this.radius * .85) {
                    _this.lastPos.x = _this.currentPos.x;
                    _this.lastPos.y = _this.currentPos.y;
                    _this.currentPos = new Vector(dot.x, dot.y);
                    _this.points = _this.points + (dot.x + " " + dot.y + " ");
                    dot.element.setAttribute('fill', '#a7ffeb');
                    dot.isActive = true;
                    _this.drawDot(dot.x, dot.y, _this.radius / 2.5, '#1de9b6', 'inner-dot');
                    for (var _b = 0, _c = _this.dotsPos; _b < _c.length; _b++) {
                        var d = _c[_b];
                        if (!d.isActive && d.isOnLine(_this.lastPos.x, _this.lastPos.y, _this.currentPos.x, _this.currentPos.y)) {
                            d.element.setAttribute('fill', '#a7ffeb');
                            d.isActive = true;
                            _this.drawDot(d.x, d.y, _this.radius / 2.5, '#1de9b6', 'inner-dot');
                            _this.value += d.value;
                        }
                    }
                    _this.value += dot.value;
                }
                _this.polyline.setAttribute('points', _this.points + (x + " " + y + " "));
            }
        };
        if ('ontouchmove' in document.documentElement) {
            this.svg.addEventListener('touchmove', function (e) {
                listener(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e);
            });
        }
        else {
            document.addEventListener('mousemove', function (e) {
                if (e.buttons == 1) {
                    listener(e.clientX, e.clientY, e);
                }
            });
        }
    };
    PatternLock.prototype.addTouchCompleteEventListener = function () {
        var _this = this;
        var complete = function () {
            if (!_this.isDirty) {
                return;
            }
            _this.container.style.pointerEvents = 'none';
            _this.polyline && _this.polyline.setAttribute('points', _this.points);
            _this.verify();
            _this.callback.complete && _this.callback.complete(_this.value);
            setTimeout(function () {
                _this.reset();
                _this.container.style.pointerEvents = 'auto';
            }, 1000);
        };
        if ('ontouchend' in document.documentElement) {
            this.svg.addEventListener('touchend', function () {
                complete();
            });
            this.svg.addEventListener('touchcancel', function () {
                complete();
            });
        }
        else {
            document.addEventListener('mouseup', function () {
                complete();
            });
        }
    };
    PatternLock.prototype.resize = function () {
        var _this = this;
        window.addEventListener('resize', this.debounce(function () {
            _this.init();
            var pos = [
                _this.radius + _this.margin,
                _this.radius * 3 + _this.margin * 2,
                _this.radius * 5 + _this.margin * 3
            ];
            var dotsPos = [
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
            for (var i = 0; i < dotsPos.length; i++) {
                _this.dotsPos[i].x = dotsPos[i].x;
                _this.dotsPos[i].element.setAttribute('cx', dotsPos[i].x);
                _this.dotsPos[i].y = dotsPos[i].y;
                _this.dotsPos[i].element.setAttribute('cy', dotsPos[i].y);
                _this.dotsPos[i].element.setAttribute('r', _this.radius);
            }
        }, 250));
    };
    PatternLock.prototype.verify = function () {
        if (!this.callback.verify || !this.callback.verify(this.value)) {
            this.polyline && this.polyline.setAttribute('stroke', '#ff5252');
            for (var _i = 0, _a = this.dotsPos; _i < _a.length; _i++) {
                var dot = _a[_i];
                if (dot.isActive) {
                    dot.element.setAttribute('fill', '#ffcdd2');
                }
            }
            var innerDots = document.querySelectorAll('.inner-dot');
            for (var i = 0; i < innerDots.length; i++) {
                innerDots[i].setAttribute('fill', '#ff5252');
            }
            if ('vibrate' in window.navigator) {
                window.navigator.vibrate(150);
            }
        }
    };
    PatternLock.prototype.reset = function () {
        this.points = '';
        this.value = '';
        this.isDirty = false;
        if (this.polyline) {
            this.svg.removeChild(this.polyline);
            this.polyline = null;
        }
        var innderDots = this.svg.querySelectorAll('.inner-dot');
        for (var _i = 0, innderDots_1 = innderDots; _i < innderDots_1.length; _i++) {
            var innerDot = innderDots_1[_i];
            this.svg.removeChild(innerDot);
        }
        for (var _a = 0, _b = this.dotsPos; _a < _b.length; _a++) {
            var dot = _b[_a];
            if (dot.isActive) {
                dot.isActive = false;
            }
            if (dot.element.getAttribute('fill') != '#eee') {
                dot.element.setAttribute('fill', '#eee');
            }
        }
        this.callback.reset && this.callback.reset();
    };
    PatternLock.prototype.drawDot = function (cx, cy, r, fill, className) {
        var dotElement = Svg.createElement('circle', {
            cx: cx, cy: cy, r: r, fill: fill, class: className
        });
        this.svg.appendChild(dotElement);
        return dotElement;
    };
    PatternLock.prototype.debounce = function (fn, delay) {
        var _this = this;
        var timer = null;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            timer && clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(_this, args);
            }, delay);
        };
    };
    return PatternLock;
}());
