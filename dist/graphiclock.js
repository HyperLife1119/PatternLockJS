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
var GraphicLock = (function () {
    function GraphicLock(selectors, callback) {
        if (callback === void 0) { callback = {}; }
        this.dotsPos = [];
        this.container = document.querySelector(selectors);
        this.callback = callback;
        this.value = '';
        this.width = this.container.clientWidth;
        this.radius = this.width / 6 * .7;
        this.margin = (this.width - this.radius * 6) / 4;
        this.svg = Svg.createSvgElement();
        this.points = '';
        this.isDirty = false;
        this.init();
    }
    GraphicLock.prototype.init = function () {
        this.svg.style.width = this.svg.style.height = '100%';
        this.container.appendChild(this.svg);
        var pos = [
            this.radius + this.margin,
            this.radius * 3 + this.margin * 2,
            this.radius * 5 + this.margin * 3
        ];
        this.dotsPos = [
            new Dot(pos[0], pos[0], 1),
            new Dot(pos[1], pos[0], 2),
            new Dot(pos[2], pos[0], 3),
            new Dot(pos[0], pos[1], 4),
            new Dot(pos[1], pos[1], 5),
            new Dot(pos[2], pos[1], 6),
            new Dot(pos[0], pos[2], 7),
            new Dot(pos[1], pos[2], 8),
            new Dot(pos[2], pos[2], 9)
        ];
        this.reset();
    };
    GraphicLock.prototype.addTouchStartEventListener = function (dot) {
        var _this = this;
        dot.element.ontouchstart = function (e) {
            e.stopPropagation();
            if (e.touches.length > 1 || _this.isDirty || dot.isActive) {
                return;
            }
            _this.isDirty = true;
            dot.isActive = true;
            dot.element.setAttribute('fill', '#a7ffeb');
            _this.drawDot(dot.x, dot.y, _this.radius / 2.5, '#1de9b6', 'inner-dot');
            console.log(1);
            _this.lastPos = new Vector(dot.x, dot.y);
            _this.currentPos = new Vector(dot.x, dot.y);
            _this.points = dot.x + " " + dot.y + " ";
            _this.polyline = Svg.createElement('polyline', {
                points: _this.points,
                stroke: '#1de9b6',
                style: "fill:none;stroke-width:" + _this.radius / 4
            });
            _this.svg.appendChild(_this.polyline);
            console.log(2);
            _this.value = "" + dot.value;
        };
    };
    GraphicLock.prototype.addTouchMoveEventListener = function () {
        var _this = this;
        this.svg.ontouchmove = function (e) {
            e.preventDefault();
            if (!_this.polyline) {
                return;
            }
            var x = e.changedTouches[0].clientX - _this.container.offsetLeft, y = e.changedTouches[0].clientY - _this.container.offsetTop;
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
    };
    GraphicLock.prototype.addTouchCompleteEventListener = function () {
        var _this = this;
        var complete = function () {
            _this.verify();
            _this.container.style.pointerEvents = 'none';
            _this.polyline && _this.polyline.setAttribute('points', _this.points);
            if (_this.isDirty)
                _this.callback.complete && _this.callback.complete(_this.value);
            setTimeout(function () {
                _this.container.style.pointerEvents = 'auto';
                _this.reset();
            }, 1750);
        };
        this.svg.ontouchend = function () {
            complete();
        };
        this.svg.ontouchcancel = function () {
            complete();
        };
    };
    GraphicLock.prototype.verify = function () {
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
        }
    };
    GraphicLock.prototype.reset = function () {
        this.svg.innerHTML = '';
        this.points = '';
        this.value = '';
        this.isDirty = false;
        this.polyline = null;
        for (var _i = 0, _a = this.dotsPos; _i < _a.length; _i++) {
            var dot = _a[_i];
            if (dot.isActive) {
                dot.isActive = false;
            }
            dot.element = this.drawDot(dot.x, dot.y, this.radius, '#eee', 'dot');
            this.addTouchStartEventListener(dot);
        }
        this.addTouchMoveEventListener();
        this.addTouchCompleteEventListener();
        this.callback.reset && this.callback.reset();
    };
    GraphicLock.prototype.drawDot = function (cx, cy, r, fill, className) {
        var dotElement = Svg.createElement('circle', {
            cx: cx, cy: cy, r: r, fill: fill, class: className
        });
        this.svg.appendChild(dotElement);
        return dotElement;
    };
    return GraphicLock;
}());
