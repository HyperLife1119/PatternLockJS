export class Vector {
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