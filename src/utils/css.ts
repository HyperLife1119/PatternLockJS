export class Css {
    /**
     * 添加CSS样式
     * @param style 样式
     */
    static addStyle(style: string): HTMLStyleElement {
        const element = document.createElement('style');
        element.innerHTML = style;
        document.head.appendChild(element);
        return element;
    }
}