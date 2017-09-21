(function webpackUniversalModuleDefinition(root, factory) {
   //CommonJS2 Comment
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
   //AMD Comment
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/** 
 * 构建 MiniRefresh
 * MiniRefreshTools 是内部使用的
 * 外部主题会用 MiniRefresh变量
 */



const  utils = {};

/**
 * 模拟Class的基类,以便模拟Class进行继承等
 */
(function () {
    // 同时声明多个变量,用,分开要好那么一点点
    var initializing = false,
        // 通过正则检查是否是函数
        fnTest = /xyz/.test(function () {
            'xyz';
        }) ? /\b_super\b/ : /.*/;
    var Clazz = function () { };

    // 很灵活的一种写法,直接重写Class的extend,模拟继承
    Clazz.extend = function (prop) {
        var _super = this.prototype;

        initializing = true;
        // 可以这样理解:这个prototype将this中的方法和属性全部都复制了一遍
        var prototype = new this();

        initializing = false;
        for (var name in prop) {
            if (!Object.prototype.hasOwnProperty.call(prop, name)) {
                // 跳过原型上的
                continue;
            }

            /**
             * 这一些列操作逻辑并不简单，得清楚运算符优先级
             * 逻辑与的优先级是高于三元条件运算符的,得注意下
             * 只有继承的函数存在_super时才会触发(哪怕注释也一样进入)
             * 所以梳理后其实一系列的操作就是判断是否父对象也有相同对象
             * 如果有,则对应函数存在_super这个东西
             */
            prototype[name] = typeof prop[name] === 'function' &&
                typeof _super[name] === 'function' && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this._super;

                        this._super = _super[name];

                        var ret = fn.apply(this, arguments);

                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        /**
         * Clss的构造,默认会执行init方法
         */
        function Clazz() {
            if (!initializing && this.init) {
                this.init.apply(this, arguments);
            }
        }
        Clazz.prototype = prototype;
        Clazz.prototype.constructor = Clazz;
        // 只会继承 extend静态属性，其它属性不会继承
        Clazz.extend = this.extend;

        return Clazz;
    };
    utils.Clazz = Clazz;
})();

utils.noop = function () { };

utils.isFunction = function (obj) {
    return typeof obj === 'function';
};

utils.isObject = function (obj) {
    return typeof obj === 'object';
};

utils.isArray = Array.isArray ||
    function (object) {
        return object instanceof Array;
    };

/**
 * 参数拓展
 * @param {type} deep 是否深复制
 * @param {type} target 需要拓展的目标对象
 * @param {type} source 其它需要拓展的源，会覆盖目标对象上的相同属性
 * @return {Object} 拓展后的对象
 */
utils.extend = function () {
    var args = [].slice.call(arguments);

    // 目标
    var target = args[0] || {},
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
        var source = args[index];

        if (source && utils.isObject(source)) {
            for (var name in source) {
                if (!Object.prototype.hasOwnProperty.call(source, name)) {
                    // 防止原型上的数据
                    continue;
                }

                var src = target[name];
                var copy = source[name];
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
    var height = dom.clientHeight;

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
    var parent = utils;

    if (!namespace) {
        return parent;
    }

    var namespaceArr = namespace.split('.'),
        len = namespaceArr.length;

    for (var i = 0; i < len - 1; i++) {
        var tmp = namespaceArr[i];

        // 不存在的话要重新创建对象
        parent[tmp] = parent[tmp] || {};
        // parent要向下一级
        parent = parent[tmp];

    }
    parent[namespaceArr[len - 1]] = obj;

    return parent[namespaceArr[len - 1]];
};

/* harmony default export */ __webpack_exports__["a"] = (utils);

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pagerefresh", function() { return pagerefresh; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__theme__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__theme_jianshu__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__theme_taobao__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__theme_applet__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__theme_drawer3d__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__theme_drawerslider__ = __webpack_require__(14);







const themeMap = {
    defaults: __WEBPACK_IMPORTED_MODULE_0__theme__["a" /* default */],
    jianshu: __WEBPACK_IMPORTED_MODULE_1__theme_jianshu__["a" /* default */],
    taobao: __WEBPACK_IMPORTED_MODULE_2__theme_taobao__["a" /* default */],
    applet: __WEBPACK_IMPORTED_MODULE_3__theme_applet__["a" /* default */],
    drawer3d: __WEBPACK_IMPORTED_MODULE_4__theme_drawer3d__["a" /* default */],
    drawerslider: __WEBPACK_IMPORTED_MODULE_5__theme_drawerslider__["a" /* default */]
}
const pagerefresh = function (position) {
    return new themeMap[position.theme](position)
}


/* harmony default export */ __webpack_exports__["default"] = (pagerefresh);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__css_minirefresh_css__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__css_minirefresh_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__css_minirefresh_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__core__ = __webpack_require__(4);
/**
 * minirefresh的默认主题
 * 默认主题会打包到核心代码中
 * 主题类继承自基类，所以可以调用基类的属性（但是不建议滥用）
 * 拓展其它主题有两种方案：
 * 1. 直接继承自default，会默认拥有default的属性，只需要覆盖自定义功能即可（注意必须覆盖，否则会调用dwfault的默认操作）
 * 2. 和default一样，继承自 utils.core，这样会与default无关，所以的一切UI都必须自己实现（可以参考default去实现）
 * 
 * 一般，在进行一些小修改时，建议继承自default（这样toTop，上拉加载大部分代码都可复用）
 * 在进行大修改时，建议继承自utils.core，这样可以干干净净的重写主题
 */





/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * THEME 字段会根据不同的主题有不同值
 * 在使用body的scroll时，需要加上样式 CLASS_BODY_SCROLL_WRAP
 */
var CLASS_THEME = 'minirefresh-theme-default';
var CLASS_DOWN_WRAP = 'minirefresh-downwrap';
var CLASS_UP_WRAP = 'minirefresh-upwrap';
var CLASS_FADE_IN = 'minirefresh-fade-in';
var CLASS_FADE_OUT = 'minirefresh-fade-out';
var CLASS_TO_TOP = 'minirefresh-totop';
var CLASS_ROTATE = 'minirefresh-rotate';
var CLASS_HARDWARE_SPEEDUP = 'minirefresh-hardware-speedup';
var CLASS_HIDDEN = 'minirefresh-hidden';
var CLASS_BODY_SCROLL_WRAP = 'body-scroll-wrap';

/**
 * 本主题的特色样式
 */
var CLASS_DOWN_SUCCESS = 'downwrap-success';
var CLASS_DOWN_ERROR = 'downwrap-error';

/**
 * 一些常量
 */
var DEFAULT_DOWN_HEIGHT = 75;

var defaultSetting = {
    down: {
        successAnim: {
            // 下拉刷新结束后是否有成功动画，默认为false，如果想要有成功刷新xxx条数据这种操作，请设为true，并实现对应hook函数
            isEnable: false,
            duration: 300
        },
        // 可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
        contentdown: '下拉刷新',
        // 可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
        contentover: '释放刷新',
        // 可选，正在刷新状态时，下拉刷新控件上显示的标题内容
        contentrefresh: '加载中...',
        // 可选，刷新成功的提示，当开启successAnim时才有效
        contentsuccess: '刷新成功',
        // 可选，刷新失败的提示，错误回调用到，当开启successAnim时才有效
        contenterror: '刷新失败',
        // 是否默认跟随进行css动画
        isWrapCssTranslate: false
    },
    up: {
        toTop: {
            // 是否开启点击回到顶部
            isEnable: true,
            duration: 300,
            // 滚动多少距离才显示toTop
            offset: 800
        },
        contentdown: '上拉显示更多',
        contentrefresh: '加载中...',
        contentnomore: '没有更多数据了'
    }
};

var defaults = __WEBPACK_IMPORTED_MODULE_2__core__["a" /* default */].extend({
    init: function (options) {
        // 拓展自定义的配置
        options = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].extend(true, {}, defaultSetting, options);
        this._super(options);
    },
    _initHook: function (isLockDown, isLockUp) {
        var container = this.container,
            contentWrap = this.contentWrap;

        container.classList.add(CLASS_THEME);
        // 加上硬件加速让动画更流畅
        contentWrap.classList.add(CLASS_HARDWARE_SPEEDUP);

        if (this.options.isUseBodyScroll) {
            // 如果使用了body的scroll，需要增加对应的样式，否则默认的absolute无法被监听到
            container.classList.add(CLASS_BODY_SCROLL_WRAP);
            contentWrap.classList.add(CLASS_BODY_SCROLL_WRAP);
        }

        this._initDownWrap();
        this._initUpWrap();
        //this._initToTop();
    },

    /**
     * 刷新的实现，需要根据新配置进行一些更改
     */
    _refreshHook: function () {
        // 如果开关csstranslate，需要兼容
        if (this.options.down.isWrapCssTranslate) {
            this._transformDownWrap(-this.downWrapHeight);
        } else {
            this._transformDownWrap(0, 0, true);
        }

        // toTop的显影控制，如果本身显示了，又更新为隐藏，需要马上隐藏
        if (!this.options.up.toTop.isEnable) {
            this.toTopBtn && this.toTopBtn.classList.add(CLASS_HIDDEN);
            this.isShowToTopBtn = false;
        }
    },
    _initDownWrap: function () {
        var container = this.container,
            contentWrap = this.contentWrap,
            options = this.options;

        // 下拉的区域
        var downWrap = document.createElement('div');

        downWrap.className = CLASS_DOWN_WRAP + ' ' + CLASS_HARDWARE_SPEEDUP;
        downWrap.innerHTML = '<div class="downwrap-content"><p class="downwrap-progress"></p><p class="downwrap-tips">' + options.down.contentdown + ' </p></div>';
        container.insertBefore(downWrap, contentWrap);

        this.downWrap = downWrap;
        this.downWrapProgress = this.downWrap.querySelector('.downwrap-progress');
        this.downWrapTips = this.downWrap.querySelector('.downwrap-tips');
        // 是否能下拉的变量，控制pull时的状态转变
        this.isCanPullDown = false;

        this.downWrapHeight = downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT;
        this._transformDownWrap(-this.downWrapHeight);
    },
    _transformDownWrap: function (offset, duration, isForce) {
        if (!isForce && !this.options.down.isWrapCssTranslate) {
            return;
        }
        offset = offset || 0;
        duration = duration || 0;
        // 记得动画时 translateZ 否则硬件加速会被覆盖
        this.downWrap.style.webkitTransitionDuration = duration + 'ms';
        this.downWrap.style.transitionDuration = duration + 'ms';
        this.downWrap.style.webkitTransform = 'translateY(' + offset + 'px)  translateZ(0px)';
        this.downWrap.style.transform = 'translateY(' + offset + 'px)  translateZ(0px)';
    },

    _initUpWrap: function () {
        var contentWrap = this.contentWrap,
            options = this.options;

        // 上拉区域
        var upWrap = document.createElement('div');

        upWrap.className = CLASS_UP_WRAP + ' ' + CLASS_HARDWARE_SPEEDUP;
        upWrap.innerHTML = '<p class="upwrap-progress"></p><p class="upwrap-tips">' + options.up.contentdown + '</p>';
        upWrap.style.visibility = 'hidden';
        contentWrap.appendChild(upWrap);

        this.upWrap = upWrap;
        this.upWrapProgress = this.upWrap.querySelector('.upwrap-progress');
        this.upWrapTips = this.upWrap.querySelector('.upwrap-tips');
    },

    /**
     * 自定义实现一个toTop，由于这个是属于额外的事件所以没有添加的核心中，而是由各自的主题决定是否实现或者实现成什么样子
     * 不过框架中仍然提供了一个默认的minirefresh-totop样式，可以方便使用
     */
    _initToTop: function () {
        var self = this,
            options = this.options,
            toTop = options.up.toTop.isEnable,
            duration = options.up.toTop.duration;

        if (toTop) {
            var toTopBtn = document.createElement('div');

            toTopBtn.className = CLASS_TO_TOP + ' ' + CLASS_THEME;

            toTopBtn.onclick = function () {
                self.scroller.scrollTo(0, duration);
            };
            toTopBtn.classList.add(CLASS_HIDDEN);
            this.toTopBtn = toTopBtn;
            this.isShowToTopBtn = false;
            // 默认添加到body中防止冲突
            document.body.appendChild(toTopBtn);
        }
    },
    _pullHook: function (downHight, downOffset) {
        var options = this.options,
            FULL_DEGREE = 360;

        if (downHight < downOffset) {
            if (this.isCanPullDown) {
                this.downWrapTips.innerText = options.down.contentdown;
                this.isCanPullDown = false;
            }
        } else {
            if (!this.isCanPullDown) {
                this.downWrapTips.innerText = options.down.contentover;
                this.isCanPullDown = true;
            }
        }

        var rate = downHight / downOffset,
            progress = FULL_DEGREE * rate;

        this.downWrapProgress.style.webkitTransform = 'rotate(' + progress + 'deg)';
        this.downWrapProgress.style.transform = 'rotate(' + progress + 'deg)';
        this._transformDownWrap(-this.downWrapHeight + downHight);
    },
    _scrollHook: function (scrollTop) {
        // 用来判断toTop
        var options = this.options,
            toTop = options.up.toTop.isEnable,
            toTopBtn = this.toTopBtn;

        if (toTop && toTopBtn) {
            if (scrollTop >= options.up.toTop.offset) {
                if (!this.isShowToTopBtn) {
                    toTopBtn.classList.remove(CLASS_FADE_OUT);
                    toTopBtn.classList.remove(CLASS_HIDDEN);
                    toTopBtn.classList.add(CLASS_FADE_IN);
                    this.isShowToTopBtn = true;
                }
            } else {
                if (this.isShowToTopBtn) {
                    toTopBtn.classList.add(CLASS_FADE_OUT);
                    toTopBtn.classList.remove(CLASS_FADE_IN);
                    this.isShowToTopBtn = false;
                }
            }
        }
    },
    _downLoaingHook: function () {
        // 默认和contentWrap的同步
        this._transformDownWrap(-this.downWrapHeight + this.options.down.offset, this.options.down.bounceTime);
        this.downWrapTips.innerText = this.options.down.contentrefresh;
        this.downWrapProgress.classList.add(CLASS_ROTATE);
    },
    _downLoaingSuccessHook: function (isSuccess, successTips) {
        this.options.down.contentsuccess = successTips || this.options.down.contentsuccess;
        this.downWrapTips.innerText = isSuccess ? this.options.down.contentsuccess : this.options.down.contenterror;
        this.downWrapProgress.classList.remove(CLASS_ROTATE);
        this.downWrapProgress.classList.add(CLASS_FADE_OUT);
        this.downWrapProgress.classList.add(isSuccess ? CLASS_DOWN_SUCCESS : CLASS_DOWN_ERROR);
    },
    _downLoaingEndHook: function (isSuccess) {
        this.downWrapTips.innerText = this.options.down.contentdown;
        this.downWrapProgress.classList.remove(CLASS_ROTATE);
        this.downWrapProgress.classList.remove(CLASS_FADE_OUT);
        this.downWrapProgress.classList.remove(isSuccess ? CLASS_DOWN_SUCCESS : CLASS_DOWN_ERROR);
        // 默认为不可见
        // 需要重置回来
        this.isCanPullDown = false;
        this._transformDownWrap(-this.downWrapHeight, this.options.down.bounceTime);
    },
    _cancelLoaingHook: function () {
        this._transformDownWrap(-this.downWrapHeight, this.options.down.bounceTime);
    },
    _upLoaingHook: function (isShowUpLoading) {
        if (isShowUpLoading) {
            this.upWrapTips.innerText = this.options.up.contentrefresh;
            this.upWrapProgress.classList.add(CLASS_ROTATE);
            this.upWrapProgress.classList.remove(CLASS_HIDDEN);
            this.upWrap.style.visibility = 'visible';
        } else {
            this.upWrap.style.visibility = 'hidden';
        }

    },
    _upLoaingEndHook: function (isFinishUp) {
        if (!isFinishUp) {
            // 接下来还可以加载更多
            this.upWrap.style.visibility = 'hidden';
            this.upWrapTips.innerText = this.options.up.contentdown;
        } else {
            // 已经没有更多数据了
            this.upWrap.style.visibility = 'visible';
            this.upWrapTips.innerText = this.options.up.contentnomore;
        }
        this.upWrapProgress.classList.remove(CLASS_ROTATE);
        this.upWrapProgress.classList.add(CLASS_HIDDEN);
    },
    _lockUpLoadingHook: function (isLock) {
        this.upWrap.style.visibility = isLock ? 'hidden' : 'visible';
    },
    _lockDownLoadingHook: function (isLock) {
        this.downWrap.style.visibility = isLock ? 'hidden' : 'visible';
    }
});

// 挂载主题，这样多个主题可以并存，default是关键字，所以使用了defaults
__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].namespace('theme.defaults', defaults);

/* harmony default export */ __webpack_exports__["a"] = (defaults);



/***/ }),
/* 3 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__scroll__ = __webpack_require__(5);
/**
 * MiniRerefresh 的核心代码，代码中约定对外的API
 * 可以通过继承  MiniRefreshCore， 得到一个主题类，然后在主题类中实现UI hook函数可以达到不同的动画效果
 * 核心类内部没有任何UI实现，所有的UI都依赖于主题类
 * 
 * 以下是主题类可以实现的Hook（为undefined的话相当于忽略）
 * _initHook(isLockDown, isLockUp)              初始化时的回调
 * _refreshHook(isLockDown, isLockUp)           刷新options时的回调
 * _pullHook(downHight, downOffset)             下拉过程中持续回调
 * _scrollHook(scrollTop)                       滚动过程中持续回调
 * _downLoaingHook()                            下拉触发的那一刻回调
 * _downLoaingSuccessHook(isSuccess)            下拉刷新的成功动画，处理成功或失败提示
 * _downLoaingEndHook(isSuccess)                下拉刷新动画结束后的回调
 * _cancelLoaingHook()                          取消loading的回调
 * _upLoaingHook()                              上拉触发的那一刻回调
 * _upLoaingEndHook(isFinishUp)                 上拉加载动画结束后的回调
 * __lockUpLoadingHook(isLock)                   锁定上拉时的回调
 * __lockDownLoadingHook(isLock)                 锁定下拉时的回调
 * 
 * _beforeDownLoadingHook(downHight, downOffset)一个特殊的hook，返回false时代表不会走入下拉刷新loading，完全自定义实现动画，默认为返回true
 */




var defaultSetting = {
    // 下拉有关
    down: {
        // 默认没有锁定，可以通过API动态设置
        isLock: false,
        // 是否自动下拉刷新
        isAuto: false,
        // 设置isAuto=true时生效，是否在初始化的下拉刷新触发事件中显示动画，如果是false，初始化的加载只会触发回调，不会触发动画
        isAllowAutoLoading: true,
        // 是否不管任何情况下都能触发下拉刷新，为false的话当上拉时不会触发下拉
        isAways: false,
        // 是否scroll在下拉时会进行css移动，通过关闭它可以实现自定义动画
        isScrollCssTranslate: true,
        // 下拉要大于多少长度后再下拉刷新
        offset: 75,
        // 阻尼系数，下拉小于offset时的阻尼系数，值越接近0,高度变化越小,表现为越往下越难拉
        dampRateBegin: 1,
        // 阻尼系数，下拉的距离大于offset时,改变下拉区域高度比例;值越接近0,高度变化越小,表现为越往下越难拉
        dampRate: 0.3,
        // 回弹动画时间
        bounceTime: 300,
        successAnim: {
            // 下拉刷新结束后是否有成功动画，默认为false，如果想要有成功刷新xxx条数据这种操作，请设为true，并实现对应hook函数
            isEnable: false,
            duration: 300
        },
        // 下拉时会提供回调，默认为null不会执行
        onPull: null,
        // 取消时回调
        onCalcel: null,
        callback: __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].noop
    },
    // 上拉有关
    up: {
        // 默认没有锁定，可以通过API动态设置
        isLock: false,
        // 是否自动上拉加载-初始化是是否自动
        isAuto: true,
        // 是否默认显示上拉进度条，可以通过API改变
        isShowUpLoading: true,
        // 距离底部高度(到达该高度即触发)
        offset: 100,
        loadFull: {
            // 开启配置后，只要没满屏幕，就会自动加载
            isEnable: true,
            delay: 300
        },
        // 滚动时会提供回调，默认为null不会执行
        onScroll: null,
        callback: __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].noop
    },
    // 容器
    container: '#minirefresh',
    // 是否锁定横向滑动，如果锁定则原生滚动条无法滑动
    isLockX: true,
    // 是否使用body对象的scroll而不是minirefresh-scroll对象的scroll
    // 开启后一个页面只能有一个下拉刷新，否则会有冲突
    isUseBodyScroll: false
};

var core = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].Clazz.extend({

    /**
     * 初始化
     * @param {Object} options 配置信息
     */
    init: function (options) {
        options = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].extend(true, {}, defaultSetting, options);

        this.container = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].selector(options.container);
        // scroll的dom-wrapper下的第一个节点，作用是down动画时的操作
        this.contentWrap = this.container.children[0];
        // 默认和contentWrap一致，但是为了兼容body的滚动，拆分为两个对象方便处理
        // 如果是使用body的情况，scrollWrap恒为body
        this.scrollWrap = options.isUseBodyScroll ? document.body : this.contentWrap;

        this.options = options;

        // 初始化的hook
        this._initHook && this._initHook(this.options.down.isLock, this.options.up.isLock);

        // 生成一个Scroll对象 ，对象内部处理滑动监听
        this.scroller = new __WEBPACK_IMPORTED_MODULE_1__scroll__["a" /* default */](this);

        this._initEvent();

        // 如果初始化时锁定了，需要触发锁定，避免没有锁定时解锁（会触发逻辑bug）
        options.up.isLock && this._lockUpLoading(options.up.isLock);
        options.down.isLock && this._lockDownLoading(options.down.isLock);
    },
    _resetOptions: function () {
        var options = this.options;
        this._lockUpLoading(options.up.isLock);
        this._lockDownLoading(options.down.isLock);
    },
    _initEvent: function () {
        var self = this,
            options = self.options;

        this.scroller.on('downLoading', function (isHideLoading) {
            !isHideLoading && self._downLoaingHook && self._downLoaingHook();
            options.down.callback && options.down.callback();
        });

        this.scroller.on('cancelLoading', function () {
            self._cancelLoaingHook && self._cancelLoaingHook();
            options.down.onCalcel && options.down.onCalcel();
        });

        this.scroller.on('upLoading', function () {
            self._upLoaingHook && self._upLoaingHook(self.options.up.isShowUpLoading);
            options.up.callback && options.up.callback();
        });

        this.scroller.on('pull', function (downHight, downOffset) {
            self._pullHook && self._pullHook(downHight, downOffset);
            options.down.onPull && options.down.onPull(downHight, downOffset);
        });

        this.scroller.on('scroll', function (scrollTop) {
            self._scrollHook && self._scrollHook(scrollTop);
            options.up.onScroll && options.up.onScroll(scrollTop);
        });

        // 检查是否允许普通的加载中，如果返回false，就代表自定义下拉刷新，通常自己处理
        this.scroller.hook('beforeDownLoading', function (downHight, downOffset) {
            return !self._beforeDownLoadingHook || self._beforeDownLoadingHook(downHight, downOffset);
        });
    },

    /**
     * 内部执行，结束下拉刷新
     * @param {Boolean} isSuccess 是否下拉请求成功
     * @param {String} successTips 需要更新的成功提示
     * 在开启了成功动画时，往往成功的提示是需要由外传入动态更新的，譬如  update 10 news
     */
    _endDownLoading: function (isSuccess, successTips) {
        var self = this;

        if (!this.options.down) {
            // 防止没传down导致错误
            return;
        }

        if (this.scroller.downLoading) {
            // 必须是loading时才允许执行对应hook
            var successAnim = this.options.down.successAnim.isEnable,
                successAnimTime = this.options.down.successAnim.duration;

            if (successAnim) {
                // 如果有成功动画    
                this._downLoaingSuccessHook && this._downLoaingSuccessHook(isSuccess, successTips);
            } else {
                // 默认为没有成功动画
                successAnimTime = 0;
            }

            setTimeout(function () {
                // 成功动画结束后就可以重置位置了
                self.scroller.endDownLoading();
                // 触发结束hook
                self._downLoaingEndHook && self._downLoaingEndHook(isSuccess);

            }, successAnimTime);
        }
    },

    /**
     * 内部执行，结束上拉加载
     * @param {Boolean} isFinishUp 是否结束了上拉加载
     */
    _endUpLoading: function (isFinishUp) {
        if (this.scroller.upLoading) {
            this.scroller.endUpLoading(isFinishUp);
            this._upLoaingEndHook && this._upLoaingEndHook(isFinishUp);
        }
    },

    /**
     * 重新刷新上拉加载，刷新后会变为可以上拉加载
     */
    _resetUpLoading: function () {
        this.scroller.resetUpLoading();
    },

    /**
     * 锁定上拉加载
     * 将开启和禁止合并成一个锁定API
     * @param {Boolean} isLock 是否锁定
     */
    _lockUpLoading: function (isLock) {
        this.scroller.lockUp(isLock);
        this._lockUpLoadingHook && this._lockUpLoadingHook(isLock);
    },

    /**
     * 锁定下拉刷新
     * @param {Boolean} isLock 是否锁定
     */
    _lockDownLoading: function (isLock) {
        this.scroller.lockDown(isLock);
        this._lockDownLoadingHook && this._lockDownLoadingHook(isLock);
    },

    /**
     * 刷新minirefresh的配置，关键性的配置请不要更新，如容器，回调等
     * @param {Object} options 新的配置，会覆盖原有的
     */
    refreshOptions: function (options) {
        this.options = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].extend(true, {}, this.options, options);
        this.scroller.refreshOptions(this.options);
        this._resetOptions(options);
        this._refreshHook && this._refreshHook();
    },

    /**
     * 结束下拉刷新
     * @param {Boolean} isSuccess 是否请求成功，这个状态会中转给对应主题
     * @param {String} successTips 需要更新的成功提示
     * 在开启了成功动画时，往往成功的提示是需要由外传入动态更新的，譬如  update 10 news
     */
    endDownLoading: function (isSuccess, successTips) {
        typeof isSuccess !== 'boolean' && (isSuccess = true);
        this._endDownLoading(isSuccess, successTips);
        // 同时恢复上拉加载的状态，注意，此时没有传isShowUpLoading，所以这个值不会生效
        this._resetUpLoading();
    },

    /**
     * 重置上拉加载状态,如果是没有更多数据后重置，会变为可以继续上拉加载
     */
    resetUpLoading: function () {
        this._resetUpLoading();
    },

    /**
     * 结束上拉加载
     * @param {Boolean} isFinishUp 是否结束上拉加载，如果结束，就相当于变为了没有更多数据，无法再出发上拉加载了
     * 结束后必须reset才能重新开启
     */
    endUpLoading: function (isFinishUp) {
        this._endUpLoading(isFinishUp);
    },

    /**
     * 触发上拉加载
     */
    triggerUpLoading: function () {
        this.scroller.triggerUpLoading();
    },

    /**
     * 触发下拉刷新
     */
    triggerDownLoading: function () {
        this.scroller.scrollTo(0);
        this.scroller.triggerDownLoading();
    },

    /**
     * 滚动到指定的y位置
     * @param {Number} y 需要滑动到的top值
     * @param {Number} duration 单位毫秒
     */
    scrollTo: function (y, duration) {
        this.scroller.scrollTo(y, duration);
    }
});

/* harmony default export */ __webpack_exports__["a"] = (core);


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);
/**
 * MiniRerefresh 处理滑动监听的关键代码，都是逻辑操作，没有UI实现
 * 依赖于一个 MiniRefresh对象
 */


/**
 * 每秒多少帧
 */
var SECOND_MILLIONS = 1000,
    NUMBER_FRAMES = 60,
    PER_SECOND = SECOND_MILLIONS / NUMBER_FRAMES;

/**
 * 定义一些常量
 */
var EVENT_SCROLL = 'scroll',
    EVENT_PULL = 'pull',
    EVENT_UP_LOADING = 'upLoading',
    EVENT_DOWN_LOADING = 'downLoading',
    EVENT_CANCEL_LOADING = 'cancelLoading',
    HOOK_BEFORE_DOWN_LOADING = 'beforeDownLoading';

var rAF = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    // 默认每秒60帧
    function (callback) {
        window.setTimeout(callback, PER_SECOND);
    };

var Scroll = function (minirefresh) {
    this.minirefresh = minirefresh;
    this.container = minirefresh.container;
    this.contentWrap = minirefresh.contentWrap;
    this.scrollWrap = minirefresh.scrollWrap;
    this.options = minirefresh.options;
    // 默认没有事件，需要主动绑定
    this.events = {};
    // 默认没有hook
    this.hooks = {};

    // 锁定上拉和下拉,core内如果想改变，需要通过API调用设置
    this.isLockDown = false;
    this.isLockUp = false;

    // 是否使用了scrollto功能，使用这个功能时会禁止操作
    this.isScrollTo = false;
    // 上拉和下拉的状态
    this.upLoading = false;
    this.downLoading = false;

    // 默认up是没有finish的
    this.isFinishUp = false;

    this._initPullDown();
    this._initPullUp();

    var self = this;

    // 在初始化完毕后，下一个循环的开始再执行
    setTimeout(function () {
        if (self.options.down && self.options.down.isAuto && !self.isLockDown) {
            // 如果设置了auto，则自动下拉一次
            // 需要判断是否需要动画
            if (self.options.down.isAllowAutoLoading) {
                self.triggerDownLoading();
            } else {
                self.events[EVENT_DOWN_LOADING] && self.events[EVENT_DOWN_LOADING](true);
            }
        } else if (self.options.up && self.options.up.isAuto && !self.isLockUp) {
            // 如果设置了auto，则自动上拉一次
            self.triggerUpLoading();
        }
    });
};

Scroll.prototype.refreshOptions = function (options) {
    this.options = options;
};

/**
 * 对外暴露的，移动wrap的同时一起修改downHeight
 * @param {Number} y 移动的高度
 * @param {Number} duration 过渡时间
 */
Scroll.prototype.translateContentWrap = function (y, duration) {
    this._translate(y, duration);
    this.downHight = y;
};

/**
 * wrap的translate动画，用于下拉刷新时进行transform动画
 * @param {Number} y 移动的高度
 * @param {Number} duration 过渡时间
 */
Scroll.prototype._translate = function (y, duration) {
    if (!this.options.down.isScrollCssTranslate) {
        // 只有允许动画时才会scroll也translate,否则只会改变downHeight
        return;
    }
    y = y || 0;
    duration = duration || 0;

    var wrap = this.contentWrap;

    wrap.style.webkitTransitionDuration = duration + 'ms';
    wrap.style.transitionDuration = duration + 'ms';
    wrap.style.webkitTransform = 'translate(0px, ' + y + 'px) translateZ(0px)';
    wrap.style.transform = 'translate(0px, ' + y + 'px) translateZ(0px)';
};

Scroll.prototype._initPullDown = function () {
    var self = this,
        // 考虑到options可以更新，所以缓存时请注意一定能最新
        scrollWrap = this.scrollWrap;

    scrollWrap.webkitTransitionTimingFunction = 'cubic-bezier(0.1, 0.57, 0.1, 1)';
    scrollWrap.transitionTimingFunction = 'cubic-bezier(0.1, 0.57, 0.1, 1)';

    var touchstartEvent = function (e) {
        if (self.isScrollTo) {
            // 如果执行滑动事件,则阻止touch事件,优先执行scrollTo方法
            e.preventDefault();
        }
        // 记录startTop, 并且只有startTop存在值时才允许move
        self.startTop = scrollWrap.scrollTop;

        // startY用来计算距离
        self.startY = e.touches ? e.touches[0].pageY : e.clientY;
        // X的作用是用来计算方向，如果是横向，则不进行动画处理，避免误操作
        self.startX = e.touches ? e.touches[0].pageX : e.clientX;
    };

    // 兼容手指滑动与鼠标
    scrollWrap.addEventListener('touchstart', touchstartEvent);
    scrollWrap.addEventListener('mousedown', touchstartEvent);

    var touchmoveEvent = function (e) {
        var options = self.options,
            isAllowDownloading = true;

        if (self.downLoading) {
            isAllowDownloading = false;
        } else if (!options.down.isAways && self.upLoading) {
            isAllowDownloading = false;
        }

        if (self.startTop !== undefined && self.startTop <= 0 &&
            (isAllowDownloading) && !self.isLockDown) {
            // 列表在顶部且不在加载中，并且没有锁住下拉动画

            // 当前第一个手指距离列表顶部的距离
            var curY = e.touches ? e.touches[0].pageY : e.clientY;
            var curX = e.touches ? e.touches[0].pageX : e.clientX;

            if (!self.preY) {
                // 设置上次移动的距离，作用是用来计算滑动方向
                self.preY = curY;
            }

            // 和上次比,移动的距离 (大于0向下,小于0向上)
            var diff = curY - self.preY;

            self.preY = curY;

            // 和起点比,移动的距离,大于0向下拉
            var moveY = curY - self.startY;
            var moveX = curX - self.startX;

            // 如果锁定横向滑动并且横向滑动更多，阻止默认事件
            if (options.isLockX && Math.abs(moveX) > Math.abs(moveY)) {
                e.preventDefault();

                return;
            }

            if (moveY > 0) {
                // 向下拉
                self.isMoveDown = true;

                // 阻止浏览器的默认滚动事件，因为这时候只需要执行动画即可
                e.preventDefault();

                if (!self.downHight) {
                    // 下拉区域的高度，用translate动画
                    self.downHight = 0;
                }

                var downOffset = options.down.offset,
                    dampRate = 1;

                if (self.downHight < downOffset) {
                    // 下拉距离  < 指定距离
                    dampRate = options.down.dampRateBegin;
                } else {
                    // 超出了指定距离，随时可以刷新
                    dampRate = options.down.dampRate;
                }

                if (diff > 0) {
                    // 需要加上阻尼系数
                    self.downHight += diff * dampRate;
                } else {
                    // 向上收回高度,则向上滑多少收多少高度
                    self.downHight += diff;
                }

                self.events[EVENT_PULL] && self.events[EVENT_PULL](self.downHight, downOffset);
                // 执行动画
                self._translate(self.downHight);
            } else {
                // 解决嵌套问题。在嵌套有 IScroll，或类似的组件时，这段代码会生效，可以辅助滚动scrolltop
                // 否则有可能在最开始滚不动
                if (scrollWrap.scrollTop <= 0) {
                    scrollWrap.scrollTop += Math.abs(diff);
                }
            }
        }

    };

    scrollWrap.addEventListener('touchmove', touchmoveEvent);
    scrollWrap.addEventListener('mousemove', touchmoveEvent);

    var touchendEvent = function (e) {
        var options = self.options;

        // 需要重置状态
        if (self.isMoveDown) {
            // 如果下拉区域已经执行动画,则需重置回来
            if (self.downHight >= options.down.offset) {
                // 符合触发刷新的条件
                self.triggerDownLoading();
            } else {
                // 否则默认重置位置
                self._translate(0, options.down.bounceTime);
                self.downHight = 0;
                self.events[EVENT_CANCEL_LOADING] && self.events[EVENT_CANCEL_LOADING]();
            }

            self.isMoveDown = false;
        }

        self.startY = 0;
        self.startX = 0;
        self.preY = 0;
        self.startTop = undefined;
    };

    scrollWrap.addEventListener('touchend', touchendEvent);
    scrollWrap.addEventListener('mouseup', touchendEvent);
    scrollWrap.addEventListener('mouseleave', touchendEvent);

};

Scroll.prototype._initPullUp = function () {
    var self = this,
        scrollWrap = this.scrollWrap;

    // 如果是Body上的滑动，需要监听window的scroll
    var targetScrollDom = scrollWrap === document.body ? window : scrollWrap;

    targetScrollDom.addEventListener('scroll', function () {
        var scrollTop = scrollWrap.scrollTop,
            scrollHeight = scrollWrap.scrollHeight,
            clientHeight = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].getClientHeightByDom(scrollWrap),
            options = self.options;

        self.events[EVENT_SCROLL] && self.events[EVENT_SCROLL](scrollTop);

        if (!self.upLoading) {
            if (!self.isLockUp && !self.isFinishUp) {
                var toBottom = scrollHeight - clientHeight - scrollTop;

                if (toBottom <= options.up.offset) {
                    // 满足上拉加载
                    self.triggerUpLoading();
                }
            }
        }
    });
};

Scroll.prototype._loadFull = function () {
    var self = this,
        scrollWrap = this.scrollWrap,
        options = this.options;

    setTimeout(function () {
        // 在下一个循环中运行
        if (!self.isLockUp && options.up.loadFull.isEnable && scrollWrap.scrollHeight <= __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].getClientHeightByDom(scrollWrap)) {
            self.triggerUpLoading();
        }
    }, options.up.loadFull.delay || 0);
};

Scroll.prototype.triggerDownLoading = function () {
    var self = this,
        options = this.options,
        bounceTime = options.down.bounceTime;

    if (!this.hooks[HOOK_BEFORE_DOWN_LOADING] || this.hooks[HOOK_BEFORE_DOWN_LOADING](self.downHight, options.down.offset)) {
        // 没有hook或者hook返回true都通过，主要是为了方便类似于秘密花园等的自定义下拉刷新动画实现
        self.downLoading = true;
        self.downHight = options.down.offset;
        self._translate(self.downHight, bounceTime);

        self.events[EVENT_DOWN_LOADING] && self.events[EVENT_DOWN_LOADING]();
    }
};

/**
 * 结束下拉刷新动画
 * @param {Number} duration 回弹时间
 */
Scroll.prototype.endDownLoading = function () {
    var self = this,
        options = this.options,
        bounceTime = options.down.bounceTime;

    if (this.downLoading) {

        // 必须是loading时才允许结束
        self._translate(0, bounceTime);
        self.downHight = 0;
        self.downLoading = false;
    }
};

Scroll.prototype.triggerUpLoading = function () {
    this.upLoading = true;
    this.events[EVENT_UP_LOADING] && this.events[EVENT_UP_LOADING]();
};

/**
 * 结束上拉加载动画
 * @param {Boolean} isFinishUp 是否结束上拉加载
 */
Scroll.prototype.endUpLoading = function (isFinishUp) {
    if (this.upLoading) {

        this.upLoading = false;

        if (isFinishUp) {
            this.isFinishUp = true;
        } else {
            this._loadFull();
        }
    }
};

/**
 * 滚动到指定的y位置
 * @param {Number} y top坐标
 * @param {Number} duration 单位毫秒
 */
Scroll.prototype.scrollTo = function (y, duration) {
    var self = this,
        scrollWrap = this.scrollWrap;

    y = y || 0;
    duration = duration || 0;

    // 最大可滚动的y
    var maxY = scrollWrap.scrollHeight - __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].getClientHeightByDom(scrollWrap);

    y = Math.max(y, 0);
    y = Math.min(y, maxY);

    // 差值 (可能为负)
    var diff = scrollWrap.scrollTop - y;

    if (diff === 0) {
        return;
    }
    if (duration === 0) {
        scrollWrap.scrollTop = y;

        return;
    }

    // 每秒60帧，计算一共多少帧，然后每帧的步长
    var count = duration / PER_SECOND;
    var step = diff / (count),
        i = 0;

    // 锁定状态
    self.isScrollTo = true;

    var execute = function () {
        if (i < count) {
            if (i === count - 1) {
                // 最后一次直接设置y,避免计算误差
                scrollWrap.scrollTop = y;
            } else {
                scrollWrap.scrollTop -= step;
            }
            i++;
            rAF(execute);
        } else {
            self.isScrollTo = false;
        }
    };

    rAF(execute);
};

/**
 * 只有 down存在时才允许解锁
 * @param {Boolean} isLock 是否锁定
 */
Scroll.prototype.lockDown = function (isLock) {
    this.options.down && (this.isLockDown = isLock);
};

/**
 * 只有 up存在时才允许解锁
 * @param {Boolean} isLock 是否锁定
 */
Scroll.prototype.lockUp = function (isLock) {
    this.options.up && (this.isLockUp = isLock);
};

Scroll.prototype.resetUpLoading = function () {
    if (this.isFinishUp) {
        this.isFinishUp = false;
    }

    // 触发一次HTML的scroll事件，以便检查当前位置是否需要加载更多
    // 需要兼容webkit和firefox
    var evt = document.createEvent('HTMLEvents');

    // 这个事件没有必要冒泡，firefox内参数必须完整
    evt.initEvent('scroll', false, true);
    this.scrollWrap.dispatchEvent(evt);
};

/**
 * 监听事件，包括下拉过程，下拉刷新，上拉加载，滑动等事件都可以监听到
 * @param {String} event 事件名，可选名称
 * scroll 容器滑动的持续回调，可以监听滑动位置
 * pull 下拉滑动过程的回调，持续回调
 * upLoading 上拉加载那一刻触发
 * downLoading 下拉刷新那一刻触发
 * @param {Function} callback 回调函数
 */
Scroll.prototype.on = function (event, callback) {
    if (!event || !__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].isFunction(callback)) {
        return;
    }
    this.events[event] = callback;
};

/**
 * 注册钩子函数，主要是一些自定义刷新动画时用到，如进入秘密花园
 * @param {String} hook 名称，范围如下
 * beforeDownLoading 是否准备downLoading，如果返回false，则不会loading，完全进入自定义动画
 * @param {Function} callback 回调函数
 */
Scroll.prototype.hook = function (hook, callback) {
    if (!hook || !__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].isFunction(callback)) {
        return;
    }
    this.hooks[hook] = callback;
};

/* harmony default export */ __webpack_exports__["a"] = (Scroll);


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_css__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__index_css__);
/**
 * 滑动抽屉效果
 * 复用了default的代码
 * 下拉动画时完全自定义重写，不移动scroll，而是直接css动画
 */




/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * theme字段会根据不同的主题有不同值
 */
var CLASS_THEME = 'minirefresh-theme-jianshu';

/**
 * 一些常量
 * 默认高度是200
 * 其中背景默认是黑色，内容是白色，再增设阻尼系数可以较好的达到3D效果
 */
var DEFAULT_DOWN_HEIGHT = 200,
    DOWN_SHADOW_HEIGHT = 2;

var defaultSetting = {
    down: {
        offset: 100,
        // 阻尼系数，下拉的距离大于offset时,改变下拉区域高度比例;值越接近0,高度变化越小,表现为越往下越难拉
        dampRate: 0.2,
        bounceTime: 500,
        successAnim: {
            // successAnim
            isEnable: false
        },
        // 继承了default的downWrap部分代码，需要这个变量
        isWrapCssTranslate: true,
        // 是否scroll在下拉时会进行css移动，本主题关闭它，完全自定义
        // 这种方案记得修改动画区域的index
        isScrollCssTranslate: false
    }
};

var jianshu = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].theme.defaults.extend({

    /**
     * 拓展自定义的配置
     * @param {Object} options 配置参数
     */
    init: function (options) {
        options = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].extend(true, {}, defaultSetting, options);
        this._super(options);
    },

    /**
     * 重写下拉刷新初始化，变为小程序自己的动画
     */
    _initDownWrap: function () {
        // 先复用default代码，然后重写
        this._super();

        var container = this.container,
            options = this.options,
            downWrap = this.downWrap;

        // 改写内容区域
        downWrap.innerHTML = `<div class="drawer">
            <div class="downwrap-content">
            <p class="downwrap-progress"></p></div>
            <div class="drawer-mask"></div ></div>`;

        // 由于直接继承的default，所以其实已经有default主题了，这里再加上本主题样式
        container.classList.add(CLASS_THEME);

        // 改写完后，对象需要重新查找，需要给default用
        this.downWrapProgress = downWrap.querySelector('.downwrap-progress');
        this.drawer = downWrap.querySelector('.drawer');
        this.drawerMask = downWrap.querySelector('.drawer-mask');

        // 留一个默认值，以免样式被覆盖，无法获取
        // +2是去除阴影的位置
        this.downWrapHeight = DOWN_SHADOW_HEIGHT + downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT;
        // 由于downWrap被改变了，重新移动
        this._transformDownWrap(-this.downWrapHeight);
    },
    _transformDownWrap: function (offset, duration) {
        this._super(offset, duration);
        this._transformDrawer(offset, duration);
    },
    _transformDrawer: function (offset, duration) {
        if (!this.drawerMask) {
            return;
        }

        offset = offset || 0;
        duration = duration || 0;

        var opacity = (-offset - this.options.down.offset) / this.downWrapHeight;

        opacity = Math.min(1, opacity);
        opacity = Math.max(0, opacity);

        this.drawerMask.style.opacity = opacity;
        this.drawerMask.style.webkitTransitionDuration = duration + 'ms';
        this.drawerMask.style.transitionDuration = duration + 'ms';
    },

    /**
     * 重写下拉过程动画
     * @param {Number} downHight 当前下拉的高度
     * @param {Number} downOffset 下拉的阈值
     */
    _pullHook: function (downHight, downOffset) {
        // 复用default的同名函数代码           
        this._super(downHight, downOffset);
    },

    /**
     * 重写下拉动画
     */
    _downLoaingHook: function () {
        // loading中已经translate了
        this._super();
    },

    /**
     * 重写success 但是什么都不做
     */
    _downLoaingSuccessHook: function () { },

    /**
     * 重写下拉end
     * @param {Boolean} isSuccess 是否成功
     */
    _downLoaingEndHook: function (isSuccess) {
        this._super(isSuccess);
    },

    /**
     * 取消loading的回调
     */
    _cancelLoaingHook: function () {
        this._super();
    }
});

// 挂载主题，这样多个主题可以并存
__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].namespace('theme.jianshu', jianshu);

// 覆盖全局对象，使的全局对象只会指向一个最新的主题
// globalContext.MiniRefresh = MiniRefreshTheme;

/* harmony default export */ __webpack_exports__["a"] = (jianshu);

/***/ }),
/* 7 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_css__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__index_css__);
/**
 * 仿淘宝下拉刷新主题
 * 继承自default
 */





/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * theme字段会根据不同的主题有不同值
 */
var CLASS_THEME = 'minirefresh-theme-taobao';
var CLASS_DOWN_WRAP = 'minirefresh-downwrap';
var CLASS_HARDWARE_SPEEDUP = 'minirefresh-hardware-speedup';
var CLASS_ROTATE = 'minirefresh-rotate';
var CLASS_HIDDEN = 'minirefresh-hidden';

/**
 * 定义几个状态
 * 默认状态
 * 下拉刷新状态
 * 释放刷新状态
 * 准备进入秘密花园状态
 */
var STATE_PULL_DEFAULT = 0;
var STATE_PULL_DOWN = 1;
var STATE_PULL_READY_REFRESH = 2;
var STATE_PULL_READY_SECRETGARDEN = 3;

/**
 * 一些常量
 */
var DEFAULT_DOWN_HEIGHT = 800;

/**
 * 一些样式
 */
var CLASS_SECRET_GARDEN_BG_IN = 'secret-garden-bg-in';
var CLASS_SECRET_GARDEN_BG_OUT = 'secret-garden-bg-out';
var CLASS_SECRET_GARDEN_MOON_IN = 'secret-garden-moon-in';
var CLASS_SECRET_GARDEN_MOON_OUT = 'secret-garden-moon-out';

var defaultSetting = {
    down: {
        // 下拉100出现释放更新
        offset: 100,
        dampRate: 0.4,
        successAnim: {
            // successAnim
            isEnable: false
        },
        // 本主题独有的效果
        secretGarden: {
            // 是否开启秘密花园（即类似淘宝二楼效果）
            isEnable: true,
            // 下拉超过200后可以出现秘密花园效果，注意，必须大于down的offset
            offset: 200,
            // 提示文字
            tips: '欢迎光临秘密花园',
            inSecretGarden: __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].noop
        },
        // 继承了default的downWrap部分代码，需要这个变量
        isWrapCssTranslate: true
    }
};

var taobao = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].theme.defaults.extend({

    /**
     * 拓展自定义的配置
     * @param {Object} options 配置参数
     */
    init: function (options) {
        options = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].extend(true, {}, defaultSetting, options);
        this._super(options);
    },

    /**
     * 重写下拉刷新初始化，变为小程序自己的动画
     */
    _initDownWrap: function () {
        var container = this.container,
            contentWrap = this.contentWrap,
            options = this.options;

        // 下拉的区域
        var downWrap = document.createElement('div');

        downWrap.className = CLASS_DOWN_WRAP + ' ' + CLASS_HARDWARE_SPEEDUP;
        downWrap.innerHTML = '<div class="downwrap-bg"></div>' +
            '<div class="downwrap-moon"></div>' +
            '<div class="downwrap-content">' +
            '<p class="downwrap-progress"></p>' +
            '<p class="downwrap-tips">' +
            options.down.contentdown +
            '</p>' +
            '</div>';
        container.insertBefore(downWrap, contentWrap);

        // 由于直接继承的default，所以其实已经有default主题了，这里再加上本主题样式
        container.classList.add(CLASS_THEME);

        this.downWrap = downWrap;
        this.downWrapProgress = this.downWrap.querySelector('.downwrap-progress');
        this.downWrapTips = this.downWrap.querySelector('.downwrap-tips');
        // 进入秘密花园后有背景和月亮的动画
        this.downWrapBg = this.downWrap.querySelector('.downwrap-bg');
        this.downWrapMoon = this.downWrap.querySelector('.downwrap-moon');
        // 初始化为默认状态
        this.pullState = STATE_PULL_DEFAULT;
        this.downWrapHeight = this.downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT;

        this._transformDownWrap(-1 * this.downWrapHeight);
    },
    _transformDownWrap: function (offset, duration) {
        this._super(offset, duration);
    },

    /**
     * 旋转进度条
     * @param {Number} progress 对应需要选择的进度
     */
    _rotateDownProgress: function (progress) {
        this.downWrapProgress.style.webkitTransform = 'rotate(' + progress + 'deg)';
        this.downWrapProgress.style.transform = 'rotate(' + progress + 'deg)';
    },

    /**
     * 重写下拉过程动画
     * @param {Number} downHight 当前下拉高度
     * @param {Number} downOffset 下拉阈值
     */
    _pullHook: function (downHight, downOffset) {
        var options = this.options,
            down = options.down,
            secretGarden = down.secretGarden.isEnable,
            secretGardenOffset = down.secretGarden.offset,
            FULL_DEGREE = 360;

        var rate = downHight / downOffset,
            progress = FULL_DEGREE * rate;

        this._transformDownWrap(-this.downWrapHeight + downHight);
        this._rotateDownProgress(progress);

        if (downHight < downOffset) {
            if (this.pullState !== STATE_PULL_DOWN) {
                // tips-down中需要移除bg的动画样式，如果不移除， downWrapTips修改innerText修改后可能无法重新渲染
                this.downWrapBg.classList.remove(CLASS_SECRET_GARDEN_BG_OUT);
                this.downWrapMoon.classList.remove(CLASS_SECRET_GARDEN_MOON_OUT);

                this.downWrapTips.classList.remove(CLASS_HIDDEN);
                this.downWrapProgress.classList.remove(CLASS_HIDDEN);
                this.downWrapTips.innerText = down.contentdown;
                this.pullState = STATE_PULL_DOWN;
            }
        } else if (downHight >= downOffset && (!secretGarden || downHight < secretGardenOffset)) {
            if (this.pullState !== STATE_PULL_READY_REFRESH) {
                this.downWrapTips.classList.remove(CLASS_HIDDEN);
                this.downWrapProgress.classList.remove(CLASS_HIDDEN);
                this.downWrapTips.innerText = down.contentover;
                this.pullState = STATE_PULL_READY_REFRESH;
            }
        } else {
            if (this.pullState !== STATE_PULL_READY_SECRETGARDEN) {
                this.downWrapTips.classList.remove(CLASS_HIDDEN);
                this.downWrapProgress.classList.add(CLASS_HIDDEN);
                this.downWrapTips.innerText = down.secretGarden.tips;
                this.pullState = STATE_PULL_READY_SECRETGARDEN;
            }
        }
    },

    /**
     * 因为有自定义秘密花园的动画，所以需要实现这个hook，在特定条件下去除默认行为
     * @param {Number} downHight 当前已经下拉的高度
     * @param {Number} downOffset 下拉阈值
     * @return {Boolean} 返回false就不再进入下拉loading，默认为true
     */
    _beforeDownLoadingHook: function (downHight, downOffset) {
        // 只要没有进入秘密花园，就仍然是以前的动作，否则downLoading都无法进入了，需要自定义实现
        if (this.pullState === STATE_PULL_READY_SECRETGARDEN) {
            this._inSecretGarden();

            return false;
        } else {
            return true;
        }
    },

    /**
     * 重写下拉动画
     * 秘密花园状态下无法进入
     */
    _downLoaingHook: function () {
        this.downWrapTips.innerText = this.options.down.contentrefresh;
        this.downWrapProgress.classList.add(CLASS_ROTATE);
        // 默认和contentWrap的同步
        this._transformDownWrap(-this.downWrapHeight + this.options.down.offset, this.options.down.bounceTime);
    },

    /**
     * 重写success 但是什么都不做
     * 秘密花园状态下无法进入
     */
    _downLoaingSuccessHook: function () { },

    /**
     * 重写下拉end
     * 秘密花园状态下无法进入
     * @param {Boolean} isSuccess 是否下拉请求成功
     */
    _downLoaingEndHook: function (isSuccess) {
        this.downWrapTips.innerText = this.options.down.contentdown;
        this.downWrapProgress.classList.remove(CLASS_ROTATE);
        // 默认和contentWrap的同步
        this._transformDownWrap(-this.downWrapHeight, this.options.down.bounceTime);
        // 需要重置回来
        this.pullState = STATE_PULL_DEFAULT;
    },

    /**
     * 取消loading的回调
     */
    _cancelLoaingHook: function () {
        // 默认和contentWrap的同步
        this._transformDownWrap(-this.downWrapHeight, this.options.down.bounceTime);
        this.pullState = STATE_PULL_DEFAULT;
    },

    /**
     * 秘密花园的动画
     * @param {Boolean} isInAnim 是否是进入
     */
    _secretGardenAnimation: function (isInAnim) {
        var bgAnimClassAdd = isInAnim ? CLASS_SECRET_GARDEN_BG_IN : CLASS_SECRET_GARDEN_BG_OUT,
            bgAnimClassRemove = isInAnim ? CLASS_SECRET_GARDEN_BG_OUT : CLASS_SECRET_GARDEN_BG_IN,
            moonAnimClassAdd = isInAnim ? CLASS_SECRET_GARDEN_MOON_IN : CLASS_SECRET_GARDEN_MOON_OUT,
            moonAnimClassRemove = isInAnim ? CLASS_SECRET_GARDEN_MOON_OUT : CLASS_SECRET_GARDEN_MOON_IN;

        // 动画变为加载特定的css样式，这样便于外部修改
        this.downWrapBg.classList.remove(bgAnimClassRemove);
        this.downWrapBg.classList.add(bgAnimClassAdd);

        this.downWrapMoon.classList.remove(moonAnimClassRemove);
        this.downWrapMoon.classList.add(moonAnimClassAdd);
    },

    /**
     * 进入秘密花园
     * 在秘密花园状态下走入的是这个实现
     */
    _inSecretGarden: function () {
        var downBounceTime = this.options.down.bounceTime,
            inSecretGardenCb = this.options.down.secretGarden.inSecretGarden;

        this.downWrapTips.classList.add(CLASS_HIDDEN);
        // 动画
        this.scroller.translateContentWrap(this.contentWrap.clientHeight, downBounceTime);
        this._transformDownWrap(this.contentWrap.clientHeight - this.downWrapHeight, downBounceTime);
        this._secretGardenAnimation(true);
        inSecretGardenCb && inSecretGardenCb();
    },

    /**
     * 重置秘密花园
     */
    resetSecretGarden: function () {
        var downBounceTime = this.options.down.bounceTime;

        // 重置scroll
        this.scroller.translateContentWrap(0, downBounceTime);
        // 重置动画区域的wrap
        this._transformDownWrap(-1 * this.downWrapHeight, downBounceTime);
        this._secretGardenAnimation(false);
        // 需要重置回来
        this.pullState = STATE_PULL_DEFAULT;
    }
});

// 挂载主题，这样多个主题可以并存
__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].namespace('theme.taobao', taobao);

// 覆盖全局对象，使的全局对象只会指向一个最新的主题
// globalContext.MiniRefresh = MiniRefreshTheme;

/* harmony default export */ __webpack_exports__["a"] = (taobao);

/***/ }),
/* 9 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_css__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__index_css__);
/**
 * 仿微信小程序主题
 * 由于要复用default的上拉加载，toTop功能，所以直接继承自default
 * 只重写了 downWrap相关操作
 */





/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * theme字段会根据不同的主题有不同值
 */
var CLASS_THEME = 'minirefresh-theme-applet';
var CLASS_DOWN_WRAP = 'minirefresh-downwrap';
var CLASS_HARDWARE_SPEEDUP = 'minirefresh-hardware-speedup';

/**
 * 本主题的特色样式
 */
var CLASS_DOWN_LOADING = 'loading-applet';

/**
 * 一些常量
 */
var DEFAULT_DOWN_HEIGHT = 50;

var defaultSetting = {
    down: {
        successAnim: {
            // 微信小程序没有successAnim 也没有文字提示
            isEnable: false
        },
        // 继承了default的downWrap部分代码，需要这个变量
        isWrapCssTranslate: true
    }
};

var applet = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].theme.defaults.extend({

    /**
     * 拓展自定义的配置
     * @param {Object} options 配置参数
     */
    init: function (options) {
        options = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].extend(true, {}, defaultSetting, options);
        this._super(options);
    },

    /**
     * 重写下拉刷新初始化，变为小程序自己的动画
     */
    _initDownWrap: function () {
        var container = this.container,
            contentWrap = this.contentWrap;

        // 下拉的区域
        var downWrap = document.createElement('div');

        downWrap.className = CLASS_DOWN_WRAP + ' ' + CLASS_HARDWARE_SPEEDUP;
        downWrap.innerHTML = '<div class="downwrap-content ball-beat"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
        container.insertBefore(downWrap, contentWrap);

        // 由于直接继承的default，所以其实已经有default主题了，这里再加上本主题样式
        container.classList.add(CLASS_THEME);

        this.downWrap = downWrap;
        // 留一个默认值，以免样式被覆盖，无法获取
        this.downWrapHeight = this.downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT;
        this._transformDownWrap(-1 * this.downWrapHeight);
    },
    _transformDownWrap: function (offset, duration) {
        this._super(offset, duration);
    },

    /**
     * 重写下拉过程动画
     * @param {Number} downHight 当前下拉的高度
     * @param {Number} downOffset 下拉的阈值
     */
    _pullHook: function (downHight, downOffset) {

        if (downHight < downOffset) {
            var rate = downHight / downOffset,
                offset = this.downWrapHeight * (-1 + rate);

            this._transformDownWrap(offset);
        } else {
            this._transformDownWrap(0);
        }
    },

    /**
     * 重写下拉动画
     */
    _downLoaingHook: function () {
        this.downWrap.classList.add(CLASS_DOWN_LOADING);
    },

    /**
     * 重写success 但是什么都不做
     */
    _downLoaingSuccessHook: function () { },

    /**
     * 重写下拉end
     * @param {Boolean} isSuccess 是否成功
     */
    _downLoaingEndHook: function (isSuccess) {
        this.downWrap.classList.remove(CLASS_DOWN_LOADING);
        this._transformDownWrap(-1 * this.downWrapHeight, this.options.down.bounceTime);
    },

    /**
     * 取消loading的回调
     */
    _cancelLoaingHook: function () {
        this._transformDownWrap(-1 * this.downWrapHeight, this.options.down.bounceTime);
    }
});

// 挂载主题，这样多个主题可以并存
__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].namespace('theme.applet', applet);

// 覆盖全局对象，使的全局对象只会指向一个最新的主题
// globalContext.MiniRefresh = MiniRefreshTheme;

/* harmony default export */ __webpack_exports__["a"] = (applet);

/***/ }),
/* 11 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_css__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__index_css__);
/**
 * 3D抽屉效果主题
 * 复用了default的代码，在其基础上增加3D效果
 * 注意，复用_super时一定要十分熟悉default中对应代码的作用
 */






/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * theme字段会根据不同的主题有不同值
 */
var CLASS_THEME = 'minirefresh-theme-drawer3d';

/**
 * 一些常量
 * 默认高度是200
 * 其中背景默认是黑色，内容是白色，再增设阻尼系数可以较好的达到3D效果
 */
var DEFAULT_DOWN_HEIGHT = 200;
var DRAWER_FULL_DEGREE = 90;

var defaultSetting = {
    down: {
        offset: 100,
        // 阻尼系数，下拉的距离大于offset时,改变下拉区域高度比例;值越接近0,高度变化越小,表现为越往下越难拉
        dampRate: 0.2,
        bounceTime: 500,
        successAnim: {
            // successAnim
            isEnable: false
        },
        // 继承了default的downWrap部分代码，需要这个变量
        isWrapCssTranslate: true
    }
};

var drawer3d = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].theme.defaults.extend({

    /**
     * 拓展自定义的配置
     * @param {Object} options 配置参数
     */
    init: function (options) {
        options = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].extend(true, {}, defaultSetting, options);
        this._super(options);
    },

    /**
     * 重写下拉刷新初始化，变为小程序自己的动画
     */
    _initDownWrap: function () {
        // 先复用default代码，然后重写
        this._super();

        var container = this.container,
            options = this.options,
            downWrap = this.downWrap;

        // 改写内容区域
        downWrap.innerHTML = '<div class="state-3d"><div class="drawer3d">' +
            '<div class="downwrap-content">' +
            '<p class="downwrap-progress"></p>' +
            '<p class="downwrap-tips">' +
            options.down.contentdown +
            ' </p></div>' +
            '<div class="drawer3d-mask"></div ></div></div>';

        // 由于直接继承的default，所以其实已经有default主题了，这里再加上本主题样式
        container.classList.add(CLASS_THEME);

        // 改写完后，对象需要重新查找
        this.downWrapProgress = downWrap.querySelector('.downwrap-progress');
        this.downWrapTips = downWrap.querySelector('.downwrap-tips');
        this.drawer = downWrap.querySelector('.drawer3d');
        this.drawerMask = downWrap.querySelector('.drawer3d-mask');

        // 留一个默认值，以免样式被覆盖，无法获取
        this.downWrapHeight = downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT;
        // 由于downWrap被改变了，重新移动
        this._transformDownWrap(-this.downWrapHeight);
        this._resetDrawer();
    },
    _transformDownWrap: function (offset, duration) {
        this._super(offset, duration);
    },
    _transformDrawer: function (degree, duration) {
        degree = degree || 0;
        duration = duration || 0;
        // 一些3D相关属性写到了CSS中
        this.drawer.style.transform = 'rotateX(' + degree + 'deg) rotateY(0deg)';
        this.drawer.style.webkitTransform = 'rotateX(' + degree + 'deg) rotateY(0deg)';
        this.drawer.style.transitionDuration = duration + 'ms';
        this.drawer.style.webkitTransitionDuration = duration + 'ms';

        var opacity = degree / DRAWER_FULL_DEGREE;

        this.drawerMask.style.opacity = opacity;
        this.drawerMask.style.transitionDuration = duration + 'ms';
        this.drawerMask.style.webkitTransitionDuration = duration + 'ms';
    },

    /**
     * 重置抽屉，主要是旋转角度
     */
    _resetDrawer: function () {
        this._transformDrawer(DRAWER_FULL_DEGREE, this.options.down.bounceTime);
    },

    /**
     * 重写下拉过程动画
     * @param {Number} downHight 当前下拉的高度
     * @param {Number} downOffset 下拉的阈值
     */
    _pullHook: function (downHight, downOffset) {
        // 复用default的同名函数代码           
        this._super(downHight, downOffset);

        var rate = downHight / downOffset,
            degree = DRAWER_FULL_DEGREE * (1 - Math.min(rate, 1));

        this._transformDrawer(degree);
    },

    /**
     * 重写下拉动画
     */
    _downLoaingHook: function () {
        // loading中已经translate了
        this._super();

        this._transformDrawer(0, this.options.down.bounceTime);
    },

    /**
     * 重写success 但是什么都不做
     */
    _downLoaingSuccessHook: function () { },

    /**
     * 重写下拉end
     * @param {Boolean} isSuccess 是否成功
     */
    _downLoaingEndHook: function (isSuccess) {
        this._super(isSuccess);
        this._resetDrawer();
    },

    /**
     * 取消loading的回调
     */
    _cancelLoaingHook: function () {
        this._super();
        this._resetDrawer();
    }
});

// 挂载主题，这样多个主题可以并存
__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].namespace('theme.drawer3d', drawer3d);

/* harmony default export */ __webpack_exports__["a"] = (drawer3d);

/***/ }),
/* 13 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_css__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__index_css__);
/**
 * 滑动抽屉效果
 * 复用了default的代码
 * 下拉动画时完全自定义重写，不移动scroll，而是直接css动画
 */





/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * theme字段会根据不同的主题有不同值
 */
var CLASS_THEME = 'minirefresh-theme-drawerslider';

/**
 * 一些常量
 * 默认高度是200
 * 其中背景默认是黑色，内容是白色，再增设阻尼系数可以较好的达到3D效果
 */
var DEFAULT_DOWN_HEIGHT = 200,
    DOWN_SHADOW_HEIGHT = 2;

var defaultSetting = {
    down: {
        offset: 100,
        // 阻尼系数，下拉的距离大于offset时,改变下拉区域高度比例;值越接近0,高度变化越小,表现为越往下越难拉
        dampRate: 0.2,
        bounceTime: 500,
        successAnim: {
            // successAnim
            isEnable: false
        },
        // 继承了default的downWrap部分代码，需要这个变量
        isWrapCssTranslate: true,
        // 是否scroll在下拉时会进行css移动，本主题关闭它，完全自定义
        // 这种方案记得修改动画区域的index
        isScrollCssTranslate: false
    }
};

var drawerslider = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].theme.defaults.extend({

    /**
     * 拓展自定义的配置
     * @param {Object} options 配置参数
     */
    init: function (options) {
        options = __WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].extend(true, {}, defaultSetting, options);
        this._super(options);
    },

    /**
     * 重写下拉刷新初始化，变为小程序自己的动画
     */
    _initDownWrap: function () {
        // 先复用default代码，然后重写
        this._super();

        var container = this.container,
            options = this.options,
            downWrap = this.downWrap;

        // 改写内容区域
        downWrap.innerHTML = '<div class="drawer">' +
            '<div class="downwrap-content">' +
            '<p class="downwrap-progress"></p>' +
            '<p class="downwrap-tips">' +
            options.down.contentdown +
            ' </p></div>' +
            '<div class="drawer-mask"></div ></div>';

        // 由于直接继承的default，所以其实已经有default主题了，这里再加上本主题样式
        container.classList.add(CLASS_THEME);

        // 改写完后，对象需要重新查找，需要给default用
        this.downWrapProgress = downWrap.querySelector('.downwrap-progress');
        this.downWrapTips = downWrap.querySelector('.downwrap-tips');
        this.drawer = downWrap.querySelector('.drawer');
        this.drawerMask = downWrap.querySelector('.drawer-mask');

        // 留一个默认值，以免样式被覆盖，无法获取
        // +2是去除阴影的位置
        this.downWrapHeight = DOWN_SHADOW_HEIGHT + downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT;
        // 由于downWrap被改变了，重新移动
        this._transformDownWrap(-this.downWrapHeight);
    },
    _transformDownWrap: function (offset, duration) {
        this._super(offset, duration);
        this._transformDrawer(offset, duration);
    },
    _transformDrawer: function (offset, duration) {
        if (!this.drawerMask) {
            return;
        }

        offset = offset || 0;
        duration = duration || 0;

        var opacity = (-offset - this.options.down.offset) / this.downWrapHeight;

        opacity = Math.min(1, opacity);
        opacity = Math.max(0, opacity);

        this.drawerMask.style.opacity = opacity;
        this.drawerMask.style.webkitTransitionDuration = duration + 'ms';
        this.drawerMask.style.transitionDuration = duration + 'ms';
    },

    /**
     * 重写下拉过程动画
     * @param {Number} downHight 当前下拉的高度
     * @param {Number} downOffset 下拉的阈值
     */
    _pullHook: function (downHight, downOffset) {
        // 复用default的同名函数代码           
        this._super(downHight, downOffset);
    },

    /**
     * 重写下拉动画
     */
    _downLoaingHook: function () {
        // loading中已经translate了
        this._super();
    },

    /**
     * 重写success 但是什么都不做
     */
    _downLoaingSuccessHook: function () { },

    /**
     * 重写下拉end
     * @param {Boolean} isSuccess 是否成功
     */
    _downLoaingEndHook: function (isSuccess) {
        this._super(isSuccess);
    },

    /**
     * 取消loading的回调
     */
    _cancelLoaingHook: function () {
        this._super();
    }
});

// 挂载主题，这样多个主题可以并存
__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* default */].namespace('theme.drawerslider', drawerslider);

// 覆盖全局对象，使的全局对象只会指向一个最新的主题
// globalContext.MiniRefresh = MiniRefreshTheme;

/* harmony default export */ __webpack_exports__["a"] = (drawerslider);


/***/ }),
/* 15 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
/******/ ]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAxZDEyMmEyNDkxZjA4MTlhMDFjMSIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy90aGVtZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY3NzL21pbmlyZWZyZXNoLmNzcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29yZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc2Nyb2xsL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy90aGVtZS9qaWFuc2h1L2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy90aGVtZS9qaWFuc2h1L2luZGV4LmNzcyIsIndlYnBhY2s6Ly8vLi9zcmMvdGhlbWUvdGFvYmFvL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy90aGVtZS90YW9iYW8vaW5kZXguY3NzIiwid2VicGFjazovLy8uL3NyYy90aGVtZS9hcHBsZXQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RoZW1lL2FwcGxldC9pbmRleC5jc3MiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RoZW1lL2RyYXdlcjNkL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy90aGVtZS9kcmF3ZXIzZC9pbmRleC5jc3MiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RoZW1lL2RyYXdlcnNsaWRlci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdGhlbWUvZHJhd2Vyc2xpZGVyL2luZGV4LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNaQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsNkJBQTZCOztBQUU3QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVELDBCQUEwQjs7QUFFMUI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxVQUFVLGFBQWE7QUFDdkI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTs7QUFFQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixZQUFZLFlBQVk7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsWUFBWTtBQUN2QixZQUFZLE9BQU87QUFDbkI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxtQkFBbUIsYUFBYTtBQUNoQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsOEQ7Ozs7Ozs7Ozs7Ozs7OztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7Ozs7Ozs7Ozs7O0FDcEJBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHlGQUF1QztBQUN2QztBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTs7Ozs7Ozs7QUM5U0EseUM7Ozs7Ozs7O0FDQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQSx5RkFBdUM7O0FBRXZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7O0FBRUw7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGFBQWE7QUFDYjtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QjtBQUNBO0FBQ0EsOEZBQTRDO0FBQzVDO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxlQUFlLFFBQVE7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEOzs7Ozs7OztBQ3RTQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQjtBQUNBLFdBQVcsU0FBUztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7O0FDcmRBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEM7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQSx5RkFBdUM7QUFDdkM7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZUFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxFQUFFOztBQUUzQztBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsZ0U7Ozs7OztBQ3RKQSx5Qzs7Ozs7Ozs7QUNBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QjtBQUNBO0FBQ0EseUZBQXVDO0FBQ3ZDO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZUFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGVBQWUsT0FBTztBQUN0QixnQkFBZ0IsUUFBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsRUFBRTs7QUFFM0M7QUFDQTtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSwrRDs7Ozs7O0FDaFNBLHlDOzs7Ozs7OztBQ0FBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QjtBQUNBO0FBQ0EseUZBQXVDO0FBQ3ZDO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGVBQWUsT0FBTztBQUN0QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsRUFBRTs7QUFFM0M7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsK0Q7Ozs7OztBQ2hJQSx5Qzs7Ozs7Ozs7QUNBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEM7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQSx5RkFBdUM7QUFDdkM7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGVBQWUsT0FBTztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxFQUFFOztBQUUzQztBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQSxpRTs7Ozs7O0FDbktBLHlDOzs7Ozs7OztBQ0FBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMENBQTBDO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QjtBQUNBO0FBQ0EseUZBQXVDO0FBQ3ZDO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZUFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxFQUFFOztBQUUzQztBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUMzSkEseUMiLCJmaWxlIjoicGFnZXJlZnJlc2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuICAgLy9Db21tb25KUzIgQ29tbWVudFxuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAvL0FNRCBDb21tZW50XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2Uge1xuXHRcdHZhciBhID0gZmFjdG9yeSgpO1xuXHRcdGZvcih2YXIgaSBpbiBhKSAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnID8gZXhwb3J0cyA6IHJvb3QpW2ldID0gYVtpXTtcblx0fVxufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDEpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDFkMTIyYTI0OTFmMDgxOWEwMWMxIiwiLyoqIFxyXG4gKiDmnoTlu7ogTWluaVJlZnJlc2hcclxuICogTWluaVJlZnJlc2hUb29scyDmmK/lhoXpg6jkvb/nlKjnmoRcclxuICog5aSW6YOo5Li76aKY5Lya55SoIE1pbmlSZWZyZXNo5Y+Y6YePXHJcbiAqL1xyXG5cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuY29uc3QgIHV0aWxzID0ge307XHJcblxyXG4vKipcclxuICog5qih5oufQ2xhc3PnmoTln7rnsbss5Lul5L6/5qih5oufQ2xhc3Pov5vooYznu6fmib/nrYlcclxuICovXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyDlkIzml7blo7DmmI7lpJrkuKrlj5jph48s55SoLOWIhuW8gOimgeWlvemCo+S5iOS4gOeCueeCuVxyXG4gICAgdmFyIGluaXRpYWxpemluZyA9IGZhbHNlLFxyXG4gICAgICAgIC8vIOmAmui/h+ato+WImeajgOafpeaYr+WQpuaYr+WHveaVsFxyXG4gICAgICAgIGZuVGVzdCA9IC94eXovLnRlc3QoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAneHl6JztcclxuICAgICAgICB9KSA/IC9cXGJfc3VwZXJcXGIvIDogLy4qLztcclxuICAgIHZhciBDbGF6eiA9IGZ1bmN0aW9uICgpIHsgfTtcclxuXHJcbiAgICAvLyDlvojngbXmtLvnmoTkuIDnp43lhpnms5Us55u05o6l6YeN5YaZQ2xhc3PnmoRleHRlbmQs5qih5ouf57un5om/XHJcbiAgICBDbGF6ei5leHRlbmQgPSBmdW5jdGlvbiAocHJvcCkge1xyXG4gICAgICAgIHZhciBfc3VwZXIgPSB0aGlzLnByb3RvdHlwZTtcclxuXHJcbiAgICAgICAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcclxuICAgICAgICAvLyDlj6/ku6Xov5nmoLfnkIbop6M66L+Z5LiqcHJvdG90eXBl5bCGdGhpc+S4reeahOaWueazleWSjOWxnuaAp+WFqOmDqOmDveWkjeWItuS6huS4gOmBjVxyXG4gICAgICAgIHZhciBwcm90b3R5cGUgPSBuZXcgdGhpcygpO1xyXG5cclxuICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHByb3ApIHtcclxuICAgICAgICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocHJvcCwgbmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIOi3s+i/h+WOn+Wei+S4iueahFxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDov5nkuIDkupvliJfmk43kvZzpgLvovpHlubbkuI3nroDljZXvvIzlvpfmuIXmpZrov5DnrpfnrKbkvJjlhYjnuqdcclxuICAgICAgICAgICAgICog6YC76L6R5LiO55qE5LyY5YWI57qn5piv6auY5LqO5LiJ5YWD5p2h5Lu26L+Q566X56ym55qELOW+l+azqOaEj+S4i1xyXG4gICAgICAgICAgICAgKiDlj6rmnInnu6fmib/nmoTlh73mlbDlrZjlnKhfc3VwZXLml7bmiY3kvJrop6blj5Eo5ZOq5oCV5rOo6YeK5Lmf5LiA5qC36L+b5YWlKVxyXG4gICAgICAgICAgICAgKiDmiYDku6XmorPnkIblkI7lhbblrp7kuIDns7vliJfnmoTmk43kvZzlsLHmmK/liKTmlq3mmK/lkKbniLblr7nosaHkuZ/mnInnm7jlkIzlr7nosaFcclxuICAgICAgICAgICAgICog5aaC5p6c5pyJLOWImeWvueW6lOWHveaVsOWtmOWcqF9zdXBlcui/meS4quS4nOilv1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgcHJvdG90eXBlW25hbWVdID0gdHlwZW9mIHByb3BbbmFtZV0gPT09ICdmdW5jdGlvbicgJiZcclxuICAgICAgICAgICAgICAgIHR5cGVvZiBfc3VwZXJbbmFtZV0gPT09ICdmdW5jdGlvbicgJiYgZm5UZXN0LnRlc3QocHJvcFtuYW1lXSkgP1xyXG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uIChuYW1lLCBmbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0bXAgPSB0aGlzLl9zdXBlcjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3N1cGVyID0gX3N1cGVyW25hbWVdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJldCA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdXBlciA9IHRtcDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0pKG5hbWUsIHByb3BbbmFtZV0pIDpcclxuICAgICAgICAgICAgICAgIHByb3BbbmFtZV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDbHNz55qE5p6E6YCgLOm7mOiupOS8muaJp+ihjGluaXTmlrnms5VcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBDbGF6eigpIHtcclxuICAgICAgICAgICAgaWYgKCFpbml0aWFsaXppbmcgJiYgdGhpcy5pbml0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBDbGF6ei5wcm90b3R5cGUgPSBwcm90b3R5cGU7XHJcbiAgICAgICAgQ2xhenoucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2xheno7XHJcbiAgICAgICAgLy8g5Y+q5Lya57un5om/IGV4dGVuZOmdmeaAgeWxnuaAp++8jOWFtuWug+WxnuaAp+S4jeS8mue7p+aJv1xyXG4gICAgICAgIENsYXp6LmV4dGVuZCA9IHRoaXMuZXh0ZW5kO1xyXG5cclxuICAgICAgICByZXR1cm4gQ2xheno7XHJcbiAgICB9O1xyXG4gICAgdXRpbHMuQ2xhenogPSBDbGF6ejtcclxufSkoKTtcclxuXHJcbnV0aWxzLm5vb3AgPSBmdW5jdGlvbiAoKSB7IH07XHJcblxyXG51dGlscy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24gKG9iaikge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7XHJcbn07XHJcblxyXG51dGlscy5pc09iamVjdCA9IGZ1bmN0aW9uIChvYmopIHtcclxuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JztcclxufTtcclxuXHJcbnV0aWxzLmlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8XHJcbiAgICBmdW5jdGlvbiAob2JqZWN0KSB7XHJcbiAgICAgICAgcmV0dXJuIG9iamVjdCBpbnN0YW5jZW9mIEFycmF5O1xyXG4gICAgfTtcclxuXHJcbi8qKlxyXG4gKiDlj4LmlbDmi5PlsZVcclxuICogQHBhcmFtIHt0eXBlfSBkZWVwIOaYr+WQpua3seWkjeWItlxyXG4gKiBAcGFyYW0ge3R5cGV9IHRhcmdldCDpnIDopoHmi5PlsZXnmoTnm67moIflr7nosaFcclxuICogQHBhcmFtIHt0eXBlfSBzb3VyY2Ug5YW25a6D6ZyA6KaB5ouT5bGV55qE5rqQ77yM5Lya6KaG55uW55uu5qCH5a+56LGh5LiK55qE55u45ZCM5bGe5oCnXHJcbiAqIEByZXR1cm4ge09iamVjdH0g5ouT5bGV5ZCO55qE5a+56LGhXHJcbiAqL1xyXG51dGlscy5leHRlbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuXHJcbiAgICAvLyDnm67moIdcclxuICAgIHZhciB0YXJnZXQgPSBhcmdzWzBdIHx8IHt9LFxyXG4gICAgICAgIC8vIOm7mOiupHNvdXJjZeS7jjHlvIDlp4tcclxuICAgICAgICBpbmRleCA9IDEsXHJcbiAgICAgICAgbGVuID0gYXJncy5sZW5ndGgsXHJcbiAgICAgICAgLy8g6buY6K6k6Z2e5rex5aSN5Yi2XHJcbiAgICAgICAgZGVlcCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAvLyDlpoLmnpzlvIDlkK/kuobmt7HlpI3liLZcclxuICAgICAgICBkZWVwID0gdGFyZ2V0O1xyXG4gICAgICAgIHRhcmdldCA9IGFyZ3NbaW5kZXhdIHx8IHt9O1xyXG4gICAgICAgIGluZGV4Kys7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF1dGlscy5pc09iamVjdCh0YXJnZXQpKSB7XHJcbiAgICAgICAgLy8g56Gu5L+d5ouT5bGV55qE5LiA5a6a5pivb2JqZWN0XHJcbiAgICAgICAgdGFyZ2V0ID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICg7IGluZGV4IDwgbGVuOyBpbmRleCsrKSB7XHJcbiAgICAgICAgLy8gc291cmNl55qE5ouT5bGVXHJcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3NbaW5kZXhdO1xyXG5cclxuICAgICAgICBpZiAoc291cmNlICYmIHV0aWxzLmlzT2JqZWN0KHNvdXJjZSkpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwgbmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDpmLLmraLljp/lnovkuIrnmoTmlbDmja5cclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgc3JjID0gdGFyZ2V0W25hbWVdO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvcHkgPSBzb3VyY2VbbmFtZV07XHJcbiAgICAgICAgICAgICAgICB2YXIgY2xvbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29weUlzQXJyYXk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldCA9PT0gY29weSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOmYsuatoueOr+W9ouW8leeUqFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkZWVwICYmIGNvcHkgJiYgKHV0aWxzLmlzT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IHV0aWxzLmlzQXJyYXkoY29weSkpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3B5SXNBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3B5SXNBcnJheSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZSA9IHNyYyAmJiB1dGlscy5pc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZSA9IHNyYyAmJiB1dGlscy5pc09iamVjdChzcmMpID8gc3JjIDoge307XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0gPSB1dGlscy5leHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb3B5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0gPSBjb3B5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YXJnZXQ7XHJcbn07XHJcblxyXG4vKipcclxuICog6YCJ5oup6L+Z5q615Luj56CB55So5Yiw55qE5aSq5aSa5LqG77yM5Zug5q2k5oq95Y+W5bCB6KOF5Ye65p2lXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IGRvbeWFg+e0oOaIluiAhXNlbGVjdG9yXHJcbiAqIEByZXR1cm4ge0hUTUxFbGVtZW50fSDov5Tlm57pgInmi6nnmoREb23lr7nosaHvvIzml6DmnpzmsqHmnInnrKblkIjopoHmsYLnmoTvvIzliJnov5Tlm55udWxsXHJcbiAqL1xyXG51dGlscy5zZWxlY3RvciA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbn07XHJcblxyXG4vKipcclxuICog6I635Y+WRE9N55qE5Y+v6KeG5Yy66auY5bqm77yM5YW85a65UEPkuIrnmoRib2R56auY5bqm6I635Y+WXHJcbiAqIOWboOS4uuWcqOmAmui/h2JvZHnojrflj5bml7bvvIzlnKhQQ+S4iuS8muaciUNTUzFDb21wYXTlvaLlvI/vvIzmiYDku6XpnIDopoHlhbzlrrlcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZG9tIOmcgOimgeiOt+WPluWPr+inhuWMuumrmOW6pueahGRvbSzlr7lib2R55a+56LGh5pyJ54m55q6K55qE5YW85a655pa55qGIXHJcbiAqIEByZXR1cm4ge051bWJlcn0g6L+U5Zue5pyA57uI55qE6auY5bqmXHJcbiAqL1xyXG51dGlscy5nZXRDbGllbnRIZWlnaHRCeURvbSA9IGZ1bmN0aW9uIChkb20pIHtcclxuICAgIHZhciBoZWlnaHQgPSBkb20uY2xpZW50SGVpZ2h0O1xyXG5cclxuICAgIGlmIChkb20gPT09IGRvY3VtZW50LmJvZHkgJiYgZG9jdW1lbnQuY29tcGF0TW9kZSA9PT0gJ0NTUzFDb21wYXQnKSB7XHJcbiAgICAgICAgLy8gUEPkuIpib2R555qE5Y+v6KeG5Yy655qE54m55q6K5aSE55CGXHJcbiAgICAgICAgaGVpZ2h0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaGVpZ2h0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIOiuvue9ruS4gOS4qlV0aWzlr7nosaHkuIvnmoTlkb3lkI3nqbrpl7RcclxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSDlkb3lkI3nqbrpl7RcclxuICogQHBhcmFtIHtPYmplY3R9IG9iaiDpnIDopoHotYvlgLznmoTnm67moIflr7nosaFcclxuICogQHJldHVybiB7T2JqZWN0fSDov5Tlm57mnIDnu4jnmoTlr7nosaFcclxuICovXHJcbnV0aWxzLm5hbWVzcGFjZSA9IGZ1bmN0aW9uIChuYW1lc3BhY2UsIG9iaikge1xyXG4gICAgdmFyIHBhcmVudCA9IHV0aWxzO1xyXG5cclxuICAgIGlmICghbmFtZXNwYWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhcmVudDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmFtZXNwYWNlQXJyID0gbmFtZXNwYWNlLnNwbGl0KCcuJyksXHJcbiAgICAgICAgbGVuID0gbmFtZXNwYWNlQXJyLmxlbmd0aDtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbiAtIDE7IGkrKykge1xyXG4gICAgICAgIHZhciB0bXAgPSBuYW1lc3BhY2VBcnJbaV07XHJcblxyXG4gICAgICAgIC8vIOS4jeWtmOWcqOeahOivneimgemHjeaWsOWIm+W7uuWvueixoVxyXG4gICAgICAgIHBhcmVudFt0bXBdID0gcGFyZW50W3RtcF0gfHwge307XHJcbiAgICAgICAgLy8gcGFyZW506KaB5ZCR5LiL5LiA57qnXHJcbiAgICAgICAgcGFyZW50ID0gcGFyZW50W3RtcF07XHJcblxyXG4gICAgfVxyXG4gICAgcGFyZW50W25hbWVzcGFjZUFycltsZW4gLSAxXV0gPSBvYmo7XHJcblxyXG4gICAgcmV0dXJuIHBhcmVudFtuYW1lc3BhY2VBcnJbbGVuIC0gMV1dO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgIHV0aWxzXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdXRpbHMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IGRlZmF1bHRzIGZyb20gJy4vdGhlbWUnO1xyXG5pbXBvcnQgamlhbnNodSBmcm9tICcuL3RoZW1lL2ppYW5zaHUnO1xyXG5pbXBvcnQgdGFvYmFvIGZyb20gJy4vdGhlbWUvdGFvYmFvJztcclxuaW1wb3J0IGFwcGxldCBmcm9tICcuL3RoZW1lL2FwcGxldCc7XHJcbmltcG9ydCBkcmF3ZXIzZCBmcm9tICcuL3RoZW1lL2RyYXdlcjNkJztcclxuaW1wb3J0IGRyYXdlcnNsaWRlciBmcm9tICcuL3RoZW1lL2RyYXdlcnNsaWRlcic7XHJcblxyXG5jb25zdCB0aGVtZU1hcCA9IHtcclxuICAgIGRlZmF1bHRzLFxyXG4gICAgamlhbnNodSxcclxuICAgIHRhb2JhbyxcclxuICAgIGFwcGxldCxcclxuICAgIGRyYXdlcjNkLFxyXG4gICAgZHJhd2Vyc2xpZGVyXHJcbn1cclxuY29uc3QgcGFnZXJlZnJlc2ggPSBmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuICAgIHJldHVybiBuZXcgdGhlbWVNYXBbcG9zaXRpb24udGhlbWVdKHBvc2l0aW9uKVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgcGFnZXJlZnJlc2hcclxuZXhwb3J0IHsgcGFnZXJlZnJlc2ggfVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxyXG4gKiBtaW5pcmVmcmVzaOeahOm7mOiupOS4u+mimFxyXG4gKiDpu5jorqTkuLvpopjkvJrmiZPljIXliLDmoLjlv4Pku6PnoIHkuK1cclxuICog5Li76aKY57G757un5om/6Ieq5Z+657G777yM5omA5Lul5Y+v5Lul6LCD55So5Z+657G755qE5bGe5oCn77yI5L2G5piv5LiN5bu66K6u5rul55So77yJXHJcbiAqIOaLk+WxleWFtuWug+S4u+mimOacieS4pOenjeaWueahiO+8mlxyXG4gKiAxLiDnm7TmjqXnu6fmib/oh6pkZWZhdWx077yM5Lya6buY6K6k5oul5pyJZGVmYXVsdOeahOWxnuaAp++8jOWPqumcgOimgeimhuebluiHquWumuS5ieWKn+iDveWNs+WPr++8iOazqOaEj+W/hemhu+imhueblu+8jOWQpuWImeS8muiwg+eUqGR3ZmF1bHTnmoTpu5jorqTmk43kvZzvvIlcclxuICogMi4g5ZKMZGVmYXVsdOS4gOagt++8jOe7p+aJv+iHqiB1dGlscy5jb3Jl77yM6L+Z5qC35Lya5LiOZGVmYXVsdOaXoOWFs++8jOaJgOS7peeahOS4gOWIh1VJ6YO95b+F6aG76Ieq5bex5a6e546w77yI5Y+v5Lul5Y+C6ICDZGVmYXVsdOWOu+WunueOsO+8iVxyXG4gKiBcclxuICog5LiA6Iis77yM5Zyo6L+b6KGM5LiA5Lqb5bCP5L+u5pS55pe277yM5bu66K6u57un5om/6IeqZGVmYXVsdO+8iOi/meagt3RvVG9w77yM5LiK5ouJ5Yqg6L295aSn6YOo5YiG5Luj56CB6YO95Y+v5aSN55So77yJXHJcbiAqIOWcqOi/m+ihjOWkp+S/ruaUueaXtu+8jOW7uuiurue7p+aJv+iHqnV0aWxzLmNvcmXvvIzov5nmoLflj6/ku6XlubLlubLlh4Dlh4DnmoTph43lhpnkuLvpophcclxuICovXHJcbmltcG9ydCAnLi4vY3NzL21pbmlyZWZyZXNoLmNzcyc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCBjb3JlIGZyb20gJy4uL2NvcmUnO1xyXG5cclxuXHJcbi8qKlxyXG4gKiDkuIDkupvpu5jorqTmj5DkvpvnmoRDU1PnsbvvvIzkuIDoiKzmnaXor7TkuI3kvJrlj5jliqjvvIjnlLHmoYbmnrbmj5DkvpvnmoTvvIlcclxuICogVEhFTUUg5a2X5q615Lya5qC55o2u5LiN5ZCM55qE5Li76aKY5pyJ5LiN5ZCM5YC8XHJcbiAqIOWcqOS9v+eUqGJvZHnnmoRzY3JvbGzml7bvvIzpnIDopoHliqDkuIrmoLflvI8gQ0xBU1NfQk9EWV9TQ1JPTExfV1JBUFxyXG4gKi9cclxudmFyIENMQVNTX1RIRU1FID0gJ21pbmlyZWZyZXNoLXRoZW1lLWRlZmF1bHQnO1xyXG52YXIgQ0xBU1NfRE9XTl9XUkFQID0gJ21pbmlyZWZyZXNoLWRvd253cmFwJztcclxudmFyIENMQVNTX1VQX1dSQVAgPSAnbWluaXJlZnJlc2gtdXB3cmFwJztcclxudmFyIENMQVNTX0ZBREVfSU4gPSAnbWluaXJlZnJlc2gtZmFkZS1pbic7XHJcbnZhciBDTEFTU19GQURFX09VVCA9ICdtaW5pcmVmcmVzaC1mYWRlLW91dCc7XHJcbnZhciBDTEFTU19UT19UT1AgPSAnbWluaXJlZnJlc2gtdG90b3AnO1xyXG52YXIgQ0xBU1NfUk9UQVRFID0gJ21pbmlyZWZyZXNoLXJvdGF0ZSc7XHJcbnZhciBDTEFTU19IQVJEV0FSRV9TUEVFRFVQID0gJ21pbmlyZWZyZXNoLWhhcmR3YXJlLXNwZWVkdXAnO1xyXG52YXIgQ0xBU1NfSElEREVOID0gJ21pbmlyZWZyZXNoLWhpZGRlbic7XHJcbnZhciBDTEFTU19CT0RZX1NDUk9MTF9XUkFQID0gJ2JvZHktc2Nyb2xsLXdyYXAnO1xyXG5cclxuLyoqXHJcbiAqIOacrOS4u+mimOeahOeJueiJsuagt+W8j1xyXG4gKi9cclxudmFyIENMQVNTX0RPV05fU1VDQ0VTUyA9ICdkb3dud3JhcC1zdWNjZXNzJztcclxudmFyIENMQVNTX0RPV05fRVJST1IgPSAnZG93bndyYXAtZXJyb3InO1xyXG5cclxuLyoqXHJcbiAqIOS4gOS6m+W4uOmHj1xyXG4gKi9cclxudmFyIERFRkFVTFRfRE9XTl9IRUlHSFQgPSA3NTtcclxuXHJcbnZhciBkZWZhdWx0U2V0dGluZyA9IHtcclxuICAgIGRvd246IHtcclxuICAgICAgICBzdWNjZXNzQW5pbToge1xyXG4gICAgICAgICAgICAvLyDkuIvmi4nliLfmlrDnu5PmnZ/lkI7mmK/lkKbmnInmiJDlip/liqjnlLvvvIzpu5jorqTkuLpmYWxzZe+8jOWmguaenOaDs+imgeacieaIkOWKn+WIt+aWsHh4eOadoeaVsOaNrui/meenjeaTjeS9nO+8jOivt+iuvuS4unRydWXvvIzlubblrp7njrDlr7nlupRob29r5Ye95pWwXHJcbiAgICAgICAgICAgIGlzRW5hYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgZHVyYXRpb246IDMwMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5Y+v6YCJ77yM5Zyo5LiL5ouJ5Y+v5Yi35paw54q25oCB5pe277yM5LiL5ouJ5Yi35paw5o6n5Lu25LiK5pi+56S655qE5qCH6aKY5YaF5a65XHJcbiAgICAgICAgY29udGVudGRvd246ICfkuIvmi4nliLfmlrAnLFxyXG4gICAgICAgIC8vIOWPr+mAie+8jOWcqOmHiuaUvuWPr+WIt+aWsOeKtuaAgeaXtu+8jOS4i+aLieWIt+aWsOaOp+S7tuS4iuaYvuekuueahOagh+mimOWGheWuuVxyXG4gICAgICAgIGNvbnRlbnRvdmVyOiAn6YeK5pS+5Yi35pawJyxcclxuICAgICAgICAvLyDlj6/pgInvvIzmraPlnKjliLfmlrDnirbmgIHml7bvvIzkuIvmi4nliLfmlrDmjqfku7bkuIrmmL7npLrnmoTmoIfpopjlhoXlrrlcclxuICAgICAgICBjb250ZW50cmVmcmVzaDogJ+WKoOi9veS4rS4uLicsXHJcbiAgICAgICAgLy8g5Y+v6YCJ77yM5Yi35paw5oiQ5Yqf55qE5o+Q56S677yM5b2T5byA5ZCvc3VjY2Vzc0FuaW3ml7bmiY3mnInmlYhcclxuICAgICAgICBjb250ZW50c3VjY2VzczogJ+WIt+aWsOaIkOWKnycsXHJcbiAgICAgICAgLy8g5Y+v6YCJ77yM5Yi35paw5aSx6LSl55qE5o+Q56S677yM6ZSZ6K+v5Zue6LCD55So5Yiw77yM5b2T5byA5ZCvc3VjY2Vzc0FuaW3ml7bmiY3mnInmlYhcclxuICAgICAgICBjb250ZW50ZXJyb3I6ICfliLfmlrDlpLHotKUnLFxyXG4gICAgICAgIC8vIOaYr+WQpum7mOiupOi3n+maj+i/m+ihjGNzc+WKqOeUu1xyXG4gICAgICAgIGlzV3JhcENzc1RyYW5zbGF0ZTogZmFsc2VcclxuICAgIH0sXHJcbiAgICB1cDoge1xyXG4gICAgICAgIHRvVG9wOiB7XHJcbiAgICAgICAgICAgIC8vIOaYr+WQpuW8gOWQr+eCueWHu+WbnuWIsOmhtumDqFxyXG4gICAgICAgICAgICBpc0VuYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZHVyYXRpb246IDMwMCxcclxuICAgICAgICAgICAgLy8g5rua5Yqo5aSa5bCR6Led56a75omN5pi+56S6dG9Ub3BcclxuICAgICAgICAgICAgb2Zmc2V0OiA4MDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbnRlbnRkb3duOiAn5LiK5ouJ5pi+56S65pu05aSaJyxcclxuICAgICAgICBjb250ZW50cmVmcmVzaDogJ+WKoOi9veS4rS4uLicsXHJcbiAgICAgICAgY29udGVudG5vbW9yZTogJ+ayoeacieabtOWkmuaVsOaNruS6hidcclxuICAgIH1cclxufTtcclxuXHJcbnZhciBkZWZhdWx0cyA9IGNvcmUuZXh0ZW5kKHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgLy8g5ouT5bGV6Ieq5a6a5LmJ55qE6YWN572uXHJcbiAgICAgICAgb3B0aW9ucyA9IHV0aWxzLmV4dGVuZCh0cnVlLCB7fSwgZGVmYXVsdFNldHRpbmcsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuX3N1cGVyKG9wdGlvbnMpO1xyXG4gICAgfSxcclxuICAgIF9pbml0SG9vazogZnVuY3Rpb24gKGlzTG9ja0Rvd24sIGlzTG9ja1VwKSB7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLFxyXG4gICAgICAgICAgICBjb250ZW50V3JhcCA9IHRoaXMuY29udGVudFdyYXA7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKENMQVNTX1RIRU1FKTtcclxuICAgICAgICAvLyDliqDkuIrnoazku7bliqDpgJ/orqnliqjnlLvmm7TmtYHnlYVcclxuICAgICAgICBjb250ZW50V3JhcC5jbGFzc0xpc3QuYWRkKENMQVNTX0hBUkRXQVJFX1NQRUVEVVApO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzVXNlQm9keVNjcm9sbCkge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzkvb/nlKjkuoZib2R555qEc2Nyb2xs77yM6ZyA6KaB5aKe5Yqg5a+55bqU55qE5qC35byP77yM5ZCm5YiZ6buY6K6k55qEYWJzb2x1dGXml6Dms5Xooqvnm5HlkKzliLBcclxuICAgICAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoQ0xBU1NfQk9EWV9TQ1JPTExfV1JBUCk7XHJcbiAgICAgICAgICAgIGNvbnRlbnRXcmFwLmNsYXNzTGlzdC5hZGQoQ0xBU1NfQk9EWV9TQ1JPTExfV1JBUCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9pbml0RG93bldyYXAoKTtcclxuICAgICAgICB0aGlzLl9pbml0VXBXcmFwKCk7XHJcbiAgICAgICAgLy90aGlzLl9pbml0VG9Ub3AoKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliLfmlrDnmoTlrp7njrDvvIzpnIDopoHmoLnmja7mlrDphY3nva7ov5vooYzkuIDkupvmm7TmlLlcclxuICAgICAqL1xyXG4gICAgX3JlZnJlc2hIb29rOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5aaC5p6c5byA5YWzY3NzdHJhbnNsYXRl77yM6ZyA6KaB5YW85a65XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kb3duLmlzV3JhcENzc1RyYW5zbGF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl90cmFuc2Zvcm1Eb3duV3JhcCgtdGhpcy5kb3duV3JhcEhlaWdodCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fdHJhbnNmb3JtRG93bldyYXAoMCwgMCwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB0b1RvcOeahOaYvuW9seaOp+WItu+8jOWmguaenOacrOi6q+aYvuekuuS6hu+8jOWPiOabtOaWsOS4uumakOiXj++8jOmcgOimgemprOS4iumakOiXj1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnVwLnRvVG9wLmlzRW5hYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMudG9Ub3BCdG4gJiYgdGhpcy50b1RvcEJ0bi5jbGFzc0xpc3QuYWRkKENMQVNTX0hJRERFTik7XHJcbiAgICAgICAgICAgIHRoaXMuaXNTaG93VG9Ub3BCdG4gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2luaXREb3duV3JhcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcixcclxuICAgICAgICAgICAgY29udGVudFdyYXAgPSB0aGlzLmNvbnRlbnRXcmFwLFxyXG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG5cclxuICAgICAgICAvLyDkuIvmi4nnmoTljLrln59cclxuICAgICAgICB2YXIgZG93bldyYXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcbiAgICAgICAgZG93bldyYXAuY2xhc3NOYW1lID0gQ0xBU1NfRE9XTl9XUkFQICsgJyAnICsgQ0xBU1NfSEFSRFdBUkVfU1BFRURVUDtcclxuICAgICAgICBkb3duV3JhcC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImRvd253cmFwLWNvbnRlbnRcIj48cCBjbGFzcz1cImRvd253cmFwLXByb2dyZXNzXCI+PC9wPjxwIGNsYXNzPVwiZG93bndyYXAtdGlwc1wiPicgKyBvcHRpb25zLmRvd24uY29udGVudGRvd24gKyAnIDwvcD48L2Rpdj4nO1xyXG4gICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoZG93bldyYXAsIGNvbnRlbnRXcmFwKTtcclxuXHJcbiAgICAgICAgdGhpcy5kb3duV3JhcCA9IGRvd25XcmFwO1xyXG4gICAgICAgIHRoaXMuZG93bldyYXBQcm9ncmVzcyA9IHRoaXMuZG93bldyYXAucXVlcnlTZWxlY3RvcignLmRvd253cmFwLXByb2dyZXNzJyk7XHJcbiAgICAgICAgdGhpcy5kb3duV3JhcFRpcHMgPSB0aGlzLmRvd25XcmFwLnF1ZXJ5U2VsZWN0b3IoJy5kb3dud3JhcC10aXBzJyk7XHJcbiAgICAgICAgLy8g5piv5ZCm6IO95LiL5ouJ55qE5Y+Y6YeP77yM5o6n5Yi2cHVsbOaXtueahOeKtuaAgei9rOWPmFxyXG4gICAgICAgIHRoaXMuaXNDYW5QdWxsRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmRvd25XcmFwSGVpZ2h0ID0gZG93bldyYXAub2Zmc2V0SGVpZ2h0IHx8IERFRkFVTFRfRE9XTl9IRUlHSFQ7XHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRG93bldyYXAoLXRoaXMuZG93bldyYXBIZWlnaHQpO1xyXG4gICAgfSxcclxuICAgIF90cmFuc2Zvcm1Eb3duV3JhcDogZnVuY3Rpb24gKG9mZnNldCwgZHVyYXRpb24sIGlzRm9yY2UpIHtcclxuICAgICAgICBpZiAoIWlzRm9yY2UgJiYgIXRoaXMub3B0aW9ucy5kb3duLmlzV3JhcENzc1RyYW5zbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xyXG4gICAgICAgIGR1cmF0aW9uID0gZHVyYXRpb24gfHwgMDtcclxuICAgICAgICAvLyDorrDlvpfliqjnlLvml7YgdHJhbnNsYXRlWiDlkKbliJnnoazku7bliqDpgJ/kvJrooqvopobnm5ZcclxuICAgICAgICB0aGlzLmRvd25XcmFwLnN0eWxlLndlYmtpdFRyYW5zaXRpb25EdXJhdGlvbiA9IGR1cmF0aW9uICsgJ21zJztcclxuICAgICAgICB0aGlzLmRvd25XcmFwLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGR1cmF0aW9uICsgJ21zJztcclxuICAgICAgICB0aGlzLmRvd25XcmFwLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKCcgKyBvZmZzZXQgKyAncHgpICB0cmFuc2xhdGVaKDBweCknO1xyXG4gICAgICAgIHRoaXMuZG93bldyYXAuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoJyArIG9mZnNldCArICdweCkgIHRyYW5zbGF0ZVooMHB4KSc7XHJcbiAgICB9LFxyXG5cclxuICAgIF9pbml0VXBXcmFwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGNvbnRlbnRXcmFwID0gdGhpcy5jb250ZW50V3JhcCxcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcclxuXHJcbiAgICAgICAgLy8g5LiK5ouJ5Yy65Z+fXHJcbiAgICAgICAgdmFyIHVwV3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuICAgICAgICB1cFdyYXAuY2xhc3NOYW1lID0gQ0xBU1NfVVBfV1JBUCArICcgJyArIENMQVNTX0hBUkRXQVJFX1NQRUVEVVA7XHJcbiAgICAgICAgdXBXcmFwLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cInVwd3JhcC1wcm9ncmVzc1wiPjwvcD48cCBjbGFzcz1cInVwd3JhcC10aXBzXCI+JyArIG9wdGlvbnMudXAuY29udGVudGRvd24gKyAnPC9wPic7XHJcbiAgICAgICAgdXBXcmFwLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcclxuICAgICAgICBjb250ZW50V3JhcC5hcHBlbmRDaGlsZCh1cFdyYXApO1xyXG5cclxuICAgICAgICB0aGlzLnVwV3JhcCA9IHVwV3JhcDtcclxuICAgICAgICB0aGlzLnVwV3JhcFByb2dyZXNzID0gdGhpcy51cFdyYXAucXVlcnlTZWxlY3RvcignLnVwd3JhcC1wcm9ncmVzcycpO1xyXG4gICAgICAgIHRoaXMudXBXcmFwVGlwcyA9IHRoaXMudXBXcmFwLnF1ZXJ5U2VsZWN0b3IoJy51cHdyYXAtdGlwcycpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOiHquWumuS5ieWunueOsOS4gOS4qnRvVG9w77yM55Sx5LqO6L+Z5Liq5piv5bGe5LqO6aKd5aSW55qE5LqL5Lu25omA5Lul5rKh5pyJ5re75Yqg55qE5qC45b+D5Lit77yM6ICM5piv55Sx5ZCE6Ieq55qE5Li76aKY5Yaz5a6a5piv5ZCm5a6e546w5oiW6ICF5a6e546w5oiQ5LuA5LmI5qC35a2QXHJcbiAgICAgKiDkuI3ov4fmoYbmnrbkuK3ku43nhLbmj5DkvpvkuobkuIDkuKrpu5jorqTnmoRtaW5pcmVmcmVzaC10b3RvcOagt+W8j++8jOWPr+S7peaWueS+v+S9v+eUqFxyXG4gICAgICovXHJcbiAgICBfaW5pdFRvVG9wOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxyXG4gICAgICAgICAgICB0b1RvcCA9IG9wdGlvbnMudXAudG9Ub3AuaXNFbmFibGUsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uID0gb3B0aW9ucy51cC50b1RvcC5kdXJhdGlvbjtcclxuXHJcbiAgICAgICAgaWYgKHRvVG9wKSB7XHJcbiAgICAgICAgICAgIHZhciB0b1RvcEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuICAgICAgICAgICAgdG9Ub3BCdG4uY2xhc3NOYW1lID0gQ0xBU1NfVE9fVE9QICsgJyAnICsgQ0xBU1NfVEhFTUU7XHJcblxyXG4gICAgICAgICAgICB0b1RvcEJ0bi5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zY3JvbGxlci5zY3JvbGxUbygwLCBkdXJhdGlvbik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRvVG9wQnRuLmNsYXNzTGlzdC5hZGQoQ0xBU1NfSElEREVOKTtcclxuICAgICAgICAgICAgdGhpcy50b1RvcEJ0biA9IHRvVG9wQnRuO1xyXG4gICAgICAgICAgICB0aGlzLmlzU2hvd1RvVG9wQnRuID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIOm7mOiupOa3u+WKoOWIsGJvZHnkuK3pmLLmraLlhrLnqoFcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b1RvcEJ0bik7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9wdWxsSG9vazogZnVuY3Rpb24gKGRvd25IaWdodCwgZG93bk9mZnNldCkge1xyXG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxyXG4gICAgICAgICAgICBGVUxMX0RFR1JFRSA9IDM2MDtcclxuXHJcbiAgICAgICAgaWYgKGRvd25IaWdodCA8IGRvd25PZmZzZXQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNDYW5QdWxsRG93bikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kb3duV3JhcFRpcHMuaW5uZXJUZXh0ID0gb3B0aW9ucy5kb3duLmNvbnRlbnRkb3duO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0NhblB1bGxEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNDYW5QdWxsRG93bikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kb3duV3JhcFRpcHMuaW5uZXJUZXh0ID0gb3B0aW9ucy5kb3duLmNvbnRlbnRvdmVyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0NhblB1bGxEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHJhdGUgPSBkb3duSGlnaHQgLyBkb3duT2Zmc2V0LFxyXG4gICAgICAgICAgICBwcm9ncmVzcyA9IEZVTExfREVHUkVFICogcmF0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5kb3duV3JhcFByb2dyZXNzLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICdyb3RhdGUoJyArIHByb2dyZXNzICsgJ2RlZyknO1xyXG4gICAgICAgIHRoaXMuZG93bldyYXBQcm9ncmVzcy5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlKCcgKyBwcm9ncmVzcyArICdkZWcpJztcclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm1Eb3duV3JhcCgtdGhpcy5kb3duV3JhcEhlaWdodCArIGRvd25IaWdodCk7XHJcbiAgICB9LFxyXG4gICAgX3Njcm9sbEhvb2s6IGZ1bmN0aW9uIChzY3JvbGxUb3ApIHtcclxuICAgICAgICAvLyDnlKjmnaXliKTmlq10b1RvcFxyXG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxyXG4gICAgICAgICAgICB0b1RvcCA9IG9wdGlvbnMudXAudG9Ub3AuaXNFbmFibGUsXHJcbiAgICAgICAgICAgIHRvVG9wQnRuID0gdGhpcy50b1RvcEJ0bjtcclxuXHJcbiAgICAgICAgaWYgKHRvVG9wICYmIHRvVG9wQnRuKSB7XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPj0gb3B0aW9ucy51cC50b1RvcC5vZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1Nob3dUb1RvcEJ0bikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvVG9wQnRuLmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfRkFERV9PVVQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvVG9wQnRuLmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfSElEREVOKTtcclxuICAgICAgICAgICAgICAgICAgICB0b1RvcEJ0bi5jbGFzc0xpc3QuYWRkKENMQVNTX0ZBREVfSU4pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaG93VG9Ub3BCdG4gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTaG93VG9Ub3BCdG4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0b1RvcEJ0bi5jbGFzc0xpc3QuYWRkKENMQVNTX0ZBREVfT1VUKTtcclxuICAgICAgICAgICAgICAgICAgICB0b1RvcEJ0bi5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX0ZBREVfSU4pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaG93VG9Ub3BCdG4gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfZG93bkxvYWluZ0hvb2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDpu5jorqTlkoxjb250ZW50V3JhcOeahOWQjOatpVxyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybURvd25XcmFwKC10aGlzLmRvd25XcmFwSGVpZ2h0ICsgdGhpcy5vcHRpb25zLmRvd24ub2Zmc2V0LCB0aGlzLm9wdGlvbnMuZG93bi5ib3VuY2VUaW1lKTtcclxuICAgICAgICB0aGlzLmRvd25XcmFwVGlwcy5pbm5lclRleHQgPSB0aGlzLm9wdGlvbnMuZG93bi5jb250ZW50cmVmcmVzaDtcclxuICAgICAgICB0aGlzLmRvd25XcmFwUHJvZ3Jlc3MuY2xhc3NMaXN0LmFkZChDTEFTU19ST1RBVEUpO1xyXG4gICAgfSxcclxuICAgIF9kb3duTG9haW5nU3VjY2Vzc0hvb2s6IGZ1bmN0aW9uIChpc1N1Y2Nlc3MsIHN1Y2Nlc3NUaXBzKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmRvd24uY29udGVudHN1Y2Nlc3MgPSBzdWNjZXNzVGlwcyB8fCB0aGlzLm9wdGlvbnMuZG93bi5jb250ZW50c3VjY2VzcztcclxuICAgICAgICB0aGlzLmRvd25XcmFwVGlwcy5pbm5lclRleHQgPSBpc1N1Y2Nlc3MgPyB0aGlzLm9wdGlvbnMuZG93bi5jb250ZW50c3VjY2VzcyA6IHRoaXMub3B0aW9ucy5kb3duLmNvbnRlbnRlcnJvcjtcclxuICAgICAgICB0aGlzLmRvd25XcmFwUHJvZ3Jlc3MuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19ST1RBVEUpO1xyXG4gICAgICAgIHRoaXMuZG93bldyYXBQcm9ncmVzcy5jbGFzc0xpc3QuYWRkKENMQVNTX0ZBREVfT1VUKTtcclxuICAgICAgICB0aGlzLmRvd25XcmFwUHJvZ3Jlc3MuY2xhc3NMaXN0LmFkZChpc1N1Y2Nlc3MgPyBDTEFTU19ET1dOX1NVQ0NFU1MgOiBDTEFTU19ET1dOX0VSUk9SKTtcclxuICAgIH0sXHJcbiAgICBfZG93bkxvYWluZ0VuZEhvb2s6IGZ1bmN0aW9uIChpc1N1Y2Nlc3MpIHtcclxuICAgICAgICB0aGlzLmRvd25XcmFwVGlwcy5pbm5lclRleHQgPSB0aGlzLm9wdGlvbnMuZG93bi5jb250ZW50ZG93bjtcclxuICAgICAgICB0aGlzLmRvd25XcmFwUHJvZ3Jlc3MuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19ST1RBVEUpO1xyXG4gICAgICAgIHRoaXMuZG93bldyYXBQcm9ncmVzcy5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX0ZBREVfT1VUKTtcclxuICAgICAgICB0aGlzLmRvd25XcmFwUHJvZ3Jlc3MuY2xhc3NMaXN0LnJlbW92ZShpc1N1Y2Nlc3MgPyBDTEFTU19ET1dOX1NVQ0NFU1MgOiBDTEFTU19ET1dOX0VSUk9SKTtcclxuICAgICAgICAvLyDpu5jorqTkuLrkuI3lj6/op4FcclxuICAgICAgICAvLyDpnIDopoHph43nva7lm57mnaVcclxuICAgICAgICB0aGlzLmlzQ2FuUHVsbERvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm1Eb3duV3JhcCgtdGhpcy5kb3duV3JhcEhlaWdodCwgdGhpcy5vcHRpb25zLmRvd24uYm91bmNlVGltZSk7XHJcbiAgICB9LFxyXG4gICAgX2NhbmNlbExvYWluZ0hvb2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm1Eb3duV3JhcCgtdGhpcy5kb3duV3JhcEhlaWdodCwgdGhpcy5vcHRpb25zLmRvd24uYm91bmNlVGltZSk7XHJcbiAgICB9LFxyXG4gICAgX3VwTG9haW5nSG9vazogZnVuY3Rpb24gKGlzU2hvd1VwTG9hZGluZykge1xyXG4gICAgICAgIGlmIChpc1Nob3dVcExvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy51cFdyYXBUaXBzLmlubmVyVGV4dCA9IHRoaXMub3B0aW9ucy51cC5jb250ZW50cmVmcmVzaDtcclxuICAgICAgICAgICAgdGhpcy51cFdyYXBQcm9ncmVzcy5jbGFzc0xpc3QuYWRkKENMQVNTX1JPVEFURSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBXcmFwUHJvZ3Jlc3MuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19ISURERU4pO1xyXG4gICAgICAgICAgICB0aGlzLnVwV3JhcC5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBXcmFwLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuICAgIF91cExvYWluZ0VuZEhvb2s6IGZ1bmN0aW9uIChpc0ZpbmlzaFVwKSB7XHJcbiAgICAgICAgaWYgKCFpc0ZpbmlzaFVwKSB7XHJcbiAgICAgICAgICAgIC8vIOaOpeS4i+adpei/mOWPr+S7peWKoOi9veabtOWkmlxyXG4gICAgICAgICAgICB0aGlzLnVwV3JhcC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcbiAgICAgICAgICAgIHRoaXMudXBXcmFwVGlwcy5pbm5lclRleHQgPSB0aGlzLm9wdGlvbnMudXAuY29udGVudGRvd247XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8g5bey57uP5rKh5pyJ5pu05aSa5pWw5o2u5LqGXHJcbiAgICAgICAgICAgIHRoaXMudXBXcmFwLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XHJcbiAgICAgICAgICAgIHRoaXMudXBXcmFwVGlwcy5pbm5lclRleHQgPSB0aGlzLm9wdGlvbnMudXAuY29udGVudG5vbW9yZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51cFdyYXBQcm9ncmVzcy5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX1JPVEFURSk7XHJcbiAgICAgICAgdGhpcy51cFdyYXBQcm9ncmVzcy5jbGFzc0xpc3QuYWRkKENMQVNTX0hJRERFTik7XHJcbiAgICB9LFxyXG4gICAgX2xvY2tVcExvYWRpbmdIb29rOiBmdW5jdGlvbiAoaXNMb2NrKSB7XHJcbiAgICAgICAgdGhpcy51cFdyYXAuc3R5bGUudmlzaWJpbGl0eSA9IGlzTG9jayA/ICdoaWRkZW4nIDogJ3Zpc2libGUnO1xyXG4gICAgfSxcclxuICAgIF9sb2NrRG93bkxvYWRpbmdIb29rOiBmdW5jdGlvbiAoaXNMb2NrKSB7XHJcbiAgICAgICAgdGhpcy5kb3duV3JhcC5zdHlsZS52aXNpYmlsaXR5ID0gaXNMb2NrID8gJ2hpZGRlbicgOiAndmlzaWJsZSc7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLy8g5oyC6L295Li76aKY77yM6L+Z5qC35aSa5Liq5Li76aKY5Y+v5Lul5bm25a2Y77yMZGVmYXVsdOaYr+WFs+mUruWtl++8jOaJgOS7peS9v+eUqOS6hmRlZmF1bHRzXHJcbnV0aWxzLm5hbWVzcGFjZSgndGhlbWUuZGVmYXVsdHMnLCBkZWZhdWx0cyk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0c1xyXG5cclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdGhlbWUvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9jc3MvbWluaXJlZnJlc2guY3NzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxyXG4gKiBNaW5pUmVyZWZyZXNoIOeahOaguOW/g+S7o+egge+8jOS7o+eggeS4ree6puWumuWvueWklueahEFQSVxyXG4gKiDlj6/ku6XpgJrov4fnu6fmib8gIE1pbmlSZWZyZXNoQ29yZe+8jCDlvpfliLDkuIDkuKrkuLvpopjnsbvvvIznhLblkI7lnKjkuLvpopjnsbvkuK3lrp7njrBVSSBob29r5Ye95pWw5Y+v5Lul6L6+5Yiw5LiN5ZCM55qE5Yqo55S75pWI5p6cXHJcbiAqIOaguOW/g+exu+WGhemDqOayoeacieS7u+S9lVVJ5a6e546w77yM5omA5pyJ55qEVUnpg73kvp3otZbkuo7kuLvpopjnsbtcclxuICogXHJcbiAqIOS7peS4i+aYr+S4u+mimOexu+WPr+S7peWunueOsOeahEhvb2vvvIjkuLp1bmRlZmluZWTnmoTor53nm7jlvZPkuo7lv73nlaXvvIlcclxuICogX2luaXRIb29rKGlzTG9ja0Rvd24sIGlzTG9ja1VwKSAgICAgICAgICAgICAg5Yid5aeL5YyW5pe255qE5Zue6LCDXHJcbiAqIF9yZWZyZXNoSG9vayhpc0xvY2tEb3duLCBpc0xvY2tVcCkgICAgICAgICAgIOWIt+aWsG9wdGlvbnPml7bnmoTlm57osINcclxuICogX3B1bGxIb29rKGRvd25IaWdodCwgZG93bk9mZnNldCkgICAgICAgICAgICAg5LiL5ouJ6L+H56iL5Lit5oyB57ut5Zue6LCDXHJcbiAqIF9zY3JvbGxIb29rKHNjcm9sbFRvcCkgICAgICAgICAgICAgICAgICAgICAgIOa7muWKqOi/h+eoi+S4reaMgee7reWbnuiwg1xyXG4gKiBfZG93bkxvYWluZ0hvb2soKSAgICAgICAgICAgICAgICAgICAgICAgICAgICDkuIvmi4nop6blj5HnmoTpgqPkuIDliLvlm57osINcclxuICogX2Rvd25Mb2FpbmdTdWNjZXNzSG9vayhpc1N1Y2Nlc3MpICAgICAgICAgICAg5LiL5ouJ5Yi35paw55qE5oiQ5Yqf5Yqo55S777yM5aSE55CG5oiQ5Yqf5oiW5aSx6LSl5o+Q56S6XHJcbiAqIF9kb3duTG9haW5nRW5kSG9vayhpc1N1Y2Nlc3MpICAgICAgICAgICAgICAgIOS4i+aLieWIt+aWsOWKqOeUu+e7k+adn+WQjueahOWbnuiwg1xyXG4gKiBfY2FuY2VsTG9haW5nSG9vaygpICAgICAgICAgICAgICAgICAgICAgICAgICDlj5bmtohsb2FkaW5n55qE5Zue6LCDXHJcbiAqIF91cExvYWluZ0hvb2soKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOS4iuaLieinpuWPkeeahOmCo+S4gOWIu+Wbnuiwg1xyXG4gKiBfdXBMb2FpbmdFbmRIb29rKGlzRmluaXNoVXApICAgICAgICAgICAgICAgICDkuIrmi4nliqDovb3liqjnlLvnu5PmnZ/lkI7nmoTlm57osINcclxuICogX19sb2NrVXBMb2FkaW5nSG9vayhpc0xvY2spICAgICAgICAgICAgICAgICAgIOmUgeWumuS4iuaLieaXtueahOWbnuiwg1xyXG4gKiBfX2xvY2tEb3duTG9hZGluZ0hvb2soaXNMb2NrKSAgICAgICAgICAgICAgICAg6ZSB5a6a5LiL5ouJ5pe255qE5Zue6LCDXHJcbiAqIFxyXG4gKiBfYmVmb3JlRG93bkxvYWRpbmdIb29rKGRvd25IaWdodCwgZG93bk9mZnNldCnkuIDkuKrnibnmrornmoRob29r77yM6L+U5ZueZmFsc2Xml7bku6PooajkuI3kvJrotbDlhaXkuIvmi4nliLfmlrBsb2FkaW5n77yM5a6M5YWo6Ieq5a6a5LmJ5a6e546w5Yqo55S777yM6buY6K6k5Li66L+U5ZuedHJ1ZVxyXG4gKi9cclxuXHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCBzY3JvbGwgZnJvbSAnLi4vc2Nyb2xsJztcclxuXHJcbnZhciBkZWZhdWx0U2V0dGluZyA9IHtcclxuICAgIC8vIOS4i+aLieacieWFs1xyXG4gICAgZG93bjoge1xyXG4gICAgICAgIC8vIOm7mOiupOayoeaciemUgeWumu+8jOWPr+S7pemAmui/h0FQSeWKqOaAgeiuvue9rlxyXG4gICAgICAgIGlzTG9jazogZmFsc2UsXHJcbiAgICAgICAgLy8g5piv5ZCm6Ieq5Yqo5LiL5ouJ5Yi35pawXHJcbiAgICAgICAgaXNBdXRvOiBmYWxzZSxcclxuICAgICAgICAvLyDorr7nva5pc0F1dG89dHJ1ZeaXtueUn+aViO+8jOaYr+WQpuWcqOWIneWni+WMlueahOS4i+aLieWIt+aWsOinpuWPkeS6i+S7tuS4reaYvuekuuWKqOeUu++8jOWmguaenOaYr2ZhbHNl77yM5Yid5aeL5YyW55qE5Yqg6L295Y+q5Lya6Kem5Y+R5Zue6LCD77yM5LiN5Lya6Kem5Y+R5Yqo55S7XHJcbiAgICAgICAgaXNBbGxvd0F1dG9Mb2FkaW5nOiB0cnVlLFxyXG4gICAgICAgIC8vIOaYr+WQpuS4jeeuoeS7u+S9leaDheWGteS4i+mDveiDveinpuWPkeS4i+aLieWIt+aWsO+8jOS4umZhbHNl55qE6K+d5b2T5LiK5ouJ5pe25LiN5Lya6Kem5Y+R5LiL5ouJXHJcbiAgICAgICAgaXNBd2F5czogZmFsc2UsXHJcbiAgICAgICAgLy8g5piv5ZCmc2Nyb2xs5Zyo5LiL5ouJ5pe25Lya6L+b6KGMY3Nz56e75Yqo77yM6YCa6L+H5YWz6Zet5a6D5Y+v5Lul5a6e546w6Ieq5a6a5LmJ5Yqo55S7XHJcbiAgICAgICAgaXNTY3JvbGxDc3NUcmFuc2xhdGU6IHRydWUsXHJcbiAgICAgICAgLy8g5LiL5ouJ6KaB5aSn5LqO5aSa5bCR6ZW/5bqm5ZCO5YaN5LiL5ouJ5Yi35pawXHJcbiAgICAgICAgb2Zmc2V0OiA3NSxcclxuICAgICAgICAvLyDpmLvlsLzns7vmlbDvvIzkuIvmi4nlsI/kuo5vZmZzZXTml7bnmoTpmLvlsLzns7vmlbDvvIzlgLzotormjqXov5EwLOmrmOW6puWPmOWMlui2iuWwjyzooajnjrDkuLrotorlvoDkuIvotorpmr7mi4lcclxuICAgICAgICBkYW1wUmF0ZUJlZ2luOiAxLFxyXG4gICAgICAgIC8vIOmYu+WwvOezu+aVsO+8jOS4i+aLieeahOi3neemu+Wkp+S6jm9mZnNldOaXtizmlLnlj5jkuIvmi4nljLrln5/pq5jluqbmr5Tkvos75YC86LaK5o6l6L+RMCzpq5jluqblj5jljJbotorlsI8s6KGo546w5Li66LaK5b6A5LiL6LaK6Zq+5ouJXHJcbiAgICAgICAgZGFtcFJhdGU6IDAuMyxcclxuICAgICAgICAvLyDlm57lvLnliqjnlLvml7bpl7RcclxuICAgICAgICBib3VuY2VUaW1lOiAzMDAsXHJcbiAgICAgICAgc3VjY2Vzc0FuaW06IHtcclxuICAgICAgICAgICAgLy8g5LiL5ouJ5Yi35paw57uT5p2f5ZCO5piv5ZCm5pyJ5oiQ5Yqf5Yqo55S777yM6buY6K6k5Li6ZmFsc2XvvIzlpoLmnpzmg7PopoHmnInmiJDlip/liLfmlrB4eHjmnaHmlbDmja7ov5nnp43mk43kvZzvvIzor7forr7kuLp0cnVl77yM5bm25a6e546w5a+55bqUaG9va+WHveaVsFxyXG4gICAgICAgICAgICBpc0VuYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAzMDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOS4i+aLieaXtuS8muaPkOS+m+Wbnuiwg++8jOm7mOiupOS4um51bGzkuI3kvJrmiafooYxcclxuICAgICAgICBvblB1bGw6IG51bGwsXHJcbiAgICAgICAgLy8g5Y+W5raI5pe25Zue6LCDXHJcbiAgICAgICAgb25DYWxjZWw6IG51bGwsXHJcbiAgICAgICAgY2FsbGJhY2s6IHV0aWxzLm5vb3BcclxuICAgIH0sXHJcbiAgICAvLyDkuIrmi4nmnInlhbNcclxuICAgIHVwOiB7XHJcbiAgICAgICAgLy8g6buY6K6k5rKh5pyJ6ZSB5a6a77yM5Y+v5Lul6YCa6L+HQVBJ5Yqo5oCB6K6+572uXHJcbiAgICAgICAgaXNMb2NrOiBmYWxzZSxcclxuICAgICAgICAvLyDmmK/lkKboh6rliqjkuIrmi4nliqDovb0t5Yid5aeL5YyW5piv5piv5ZCm6Ieq5YqoXHJcbiAgICAgICAgaXNBdXRvOiB0cnVlLFxyXG4gICAgICAgIC8vIOaYr+WQpum7mOiupOaYvuekuuS4iuaLiei/m+W6puadoe+8jOWPr+S7pemAmui/h0FQSeaUueWPmFxyXG4gICAgICAgIGlzU2hvd1VwTG9hZGluZzogdHJ1ZSxcclxuICAgICAgICAvLyDot53nprvlupXpg6jpq5jluqYo5Yiw6L6+6K+l6auY5bqm5Y2z6Kem5Y+RKVxyXG4gICAgICAgIG9mZnNldDogMTAwLFxyXG4gICAgICAgIGxvYWRGdWxsOiB7XHJcbiAgICAgICAgICAgIC8vIOW8gOWQr+mFjee9ruWQju+8jOWPquimgeayoea7oeWxj+W5le+8jOWwseS8muiHquWKqOWKoOi9vVxyXG4gICAgICAgICAgICBpc0VuYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZGVsYXk6IDMwMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5rua5Yqo5pe25Lya5o+Q5L6b5Zue6LCD77yM6buY6K6k5Li6bnVsbOS4jeS8muaJp+ihjFxyXG4gICAgICAgIG9uU2Nyb2xsOiBudWxsLFxyXG4gICAgICAgIGNhbGxiYWNrOiB1dGlscy5ub29wXHJcbiAgICB9LFxyXG4gICAgLy8g5a655ZmoXHJcbiAgICBjb250YWluZXI6ICcjbWluaXJlZnJlc2gnLFxyXG4gICAgLy8g5piv5ZCm6ZSB5a6a5qiq5ZCR5ruR5Yqo77yM5aaC5p6c6ZSB5a6a5YiZ5Y6f55Sf5rua5Yqo5p2h5peg5rOV5ruR5YqoXHJcbiAgICBpc0xvY2tYOiB0cnVlLFxyXG4gICAgLy8g5piv5ZCm5L2/55SoYm9keeWvueixoeeahHNjcm9sbOiAjOS4jeaYr21pbmlyZWZyZXNoLXNjcm9sbOWvueixoeeahHNjcm9sbFxyXG4gICAgLy8g5byA5ZCv5ZCO5LiA5Liq6aG16Z2i5Y+q6IO95pyJ5LiA5Liq5LiL5ouJ5Yi35paw77yM5ZCm5YiZ5Lya5pyJ5Yay56qBXHJcbiAgICBpc1VzZUJvZHlTY3JvbGw6IGZhbHNlXHJcbn07XHJcblxyXG52YXIgY29yZSA9IHV0aWxzLkNsYXp6LmV4dGVuZCh7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJ3lp4vljJZcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIOmFjee9ruS/oeaBr1xyXG4gICAgICovXHJcbiAgICBpbml0OiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIG9wdGlvbnMgPSB1dGlscy5leHRlbmQodHJ1ZSwge30sIGRlZmF1bHRTZXR0aW5nLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSB1dGlscy5zZWxlY3RvcihvcHRpb25zLmNvbnRhaW5lcik7XHJcbiAgICAgICAgLy8gc2Nyb2xs55qEZG9tLXdyYXBwZXLkuIvnmoTnrKzkuIDkuKroioLngrnvvIzkvZznlKjmmK9kb3du5Yqo55S75pe255qE5pON5L2cXHJcbiAgICAgICAgdGhpcy5jb250ZW50V3JhcCA9IHRoaXMuY29udGFpbmVyLmNoaWxkcmVuWzBdO1xyXG4gICAgICAgIC8vIOm7mOiupOWSjGNvbnRlbnRXcmFw5LiA6Ie077yM5L2G5piv5Li65LqG5YW85a65Ym9keeeahOa7muWKqO+8jOaLhuWIhuS4uuS4pOS4quWvueixoeaWueS+v+WkhOeQhlxyXG4gICAgICAgIC8vIOWmguaenOaYr+S9v+eUqGJvZHnnmoTmg4XlhrXvvIxzY3JvbGxXcmFw5oGS5Li6Ym9keVxyXG4gICAgICAgIHRoaXMuc2Nyb2xsV3JhcCA9IG9wdGlvbnMuaXNVc2VCb2R5U2Nyb2xsID8gZG9jdW1lbnQuYm9keSA6IHRoaXMuY29udGVudFdyYXA7XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcblxyXG4gICAgICAgIC8vIOWIneWni+WMlueahGhvb2tcclxuICAgICAgICB0aGlzLl9pbml0SG9vayAmJiB0aGlzLl9pbml0SG9vayh0aGlzLm9wdGlvbnMuZG93bi5pc0xvY2ssIHRoaXMub3B0aW9ucy51cC5pc0xvY2spO1xyXG5cclxuICAgICAgICAvLyDnlJ/miJDkuIDkuKpTY3JvbGzlr7nosaEg77yM5a+56LGh5YaF6YOo5aSE55CG5ruR5Yqo55uR5ZCsXHJcbiAgICAgICAgdGhpcy5zY3JvbGxlciA9IG5ldyBzY3JvbGwodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2luaXRFdmVudCgpO1xyXG5cclxuICAgICAgICAvLyDlpoLmnpzliJ3lp4vljJbml7bplIHlrprkuobvvIzpnIDopoHop6blj5HplIHlrprvvIzpgb/lhY3msqHmnInplIHlrprml7bop6PplIHvvIjkvJrop6blj5HpgLvovpFidWfvvIlcclxuICAgICAgICBvcHRpb25zLnVwLmlzTG9jayAmJiB0aGlzLl9sb2NrVXBMb2FkaW5nKG9wdGlvbnMudXAuaXNMb2NrKTtcclxuICAgICAgICBvcHRpb25zLmRvd24uaXNMb2NrICYmIHRoaXMuX2xvY2tEb3duTG9hZGluZyhvcHRpb25zLmRvd24uaXNMb2NrKTtcclxuICAgIH0sXHJcbiAgICBfcmVzZXRPcHRpb25zOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcbiAgICAgICAgdGhpcy5fbG9ja1VwTG9hZGluZyhvcHRpb25zLnVwLmlzTG9jayk7XHJcbiAgICAgICAgdGhpcy5fbG9ja0Rvd25Mb2FkaW5nKG9wdGlvbnMuZG93bi5pc0xvY2spO1xyXG4gICAgfSxcclxuICAgIF9pbml0RXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSBzZWxmLm9wdGlvbnM7XHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIub24oJ2Rvd25Mb2FkaW5nJywgZnVuY3Rpb24gKGlzSGlkZUxvYWRpbmcpIHtcclxuICAgICAgICAgICAgIWlzSGlkZUxvYWRpbmcgJiYgc2VsZi5fZG93bkxvYWluZ0hvb2sgJiYgc2VsZi5fZG93bkxvYWluZ0hvb2soKTtcclxuICAgICAgICAgICAgb3B0aW9ucy5kb3duLmNhbGxiYWNrICYmIG9wdGlvbnMuZG93bi5jYWxsYmFjaygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbGVyLm9uKCdjYW5jZWxMb2FkaW5nJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLl9jYW5jZWxMb2FpbmdIb29rICYmIHNlbGYuX2NhbmNlbExvYWluZ0hvb2soKTtcclxuICAgICAgICAgICAgb3B0aW9ucy5kb3duLm9uQ2FsY2VsICYmIG9wdGlvbnMuZG93bi5vbkNhbGNlbCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbGVyLm9uKCd1cExvYWRpbmcnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuX3VwTG9haW5nSG9vayAmJiBzZWxmLl91cExvYWluZ0hvb2soc2VsZi5vcHRpb25zLnVwLmlzU2hvd1VwTG9hZGluZyk7XHJcbiAgICAgICAgICAgIG9wdGlvbnMudXAuY2FsbGJhY2sgJiYgb3B0aW9ucy51cC5jYWxsYmFjaygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbGVyLm9uKCdwdWxsJywgZnVuY3Rpb24gKGRvd25IaWdodCwgZG93bk9mZnNldCkge1xyXG4gICAgICAgICAgICBzZWxmLl9wdWxsSG9vayAmJiBzZWxmLl9wdWxsSG9vayhkb3duSGlnaHQsIGRvd25PZmZzZXQpO1xyXG4gICAgICAgICAgICBvcHRpb25zLmRvd24ub25QdWxsICYmIG9wdGlvbnMuZG93bi5vblB1bGwoZG93bkhpZ2h0LCBkb3duT2Zmc2V0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zY3JvbGxlci5vbignc2Nyb2xsJywgZnVuY3Rpb24gKHNjcm9sbFRvcCkge1xyXG4gICAgICAgICAgICBzZWxmLl9zY3JvbGxIb29rICYmIHNlbGYuX3Njcm9sbEhvb2soc2Nyb2xsVG9wKTtcclxuICAgICAgICAgICAgb3B0aW9ucy51cC5vblNjcm9sbCAmJiBvcHRpb25zLnVwLm9uU2Nyb2xsKHNjcm9sbFRvcCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIOajgOafpeaYr+WQpuWFgeiuuOaZrumAmueahOWKoOi9veS4re+8jOWmguaenOi/lOWbnmZhbHNl77yM5bCx5Luj6KGo6Ieq5a6a5LmJ5LiL5ouJ5Yi35paw77yM6YCa5bi46Ieq5bex5aSE55CGXHJcbiAgICAgICAgdGhpcy5zY3JvbGxlci5ob29rKCdiZWZvcmVEb3duTG9hZGluZycsIGZ1bmN0aW9uIChkb3duSGlnaHQsIGRvd25PZmZzZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICFzZWxmLl9iZWZvcmVEb3duTG9hZGluZ0hvb2sgfHwgc2VsZi5fYmVmb3JlRG93bkxvYWRpbmdIb29rKGRvd25IaWdodCwgZG93bk9mZnNldCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YaF6YOo5omn6KGM77yM57uT5p2f5LiL5ouJ5Yi35pawXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzU3VjY2VzcyDmmK/lkKbkuIvmi4nor7fmsYLmiJDlip9cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdWNjZXNzVGlwcyDpnIDopoHmm7TmlrDnmoTmiJDlip/mj5DnpLpcclxuICAgICAqIOWcqOW8gOWQr+S6huaIkOWKn+WKqOeUu+aXtu+8jOW+gOW+gOaIkOWKn+eahOaPkOekuuaYr+mcgOimgeeUseWkluS8oOWFpeWKqOaAgeabtOaWsOeahO+8jOitrOWmgiAgdXBkYXRlIDEwIG5ld3NcclxuICAgICAqL1xyXG4gICAgX2VuZERvd25Mb2FkaW5nOiBmdW5jdGlvbiAoaXNTdWNjZXNzLCBzdWNjZXNzVGlwcykge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZG93bikge1xyXG4gICAgICAgICAgICAvLyDpmLLmraLmsqHkvKBkb3du5a+86Ie06ZSZ6K+vXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNjcm9sbGVyLmRvd25Mb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIC8vIOW/hemhu+aYr2xvYWRpbmfml7bmiY3lhYHorrjmiafooYzlr7nlupRob29rXHJcbiAgICAgICAgICAgIHZhciBzdWNjZXNzQW5pbSA9IHRoaXMub3B0aW9ucy5kb3duLnN1Y2Nlc3NBbmltLmlzRW5hYmxlLFxyXG4gICAgICAgICAgICAgICAgc3VjY2Vzc0FuaW1UaW1lID0gdGhpcy5vcHRpb25zLmRvd24uc3VjY2Vzc0FuaW0uZHVyYXRpb247XHJcblxyXG4gICAgICAgICAgICBpZiAoc3VjY2Vzc0FuaW0pIHtcclxuICAgICAgICAgICAgICAgIC8vIOWmguaenOacieaIkOWKn+WKqOeUuyAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Rvd25Mb2FpbmdTdWNjZXNzSG9vayAmJiB0aGlzLl9kb3duTG9haW5nU3VjY2Vzc0hvb2soaXNTdWNjZXNzLCBzdWNjZXNzVGlwcyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyDpu5jorqTkuLrmsqHmnInmiJDlip/liqjnlLtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3NBbmltVGltZSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8g5oiQ5Yqf5Yqo55S757uT5p2f5ZCO5bCx5Y+v5Lul6YeN572u5L2N572u5LqGXHJcbiAgICAgICAgICAgICAgICBzZWxmLnNjcm9sbGVyLmVuZERvd25Mb2FkaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAvLyDop6blj5Hnu5PmnZ9ob29rXHJcbiAgICAgICAgICAgICAgICBzZWxmLl9kb3duTG9haW5nRW5kSG9vayAmJiBzZWxmLl9kb3duTG9haW5nRW5kSG9vayhpc1N1Y2Nlc3MpO1xyXG5cclxuICAgICAgICAgICAgfSwgc3VjY2Vzc0FuaW1UaW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YaF6YOo5omn6KGM77yM57uT5p2f5LiK5ouJ5Yqg6L29XHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzRmluaXNoVXAg5piv5ZCm57uT5p2f5LqG5LiK5ouJ5Yqg6L29XHJcbiAgICAgKi9cclxuICAgIF9lbmRVcExvYWRpbmc6IGZ1bmN0aW9uIChpc0ZpbmlzaFVwKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsZXIudXBMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuZW5kVXBMb2FkaW5nKGlzRmluaXNoVXApO1xyXG4gICAgICAgICAgICB0aGlzLl91cExvYWluZ0VuZEhvb2sgJiYgdGhpcy5fdXBMb2FpbmdFbmRIb29rKGlzRmluaXNoVXApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43mlrDliLfmlrDkuIrmi4nliqDovb3vvIzliLfmlrDlkI7kvJrlj5jkuLrlj6/ku6XkuIrmi4nliqDovb1cclxuICAgICAqL1xyXG4gICAgX3Jlc2V0VXBMb2FkaW5nOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxlci5yZXNldFVwTG9hZGluZygpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmUgeWumuS4iuaLieWKoOi9vVxyXG4gICAgICog5bCG5byA5ZCv5ZKM56aB5q2i5ZCI5bm25oiQ5LiA5Liq6ZSB5a6aQVBJXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzTG9jayDmmK/lkKbplIHlrppcclxuICAgICAqL1xyXG4gICAgX2xvY2tVcExvYWRpbmc6IGZ1bmN0aW9uIChpc0xvY2spIHtcclxuICAgICAgICB0aGlzLnNjcm9sbGVyLmxvY2tVcChpc0xvY2spO1xyXG4gICAgICAgIHRoaXMuX2xvY2tVcExvYWRpbmdIb29rICYmIHRoaXMuX2xvY2tVcExvYWRpbmdIb29rKGlzTG9jayk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6ZSB5a6a5LiL5ouJ5Yi35pawXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzTG9jayDmmK/lkKbplIHlrppcclxuICAgICAqL1xyXG4gICAgX2xvY2tEb3duTG9hZGluZzogZnVuY3Rpb24gKGlzTG9jaykge1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIubG9ja0Rvd24oaXNMb2NrKTtcclxuICAgICAgICB0aGlzLl9sb2NrRG93bkxvYWRpbmdIb29rICYmIHRoaXMuX2xvY2tEb3duTG9hZGluZ0hvb2soaXNMb2NrKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliLfmlrBtaW5pcmVmcmVzaOeahOmFjee9ru+8jOWFs+mUruaAp+eahOmFjee9ruivt+S4jeimgeabtOaWsO+8jOWmguWuueWZqO+8jOWbnuiwg+etiVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMg5paw55qE6YWN572u77yM5Lya6KaG55uW5Y6f5pyJ55qEXHJcbiAgICAgKi9cclxuICAgIHJlZnJlc2hPcHRpb25zOiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHV0aWxzLmV4dGVuZCh0cnVlLCB7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLnNjcm9sbGVyLnJlZnJlc2hPcHRpb25zKHRoaXMub3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5fcmVzZXRPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hIb29rICYmIHRoaXMuX3JlZnJlc2hIb29rKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog57uT5p2f5LiL5ouJ5Yi35pawXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzU3VjY2VzcyDmmK/lkKbor7fmsYLmiJDlip/vvIzov5nkuKrnirbmgIHkvJrkuK3ovaznu5nlr7nlupTkuLvpophcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdWNjZXNzVGlwcyDpnIDopoHmm7TmlrDnmoTmiJDlip/mj5DnpLpcclxuICAgICAqIOWcqOW8gOWQr+S6huaIkOWKn+WKqOeUu+aXtu+8jOW+gOW+gOaIkOWKn+eahOaPkOekuuaYr+mcgOimgeeUseWkluS8oOWFpeWKqOaAgeabtOaWsOeahO+8jOitrOWmgiAgdXBkYXRlIDEwIG5ld3NcclxuICAgICAqL1xyXG4gICAgZW5kRG93bkxvYWRpbmc6IGZ1bmN0aW9uIChpc1N1Y2Nlc3MsIHN1Y2Nlc3NUaXBzKSB7XHJcbiAgICAgICAgdHlwZW9mIGlzU3VjY2VzcyAhPT0gJ2Jvb2xlYW4nICYmIChpc1N1Y2Nlc3MgPSB0cnVlKTtcclxuICAgICAgICB0aGlzLl9lbmREb3duTG9hZGluZyhpc1N1Y2Nlc3MsIHN1Y2Nlc3NUaXBzKTtcclxuICAgICAgICAvLyDlkIzml7bmgaLlpI3kuIrmi4nliqDovb3nmoTnirbmgIHvvIzms6jmhI/vvIzmraTml7bmsqHmnInkvKBpc1Nob3dVcExvYWRpbmfvvIzmiYDku6Xov5nkuKrlgLzkuI3kvJrnlJ/mlYhcclxuICAgICAgICB0aGlzLl9yZXNldFVwTG9hZGluZygpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjee9ruS4iuaLieWKoOi9veeKtuaAgSzlpoLmnpzmmK/msqHmnInmm7TlpJrmlbDmja7lkI7ph43nva7vvIzkvJrlj5jkuLrlj6/ku6Xnu6fnu63kuIrmi4nliqDovb1cclxuICAgICAqL1xyXG4gICAgcmVzZXRVcExvYWRpbmc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9yZXNldFVwTG9hZGluZygpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOe7k+adn+S4iuaLieWKoOi9vVxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc0ZpbmlzaFVwIOaYr+WQpue7k+adn+S4iuaLieWKoOi9ve+8jOWmguaenOe7k+adn++8jOWwseebuOW9k+S6juWPmOS4uuS6huayoeacieabtOWkmuaVsOaNru+8jOaXoOazleWGjeWHuuWPkeS4iuaLieWKoOi9veS6hlxyXG4gICAgICog57uT5p2f5ZCO5b+F6aG7cmVzZXTmiY3og73ph43mlrDlvIDlkK9cclxuICAgICAqL1xyXG4gICAgZW5kVXBMb2FkaW5nOiBmdW5jdGlvbiAoaXNGaW5pc2hVcCkge1xyXG4gICAgICAgIHRoaXMuX2VuZFVwTG9hZGluZyhpc0ZpbmlzaFVwKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDop6blj5HkuIrmi4nliqDovb1cclxuICAgICAqL1xyXG4gICAgdHJpZ2dlclVwTG9hZGluZzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIudHJpZ2dlclVwTG9hZGluZygpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOinpuWPkeS4i+aLieWIt+aWsFxyXG4gICAgICovXHJcbiAgICB0cmlnZ2VyRG93bkxvYWRpbmc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNjcm9sbGVyLnNjcm9sbFRvKDApO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIudHJpZ2dlckRvd25Mb2FkaW5nKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5rua5Yqo5Yiw5oyH5a6a55qEeeS9jee9rlxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHkg6ZyA6KaB5ruR5Yqo5Yiw55qEdG9w5YC8XHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZHVyYXRpb24g5Y2V5L2N5q+r56eSXHJcbiAgICAgKi9cclxuICAgIHNjcm9sbFRvOiBmdW5jdGlvbiAoeSwgZHVyYXRpb24pIHtcclxuICAgICAgICB0aGlzLnNjcm9sbGVyLnNjcm9sbFRvKHksIGR1cmF0aW9uKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjb3JlXHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NvcmUvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXHJcbiAqIE1pbmlSZXJlZnJlc2gg5aSE55CG5ruR5Yqo55uR5ZCs55qE5YWz6ZSu5Luj56CB77yM6YO95piv6YC76L6R5pON5L2c77yM5rKh5pyJVUnlrp7njrBcclxuICog5L6d6LWW5LqO5LiA5LiqIE1pbmlSZWZyZXNo5a+56LGhXHJcbiAqL1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vdXRpbHMnXHJcblxyXG4vKipcclxuICog5q+P56eS5aSa5bCR5binXHJcbiAqL1xyXG52YXIgU0VDT05EX01JTExJT05TID0gMTAwMCxcclxuICAgIE5VTUJFUl9GUkFNRVMgPSA2MCxcclxuICAgIFBFUl9TRUNPTkQgPSBTRUNPTkRfTUlMTElPTlMgLyBOVU1CRVJfRlJBTUVTO1xyXG5cclxuLyoqXHJcbiAqIOWumuS5ieS4gOS6m+W4uOmHj1xyXG4gKi9cclxudmFyIEVWRU5UX1NDUk9MTCA9ICdzY3JvbGwnLFxyXG4gICAgRVZFTlRfUFVMTCA9ICdwdWxsJyxcclxuICAgIEVWRU5UX1VQX0xPQURJTkcgPSAndXBMb2FkaW5nJyxcclxuICAgIEVWRU5UX0RPV05fTE9BRElORyA9ICdkb3duTG9hZGluZycsXHJcbiAgICBFVkVOVF9DQU5DRUxfTE9BRElORyA9ICdjYW5jZWxMb2FkaW5nJyxcclxuICAgIEhPT0tfQkVGT1JFX0RPV05fTE9BRElORyA9ICdiZWZvcmVEb3duTG9hZGluZyc7XHJcblxyXG52YXIgckFGID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcclxuICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgLy8g6buY6K6k5q+P56eSNjDluKdcclxuICAgIGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCBQRVJfU0VDT05EKTtcclxuICAgIH07XHJcblxyXG52YXIgU2Nyb2xsID0gZnVuY3Rpb24gKG1pbmlyZWZyZXNoKSB7XHJcbiAgICB0aGlzLm1pbmlyZWZyZXNoID0gbWluaXJlZnJlc2g7XHJcbiAgICB0aGlzLmNvbnRhaW5lciA9IG1pbmlyZWZyZXNoLmNvbnRhaW5lcjtcclxuICAgIHRoaXMuY29udGVudFdyYXAgPSBtaW5pcmVmcmVzaC5jb250ZW50V3JhcDtcclxuICAgIHRoaXMuc2Nyb2xsV3JhcCA9IG1pbmlyZWZyZXNoLnNjcm9sbFdyYXA7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSBtaW5pcmVmcmVzaC5vcHRpb25zO1xyXG4gICAgLy8g6buY6K6k5rKh5pyJ5LqL5Lu277yM6ZyA6KaB5Li75Yqo57uR5a6aXHJcbiAgICB0aGlzLmV2ZW50cyA9IHt9O1xyXG4gICAgLy8g6buY6K6k5rKh5pyJaG9va1xyXG4gICAgdGhpcy5ob29rcyA9IHt9O1xyXG5cclxuICAgIC8vIOmUgeWumuS4iuaLieWSjOS4i+aLiSxjb3Jl5YaF5aaC5p6c5oOz5pS55Y+Y77yM6ZyA6KaB6YCa6L+HQVBJ6LCD55So6K6+572uXHJcbiAgICB0aGlzLmlzTG9ja0Rvd24gPSBmYWxzZTtcclxuICAgIHRoaXMuaXNMb2NrVXAgPSBmYWxzZTtcclxuXHJcbiAgICAvLyDmmK/lkKbkvb/nlKjkuoZzY3JvbGx0b+WKn+iDve+8jOS9v+eUqOi/meS4quWKn+iDveaXtuS8muemgeatouaTjeS9nFxyXG4gICAgdGhpcy5pc1Njcm9sbFRvID0gZmFsc2U7XHJcbiAgICAvLyDkuIrmi4nlkozkuIvmi4nnmoTnirbmgIFcclxuICAgIHRoaXMudXBMb2FkaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmRvd25Mb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgLy8g6buY6K6kdXDmmK/msqHmnIlmaW5pc2jnmoRcclxuICAgIHRoaXMuaXNGaW5pc2hVcCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuX2luaXRQdWxsRG93bigpO1xyXG4gICAgdGhpcy5faW5pdFB1bGxVcCgpO1xyXG5cclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAvLyDlnKjliJ3lp4vljJblrozmr5XlkI7vvIzkuIvkuIDkuKrlvqrnjq/nmoTlvIDlp4vlho3miafooYxcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmIChzZWxmLm9wdGlvbnMuZG93biAmJiBzZWxmLm9wdGlvbnMuZG93bi5pc0F1dG8gJiYgIXNlbGYuaXNMb2NrRG93bikge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzorr7nva7kuoZhdXRv77yM5YiZ6Ieq5Yqo5LiL5ouJ5LiA5qyhXHJcbiAgICAgICAgICAgIC8vIOmcgOimgeWIpOaWreaYr+WQpumcgOimgeWKqOeUu1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmRvd24uaXNBbGxvd0F1dG9Mb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXJEb3duTG9hZGluZygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5ldmVudHNbRVZFTlRfRE9XTl9MT0FESU5HXSAmJiBzZWxmLmV2ZW50c1tFVkVOVF9ET1dOX0xPQURJTkddKHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWxmLm9wdGlvbnMudXAgJiYgc2VsZi5vcHRpb25zLnVwLmlzQXV0byAmJiAhc2VsZi5pc0xvY2tVcCkge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzorr7nva7kuoZhdXRv77yM5YiZ6Ieq5Yqo5LiK5ouJ5LiA5qyhXHJcbiAgICAgICAgICAgIHNlbGYudHJpZ2dlclVwTG9hZGluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuU2Nyb2xsLnByb3RvdHlwZS5yZWZyZXNoT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIOWvueWkluaatOmcsueahO+8jOenu+WKqHdyYXDnmoTlkIzml7bkuIDotbfkv67mlLlkb3duSGVpZ2h0XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IOenu+WKqOeahOmrmOW6plxyXG4gKiBAcGFyYW0ge051bWJlcn0gZHVyYXRpb24g6L+H5rih5pe26Ze0XHJcbiAqL1xyXG5TY3JvbGwucHJvdG90eXBlLnRyYW5zbGF0ZUNvbnRlbnRXcmFwID0gZnVuY3Rpb24gKHksIGR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl90cmFuc2xhdGUoeSwgZHVyYXRpb24pO1xyXG4gICAgdGhpcy5kb3duSGlnaHQgPSB5O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHdyYXDnmoR0cmFuc2xhdGXliqjnlLvvvIznlKjkuo7kuIvmi4nliLfmlrDml7bov5vooYx0cmFuc2Zvcm3liqjnlLtcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkg56e75Yqo55qE6auY5bqmXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBkdXJhdGlvbiDov4fmuKHml7bpl7RcclxuICovXHJcblNjcm9sbC5wcm90b3R5cGUuX3RyYW5zbGF0ZSA9IGZ1bmN0aW9uICh5LCBkdXJhdGlvbikge1xyXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuZG93bi5pc1Njcm9sbENzc1RyYW5zbGF0ZSkge1xyXG4gICAgICAgIC8vIOWPquacieWFgeiuuOWKqOeUu+aXtuaJjeS8mnNjcm9sbOS5n3RyYW5zbGF0ZSzlkKbliJnlj6rkvJrmlLnlj5hkb3duSGVpZ2h0XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgeSA9IHkgfHwgMDtcclxuICAgIGR1cmF0aW9uID0gZHVyYXRpb24gfHwgMDtcclxuXHJcbiAgICB2YXIgd3JhcCA9IHRoaXMuY29udGVudFdyYXA7XHJcblxyXG4gICAgd3JhcC5zdHlsZS53ZWJraXRUcmFuc2l0aW9uRHVyYXRpb24gPSBkdXJhdGlvbiArICdtcyc7XHJcbiAgICB3cmFwLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGR1cmF0aW9uICsgJ21zJztcclxuICAgIHdyYXAuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyB5ICsgJ3B4KSB0cmFuc2xhdGVaKDBweCknO1xyXG4gICAgd3JhcC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArIHkgKyAncHgpIHRyYW5zbGF0ZVooMHB4KSc7XHJcbn07XHJcblxyXG5TY3JvbGwucHJvdG90eXBlLl9pbml0UHVsbERvd24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgLy8g6ICD6JmR5Yiwb3B0aW9uc+WPr+S7peabtOaWsO+8jOaJgOS7pee8k+WtmOaXtuivt+azqOaEj+S4gOWumuiDveacgOaWsFxyXG4gICAgICAgIHNjcm9sbFdyYXAgPSB0aGlzLnNjcm9sbFdyYXA7XHJcblxyXG4gICAgc2Nyb2xsV3JhcC53ZWJraXRUcmFuc2l0aW9uVGltaW5nRnVuY3Rpb24gPSAnY3ViaWMtYmV6aWVyKDAuMSwgMC41NywgMC4xLCAxKSc7XHJcbiAgICBzY3JvbGxXcmFwLnRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbiA9ICdjdWJpYy1iZXppZXIoMC4xLCAwLjU3LCAwLjEsIDEpJztcclxuXHJcbiAgICB2YXIgdG91Y2hzdGFydEV2ZW50ID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpZiAoc2VsZi5pc1Njcm9sbFRvKSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOaJp+ihjOa7keWKqOS6i+S7tizliJnpmLvmraJ0b3VjaOS6i+S7tizkvJjlhYjmiafooYxzY3JvbGxUb+aWueazlVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOiusOW9lXN0YXJ0VG9wLCDlubbkuJTlj6rmnIlzdGFydFRvcOWtmOWcqOWAvOaXtuaJjeWFgeiuuG1vdmVcclxuICAgICAgICBzZWxmLnN0YXJ0VG9wID0gc2Nyb2xsV3JhcC5zY3JvbGxUb3A7XHJcblxyXG4gICAgICAgIC8vIHN0YXJ0WeeUqOadpeiuoeeul+i3neemu1xyXG4gICAgICAgIHNlbGYuc3RhcnRZID0gZS50b3VjaGVzID8gZS50b3VjaGVzWzBdLnBhZ2VZIDogZS5jbGllbnRZO1xyXG4gICAgICAgIC8vIFjnmoTkvZznlKjmmK/nlKjmnaXorqHnrpfmlrnlkJHvvIzlpoLmnpzmmK/mqKrlkJHvvIzliJnkuI3ov5vooYzliqjnlLvlpITnkIbvvIzpgb/lhY3or6/mk43kvZxcclxuICAgICAgICBzZWxmLnN0YXJ0WCA9IGUudG91Y2hlcyA/IGUudG91Y2hlc1swXS5wYWdlWCA6IGUuY2xpZW50WDtcclxuICAgIH07XHJcblxyXG4gICAgLy8g5YW85a655omL5oyH5ruR5Yqo5LiO6byg5qCHXHJcbiAgICBzY3JvbGxXcmFwLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0b3VjaHN0YXJ0RXZlbnQpO1xyXG4gICAgc2Nyb2xsV3JhcC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0b3VjaHN0YXJ0RXZlbnQpO1xyXG5cclxuICAgIHZhciB0b3VjaG1vdmVFdmVudCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBzZWxmLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGlzQWxsb3dEb3dubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmIChzZWxmLmRvd25Mb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIGlzQWxsb3dEb3dubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIW9wdGlvbnMuZG93bi5pc0F3YXlzICYmIHNlbGYudXBMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIGlzQWxsb3dEb3dubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNlbGYuc3RhcnRUb3AgIT09IHVuZGVmaW5lZCAmJiBzZWxmLnN0YXJ0VG9wIDw9IDAgJiZcclxuICAgICAgICAgICAgKGlzQWxsb3dEb3dubG9hZGluZykgJiYgIXNlbGYuaXNMb2NrRG93bikge1xyXG4gICAgICAgICAgICAvLyDliJfooajlnKjpobbpg6jkuJTkuI3lnKjliqDovb3kuK3vvIzlubbkuJTmsqHmnInplIHkvY/kuIvmi4nliqjnlLtcclxuXHJcbiAgICAgICAgICAgIC8vIOW9k+WJjeesrOS4gOS4quaJi+aMh+i3neemu+WIl+ihqOmhtumDqOeahOi3neemu1xyXG4gICAgICAgICAgICB2YXIgY3VyWSA9IGUudG91Y2hlcyA/IGUudG91Y2hlc1swXS5wYWdlWSA6IGUuY2xpZW50WTtcclxuICAgICAgICAgICAgdmFyIGN1clggPSBlLnRvdWNoZXMgPyBlLnRvdWNoZXNbMF0ucGFnZVggOiBlLmNsaWVudFg7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNlbGYucHJlWSkge1xyXG4gICAgICAgICAgICAgICAgLy8g6K6+572u5LiK5qyh56e75Yqo55qE6Led56a777yM5L2c55So5piv55So5p2l6K6h566X5ruR5Yqo5pa55ZCRXHJcbiAgICAgICAgICAgICAgICBzZWxmLnByZVkgPSBjdXJZO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDlkozkuIrmrKHmr5Qs56e75Yqo55qE6Led56a7ICjlpKfkuo4w5ZCR5LiLLOWwj+S6jjDlkJHkuIopXHJcbiAgICAgICAgICAgIHZhciBkaWZmID0gY3VyWSAtIHNlbGYucHJlWTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYucHJlWSA9IGN1clk7XHJcblxyXG4gICAgICAgICAgICAvLyDlkozotbfngrnmr5Qs56e75Yqo55qE6Led56a7LOWkp+S6jjDlkJHkuIvmi4lcclxuICAgICAgICAgICAgdmFyIG1vdmVZID0gY3VyWSAtIHNlbGYuc3RhcnRZO1xyXG4gICAgICAgICAgICB2YXIgbW92ZVggPSBjdXJYIC0gc2VsZi5zdGFydFg7XHJcblxyXG4gICAgICAgICAgICAvLyDlpoLmnpzplIHlrprmqKrlkJHmu5HliqjlubbkuJTmqKrlkJHmu5Hliqjmm7TlpJrvvIzpmLvmraLpu5jorqTkuovku7ZcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuaXNMb2NrWCAmJiBNYXRoLmFicyhtb3ZlWCkgPiBNYXRoLmFicyhtb3ZlWSkpIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChtb3ZlWSA+IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIOWQkeS4i+aLiVxyXG4gICAgICAgICAgICAgICAgc2VsZi5pc01vdmVEb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyDpmLvmraLmtY/op4jlmajnmoTpu5jorqTmu5rliqjkuovku7bvvIzlm6DkuLrov5nml7blgJnlj6rpnIDopoHmiafooYzliqjnlLvljbPlj69cclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXNlbGYuZG93bkhpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5LiL5ouJ5Yy65Z+f55qE6auY5bqm77yM55SodHJhbnNsYXRl5Yqo55S7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kb3duSGlnaHQgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkb3duT2Zmc2V0ID0gb3B0aW9ucy5kb3duLm9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICBkYW1wUmF0ZSA9IDE7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuZG93bkhpZ2h0IDwgZG93bk9mZnNldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOS4i+aLiei3neemuyAgPCDmjIflrprot53nprtcclxuICAgICAgICAgICAgICAgICAgICBkYW1wUmF0ZSA9IG9wdGlvbnMuZG93bi5kYW1wUmF0ZUJlZ2luO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDotoXlh7rkuobmjIflrprot53nprvvvIzpmo/ml7blj6/ku6XliLfmlrBcclxuICAgICAgICAgICAgICAgICAgICBkYW1wUmF0ZSA9IG9wdGlvbnMuZG93bi5kYW1wUmF0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGlmZiA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDpnIDopoHliqDkuIrpmLvlsLzns7vmlbBcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmRvd25IaWdodCArPSBkaWZmICogZGFtcFJhdGU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWQkeS4iuaUtuWbnumrmOW6pizliJnlkJHkuIrmu5HlpJrlsJHmlLblpJrlsJHpq5jluqZcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmRvd25IaWdodCArPSBkaWZmO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuZXZlbnRzW0VWRU5UX1BVTExdICYmIHNlbGYuZXZlbnRzW0VWRU5UX1BVTExdKHNlbGYuZG93bkhpZ2h0LCBkb3duT2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgIC8vIOaJp+ihjOWKqOeUu1xyXG4gICAgICAgICAgICAgICAgc2VsZi5fdHJhbnNsYXRlKHNlbGYuZG93bkhpZ2h0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIOino+WGs+W1jOWll+mXrumimOOAguWcqOW1jOWll+aciSBJU2Nyb2xs77yM5oiW57G75Ly855qE57uE5Lu25pe277yM6L+Z5q615Luj56CB5Lya55Sf5pWI77yM5Y+v5Lul6L6F5Yqp5rua5Yqoc2Nyb2xsdG9wXHJcbiAgICAgICAgICAgICAgICAvLyDlkKbliJnmnInlj6/og73lnKjmnIDlvIDlp4vmu5rkuI3liqhcclxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGxXcmFwLnNjcm9sbFRvcCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsV3JhcC5zY3JvbGxUb3AgKz0gTWF0aC5hYnMoZGlmZik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBzY3JvbGxXcmFwLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRvdWNobW92ZUV2ZW50KTtcclxuICAgIHNjcm9sbFdyYXAuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdG91Y2htb3ZlRXZlbnQpO1xyXG5cclxuICAgIHZhciB0b3VjaGVuZEV2ZW50ID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHNlbGYub3B0aW9ucztcclxuXHJcbiAgICAgICAgLy8g6ZyA6KaB6YeN572u54q25oCBXHJcbiAgICAgICAgaWYgKHNlbGYuaXNNb3ZlRG93bikge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzkuIvmi4nljLrln5/lt7Lnu4/miafooYzliqjnlLss5YiZ6ZyA6YeN572u5Zue5p2lXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmRvd25IaWdodCA+PSBvcHRpb25zLmRvd24ub2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAvLyDnrKblkIjop6blj5HliLfmlrDnmoTmnaHku7ZcclxuICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlckRvd25Mb2FkaW5nKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyDlkKbliJnpu5jorqTph43nva7kvY3nva5cclxuICAgICAgICAgICAgICAgIHNlbGYuX3RyYW5zbGF0ZSgwLCBvcHRpb25zLmRvd24uYm91bmNlVGltZSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRvd25IaWdodCA9IDA7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmV2ZW50c1tFVkVOVF9DQU5DRUxfTE9BRElOR10gJiYgc2VsZi5ldmVudHNbRVZFTlRfQ0FOQ0VMX0xPQURJTkddKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNlbGYuaXNNb3ZlRG93biA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VsZi5zdGFydFkgPSAwO1xyXG4gICAgICAgIHNlbGYuc3RhcnRYID0gMDtcclxuICAgICAgICBzZWxmLnByZVkgPSAwO1xyXG4gICAgICAgIHNlbGYuc3RhcnRUb3AgPSB1bmRlZmluZWQ7XHJcbiAgICB9O1xyXG5cclxuICAgIHNjcm9sbFdyYXAuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0b3VjaGVuZEV2ZW50KTtcclxuICAgIHNjcm9sbFdyYXAuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRvdWNoZW5kRXZlbnQpO1xyXG4gICAgc2Nyb2xsV3JhcC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdG91Y2hlbmRFdmVudCk7XHJcblxyXG59O1xyXG5cclxuU2Nyb2xsLnByb3RvdHlwZS5faW5pdFB1bGxVcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICBzY3JvbGxXcmFwID0gdGhpcy5zY3JvbGxXcmFwO1xyXG5cclxuICAgIC8vIOWmguaenOaYr0JvZHnkuIrnmoTmu5HliqjvvIzpnIDopoHnm5HlkKx3aW5kb3fnmoRzY3JvbGxcclxuICAgIHZhciB0YXJnZXRTY3JvbGxEb20gPSBzY3JvbGxXcmFwID09PSBkb2N1bWVudC5ib2R5ID8gd2luZG93IDogc2Nyb2xsV3JhcDtcclxuXHJcbiAgICB0YXJnZXRTY3JvbGxEb20uYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzY3JvbGxUb3AgPSBzY3JvbGxXcmFwLnNjcm9sbFRvcCxcclxuICAgICAgICAgICAgc2Nyb2xsSGVpZ2h0ID0gc2Nyb2xsV3JhcC5zY3JvbGxIZWlnaHQsXHJcbiAgICAgICAgICAgIGNsaWVudEhlaWdodCA9IHV0aWxzLmdldENsaWVudEhlaWdodEJ5RG9tKHNjcm9sbFdyYXApLFxyXG4gICAgICAgICAgICBvcHRpb25zID0gc2VsZi5vcHRpb25zO1xyXG5cclxuICAgICAgICBzZWxmLmV2ZW50c1tFVkVOVF9TQ1JPTExdICYmIHNlbGYuZXZlbnRzW0VWRU5UX1NDUk9MTF0oc2Nyb2xsVG9wKTtcclxuXHJcbiAgICAgICAgaWYgKCFzZWxmLnVwTG9hZGluZykge1xyXG4gICAgICAgICAgICBpZiAoIXNlbGYuaXNMb2NrVXAgJiYgIXNlbGYuaXNGaW5pc2hVcCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvQm90dG9tID0gc2Nyb2xsSGVpZ2h0IC0gY2xpZW50SGVpZ2h0IC0gc2Nyb2xsVG9wO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0b0JvdHRvbSA8PSBvcHRpb25zLnVwLm9mZnNldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOa7oei2s+S4iuaLieWKoOi9vVxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYudHJpZ2dlclVwTG9hZGluZygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5TY3JvbGwucHJvdG90eXBlLl9sb2FkRnVsbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICBzY3JvbGxXcmFwID0gdGhpcy5zY3JvbGxXcmFwLFxyXG4gICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5Zyo5LiL5LiA5Liq5b6q546v5Lit6L+Q6KGMXHJcbiAgICAgICAgaWYgKCFzZWxmLmlzTG9ja1VwICYmIG9wdGlvbnMudXAubG9hZEZ1bGwuaXNFbmFibGUgJiYgc2Nyb2xsV3JhcC5zY3JvbGxIZWlnaHQgPD0gdXRpbHMuZ2V0Q2xpZW50SGVpZ2h0QnlEb20oc2Nyb2xsV3JhcCkpIHtcclxuICAgICAgICAgICAgc2VsZi50cmlnZ2VyVXBMb2FkaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgb3B0aW9ucy51cC5sb2FkRnVsbC5kZWxheSB8fCAwKTtcclxufTtcclxuXHJcblNjcm9sbC5wcm90b3R5cGUudHJpZ2dlckRvd25Mb2FkaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXHJcbiAgICAgICAgYm91bmNlVGltZSA9IG9wdGlvbnMuZG93bi5ib3VuY2VUaW1lO1xyXG5cclxuICAgIGlmICghdGhpcy5ob29rc1tIT09LX0JFRk9SRV9ET1dOX0xPQURJTkddIHx8IHRoaXMuaG9va3NbSE9PS19CRUZPUkVfRE9XTl9MT0FESU5HXShzZWxmLmRvd25IaWdodCwgb3B0aW9ucy5kb3duLm9mZnNldCkpIHtcclxuICAgICAgICAvLyDmsqHmnIlob29r5oiW6ICFaG9va+i/lOWbnnRydWXpg73pgJrov4fvvIzkuLvopoHmmK/kuLrkuobmlrnkvr/nsbvkvLzkuo7np5jlr4boirHlm63nrYnnmoToh6rlrprkuYnkuIvmi4nliLfmlrDliqjnlLvlrp7njrBcclxuICAgICAgICBzZWxmLmRvd25Mb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICBzZWxmLmRvd25IaWdodCA9IG9wdGlvbnMuZG93bi5vZmZzZXQ7XHJcbiAgICAgICAgc2VsZi5fdHJhbnNsYXRlKHNlbGYuZG93bkhpZ2h0LCBib3VuY2VUaW1lKTtcclxuXHJcbiAgICAgICAgc2VsZi5ldmVudHNbRVZFTlRfRE9XTl9MT0FESU5HXSAmJiBzZWxmLmV2ZW50c1tFVkVOVF9ET1dOX0xPQURJTkddKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICog57uT5p2f5LiL5ouJ5Yi35paw5Yqo55S7XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBkdXJhdGlvbiDlm57lvLnml7bpl7RcclxuICovXHJcblNjcm9sbC5wcm90b3R5cGUuZW5kRG93bkxvYWRpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcclxuICAgICAgICBib3VuY2VUaW1lID0gb3B0aW9ucy5kb3duLmJvdW5jZVRpbWU7XHJcblxyXG4gICAgaWYgKHRoaXMuZG93bkxvYWRpbmcpIHtcclxuXHJcbiAgICAgICAgLy8g5b+F6aG75pivbG9hZGluZ+aXtuaJjeWFgeiuuOe7k+adn1xyXG4gICAgICAgIHNlbGYuX3RyYW5zbGF0ZSgwLCBib3VuY2VUaW1lKTtcclxuICAgICAgICBzZWxmLmRvd25IaWdodCA9IDA7XHJcbiAgICAgICAgc2VsZi5kb3duTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2Nyb2xsLnByb3RvdHlwZS50cmlnZ2VyVXBMb2FkaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy51cExvYWRpbmcgPSB0cnVlO1xyXG4gICAgdGhpcy5ldmVudHNbRVZFTlRfVVBfTE9BRElOR10gJiYgdGhpcy5ldmVudHNbRVZFTlRfVVBfTE9BRElOR10oKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiDnu5PmnZ/kuIrmi4nliqDovb3liqjnlLtcclxuICogQHBhcmFtIHtCb29sZWFufSBpc0ZpbmlzaFVwIOaYr+WQpue7k+adn+S4iuaLieWKoOi9vVxyXG4gKi9cclxuU2Nyb2xsLnByb3RvdHlwZS5lbmRVcExvYWRpbmcgPSBmdW5jdGlvbiAoaXNGaW5pc2hVcCkge1xyXG4gICAgaWYgKHRoaXMudXBMb2FkaW5nKSB7XHJcblxyXG4gICAgICAgIHRoaXMudXBMb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChpc0ZpbmlzaFVwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNGaW5pc2hVcCA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZEZ1bGwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICog5rua5Yqo5Yiw5oyH5a6a55qEeeS9jee9rlxyXG4gKiBAcGFyYW0ge051bWJlcn0geSB0b3DlnZDmoIdcclxuICogQHBhcmFtIHtOdW1iZXJ9IGR1cmF0aW9uIOWNleS9jeavq+enklxyXG4gKi9cclxuU2Nyb2xsLnByb3RvdHlwZS5zY3JvbGxUbyA9IGZ1bmN0aW9uICh5LCBkdXJhdGlvbikge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgIHNjcm9sbFdyYXAgPSB0aGlzLnNjcm9sbFdyYXA7XHJcblxyXG4gICAgeSA9IHkgfHwgMDtcclxuICAgIGR1cmF0aW9uID0gZHVyYXRpb24gfHwgMDtcclxuXHJcbiAgICAvLyDmnIDlpKflj6/mu5rliqjnmoR5XHJcbiAgICB2YXIgbWF4WSA9IHNjcm9sbFdyYXAuc2Nyb2xsSGVpZ2h0IC0gdXRpbHMuZ2V0Q2xpZW50SGVpZ2h0QnlEb20oc2Nyb2xsV3JhcCk7XHJcblxyXG4gICAgeSA9IE1hdGgubWF4KHksIDApO1xyXG4gICAgeSA9IE1hdGgubWluKHksIG1heFkpO1xyXG5cclxuICAgIC8vIOW3ruWAvCAo5Y+v6IO95Li66LSfKVxyXG4gICAgdmFyIGRpZmYgPSBzY3JvbGxXcmFwLnNjcm9sbFRvcCAtIHk7XHJcblxyXG4gICAgaWYgKGRpZmYgPT09IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcclxuICAgICAgICBzY3JvbGxXcmFwLnNjcm9sbFRvcCA9IHk7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyDmr4/np5I2MOW4p++8jOiuoeeul+S4gOWFseWkmuWwkeW4p++8jOeEtuWQjuavj+W4p+eahOatpemVv1xyXG4gICAgdmFyIGNvdW50ID0gZHVyYXRpb24gLyBQRVJfU0VDT05EO1xyXG4gICAgdmFyIHN0ZXAgPSBkaWZmIC8gKGNvdW50KSxcclxuICAgICAgICBpID0gMDtcclxuXHJcbiAgICAvLyDplIHlrprnirbmgIFcclxuICAgIHNlbGYuaXNTY3JvbGxUbyA9IHRydWU7XHJcblxyXG4gICAgdmFyIGV4ZWN1dGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKGkgPCBjb3VudCkge1xyXG4gICAgICAgICAgICBpZiAoaSA9PT0gY291bnQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAvLyDmnIDlkI7kuIDmrKHnm7TmjqXorr7nva55LOmBv+WFjeiuoeeul+ivr+W3rlxyXG4gICAgICAgICAgICAgICAgc2Nyb2xsV3JhcC5zY3JvbGxUb3AgPSB5O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2Nyb2xsV3JhcC5zY3JvbGxUb3AgLT0gc3RlcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgIHJBRihleGVjdXRlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmlzU2Nyb2xsVG8gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJBRihleGVjdXRlKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiDlj6rmnIkgZG93buWtmOWcqOaXtuaJjeWFgeiuuOino+mUgVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzTG9jayDmmK/lkKbplIHlrppcclxuICovXHJcblNjcm9sbC5wcm90b3R5cGUubG9ja0Rvd24gPSBmdW5jdGlvbiAoaXNMb2NrKSB7XHJcbiAgICB0aGlzLm9wdGlvbnMuZG93biAmJiAodGhpcy5pc0xvY2tEb3duID0gaXNMb2NrKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiDlj6rmnIkgdXDlrZjlnKjml7bmiY3lhYHorrjop6PplIFcclxuICogQHBhcmFtIHtCb29sZWFufSBpc0xvY2sg5piv5ZCm6ZSB5a6aXHJcbiAqL1xyXG5TY3JvbGwucHJvdG90eXBlLmxvY2tVcCA9IGZ1bmN0aW9uIChpc0xvY2spIHtcclxuICAgIHRoaXMub3B0aW9ucy51cCAmJiAodGhpcy5pc0xvY2tVcCA9IGlzTG9jayk7XHJcbn07XHJcblxyXG5TY3JvbGwucHJvdG90eXBlLnJlc2V0VXBMb2FkaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuaXNGaW5pc2hVcCkge1xyXG4gICAgICAgIHRoaXMuaXNGaW5pc2hVcCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOinpuWPkeS4gOasoUhUTUznmoRzY3JvbGzkuovku7bvvIzku6Xkvr/mo4Dmn6XlvZPliY3kvY3nva7mmK/lkKbpnIDopoHliqDovb3mm7TlpJpcclxuICAgIC8vIOmcgOimgeWFvOWuuXdlYmtpdOWSjGZpcmVmb3hcclxuICAgIHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpO1xyXG5cclxuICAgIC8vIOi/meS4quS6i+S7tuayoeacieW/heimgeWGkuazoe+8jGZpcmVmb3jlhoXlj4LmlbDlv4XpobvlrozmlbRcclxuICAgIGV2dC5pbml0RXZlbnQoJ3Njcm9sbCcsIGZhbHNlLCB0cnVlKTtcclxuICAgIHRoaXMuc2Nyb2xsV3JhcC5kaXNwYXRjaEV2ZW50KGV2dCk7XHJcbn07XHJcblxyXG4vKipcclxuICog55uR5ZCs5LqL5Lu277yM5YyF5ous5LiL5ouJ6L+H56iL77yM5LiL5ouJ5Yi35paw77yM5LiK5ouJ5Yqg6L2977yM5ruR5Yqo562J5LqL5Lu26YO95Y+v5Lul55uR5ZCs5YiwXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCDkuovku7blkI3vvIzlj6/pgInlkI3np7BcclxuICogc2Nyb2xsIOWuueWZqOa7keWKqOeahOaMgee7reWbnuiwg++8jOWPr+S7peebkeWQrOa7keWKqOS9jee9rlxyXG4gKiBwdWxsIOS4i+aLiea7keWKqOi/h+eoi+eahOWbnuiwg++8jOaMgee7reWbnuiwg1xyXG4gKiB1cExvYWRpbmcg5LiK5ouJ5Yqg6L296YKj5LiA5Yi76Kem5Y+RXHJcbiAqIGRvd25Mb2FkaW5nIOS4i+aLieWIt+aWsOmCo+S4gOWIu+inpuWPkVxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayDlm57osIPlh73mlbBcclxuICovXHJcblNjcm9sbC5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XHJcbiAgICBpZiAoIWV2ZW50IHx8ICF1dGlscy5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuZXZlbnRzW2V2ZW50XSA9IGNhbGxiYWNrO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIOazqOWGjOmSqeWtkOWHveaVsO+8jOS4u+imgeaYr+S4gOS6m+iHquWumuS5ieWIt+aWsOWKqOeUu+aXtueUqOWIsO+8jOWmgui/m+WFpeenmOWvhuiKseWbrVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gaG9vayDlkI3np7DvvIzojIPlm7TlpoLkuItcclxuICogYmVmb3JlRG93bkxvYWRpbmcg5piv5ZCm5YeG5aSHZG93bkxvYWRpbmfvvIzlpoLmnpzov5Tlm55mYWxzZe+8jOWImeS4jeS8mmxvYWRpbmfvvIzlrozlhajov5vlhaXoh6rlrprkuYnliqjnlLtcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sg5Zue6LCD5Ye95pWwXHJcbiAqL1xyXG5TY3JvbGwucHJvdG90eXBlLmhvb2sgPSBmdW5jdGlvbiAoaG9vaywgY2FsbGJhY2spIHtcclxuICAgIGlmICghaG9vayB8fCAhdXRpbHMuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmhvb2tzW2hvb2tdID0gY2FsbGJhY2s7XHJcbn07XHJcblxyXG5leHBvcnQgIGRlZmF1bHQgIFNjcm9sbFxyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9zY3JvbGwvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXHJcbiAqIOa7keWKqOaKveWxieaViOaenFxyXG4gKiDlpI3nlKjkuoZkZWZhdWx055qE5Luj56CBXHJcbiAqIOS4i+aLieWKqOeUu+aXtuWujOWFqOiHquWumuS5iemHjeWGme+8jOS4jeenu+WKqHNjcm9sbO+8jOiAjOaYr+ebtOaOpWNzc+WKqOeUu1xyXG4gKi9cclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uLy4uL3V0aWxzJztcclxuaW1wb3J0ICcuL2luZGV4LmNzcyc7XHJcblxyXG5cclxuLyoqXHJcbiAqIOS4gOS6m+m7mOiupOaPkOS+m+eahENTU+exu++8jOS4gOiIrOadpeivtOS4jeS8muWPmOWKqO+8iOeUseahhuaetuaPkOS+m+eahO+8iVxyXG4gKiB0aGVtZeWtl+auteS8muagueaNruS4jeWQjOeahOS4u+mimOacieS4jeWQjOWAvFxyXG4gKi9cclxudmFyIENMQVNTX1RIRU1FID0gJ21pbmlyZWZyZXNoLXRoZW1lLWppYW5zaHUnO1xyXG5cclxuLyoqXHJcbiAqIOS4gOS6m+W4uOmHj1xyXG4gKiDpu5jorqTpq5jluqbmmK8yMDBcclxuICog5YW25Lit6IOM5pmv6buY6K6k5piv6buR6Imy77yM5YaF5a655piv55m96Imy77yM5YaN5aKe6K6+6Zi75bC857O75pWw5Y+v5Lul6L6D5aW955qE6L6+5YiwM0TmlYjmnpxcclxuICovXHJcbnZhciBERUZBVUxUX0RPV05fSEVJR0hUID0gMjAwLFxyXG4gICAgRE9XTl9TSEFET1dfSEVJR0hUID0gMjtcclxuXHJcbnZhciBkZWZhdWx0U2V0dGluZyA9IHtcclxuICAgIGRvd246IHtcclxuICAgICAgICBvZmZzZXQ6IDEwMCxcclxuICAgICAgICAvLyDpmLvlsLzns7vmlbDvvIzkuIvmi4nnmoTot53nprvlpKfkuo5vZmZzZXTml7Ys5pS55Y+Y5LiL5ouJ5Yy65Z+f6auY5bqm5q+U5L6LO+WAvOi2iuaOpei/kTAs6auY5bqm5Y+Y5YyW6LaK5bCPLOihqOeOsOS4uui2iuW+gOS4i+i2iumavuaLiVxyXG4gICAgICAgIGRhbXBSYXRlOiAwLjIsXHJcbiAgICAgICAgYm91bmNlVGltZTogNTAwLFxyXG4gICAgICAgIHN1Y2Nlc3NBbmltOiB7XHJcbiAgICAgICAgICAgIC8vIHN1Y2Nlc3NBbmltXHJcbiAgICAgICAgICAgIGlzRW5hYmxlOiBmYWxzZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g57un5om/5LqGZGVmYXVsdOeahGRvd25XcmFw6YOo5YiG5Luj56CB77yM6ZyA6KaB6L+Z5Liq5Y+Y6YePXHJcbiAgICAgICAgaXNXcmFwQ3NzVHJhbnNsYXRlOiB0cnVlLFxyXG4gICAgICAgIC8vIOaYr+WQpnNjcm9sbOWcqOS4i+aLieaXtuS8mui/m+ihjGNzc+enu+WKqO+8jOacrOS4u+mimOWFs+mXreWug++8jOWujOWFqOiHquWumuS5iVxyXG4gICAgICAgIC8vIOi/meenjeaWueahiOiusOW+l+S/ruaUueWKqOeUu+WMuuWfn+eahGluZGV4XHJcbiAgICAgICAgaXNTY3JvbGxDc3NUcmFuc2xhdGU6IGZhbHNlXHJcbiAgICB9XHJcbn07XHJcblxyXG52YXIgamlhbnNodSA9IHV0aWxzLnRoZW1lLmRlZmF1bHRzLmV4dGVuZCh7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmi5PlsZXoh6rlrprkuYnnmoTphY3nva5cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIOmFjee9ruWPguaVsFxyXG4gICAgICovXHJcbiAgICBpbml0OiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIG9wdGlvbnMgPSB1dGlscy5leHRlbmQodHJ1ZSwge30sIGRlZmF1bHRTZXR0aW5nLCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLl9zdXBlcihvcHRpb25zKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43lhpnkuIvmi4nliLfmlrDliJ3lp4vljJbvvIzlj5jkuLrlsI/nqIvluo/oh6rlt7HnmoTliqjnlLtcclxuICAgICAqL1xyXG4gICAgX2luaXREb3duV3JhcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWFiOWkjeeUqGRlZmF1bHTku6PnoIHvvIznhLblkI7ph43lhplcclxuICAgICAgICB0aGlzLl9zdXBlcigpO1xyXG5cclxuICAgICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXIsXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGRvd25XcmFwID0gdGhpcy5kb3duV3JhcDtcclxuXHJcbiAgICAgICAgLy8g5pS55YaZ5YaF5a655Yy65Z+fXHJcbiAgICAgICAgZG93bldyYXAuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJkcmF3ZXJcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRvd253cmFwLWNvbnRlbnRcIj5cclxuICAgICAgICAgICAgPHAgY2xhc3M9XCJkb3dud3JhcC1wcm9ncmVzc1wiPjwvcD48L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRyYXdlci1tYXNrXCI+PC9kaXYgPjwvZGl2PmA7XHJcblxyXG4gICAgICAgIC8vIOeUseS6juebtOaOpee7p+aJv+eahGRlZmF1bHTvvIzmiYDku6Xlhbblrp7lt7Lnu4/mnIlkZWZhdWx05Li76aKY5LqG77yM6L+Z6YeM5YaN5Yqg5LiK5pys5Li76aKY5qC35byPXHJcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoQ0xBU1NfVEhFTUUpO1xyXG5cclxuICAgICAgICAvLyDmlLnlhpnlrozlkI7vvIzlr7nosaHpnIDopoHph43mlrDmn6Xmib7vvIzpnIDopoHnu5lkZWZhdWx055SoXHJcbiAgICAgICAgdGhpcy5kb3duV3JhcFByb2dyZXNzID0gZG93bldyYXAucXVlcnlTZWxlY3RvcignLmRvd253cmFwLXByb2dyZXNzJyk7XHJcbiAgICAgICAgdGhpcy5kcmF3ZXIgPSBkb3duV3JhcC5xdWVyeVNlbGVjdG9yKCcuZHJhd2VyJyk7XHJcbiAgICAgICAgdGhpcy5kcmF3ZXJNYXNrID0gZG93bldyYXAucXVlcnlTZWxlY3RvcignLmRyYXdlci1tYXNrJyk7XHJcblxyXG4gICAgICAgIC8vIOeVmeS4gOS4qum7mOiupOWAvO+8jOS7peWFjeagt+W8j+iiq+imhueblu+8jOaXoOazleiOt+WPllxyXG4gICAgICAgIC8vICsy5piv5Y676Zmk6Zi05b2x55qE5L2N572uXHJcbiAgICAgICAgdGhpcy5kb3duV3JhcEhlaWdodCA9IERPV05fU0hBRE9XX0hFSUdIVCArIGRvd25XcmFwLm9mZnNldEhlaWdodCB8fCBERUZBVUxUX0RPV05fSEVJR0hUO1xyXG4gICAgICAgIC8vIOeUseS6jmRvd25XcmFw6KKr5pS55Y+Y5LqG77yM6YeN5paw56e75YqoXHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRG93bldyYXAoLXRoaXMuZG93bldyYXBIZWlnaHQpO1xyXG4gICAgfSxcclxuICAgIF90cmFuc2Zvcm1Eb3duV3JhcDogZnVuY3Rpb24gKG9mZnNldCwgZHVyYXRpb24pIHtcclxuICAgICAgICB0aGlzLl9zdXBlcihvZmZzZXQsIGR1cmF0aW9uKTtcclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm1EcmF3ZXIob2Zmc2V0LCBkdXJhdGlvbik7XHJcbiAgICB9LFxyXG4gICAgX3RyYW5zZm9ybURyYXdlcjogZnVuY3Rpb24gKG9mZnNldCwgZHVyYXRpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuZHJhd2VyTWFzaykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcclxuICAgICAgICBkdXJhdGlvbiA9IGR1cmF0aW9uIHx8IDA7XHJcblxyXG4gICAgICAgIHZhciBvcGFjaXR5ID0gKC1vZmZzZXQgLSB0aGlzLm9wdGlvbnMuZG93bi5vZmZzZXQpIC8gdGhpcy5kb3duV3JhcEhlaWdodDtcclxuXHJcbiAgICAgICAgb3BhY2l0eSA9IE1hdGgubWluKDEsIG9wYWNpdHkpO1xyXG4gICAgICAgIG9wYWNpdHkgPSBNYXRoLm1heCgwLCBvcGFjaXR5KTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3ZXJNYXNrLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5O1xyXG4gICAgICAgIHRoaXMuZHJhd2VyTWFzay5zdHlsZS53ZWJraXRUcmFuc2l0aW9uRHVyYXRpb24gPSBkdXJhdGlvbiArICdtcyc7XHJcbiAgICAgICAgdGhpcy5kcmF3ZXJNYXNrLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGR1cmF0aW9uICsgJ21zJztcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43lhpnkuIvmi4nov4fnqIvliqjnlLtcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkb3duSGlnaHQg5b2T5YmN5LiL5ouJ55qE6auY5bqmXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZG93bk9mZnNldCDkuIvmi4nnmoTpmIjlgLxcclxuICAgICAqL1xyXG4gICAgX3B1bGxIb29rOiBmdW5jdGlvbiAoZG93bkhpZ2h0LCBkb3duT2Zmc2V0KSB7XHJcbiAgICAgICAgLy8g5aSN55SoZGVmYXVsdOeahOWQjOWQjeWHveaVsOS7o+eggSAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fc3VwZXIoZG93bkhpZ2h0LCBkb3duT2Zmc2V0KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43lhpnkuIvmi4nliqjnlLtcclxuICAgICAqL1xyXG4gICAgX2Rvd25Mb2FpbmdIb29rOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gbG9hZGluZ+S4reW3sue7j3RyYW5zbGF0ZeS6hlxyXG4gICAgICAgIHRoaXMuX3N1cGVyKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN5YaZc3VjY2VzcyDkvYbmmK/ku4DkuYjpg73kuI3lgZpcclxuICAgICAqL1xyXG4gICAgX2Rvd25Mb2FpbmdTdWNjZXNzSG9vazogZnVuY3Rpb24gKCkgeyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN5YaZ5LiL5ouJZW5kXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzU3VjY2VzcyDmmK/lkKbmiJDlip9cclxuICAgICAqL1xyXG4gICAgX2Rvd25Mb2FpbmdFbmRIb29rOiBmdW5jdGlvbiAoaXNTdWNjZXNzKSB7XHJcbiAgICAgICAgdGhpcy5fc3VwZXIoaXNTdWNjZXNzKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlj5bmtohsb2FkaW5n55qE5Zue6LCDXHJcbiAgICAgKi9cclxuICAgIF9jYW5jZWxMb2FpbmdIb29rOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fc3VwZXIoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG4vLyDmjILovb3kuLvpopjvvIzov5nmoLflpJrkuKrkuLvpopjlj6/ku6XlubblrZhcclxudXRpbHMubmFtZXNwYWNlKCd0aGVtZS5qaWFuc2h1JywgamlhbnNodSk7XHJcblxyXG4vLyDopobnm5blhajlsYDlr7nosaHvvIzkvb/nmoTlhajlsYDlr7nosaHlj6rkvJrmjIflkJHkuIDkuKrmnIDmlrDnmoTkuLvpophcclxuLy8gZ2xvYmFsQ29udGV4dC5NaW5pUmVmcmVzaCA9IE1pbmlSZWZyZXNoVGhlbWU7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBqaWFuc2h1XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdGhlbWUvamlhbnNodS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3RoZW1lL2ppYW5zaHUvaW5kZXguY3NzXG4vLyBtb2R1bGUgaWQgPSA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxyXG4gKiDku7/mt5jlrp3kuIvmi4nliLfmlrDkuLvpophcclxuICog57un5om/6IeqZGVmYXVsdFxyXG4gKi9cclxuXHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCAnLi9pbmRleC5jc3MnO1xyXG5cclxuXHJcbi8qKlxyXG4gKiDkuIDkupvpu5jorqTmj5DkvpvnmoRDU1PnsbvvvIzkuIDoiKzmnaXor7TkuI3kvJrlj5jliqjvvIjnlLHmoYbmnrbmj5DkvpvnmoTvvIlcclxuICogdGhlbWXlrZfmrrXkvJrmoLnmja7kuI3lkIznmoTkuLvpopjmnInkuI3lkIzlgLxcclxuICovXHJcbnZhciBDTEFTU19USEVNRSA9ICdtaW5pcmVmcmVzaC10aGVtZS10YW9iYW8nO1xyXG52YXIgQ0xBU1NfRE9XTl9XUkFQID0gJ21pbmlyZWZyZXNoLWRvd253cmFwJztcclxudmFyIENMQVNTX0hBUkRXQVJFX1NQRUVEVVAgPSAnbWluaXJlZnJlc2gtaGFyZHdhcmUtc3BlZWR1cCc7XHJcbnZhciBDTEFTU19ST1RBVEUgPSAnbWluaXJlZnJlc2gtcm90YXRlJztcclxudmFyIENMQVNTX0hJRERFTiA9ICdtaW5pcmVmcmVzaC1oaWRkZW4nO1xyXG5cclxuLyoqXHJcbiAqIOWumuS5ieWHoOS4queKtuaAgVxyXG4gKiDpu5jorqTnirbmgIFcclxuICog5LiL5ouJ5Yi35paw54q25oCBXHJcbiAqIOmHiuaUvuWIt+aWsOeKtuaAgVxyXG4gKiDlh4blpIfov5vlhaXnp5jlr4boirHlm63nirbmgIFcclxuICovXHJcbnZhciBTVEFURV9QVUxMX0RFRkFVTFQgPSAwO1xyXG52YXIgU1RBVEVfUFVMTF9ET1dOID0gMTtcclxudmFyIFNUQVRFX1BVTExfUkVBRFlfUkVGUkVTSCA9IDI7XHJcbnZhciBTVEFURV9QVUxMX1JFQURZX1NFQ1JFVEdBUkRFTiA9IDM7XHJcblxyXG4vKipcclxuICog5LiA5Lqb5bi46YePXHJcbiAqL1xyXG52YXIgREVGQVVMVF9ET1dOX0hFSUdIVCA9IDgwMDtcclxuXHJcbi8qKlxyXG4gKiDkuIDkupvmoLflvI9cclxuICovXHJcbnZhciBDTEFTU19TRUNSRVRfR0FSREVOX0JHX0lOID0gJ3NlY3JldC1nYXJkZW4tYmctaW4nO1xyXG52YXIgQ0xBU1NfU0VDUkVUX0dBUkRFTl9CR19PVVQgPSAnc2VjcmV0LWdhcmRlbi1iZy1vdXQnO1xyXG52YXIgQ0xBU1NfU0VDUkVUX0dBUkRFTl9NT09OX0lOID0gJ3NlY3JldC1nYXJkZW4tbW9vbi1pbic7XHJcbnZhciBDTEFTU19TRUNSRVRfR0FSREVOX01PT05fT1VUID0gJ3NlY3JldC1nYXJkZW4tbW9vbi1vdXQnO1xyXG5cclxudmFyIGRlZmF1bHRTZXR0aW5nID0ge1xyXG4gICAgZG93bjoge1xyXG4gICAgICAgIC8vIOS4i+aLiTEwMOWHuueOsOmHiuaUvuabtOaWsFxyXG4gICAgICAgIG9mZnNldDogMTAwLFxyXG4gICAgICAgIGRhbXBSYXRlOiAwLjQsXHJcbiAgICAgICAgc3VjY2Vzc0FuaW06IHtcclxuICAgICAgICAgICAgLy8gc3VjY2Vzc0FuaW1cclxuICAgICAgICAgICAgaXNFbmFibGU6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmnKzkuLvpopjni6zmnInnmoTmlYjmnpxcclxuICAgICAgICBzZWNyZXRHYXJkZW46IHtcclxuICAgICAgICAgICAgLy8g5piv5ZCm5byA5ZCv56eY5a+G6Iqx5Zut77yI5Y2z57G75Ly85reY5a6d5LqM5qW85pWI5p6c77yJXHJcbiAgICAgICAgICAgIGlzRW5hYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAvLyDkuIvmi4notoXov4cyMDDlkI7lj6/ku6Xlh7rnjrDnp5jlr4boirHlm63mlYjmnpzvvIzms6jmhI/vvIzlv4XpobvlpKfkuo5kb3du55qEb2Zmc2V0XHJcbiAgICAgICAgICAgIG9mZnNldDogMjAwLFxyXG4gICAgICAgICAgICAvLyDmj5DnpLrmloflrZdcclxuICAgICAgICAgICAgdGlwczogJ+asoui/juWFieS4tOenmOWvhuiKseWbrScsXHJcbiAgICAgICAgICAgIGluU2VjcmV0R2FyZGVuOiB1dGlscy5ub29wXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDnu6fmib/kuoZkZWZhdWx055qEZG93bldyYXDpg6jliIbku6PnoIHvvIzpnIDopoHov5nkuKrlj5jph49cclxuICAgICAgICBpc1dyYXBDc3NUcmFuc2xhdGU6IHRydWVcclxuICAgIH1cclxufTtcclxuXHJcbnZhciB0YW9iYW8gPSB1dGlscy50aGVtZS5kZWZhdWx0cy5leHRlbmQoe1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5ouT5bGV6Ieq5a6a5LmJ55qE6YWN572uXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyDphY3nva7lj4LmlbBcclxuICAgICAqL1xyXG4gICAgaW5pdDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICBvcHRpb25zID0gdXRpbHMuZXh0ZW5kKHRydWUsIHt9LCBkZWZhdWx0U2V0dGluZywgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5fc3VwZXIob3B0aW9ucyk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN5YaZ5LiL5ouJ5Yi35paw5Yid5aeL5YyW77yM5Y+Y5Li65bCP56iL5bqP6Ieq5bex55qE5Yqo55S7XHJcbiAgICAgKi9cclxuICAgIF9pbml0RG93bldyYXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXIsXHJcbiAgICAgICAgICAgIGNvbnRlbnRXcmFwID0gdGhpcy5jb250ZW50V3JhcCxcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcclxuXHJcbiAgICAgICAgLy8g5LiL5ouJ55qE5Yy65Z+fXHJcbiAgICAgICAgdmFyIGRvd25XcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG4gICAgICAgIGRvd25XcmFwLmNsYXNzTmFtZSA9IENMQVNTX0RPV05fV1JBUCArICcgJyArIENMQVNTX0hBUkRXQVJFX1NQRUVEVVA7XHJcbiAgICAgICAgZG93bldyYXAuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJkb3dud3JhcC1iZ1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImRvd253cmFwLW1vb25cIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJkb3dud3JhcC1jb250ZW50XCI+JyArXHJcbiAgICAgICAgICAgICc8cCBjbGFzcz1cImRvd253cmFwLXByb2dyZXNzXCI+PC9wPicgK1xyXG4gICAgICAgICAgICAnPHAgY2xhc3M9XCJkb3dud3JhcC10aXBzXCI+JyArXHJcbiAgICAgICAgICAgIG9wdGlvbnMuZG93bi5jb250ZW50ZG93biArXHJcbiAgICAgICAgICAgICc8L3A+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoZG93bldyYXAsIGNvbnRlbnRXcmFwKTtcclxuXHJcbiAgICAgICAgLy8g55Sx5LqO55u05o6l57un5om/55qEZGVmYXVsdO+8jOaJgOS7peWFtuWunuW3sue7j+aciWRlZmF1bHTkuLvpopjkuobvvIzov5nph4zlho3liqDkuIrmnKzkuLvpopjmoLflvI9cclxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZChDTEFTU19USEVNRSk7XHJcblxyXG4gICAgICAgIHRoaXMuZG93bldyYXAgPSBkb3duV3JhcDtcclxuICAgICAgICB0aGlzLmRvd25XcmFwUHJvZ3Jlc3MgPSB0aGlzLmRvd25XcmFwLnF1ZXJ5U2VsZWN0b3IoJy5kb3dud3JhcC1wcm9ncmVzcycpO1xyXG4gICAgICAgIHRoaXMuZG93bldyYXBUaXBzID0gdGhpcy5kb3duV3JhcC5xdWVyeVNlbGVjdG9yKCcuZG93bndyYXAtdGlwcycpO1xyXG4gICAgICAgIC8vIOi/m+WFpeenmOWvhuiKseWbreWQjuacieiDjOaZr+WSjOaciOS6rueahOWKqOeUu1xyXG4gICAgICAgIHRoaXMuZG93bldyYXBCZyA9IHRoaXMuZG93bldyYXAucXVlcnlTZWxlY3RvcignLmRvd253cmFwLWJnJyk7XHJcbiAgICAgICAgdGhpcy5kb3duV3JhcE1vb24gPSB0aGlzLmRvd25XcmFwLnF1ZXJ5U2VsZWN0b3IoJy5kb3dud3JhcC1tb29uJyk7XHJcbiAgICAgICAgLy8g5Yid5aeL5YyW5Li66buY6K6k54q25oCBXHJcbiAgICAgICAgdGhpcy5wdWxsU3RhdGUgPSBTVEFURV9QVUxMX0RFRkFVTFQ7XHJcbiAgICAgICAgdGhpcy5kb3duV3JhcEhlaWdodCA9IHRoaXMuZG93bldyYXAub2Zmc2V0SGVpZ2h0IHx8IERFRkFVTFRfRE9XTl9IRUlHSFQ7XHJcblxyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybURvd25XcmFwKC0xICogdGhpcy5kb3duV3JhcEhlaWdodCk7XHJcbiAgICB9LFxyXG4gICAgX3RyYW5zZm9ybURvd25XcmFwOiBmdW5jdGlvbiAob2Zmc2V0LCBkdXJhdGlvbikge1xyXG4gICAgICAgIHRoaXMuX3N1cGVyKG9mZnNldCwgZHVyYXRpb24pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOaXi+i9rOi/m+W6puadoVxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHByb2dyZXNzIOWvueW6lOmcgOimgemAieaLqeeahOi/m+W6plxyXG4gICAgICovXHJcbiAgICBfcm90YXRlRG93blByb2dyZXNzOiBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcclxuICAgICAgICB0aGlzLmRvd25XcmFwUHJvZ3Jlc3Muc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3JvdGF0ZSgnICsgcHJvZ3Jlc3MgKyAnZGVnKSc7XHJcbiAgICAgICAgdGhpcy5kb3duV3JhcFByb2dyZXNzLnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGUoJyArIHByb2dyZXNzICsgJ2RlZyknO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeWGmeS4i+aLiei/h+eoi+WKqOeUu1xyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRvd25IaWdodCDlvZPliY3kuIvmi4npq5jluqZcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkb3duT2Zmc2V0IOS4i+aLiemYiOWAvFxyXG4gICAgICovXHJcbiAgICBfcHVsbEhvb2s6IGZ1bmN0aW9uIChkb3duSGlnaHQsIGRvd25PZmZzZXQpIHtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcclxuICAgICAgICAgICAgZG93biA9IG9wdGlvbnMuZG93bixcclxuICAgICAgICAgICAgc2VjcmV0R2FyZGVuID0gZG93bi5zZWNyZXRHYXJkZW4uaXNFbmFibGUsXHJcbiAgICAgICAgICAgIHNlY3JldEdhcmRlbk9mZnNldCA9IGRvd24uc2VjcmV0R2FyZGVuLm9mZnNldCxcclxuICAgICAgICAgICAgRlVMTF9ERUdSRUUgPSAzNjA7XHJcblxyXG4gICAgICAgIHZhciByYXRlID0gZG93bkhpZ2h0IC8gZG93bk9mZnNldCxcclxuICAgICAgICAgICAgcHJvZ3Jlc3MgPSBGVUxMX0RFR1JFRSAqIHJhdGU7XHJcblxyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybURvd25XcmFwKC10aGlzLmRvd25XcmFwSGVpZ2h0ICsgZG93bkhpZ2h0KTtcclxuICAgICAgICB0aGlzLl9yb3RhdGVEb3duUHJvZ3Jlc3MocHJvZ3Jlc3MpO1xyXG5cclxuICAgICAgICBpZiAoZG93bkhpZ2h0IDwgZG93bk9mZnNldCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wdWxsU3RhdGUgIT09IFNUQVRFX1BVTExfRE9XTikge1xyXG4gICAgICAgICAgICAgICAgLy8gdGlwcy1kb3du5Lit6ZyA6KaB56e76ZmkYmfnmoTliqjnlLvmoLflvI/vvIzlpoLmnpzkuI3np7vpmaTvvIwgZG93bldyYXBUaXBz5L+u5pS5aW5uZXJUZXh05L+u5pS55ZCO5Y+v6IO95peg5rOV6YeN5paw5riy5p+TXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25XcmFwQmcuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19TRUNSRVRfR0FSREVOX0JHX09VVCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25XcmFwTW9vbi5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX1NFQ1JFVF9HQVJERU5fTU9PTl9PVVQpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZG93bldyYXBUaXBzLmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfSElEREVOKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZG93bldyYXBQcm9ncmVzcy5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX0hJRERFTik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25XcmFwVGlwcy5pbm5lclRleHQgPSBkb3duLmNvbnRlbnRkb3duO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wdWxsU3RhdGUgPSBTVEFURV9QVUxMX0RPV047XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGRvd25IaWdodCA+PSBkb3duT2Zmc2V0ICYmICghc2VjcmV0R2FyZGVuIHx8IGRvd25IaWdodCA8IHNlY3JldEdhcmRlbk9mZnNldCkpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucHVsbFN0YXRlICE9PSBTVEFURV9QVUxMX1JFQURZX1JFRlJFU0gpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZG93bldyYXBUaXBzLmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfSElEREVOKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZG93bldyYXBQcm9ncmVzcy5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX0hJRERFTik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25XcmFwVGlwcy5pbm5lclRleHQgPSBkb3duLmNvbnRlbnRvdmVyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wdWxsU3RhdGUgPSBTVEFURV9QVUxMX1JFQURZX1JFRlJFU0g7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wdWxsU3RhdGUgIT09IFNUQVRFX1BVTExfUkVBRFlfU0VDUkVUR0FSREVOKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25XcmFwVGlwcy5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX0hJRERFTik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25XcmFwUHJvZ3Jlc3MuY2xhc3NMaXN0LmFkZChDTEFTU19ISURERU4pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kb3duV3JhcFRpcHMuaW5uZXJUZXh0ID0gZG93bi5zZWNyZXRHYXJkZW4udGlwcztcclxuICAgICAgICAgICAgICAgIHRoaXMucHVsbFN0YXRlID0gU1RBVEVfUFVMTF9SRUFEWV9TRUNSRVRHQVJERU47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Zug5Li65pyJ6Ieq5a6a5LmJ56eY5a+G6Iqx5Zut55qE5Yqo55S777yM5omA5Lul6ZyA6KaB5a6e546w6L+Z5LiqaG9va++8jOWcqOeJueWumuadoeS7tuS4i+WOu+mZpOm7mOiupOihjOS4ulxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRvd25IaWdodCDlvZPliY3lt7Lnu4/kuIvmi4nnmoTpq5jluqZcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkb3duT2Zmc2V0IOS4i+aLiemYiOWAvFxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0g6L+U5ZueZmFsc2XlsLHkuI3lho3ov5vlhaXkuIvmi4lsb2FkaW5n77yM6buY6K6k5Li6dHJ1ZVxyXG4gICAgICovXHJcbiAgICBfYmVmb3JlRG93bkxvYWRpbmdIb29rOiBmdW5jdGlvbiAoZG93bkhpZ2h0LCBkb3duT2Zmc2V0KSB7XHJcbiAgICAgICAgLy8g5Y+q6KaB5rKh5pyJ6L+b5YWl56eY5a+G6Iqx5Zut77yM5bCx5LuN54S25piv5Lul5YmN55qE5Yqo5L2c77yM5ZCm5YiZZG93bkxvYWRpbmfpg73ml6Dms5Xov5vlhaXkuobvvIzpnIDopoHoh6rlrprkuYnlrp7njrBcclxuICAgICAgICBpZiAodGhpcy5wdWxsU3RhdGUgPT09IFNUQVRFX1BVTExfUkVBRFlfU0VDUkVUR0FSREVOKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2luU2VjcmV0R2FyZGVuKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeWGmeS4i+aLieWKqOeUu1xyXG4gICAgICog56eY5a+G6Iqx5Zut54q25oCB5LiL5peg5rOV6L+b5YWlXHJcbiAgICAgKi9cclxuICAgIF9kb3duTG9haW5nSG9vazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZG93bldyYXBUaXBzLmlubmVyVGV4dCA9IHRoaXMub3B0aW9ucy5kb3duLmNvbnRlbnRyZWZyZXNoO1xyXG4gICAgICAgIHRoaXMuZG93bldyYXBQcm9ncmVzcy5jbGFzc0xpc3QuYWRkKENMQVNTX1JPVEFURSk7XHJcbiAgICAgICAgLy8g6buY6K6k5ZKMY29udGVudFdyYXDnmoTlkIzmraVcclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm1Eb3duV3JhcCgtdGhpcy5kb3duV3JhcEhlaWdodCArIHRoaXMub3B0aW9ucy5kb3duLm9mZnNldCwgdGhpcy5vcHRpb25zLmRvd24uYm91bmNlVGltZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN5YaZc3VjY2VzcyDkvYbmmK/ku4DkuYjpg73kuI3lgZpcclxuICAgICAqIOenmOWvhuiKseWbreeKtuaAgeS4i+aXoOazlei/m+WFpVxyXG4gICAgICovXHJcbiAgICBfZG93bkxvYWluZ1N1Y2Nlc3NIb29rOiBmdW5jdGlvbiAoKSB7IH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43lhpnkuIvmi4llbmRcclxuICAgICAqIOenmOWvhuiKseWbreeKtuaAgeS4i+aXoOazlei/m+WFpVxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1N1Y2Nlc3Mg5piv5ZCm5LiL5ouJ6K+35rGC5oiQ5YqfXHJcbiAgICAgKi9cclxuICAgIF9kb3duTG9haW5nRW5kSG9vazogZnVuY3Rpb24gKGlzU3VjY2Vzcykge1xyXG4gICAgICAgIHRoaXMuZG93bldyYXBUaXBzLmlubmVyVGV4dCA9IHRoaXMub3B0aW9ucy5kb3duLmNvbnRlbnRkb3duO1xyXG4gICAgICAgIHRoaXMuZG93bldyYXBQcm9ncmVzcy5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX1JPVEFURSk7XHJcbiAgICAgICAgLy8g6buY6K6k5ZKMY29udGVudFdyYXDnmoTlkIzmraVcclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm1Eb3duV3JhcCgtdGhpcy5kb3duV3JhcEhlaWdodCwgdGhpcy5vcHRpb25zLmRvd24uYm91bmNlVGltZSk7XHJcbiAgICAgICAgLy8g6ZyA6KaB6YeN572u5Zue5p2lXHJcbiAgICAgICAgdGhpcy5wdWxsU3RhdGUgPSBTVEFURV9QVUxMX0RFRkFVTFQ7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Y+W5raIbG9hZGluZ+eahOWbnuiwg1xyXG4gICAgICovXHJcbiAgICBfY2FuY2VsTG9haW5nSG9vazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOm7mOiupOWSjGNvbnRlbnRXcmFw55qE5ZCM5q2lXHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRG93bldyYXAoLXRoaXMuZG93bldyYXBIZWlnaHQsIHRoaXMub3B0aW9ucy5kb3duLmJvdW5jZVRpbWUpO1xyXG4gICAgICAgIHRoaXMucHVsbFN0YXRlID0gU1RBVEVfUFVMTF9ERUZBVUxUO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOenmOWvhuiKseWbreeahOWKqOeUu1xyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc0luQW5pbSDmmK/lkKbmmK/ov5vlhaVcclxuICAgICAqL1xyXG4gICAgX3NlY3JldEdhcmRlbkFuaW1hdGlvbjogZnVuY3Rpb24gKGlzSW5BbmltKSB7XHJcbiAgICAgICAgdmFyIGJnQW5pbUNsYXNzQWRkID0gaXNJbkFuaW0gPyBDTEFTU19TRUNSRVRfR0FSREVOX0JHX0lOIDogQ0xBU1NfU0VDUkVUX0dBUkRFTl9CR19PVVQsXHJcbiAgICAgICAgICAgIGJnQW5pbUNsYXNzUmVtb3ZlID0gaXNJbkFuaW0gPyBDTEFTU19TRUNSRVRfR0FSREVOX0JHX09VVCA6IENMQVNTX1NFQ1JFVF9HQVJERU5fQkdfSU4sXHJcbiAgICAgICAgICAgIG1vb25BbmltQ2xhc3NBZGQgPSBpc0luQW5pbSA/IENMQVNTX1NFQ1JFVF9HQVJERU5fTU9PTl9JTiA6IENMQVNTX1NFQ1JFVF9HQVJERU5fTU9PTl9PVVQsXHJcbiAgICAgICAgICAgIG1vb25BbmltQ2xhc3NSZW1vdmUgPSBpc0luQW5pbSA/IENMQVNTX1NFQ1JFVF9HQVJERU5fTU9PTl9PVVQgOiBDTEFTU19TRUNSRVRfR0FSREVOX01PT05fSU47XHJcblxyXG4gICAgICAgIC8vIOWKqOeUu+WPmOS4uuWKoOi9veeJueWumueahGNzc+agt+W8j++8jOi/meagt+S+v+S6juWklumDqOS/ruaUuVxyXG4gICAgICAgIHRoaXMuZG93bldyYXBCZy5jbGFzc0xpc3QucmVtb3ZlKGJnQW5pbUNsYXNzUmVtb3ZlKTtcclxuICAgICAgICB0aGlzLmRvd25XcmFwQmcuY2xhc3NMaXN0LmFkZChiZ0FuaW1DbGFzc0FkZCk7XHJcblxyXG4gICAgICAgIHRoaXMuZG93bldyYXBNb29uLmNsYXNzTGlzdC5yZW1vdmUobW9vbkFuaW1DbGFzc1JlbW92ZSk7XHJcbiAgICAgICAgdGhpcy5kb3duV3JhcE1vb24uY2xhc3NMaXN0LmFkZChtb29uQW5pbUNsYXNzQWRkKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDov5vlhaXnp5jlr4boirHlm61cclxuICAgICAqIOWcqOenmOWvhuiKseWbreeKtuaAgeS4i+i1sOWFpeeahOaYr+i/meS4quWunueOsFxyXG4gICAgICovXHJcbiAgICBfaW5TZWNyZXRHYXJkZW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZG93bkJvdW5jZVRpbWUgPSB0aGlzLm9wdGlvbnMuZG93bi5ib3VuY2VUaW1lLFxyXG4gICAgICAgICAgICBpblNlY3JldEdhcmRlbkNiID0gdGhpcy5vcHRpb25zLmRvd24uc2VjcmV0R2FyZGVuLmluU2VjcmV0R2FyZGVuO1xyXG5cclxuICAgICAgICB0aGlzLmRvd25XcmFwVGlwcy5jbGFzc0xpc3QuYWRkKENMQVNTX0hJRERFTik7XHJcbiAgICAgICAgLy8g5Yqo55S7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxlci50cmFuc2xhdGVDb250ZW50V3JhcCh0aGlzLmNvbnRlbnRXcmFwLmNsaWVudEhlaWdodCwgZG93bkJvdW5jZVRpbWUpO1xyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybURvd25XcmFwKHRoaXMuY29udGVudFdyYXAuY2xpZW50SGVpZ2h0IC0gdGhpcy5kb3duV3JhcEhlaWdodCwgZG93bkJvdW5jZVRpbWUpO1xyXG4gICAgICAgIHRoaXMuX3NlY3JldEdhcmRlbkFuaW1hdGlvbih0cnVlKTtcclxuICAgICAgICBpblNlY3JldEdhcmRlbkNiICYmIGluU2VjcmV0R2FyZGVuQ2IoKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43nva7np5jlr4boirHlm61cclxuICAgICAqL1xyXG4gICAgcmVzZXRTZWNyZXRHYXJkZW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZG93bkJvdW5jZVRpbWUgPSB0aGlzLm9wdGlvbnMuZG93bi5ib3VuY2VUaW1lO1xyXG5cclxuICAgICAgICAvLyDph43nva5zY3JvbGxcclxuICAgICAgICB0aGlzLnNjcm9sbGVyLnRyYW5zbGF0ZUNvbnRlbnRXcmFwKDAsIGRvd25Cb3VuY2VUaW1lKTtcclxuICAgICAgICAvLyDph43nva7liqjnlLvljLrln5/nmoR3cmFwXHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRG93bldyYXAoLTEgKiB0aGlzLmRvd25XcmFwSGVpZ2h0LCBkb3duQm91bmNlVGltZSk7XHJcbiAgICAgICAgdGhpcy5fc2VjcmV0R2FyZGVuQW5pbWF0aW9uKGZhbHNlKTtcclxuICAgICAgICAvLyDpnIDopoHph43nva7lm57mnaVcclxuICAgICAgICB0aGlzLnB1bGxTdGF0ZSA9IFNUQVRFX1BVTExfREVGQVVMVDtcclxuICAgIH1cclxufSk7XHJcblxyXG4vLyDmjILovb3kuLvpopjvvIzov5nmoLflpJrkuKrkuLvpopjlj6/ku6XlubblrZhcclxudXRpbHMubmFtZXNwYWNlKCd0aGVtZS50YW9iYW8nLCB0YW9iYW8pO1xyXG5cclxuLy8g6KaG55uW5YWo5bGA5a+56LGh77yM5L2/55qE5YWo5bGA5a+56LGh5Y+q5Lya5oyH5ZCR5LiA5Liq5pyA5paw55qE5Li76aKYXHJcbi8vIGdsb2JhbENvbnRleHQuTWluaVJlZnJlc2ggPSBNaW5pUmVmcmVzaFRoZW1lO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdGFvYmFvXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdGhlbWUvdGFvYmFvL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdGhlbWUvdGFvYmFvL2luZGV4LmNzc1xuLy8gbW9kdWxlIGlkID0gOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcclxuICog5Lu/5b6u5L+h5bCP56iL5bqP5Li76aKYXHJcbiAqIOeUseS6juimgeWkjeeUqGRlZmF1bHTnmoTkuIrmi4nliqDovb3vvIx0b1RvcOWKn+iDve+8jOaJgOS7peebtOaOpee7p+aJv+iHqmRlZmF1bHRcclxuICog5Y+q6YeN5YaZ5LqGIGRvd25XcmFw55u45YWz5pON5L2cXHJcbiAqL1xyXG5cclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uLy4uL3V0aWxzJztcclxuaW1wb3J0ICcuL2luZGV4LmNzcyc7XHJcblxyXG5cclxuLyoqXHJcbiAqIOS4gOS6m+m7mOiupOaPkOS+m+eahENTU+exu++8jOS4gOiIrOadpeivtOS4jeS8muWPmOWKqO+8iOeUseahhuaetuaPkOS+m+eahO+8iVxyXG4gKiB0aGVtZeWtl+auteS8muagueaNruS4jeWQjOeahOS4u+mimOacieS4jeWQjOWAvFxyXG4gKi9cclxudmFyIENMQVNTX1RIRU1FID0gJ21pbmlyZWZyZXNoLXRoZW1lLWFwcGxldCc7XHJcbnZhciBDTEFTU19ET1dOX1dSQVAgPSAnbWluaXJlZnJlc2gtZG93bndyYXAnO1xyXG52YXIgQ0xBU1NfSEFSRFdBUkVfU1BFRURVUCA9ICdtaW5pcmVmcmVzaC1oYXJkd2FyZS1zcGVlZHVwJztcclxuXHJcbi8qKlxyXG4gKiDmnKzkuLvpopjnmoTnibnoibLmoLflvI9cclxuICovXHJcbnZhciBDTEFTU19ET1dOX0xPQURJTkcgPSAnbG9hZGluZy1hcHBsZXQnO1xyXG5cclxuLyoqXHJcbiAqIOS4gOS6m+W4uOmHj1xyXG4gKi9cclxudmFyIERFRkFVTFRfRE9XTl9IRUlHSFQgPSA1MDtcclxuXHJcbnZhciBkZWZhdWx0U2V0dGluZyA9IHtcclxuICAgIGRvd246IHtcclxuICAgICAgICBzdWNjZXNzQW5pbToge1xyXG4gICAgICAgICAgICAvLyDlvq7kv6HlsI/nqIvluo/msqHmnIlzdWNjZXNzQW5pbSDkuZ/msqHmnInmloflrZfmj5DnpLpcclxuICAgICAgICAgICAgaXNFbmFibGU6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDnu6fmib/kuoZkZWZhdWx055qEZG93bldyYXDpg6jliIbku6PnoIHvvIzpnIDopoHov5nkuKrlj5jph49cclxuICAgICAgICBpc1dyYXBDc3NUcmFuc2xhdGU6IHRydWVcclxuICAgIH1cclxufTtcclxuXHJcbnZhciBhcHBsZXQgPSB1dGlscy50aGVtZS5kZWZhdWx0cy5leHRlbmQoe1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5ouT5bGV6Ieq5a6a5LmJ55qE6YWN572uXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyDphY3nva7lj4LmlbBcclxuICAgICAqL1xyXG4gICAgaW5pdDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICBvcHRpb25zID0gdXRpbHMuZXh0ZW5kKHRydWUsIHt9LCBkZWZhdWx0U2V0dGluZywgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5fc3VwZXIob3B0aW9ucyk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN5YaZ5LiL5ouJ5Yi35paw5Yid5aeL5YyW77yM5Y+Y5Li65bCP56iL5bqP6Ieq5bex55qE5Yqo55S7XHJcbiAgICAgKi9cclxuICAgIF9pbml0RG93bldyYXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXIsXHJcbiAgICAgICAgICAgIGNvbnRlbnRXcmFwID0gdGhpcy5jb250ZW50V3JhcDtcclxuXHJcbiAgICAgICAgLy8g5LiL5ouJ55qE5Yy65Z+fXHJcbiAgICAgICAgdmFyIGRvd25XcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG4gICAgICAgIGRvd25XcmFwLmNsYXNzTmFtZSA9IENMQVNTX0RPV05fV1JBUCArICcgJyArIENMQVNTX0hBUkRXQVJFX1NQRUVEVVA7XHJcbiAgICAgICAgZG93bldyYXAuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJkb3dud3JhcC1jb250ZW50IGJhbGwtYmVhdFwiPjxkaXYgY2xhc3M9XCJkb3RcIj48L2Rpdj48ZGl2IGNsYXNzPVwiZG90XCI+PC9kaXY+PGRpdiBjbGFzcz1cImRvdFwiPjwvZGl2PjwvZGl2Pic7XHJcbiAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShkb3duV3JhcCwgY29udGVudFdyYXApO1xyXG5cclxuICAgICAgICAvLyDnlLHkuo7nm7TmjqXnu6fmib/nmoRkZWZhdWx077yM5omA5Lul5YW25a6e5bey57uP5pyJZGVmYXVsdOS4u+mimOS6hu+8jOi/memHjOWGjeWKoOS4iuacrOS4u+mimOagt+W8j1xyXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKENMQVNTX1RIRU1FKTtcclxuXHJcbiAgICAgICAgdGhpcy5kb3duV3JhcCA9IGRvd25XcmFwO1xyXG4gICAgICAgIC8vIOeVmeS4gOS4qum7mOiupOWAvO+8jOS7peWFjeagt+W8j+iiq+imhueblu+8jOaXoOazleiOt+WPllxyXG4gICAgICAgIHRoaXMuZG93bldyYXBIZWlnaHQgPSB0aGlzLmRvd25XcmFwLm9mZnNldEhlaWdodCB8fCBERUZBVUxUX0RPV05fSEVJR0hUO1xyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybURvd25XcmFwKC0xICogdGhpcy5kb3duV3JhcEhlaWdodCk7XHJcbiAgICB9LFxyXG4gICAgX3RyYW5zZm9ybURvd25XcmFwOiBmdW5jdGlvbiAob2Zmc2V0LCBkdXJhdGlvbikge1xyXG4gICAgICAgIHRoaXMuX3N1cGVyKG9mZnNldCwgZHVyYXRpb24pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeWGmeS4i+aLiei/h+eoi+WKqOeUu1xyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRvd25IaWdodCDlvZPliY3kuIvmi4nnmoTpq5jluqZcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkb3duT2Zmc2V0IOS4i+aLieeahOmYiOWAvFxyXG4gICAgICovXHJcbiAgICBfcHVsbEhvb2s6IGZ1bmN0aW9uIChkb3duSGlnaHQsIGRvd25PZmZzZXQpIHtcclxuXHJcbiAgICAgICAgaWYgKGRvd25IaWdodCA8IGRvd25PZmZzZXQpIHtcclxuICAgICAgICAgICAgdmFyIHJhdGUgPSBkb3duSGlnaHQgLyBkb3duT2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdGhpcy5kb3duV3JhcEhlaWdodCAqICgtMSArIHJhdGUpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fdHJhbnNmb3JtRG93bldyYXAob2Zmc2V0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl90cmFuc2Zvcm1Eb3duV3JhcCgwKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN5YaZ5LiL5ouJ5Yqo55S7XHJcbiAgICAgKi9cclxuICAgIF9kb3duTG9haW5nSG9vazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZG93bldyYXAuY2xhc3NMaXN0LmFkZChDTEFTU19ET1dOX0xPQURJTkcpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeWGmXN1Y2Nlc3Mg5L2G5piv5LuA5LmI6YO95LiN5YGaXHJcbiAgICAgKi9cclxuICAgIF9kb3duTG9haW5nU3VjY2Vzc0hvb2s6IGZ1bmN0aW9uICgpIHsgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeWGmeS4i+aLiWVuZFxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1N1Y2Nlc3Mg5piv5ZCm5oiQ5YqfXHJcbiAgICAgKi9cclxuICAgIF9kb3duTG9haW5nRW5kSG9vazogZnVuY3Rpb24gKGlzU3VjY2Vzcykge1xyXG4gICAgICAgIHRoaXMuZG93bldyYXAuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19ET1dOX0xPQURJTkcpO1xyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybURvd25XcmFwKC0xICogdGhpcy5kb3duV3JhcEhlaWdodCwgdGhpcy5vcHRpb25zLmRvd24uYm91bmNlVGltZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Y+W5raIbG9hZGluZ+eahOWbnuiwg1xyXG4gICAgICovXHJcbiAgICBfY2FuY2VsTG9haW5nSG9vazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybURvd25XcmFwKC0xICogdGhpcy5kb3duV3JhcEhlaWdodCwgdGhpcy5vcHRpb25zLmRvd24uYm91bmNlVGltZSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLy8g5oyC6L295Li76aKY77yM6L+Z5qC35aSa5Liq5Li76aKY5Y+v5Lul5bm25a2YXHJcbnV0aWxzLm5hbWVzcGFjZSgndGhlbWUuYXBwbGV0JywgYXBwbGV0KTtcclxuXHJcbi8vIOimhuebluWFqOWxgOWvueixoe+8jOS9v+eahOWFqOWxgOWvueixoeWPquS8muaMh+WQkeS4gOS4quacgOaWsOeahOS4u+mimFxyXG4vLyBnbG9iYWxDb250ZXh0Lk1pbmlSZWZyZXNoID0gTWluaVJlZnJlc2hUaGVtZTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFwcGxldFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3RoZW1lL2FwcGxldC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy90aGVtZS9hcHBsZXQvaW5kZXguY3NzXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcclxuICogM0Tmir3lsYnmlYjmnpzkuLvpophcclxuICog5aSN55So5LqGZGVmYXVsdOeahOS7o+egge+8jOWcqOWFtuWfuuehgOS4iuWinuWKoDNE5pWI5p6cXHJcbiAqIOazqOaEj++8jOWkjeeUqF9zdXBlcuaXtuS4gOWumuimgeWNgeWIhueGn+aCiWRlZmF1bHTkuK3lr7nlupTku6PnoIHnmoTkvZznlKhcclxuICovXHJcblxyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vLi4vdXRpbHMnO1xyXG5pbXBvcnQgJy4vaW5kZXguY3NzJztcclxuXHJcblxyXG5cclxuLyoqXHJcbiAqIOS4gOS6m+m7mOiupOaPkOS+m+eahENTU+exu++8jOS4gOiIrOadpeivtOS4jeS8muWPmOWKqO+8iOeUseahhuaetuaPkOS+m+eahO+8iVxyXG4gKiB0aGVtZeWtl+auteS8muagueaNruS4jeWQjOeahOS4u+mimOacieS4jeWQjOWAvFxyXG4gKi9cclxudmFyIENMQVNTX1RIRU1FID0gJ21pbmlyZWZyZXNoLXRoZW1lLWRyYXdlcjNkJztcclxuXHJcbi8qKlxyXG4gKiDkuIDkupvluLjph49cclxuICog6buY6K6k6auY5bqm5pivMjAwXHJcbiAqIOWFtuS4reiDjOaZr+m7mOiupOaYr+m7keiJsu+8jOWGheWuueaYr+eZveiJsu+8jOWGjeWinuiuvumYu+WwvOezu+aVsOWPr+S7pei+g+WlveeahOi+vuWIsDNE5pWI5p6cXHJcbiAqL1xyXG52YXIgREVGQVVMVF9ET1dOX0hFSUdIVCA9IDIwMDtcclxudmFyIERSQVdFUl9GVUxMX0RFR1JFRSA9IDkwO1xyXG5cclxudmFyIGRlZmF1bHRTZXR0aW5nID0ge1xyXG4gICAgZG93bjoge1xyXG4gICAgICAgIG9mZnNldDogMTAwLFxyXG4gICAgICAgIC8vIOmYu+WwvOezu+aVsO+8jOS4i+aLieeahOi3neemu+Wkp+S6jm9mZnNldOaXtizmlLnlj5jkuIvmi4nljLrln5/pq5jluqbmr5Tkvos75YC86LaK5o6l6L+RMCzpq5jluqblj5jljJbotorlsI8s6KGo546w5Li66LaK5b6A5LiL6LaK6Zq+5ouJXHJcbiAgICAgICAgZGFtcFJhdGU6IDAuMixcclxuICAgICAgICBib3VuY2VUaW1lOiA1MDAsXHJcbiAgICAgICAgc3VjY2Vzc0FuaW06IHtcclxuICAgICAgICAgICAgLy8gc3VjY2Vzc0FuaW1cclxuICAgICAgICAgICAgaXNFbmFibGU6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDnu6fmib/kuoZkZWZhdWx055qEZG93bldyYXDpg6jliIbku6PnoIHvvIzpnIDopoHov5nkuKrlj5jph49cclxuICAgICAgICBpc1dyYXBDc3NUcmFuc2xhdGU6IHRydWVcclxuICAgIH1cclxufTtcclxuXHJcbnZhciBkcmF3ZXIzZCA9IHV0aWxzLnRoZW1lLmRlZmF1bHRzLmV4dGVuZCh7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmi5PlsZXoh6rlrprkuYnnmoTphY3nva5cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIOmFjee9ruWPguaVsFxyXG4gICAgICovXHJcbiAgICBpbml0OiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIG9wdGlvbnMgPSB1dGlscy5leHRlbmQodHJ1ZSwge30sIGRlZmF1bHRTZXR0aW5nLCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLl9zdXBlcihvcHRpb25zKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43lhpnkuIvmi4nliLfmlrDliJ3lp4vljJbvvIzlj5jkuLrlsI/nqIvluo/oh6rlt7HnmoTliqjnlLtcclxuICAgICAqL1xyXG4gICAgX2luaXREb3duV3JhcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWFiOWkjeeUqGRlZmF1bHTku6PnoIHvvIznhLblkI7ph43lhplcclxuICAgICAgICB0aGlzLl9zdXBlcigpO1xyXG5cclxuICAgICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXIsXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGRvd25XcmFwID0gdGhpcy5kb3duV3JhcDtcclxuXHJcbiAgICAgICAgLy8g5pS55YaZ5YaF5a655Yy65Z+fXHJcbiAgICAgICAgZG93bldyYXAuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzdGF0ZS0zZFwiPjxkaXYgY2xhc3M9XCJkcmF3ZXIzZFwiPicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImRvd253cmFwLWNvbnRlbnRcIj4nICtcclxuICAgICAgICAgICAgJzxwIGNsYXNzPVwiZG93bndyYXAtcHJvZ3Jlc3NcIj48L3A+JyArXHJcbiAgICAgICAgICAgICc8cCBjbGFzcz1cImRvd253cmFwLXRpcHNcIj4nICtcclxuICAgICAgICAgICAgb3B0aW9ucy5kb3duLmNvbnRlbnRkb3duICtcclxuICAgICAgICAgICAgJyA8L3A+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZHJhd2VyM2QtbWFza1wiPjwvZGl2ID48L2Rpdj48L2Rpdj4nO1xyXG5cclxuICAgICAgICAvLyDnlLHkuo7nm7TmjqXnu6fmib/nmoRkZWZhdWx077yM5omA5Lul5YW25a6e5bey57uP5pyJZGVmYXVsdOS4u+mimOS6hu+8jOi/memHjOWGjeWKoOS4iuacrOS4u+mimOagt+W8j1xyXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKENMQVNTX1RIRU1FKTtcclxuXHJcbiAgICAgICAgLy8g5pS55YaZ5a6M5ZCO77yM5a+56LGh6ZyA6KaB6YeN5paw5p+l5om+XHJcbiAgICAgICAgdGhpcy5kb3duV3JhcFByb2dyZXNzID0gZG93bldyYXAucXVlcnlTZWxlY3RvcignLmRvd253cmFwLXByb2dyZXNzJyk7XHJcbiAgICAgICAgdGhpcy5kb3duV3JhcFRpcHMgPSBkb3duV3JhcC5xdWVyeVNlbGVjdG9yKCcuZG93bndyYXAtdGlwcycpO1xyXG4gICAgICAgIHRoaXMuZHJhd2VyID0gZG93bldyYXAucXVlcnlTZWxlY3RvcignLmRyYXdlcjNkJyk7XHJcbiAgICAgICAgdGhpcy5kcmF3ZXJNYXNrID0gZG93bldyYXAucXVlcnlTZWxlY3RvcignLmRyYXdlcjNkLW1hc2snKTtcclxuXHJcbiAgICAgICAgLy8g55WZ5LiA5Liq6buY6K6k5YC877yM5Lul5YWN5qC35byP6KKr6KaG55uW77yM5peg5rOV6I635Y+WXHJcbiAgICAgICAgdGhpcy5kb3duV3JhcEhlaWdodCA9IGRvd25XcmFwLm9mZnNldEhlaWdodCB8fCBERUZBVUxUX0RPV05fSEVJR0hUO1xyXG4gICAgICAgIC8vIOeUseS6jmRvd25XcmFw6KKr5pS55Y+Y5LqG77yM6YeN5paw56e75YqoXHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRG93bldyYXAoLXRoaXMuZG93bldyYXBIZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuX3Jlc2V0RHJhd2VyKCk7XHJcbiAgICB9LFxyXG4gICAgX3RyYW5zZm9ybURvd25XcmFwOiBmdW5jdGlvbiAob2Zmc2V0LCBkdXJhdGlvbikge1xyXG4gICAgICAgIHRoaXMuX3N1cGVyKG9mZnNldCwgZHVyYXRpb24pO1xyXG4gICAgfSxcclxuICAgIF90cmFuc2Zvcm1EcmF3ZXI6IGZ1bmN0aW9uIChkZWdyZWUsIGR1cmF0aW9uKSB7XHJcbiAgICAgICAgZGVncmVlID0gZGVncmVlIHx8IDA7XHJcbiAgICAgICAgZHVyYXRpb24gPSBkdXJhdGlvbiB8fCAwO1xyXG4gICAgICAgIC8vIOS4gOS6mzNE55u45YWz5bGe5oCn5YaZ5Yiw5LqGQ1NT5LitXHJcbiAgICAgICAgdGhpcy5kcmF3ZXIuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVgoJyArIGRlZ3JlZSArICdkZWcpIHJvdGF0ZVkoMGRlZyknO1xyXG4gICAgICAgIHRoaXMuZHJhd2VyLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICdyb3RhdGVYKCcgKyBkZWdyZWUgKyAnZGVnKSByb3RhdGVZKDBkZWcpJztcclxuICAgICAgICB0aGlzLmRyYXdlci5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSBkdXJhdGlvbiArICdtcyc7XHJcbiAgICAgICAgdGhpcy5kcmF3ZXIuc3R5bGUud2Via2l0VHJhbnNpdGlvbkR1cmF0aW9uID0gZHVyYXRpb24gKyAnbXMnO1xyXG5cclxuICAgICAgICB2YXIgb3BhY2l0eSA9IGRlZ3JlZSAvIERSQVdFUl9GVUxMX0RFR1JFRTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3ZXJNYXNrLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5O1xyXG4gICAgICAgIHRoaXMuZHJhd2VyTWFzay5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSBkdXJhdGlvbiArICdtcyc7XHJcbiAgICAgICAgdGhpcy5kcmF3ZXJNYXNrLnN0eWxlLndlYmtpdFRyYW5zaXRpb25EdXJhdGlvbiA9IGR1cmF0aW9uICsgJ21zJztcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43nva7mir3lsYnvvIzkuLvopoHmmK/ml4vovazop5LluqZcclxuICAgICAqL1xyXG4gICAgX3Jlc2V0RHJhd2VyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRHJhd2VyKERSQVdFUl9GVUxMX0RFR1JFRSwgdGhpcy5vcHRpb25zLmRvd24uYm91bmNlVGltZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN5YaZ5LiL5ouJ6L+H56iL5Yqo55S7XHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZG93bkhpZ2h0IOW9k+WJjeS4i+aLieeahOmrmOW6plxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRvd25PZmZzZXQg5LiL5ouJ55qE6ZiI5YC8XHJcbiAgICAgKi9cclxuICAgIF9wdWxsSG9vazogZnVuY3Rpb24gKGRvd25IaWdodCwgZG93bk9mZnNldCkge1xyXG4gICAgICAgIC8vIOWkjeeUqGRlZmF1bHTnmoTlkIzlkI3lh73mlbDku6PnoIEgICAgICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3N1cGVyKGRvd25IaWdodCwgZG93bk9mZnNldCk7XHJcblxyXG4gICAgICAgIHZhciByYXRlID0gZG93bkhpZ2h0IC8gZG93bk9mZnNldCxcclxuICAgICAgICAgICAgZGVncmVlID0gRFJBV0VSX0ZVTExfREVHUkVFICogKDEgLSBNYXRoLm1pbihyYXRlLCAxKSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybURyYXdlcihkZWdyZWUpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeWGmeS4i+aLieWKqOeUu1xyXG4gICAgICovXHJcbiAgICBfZG93bkxvYWluZ0hvb2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBsb2FkaW5n5Lit5bey57uPdHJhbnNsYXRl5LqGXHJcbiAgICAgICAgdGhpcy5fc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRHJhd2VyKDAsIHRoaXMub3B0aW9ucy5kb3duLmJvdW5jZVRpbWUpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeWGmXN1Y2Nlc3Mg5L2G5piv5LuA5LmI6YO95LiN5YGaXHJcbiAgICAgKi9cclxuICAgIF9kb3duTG9haW5nU3VjY2Vzc0hvb2s6IGZ1bmN0aW9uICgpIHsgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeWGmeS4i+aLiWVuZFxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1N1Y2Nlc3Mg5piv5ZCm5oiQ5YqfXHJcbiAgICAgKi9cclxuICAgIF9kb3duTG9haW5nRW5kSG9vazogZnVuY3Rpb24gKGlzU3VjY2Vzcykge1xyXG4gICAgICAgIHRoaXMuX3N1cGVyKGlzU3VjY2Vzcyk7XHJcbiAgICAgICAgdGhpcy5fcmVzZXREcmF3ZXIoKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlj5bmtohsb2FkaW5n55qE5Zue6LCDXHJcbiAgICAgKi9cclxuICAgIF9jYW5jZWxMb2FpbmdIb29rOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fc3VwZXIoKTtcclxuICAgICAgICB0aGlzLl9yZXNldERyYXdlcigpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbi8vIOaMgui9veS4u+mimO+8jOi/meagt+WkmuS4quS4u+mimOWPr+S7peW5tuWtmFxyXG51dGlscy5uYW1lc3BhY2UoJ3RoZW1lLmRyYXdlcjNkJywgZHJhd2VyM2QpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZHJhd2VyM2RcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy90aGVtZS9kcmF3ZXIzZC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy90aGVtZS9kcmF3ZXIzZC9pbmRleC5jc3Ncbi8vIG1vZHVsZSBpZCA9IDEzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxyXG4gKiDmu5Hliqjmir3lsYnmlYjmnpxcclxuICog5aSN55So5LqGZGVmYXVsdOeahOS7o+eggVxyXG4gKiDkuIvmi4nliqjnlLvml7blrozlhajoh6rlrprkuYnph43lhpnvvIzkuI3np7vliqhzY3JvbGzvvIzogIzmmK/nm7TmjqVjc3PliqjnlLtcclxuICovXHJcblxyXG5cclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uLy4uL3V0aWxzJztcclxuaW1wb3J0ICcuL2luZGV4LmNzcyc7XHJcblxyXG4vKipcclxuICog5LiA5Lqb6buY6K6k5o+Q5L6b55qEQ1NT57G777yM5LiA6Iis5p2l6K+05LiN5Lya5Y+Y5Yqo77yI55Sx5qGG5p625o+Q5L6b55qE77yJXHJcbiAqIHRoZW1l5a2X5q615Lya5qC55o2u5LiN5ZCM55qE5Li76aKY5pyJ5LiN5ZCM5YC8XHJcbiAqL1xyXG52YXIgQ0xBU1NfVEhFTUUgPSAnbWluaXJlZnJlc2gtdGhlbWUtZHJhd2Vyc2xpZGVyJztcclxuXHJcbi8qKlxyXG4gKiDkuIDkupvluLjph49cclxuICog6buY6K6k6auY5bqm5pivMjAwXHJcbiAqIOWFtuS4reiDjOaZr+m7mOiupOaYr+m7keiJsu+8jOWGheWuueaYr+eZveiJsu+8jOWGjeWinuiuvumYu+WwvOezu+aVsOWPr+S7pei+g+WlveeahOi+vuWIsDNE5pWI5p6cXHJcbiAqL1xyXG52YXIgREVGQVVMVF9ET1dOX0hFSUdIVCA9IDIwMCxcclxuICAgIERPV05fU0hBRE9XX0hFSUdIVCA9IDI7XHJcblxyXG52YXIgZGVmYXVsdFNldHRpbmcgPSB7XHJcbiAgICBkb3duOiB7XHJcbiAgICAgICAgb2Zmc2V0OiAxMDAsXHJcbiAgICAgICAgLy8g6Zi75bC857O75pWw77yM5LiL5ouJ55qE6Led56a75aSn5LqOb2Zmc2V05pe2LOaUueWPmOS4i+aLieWMuuWfn+mrmOW6puavlOS+izvlgLzotormjqXov5EwLOmrmOW6puWPmOWMlui2iuWwjyzooajnjrDkuLrotorlvoDkuIvotorpmr7mi4lcclxuICAgICAgICBkYW1wUmF0ZTogMC4yLFxyXG4gICAgICAgIGJvdW5jZVRpbWU6IDUwMCxcclxuICAgICAgICBzdWNjZXNzQW5pbToge1xyXG4gICAgICAgICAgICAvLyBzdWNjZXNzQW5pbVxyXG4gICAgICAgICAgICBpc0VuYWJsZTogZmFsc2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOe7p+aJv+S6hmRlZmF1bHTnmoRkb3duV3JhcOmDqOWIhuS7o+egge+8jOmcgOimgei/meS4quWPmOmHj1xyXG4gICAgICAgIGlzV3JhcENzc1RyYW5zbGF0ZTogdHJ1ZSxcclxuICAgICAgICAvLyDmmK/lkKZzY3JvbGzlnKjkuIvmi4nml7bkvJrov5vooYxjc3Pnp7vliqjvvIzmnKzkuLvpopjlhbPpl63lroPvvIzlrozlhajoh6rlrprkuYlcclxuICAgICAgICAvLyDov5nnp43mlrnmoYjorrDlvpfkv67mlLnliqjnlLvljLrln5/nmoRpbmRleFxyXG4gICAgICAgIGlzU2Nyb2xsQ3NzVHJhbnNsYXRlOiBmYWxzZVxyXG4gICAgfVxyXG59O1xyXG5cclxudmFyIGRyYXdlcnNsaWRlciA9IHV0aWxzLnRoZW1lLmRlZmF1bHRzLmV4dGVuZCh7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmi5PlsZXoh6rlrprkuYnnmoTphY3nva5cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIOmFjee9ruWPguaVsFxyXG4gICAgICovXHJcbiAgICBpbml0OiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIG9wdGlvbnMgPSB1dGlscy5leHRlbmQodHJ1ZSwge30sIGRlZmF1bHRTZXR0aW5nLCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLl9zdXBlcihvcHRpb25zKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43lhpnkuIvmi4nliLfmlrDliJ3lp4vljJbvvIzlj5jkuLrlsI/nqIvluo/oh6rlt7HnmoTliqjnlLtcclxuICAgICAqL1xyXG4gICAgX2luaXREb3duV3JhcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWFiOWkjeeUqGRlZmF1bHTku6PnoIHvvIznhLblkI7ph43lhplcclxuICAgICAgICB0aGlzLl9zdXBlcigpO1xyXG5cclxuICAgICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXIsXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGRvd25XcmFwID0gdGhpcy5kb3duV3JhcDtcclxuXHJcbiAgICAgICAgLy8g5pS55YaZ5YaF5a655Yy65Z+fXHJcbiAgICAgICAgZG93bldyYXAuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJkcmF3ZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJkb3dud3JhcC1jb250ZW50XCI+JyArXHJcbiAgICAgICAgICAgICc8cCBjbGFzcz1cImRvd253cmFwLXByb2dyZXNzXCI+PC9wPicgK1xyXG4gICAgICAgICAgICAnPHAgY2xhc3M9XCJkb3dud3JhcC10aXBzXCI+JyArXHJcbiAgICAgICAgICAgIG9wdGlvbnMuZG93bi5jb250ZW50ZG93biArXHJcbiAgICAgICAgICAgICcgPC9wPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImRyYXdlci1tYXNrXCI+PC9kaXYgPjwvZGl2Pic7XHJcblxyXG4gICAgICAgIC8vIOeUseS6juebtOaOpee7p+aJv+eahGRlZmF1bHTvvIzmiYDku6Xlhbblrp7lt7Lnu4/mnIlkZWZhdWx05Li76aKY5LqG77yM6L+Z6YeM5YaN5Yqg5LiK5pys5Li76aKY5qC35byPXHJcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoQ0xBU1NfVEhFTUUpO1xyXG5cclxuICAgICAgICAvLyDmlLnlhpnlrozlkI7vvIzlr7nosaHpnIDopoHph43mlrDmn6Xmib7vvIzpnIDopoHnu5lkZWZhdWx055SoXHJcbiAgICAgICAgdGhpcy5kb3duV3JhcFByb2dyZXNzID0gZG93bldyYXAucXVlcnlTZWxlY3RvcignLmRvd253cmFwLXByb2dyZXNzJyk7XHJcbiAgICAgICAgdGhpcy5kb3duV3JhcFRpcHMgPSBkb3duV3JhcC5xdWVyeVNlbGVjdG9yKCcuZG93bndyYXAtdGlwcycpO1xyXG4gICAgICAgIHRoaXMuZHJhd2VyID0gZG93bldyYXAucXVlcnlTZWxlY3RvcignLmRyYXdlcicpO1xyXG4gICAgICAgIHRoaXMuZHJhd2VyTWFzayA9IGRvd25XcmFwLnF1ZXJ5U2VsZWN0b3IoJy5kcmF3ZXItbWFzaycpO1xyXG5cclxuICAgICAgICAvLyDnlZnkuIDkuKrpu5jorqTlgLzvvIzku6XlhY3moLflvI/ooqvopobnm5bvvIzml6Dms5Xojrflj5ZcclxuICAgICAgICAvLyArMuaYr+WOu+mZpOmYtOW9seeahOS9jee9rlxyXG4gICAgICAgIHRoaXMuZG93bldyYXBIZWlnaHQgPSBET1dOX1NIQURPV19IRUlHSFQgKyBkb3duV3JhcC5vZmZzZXRIZWlnaHQgfHwgREVGQVVMVF9ET1dOX0hFSUdIVDtcclxuICAgICAgICAvLyDnlLHkuo5kb3duV3JhcOiiq+aUueWPmOS6hu+8jOmHjeaWsOenu+WKqFxyXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybURvd25XcmFwKC10aGlzLmRvd25XcmFwSGVpZ2h0KTtcclxuICAgIH0sXHJcbiAgICBfdHJhbnNmb3JtRG93bldyYXA6IGZ1bmN0aW9uIChvZmZzZXQsIGR1cmF0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5fc3VwZXIob2Zmc2V0LCBkdXJhdGlvbik7XHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRHJhd2VyKG9mZnNldCwgZHVyYXRpb24pO1xyXG4gICAgfSxcclxuICAgIF90cmFuc2Zvcm1EcmF3ZXI6IGZ1bmN0aW9uIChvZmZzZXQsIGR1cmF0aW9uKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRyYXdlck1hc2spIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XHJcbiAgICAgICAgZHVyYXRpb24gPSBkdXJhdGlvbiB8fCAwO1xyXG5cclxuICAgICAgICB2YXIgb3BhY2l0eSA9ICgtb2Zmc2V0IC0gdGhpcy5vcHRpb25zLmRvd24ub2Zmc2V0KSAvIHRoaXMuZG93bldyYXBIZWlnaHQ7XHJcblxyXG4gICAgICAgIG9wYWNpdHkgPSBNYXRoLm1pbigxLCBvcGFjaXR5KTtcclxuICAgICAgICBvcGFjaXR5ID0gTWF0aC5tYXgoMCwgb3BhY2l0eSk7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd2VyTWFzay5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eTtcclxuICAgICAgICB0aGlzLmRyYXdlck1hc2suc3R5bGUud2Via2l0VHJhbnNpdGlvbkR1cmF0aW9uID0gZHVyYXRpb24gKyAnbXMnO1xyXG4gICAgICAgIHRoaXMuZHJhd2VyTWFzay5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSBkdXJhdGlvbiArICdtcyc7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN5YaZ5LiL5ouJ6L+H56iL5Yqo55S7XHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZG93bkhpZ2h0IOW9k+WJjeS4i+aLieeahOmrmOW6plxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRvd25PZmZzZXQg5LiL5ouJ55qE6ZiI5YC8XHJcbiAgICAgKi9cclxuICAgIF9wdWxsSG9vazogZnVuY3Rpb24gKGRvd25IaWdodCwgZG93bk9mZnNldCkge1xyXG4gICAgICAgIC8vIOWkjeeUqGRlZmF1bHTnmoTlkIzlkI3lh73mlbDku6PnoIEgICAgICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3N1cGVyKGRvd25IaWdodCwgZG93bk9mZnNldCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN5YaZ5LiL5ouJ5Yqo55S7XHJcbiAgICAgKi9cclxuICAgIF9kb3duTG9haW5nSG9vazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIGxvYWRpbmfkuK3lt7Lnu490cmFuc2xhdGXkuoZcclxuICAgICAgICB0aGlzLl9zdXBlcigpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeWGmXN1Y2Nlc3Mg5L2G5piv5LuA5LmI6YO95LiN5YGaXHJcbiAgICAgKi9cclxuICAgIF9kb3duTG9haW5nU3VjY2Vzc0hvb2s6IGZ1bmN0aW9uICgpIHsgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeWGmeS4i+aLiWVuZFxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1N1Y2Nlc3Mg5piv5ZCm5oiQ5YqfXHJcbiAgICAgKi9cclxuICAgIF9kb3duTG9haW5nRW5kSG9vazogZnVuY3Rpb24gKGlzU3VjY2Vzcykge1xyXG4gICAgICAgIHRoaXMuX3N1cGVyKGlzU3VjY2Vzcyk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Y+W5raIbG9hZGluZ+eahOWbnuiwg1xyXG4gICAgICovXHJcbiAgICBfY2FuY2VsTG9haW5nSG9vazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX3N1cGVyKCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLy8g5oyC6L295Li76aKY77yM6L+Z5qC35aSa5Liq5Li76aKY5Y+v5Lul5bm25a2YXHJcbnV0aWxzLm5hbWVzcGFjZSgndGhlbWUuZHJhd2Vyc2xpZGVyJywgZHJhd2Vyc2xpZGVyKTtcclxuXHJcbi8vIOimhuebluWFqOWxgOWvueixoe+8jOS9v+eahOWFqOWxgOWvueixoeWPquS8muaMh+WQkeS4gOS4quacgOaWsOeahOS4u+mimFxyXG4vLyBnbG9iYWxDb250ZXh0Lk1pbmlSZWZyZXNoID0gTWluaVJlZnJlc2hUaGVtZTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRyYXdlcnNsaWRlclxyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy90aGVtZS9kcmF3ZXJzbGlkZXIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdGhlbWUvZHJhd2Vyc2xpZGVyL2luZGV4LmNzc1xuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==