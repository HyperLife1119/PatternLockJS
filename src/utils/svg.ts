export class Svg {
    static namespace: string = 'http://www.w3.org/2000/svg';
    static version: string = '1.1';

    /**
     * 创建SVG系列元素
     * @param name 元素名称
     * @param attrObj 属性对象
     */
    static createElement(name: string, attrObj: { [key: string]: string | number }): Element {
        const element = document.createElementNS(Svg.namespace, name);
        for (const key in attrObj) {
            element.setAttribute(key, attrObj[key] + '');
        }
        return element;
    }

    /**
     * 创建SVG元素
     */
    static createSvgElement(): SVGElement {
        return Svg.createElement('svg', {
            xmlns: Svg.namespace,
            version: Svg.version
        }) as SVGElement;
    }
}