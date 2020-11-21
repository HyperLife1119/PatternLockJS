/**
 * 防抖函数
 * @param fn 需要进行防抖的函数
 * @param delay 防抖时间
 */
export function debounce(fn: Function, delay: number) {
    let timer: number = null;
    return function () {
        timer && clearTimeout(timer);
        timer = window.setTimeout(fn, delay);
    }
}