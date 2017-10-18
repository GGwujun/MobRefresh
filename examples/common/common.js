/**
 * 一些通用方法
 */
(function (exports) {
    /**
     * 将string字符串转为html对象,默认创一个div填充
     * 因为很常用，所以单独提取出来了
     * @param {String} strHtml 目标字符串
     * @return {HTMLElement} 返回处理好后的html对象,如果字符串非法,返回null
     */
    exports.parseHtml = function (strHtml) {
        if (typeof strHtml !== 'string') {
            return strHtml;
        }
        // 创一个灵活的div
        let i,
            a = document.createElement('div');
        const b = document.createDocumentFragment();

        a.innerHTML = strHtml;

        while ((i = a.firstChild)) {
            b.appendChild(i);
        }

        return b;
    };

    /**
     * 将对象渲染到模板
     * @param {String} template 对应的目标
     * @param {Object} obj 目标对象
     * @return {String} 渲染后的模板
     */
    exports.renderTemplate = function (template, obj) {
        return template.replace(/[{]{2}([^}]+)[}]{2}/g, ($0, $1) => obj[$1] || '');
    };

    /**
     * 定义一个计数器
     */
    const counterArr = [0];

    /**
     * 添加测试数据
     * @param {String} dom 目标dom
     * @param {Number} count 需要添加的数量
     * @param {Boolean} isReset 是否需要重置，下拉刷新的时候需要
     * @param {Number} index 属于哪一个刷新
     */
    exports.appendTestData = function (dom, count, isReset, index) {
        if (typeof dom === 'string') {
            dom = document.querySelector(dom);
        }
        
        const prevTitle = typeof index !== 'undefined' ? (`Tab${index}`) : '';
        
        const counterIndex = index || 0;
        
        counterArr[counterIndex] = counterArr[counterIndex] || 0;

        if (isReset) {
            dom.innerHTML = '';
            counterArr[counterIndex] = 0;
        }

        const template = `<li class="list-item">
							<img class="pd-img" src="../res/img/pd1.jpg">
							<p class="pd-name">{{title}}</p>
							<p class="pd-price">1149 元</p>
							<p class="pd-sold">已售648件</p>
						</li>`

        let html = '',
            dateStr = (new Date()).toLocaleDateString();

        for (let i = 0; i < count; i++) {
            html += exports.renderTemplate(template, {
                title: `${prevTitle}测试第【${counterArr[counterIndex]}】六罐装荷兰美素佳儿金装2段900g`,
                date: dateStr,
            });
            
            counterArr[counterIndex]++;
        }

        const child = exports.parseHtml(html);

        dom.appendChild(child);
    };

    /**
     * 绑定监听事件 暂时先用click
     * @param {String} dom 单个dom,或者selector
     * @param {Function} callback 回调函数
     * @param {String} eventName 事件名
     */
    exports.bindEvent = function (dom, callback, eventName) {
        eventName = eventName || 'click';
        if (typeof dom === 'string') {
            // 选择
            dom = document.querySelectorAll(dom);
        }
        if (!dom) {
            return;
        }
        if (dom.length > 0) {
            for (let i = 0, len = dom.length; i < len; i++) {
                dom[i].addEventListener(eventName, callback);
            }
        } else {
            dom.addEventListener(eventName, callback);
        }
    };
}(window.Common = {}));