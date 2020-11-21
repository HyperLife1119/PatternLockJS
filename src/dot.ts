import { Vector } from "./vector";

export class Dot extends Vector {
    /** 圆点的值 */
    value: string;
    /** 是否被选中 */
    isActive: boolean;
    /** 圆点元素 */
    element: SVGCircleElement;

    constructor(x: number, y: number, value: string, isActive: boolean = false) {
        super(x, y);
        this.value = value;
        this.isActive = isActive;
    }
}