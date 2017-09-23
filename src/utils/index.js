/** 
 * 构建 MiniRefresh
 * MiniRefreshTools 是内部使用的
 * 外部主题会用 MiniRefresh变量
 */


const utils = {};

utils.noop = () => { };

utils.isFunction = obj => Object.prototype.toString.call(obj) === '[object Function]';

utils.isObject = obj => Object.prototype.toString.call(obj) === '[object Object]';

utils.isArray = Array.isArray ||
    function (array) {
        return Object.prototype.toString.call(array) === '[object Array]';
    };

/**
 * 参数拓展
 * @param {type} deep 是否深复制
 * @param {type} target 需要拓展的目标对象
 * @param {type} source 其它需要拓展的源，会覆盖目标对象上的相同属性
 * @return {Object} 拓展后的对象
 */
utils.extend = function () {
    const args = [].slice.call(arguments);

    // 目标
    let target = args[0] || {},
        // 默认source从1开始
        index = 1,
        len = args.length,
        // 默认非深复制
        deep = false;

    if (typeof target === 'boolean') {
        // 如果开启了深复制
        deep = target;
        target = args[index] || {};
        index++;
    }

    if (!utils.isObject(target)) {
        // 确保拓展的一定是object
        target = {};
    }

    for (; index < len; index++) {
        // source的拓展
        const source = args[index];

        if (source && utils.isObject(source)) {
            for (const name in source) {
                if (!Object.prototype.hasOwnProperty.call(source, name)) {
                    // 防止原型上的数据
                    continue;
                }

                const src = target[name];
                const copy = source[name];
                var clone,
                    copyIsArray;

                if (target === copy) {
                    // 防止环形引用
                    continue;
                }

                if (deep && copy && (utils.isObject(copy) || (copyIsArray = utils.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && utils.isArray(src) ? src : [];
                    } else {
                        clone = src && utils.isObject(src) ? src : {};
                    }

                    target[name] = utils.extend(deep, clone, copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;
};

/**
 * 选择这段代码用到的太多了，因此抽取封装出来
 * @param {Object} element dom元素或者selector
 * @return {HTMLElement} 返回选择的Dom对象，无果没有符合要求的，则返回null
 */
utils.selector = function (element) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    return element;
};

/**
 * 获取DOM的可视区高度，兼容PC上的body高度获取
 * 因为在通过body获取时，在PC上会有CSS1Compat形式，所以需要兼容
 * @param {HTMLElement} dom 需要获取可视区高度的dom,对body对象有特殊的兼容方案
 * @return {Number} 返回最终的高度
 */
utils.getClientHeightByDom = function (dom) {
    let height = dom.clientHeight;
    if (dom === document.body && document.compatMode === 'CSS1Compat') {
        // PC上body的可视区的特殊处理
        height = document.documentElement.clientHeight;
    }
    return height;
};

/**
 * 设置一个Util对象下的命名空间
 * @param {String} namespace 命名空间
 * @param {Object} obj 需要赋值的目标对象
 * @return {Object} 返回最终的对象
 */
utils.namespace = function (namespace, obj) {
    let parent = utils;

    if (!namespace) {
        return parent;
    }

    let namespaceArr = namespace.split('.'),
        len = namespaceArr.length;

    for (let i = 0; i < len - 1; i++) {
        const tmp = namespaceArr[i];

        // 不存在的话要重新创建对象
        parent[tmp] = parent[tmp] || {};
        // parent要向下一级
        parent = parent[tmp];
    }
    parent[namespaceArr[len - 1]] = obj;

    return parent[namespaceArr[len - 1]];
};

export default utils;