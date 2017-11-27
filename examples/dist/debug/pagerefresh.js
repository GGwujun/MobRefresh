/*!
 * pagerefresh v0.0.5
 * (c) 2017-2017 dsx
 * Released under the BSD-3-Clause License.
 * https://github.com/GGwujun/pagerefresh
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.pagerefresh = factory());
}(this, (function () { 'use strict';

/** 
 * 构建 MiniRefresh
 * MiniRefreshTools 是内部使用的
 * 外部主题会用 MiniRefresh变量
 */

var utils = {};

utils.noop = function () {};

utils.isFunction = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
};

utils.isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
};

utils.isArray = Array.isArray || function (array) {
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
                var clone, copyIsArray;

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

/**
 * MiniRerefresh 处理滑动监听的关键代码，都是逻辑操作，没有UI实现
 * 依赖于一个 MiniRefresh对象
 */
/**
 * 每秒多少帧
 */
var SECOND_MILLIONS = 1000;
var NUMBER_FRAMES = 60;
var PER_SECOND = SECOND_MILLIONS / NUMBER_FRAMES;

/**
 * 定义一些常量
 */
var EVENT_SCROLL = 'scroll';
var EVENT_PULL = 'pull';
var EVENT_UP_LOADING = 'upLoading';
var EVENT_DOWN_LOADING = 'downLoading';
var EVENT_CANCEL_LOADING = 'cancelLoading';
var HOOK_BEFORE_DOWN_LOADING = 'beforeDownLoading';

var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
// 默认每秒60帧
function (callback) {
    window.setTimeout(callback, PER_SECOND);
};

var Scroll$1 = function Scroll(minirefresh) {
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

Scroll$1.prototype.refreshOptions = function (options) {
    this.options = options;
};

/**
 * 对外暴露的，移动wrap的同时一起修改downHeight
 * @param {Number} y 移动的高度
 * @param {Number} duration 过渡时间
 */
Scroll$1.prototype.translateContentWrap = function (y, duration) {
    this._translate(y, duration);
    this.downHight = y;
};

/**
 * wrap的translate动画，用于下拉刷新时进行transform动画
 * @param {Number} y 移动的高度
 * @param {Number} duration 过渡时间
 */
Scroll$1.prototype._translate = function (y, duration) {
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

Scroll$1.prototype._initPullDown = function () {
    var self = this,

    // 考虑到options可以更新，所以缓存时请注意一定能最新
    scrollWrap = this.scrollWrap;

    scrollWrap.webkitTransitionTimingFunction = 'cubic-bezier(0.1, 0.57, 0.1, 1)';
    scrollWrap.transitionTimingFunction = 'cubic-bezier(0.1, 0.57, 0.1, 1)';

    var touchstartEvent = function touchstartEvent(e) {
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

    var touchmoveEvent = function touchmoveEvent(e) {
        var options = self.options,
            isAllowDownloading = true;

        if (self.downLoading) {
            isAllowDownloading = false;
        } else if (!options.down.isAways && self.upLoading) {
            isAllowDownloading = false;
        }

        if (self.startTop !== undefined && self.startTop <= 0 && isAllowDownloading && !self.isLockDown) {
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

    var touchendEvent = function touchendEvent() {
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

Scroll$1.prototype._initPullUp = function () {
    var self = this,
        scrollWrap = this.scrollWrap;

    // 如果是Body上的滑动，需要监听window的scroll
    var targetScrollDom = scrollWrap === document.body ? window : scrollWrap;

    targetScrollDom.addEventListener('scroll', function () {
        var scrollTop = scrollWrap.scrollTop,
            scrollHeight = scrollWrap.scrollHeight,
            clientHeight = utils.getClientHeightByDom(scrollWrap),
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

Scroll$1.prototype._loadFull = function () {
    var self = this,
        scrollWrap = this.scrollWrap,
        options = this.options;

    setTimeout(function () {
        // 在下一个循环中运行
        if (!self.isLockUp && options.up.loadFull.isEnable && scrollWrap.scrollHeight <= utils.getClientHeightByDom(scrollWrap)) {
            self.triggerUpLoading();
        }
    }, options.up.loadFull.delay || 0);
};

Scroll$1.prototype.triggerDownLoading = function () {
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
Scroll$1.prototype.endDownLoading = function () {
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

Scroll$1.prototype.triggerUpLoading = function () {
    this.upLoading = true;
    this.events[EVENT_UP_LOADING] && this.events[EVENT_UP_LOADING]();
};

/**
 * 结束上拉加载动画
 * @param {Boolean} isFinishUp 是否结束上拉加载
 */
Scroll$1.prototype.endUpLoading = function (isFinishUp) {
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
Scroll$1.prototype.scrollTo = function (y, duration) {
    var self = this,
        scrollWrap = this.scrollWrap;

    y = y || 0;
    duration = duration || 0;

    // 最大可滚动的y
    var maxY = scrollWrap.scrollHeight - utils.getClientHeightByDom(scrollWrap);

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
    var step = diff / count,
        i = 0;

    // 锁定状态
    self.isScrollTo = true;

    var execute = function execute() {
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
Scroll$1.prototype.lockDown = function (isLock) {
    this.options.down && (this.isLockDown = isLock);
};

/**
 * 只有 up存在时才允许解锁
 * @param {Boolean} isLock 是否锁定
 */
Scroll$1.prototype.lockUp = function (isLock) {
    this.options.up && (this.isLockUp = isLock);
};

Scroll$1.prototype.resetUpLoading = function () {
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
Scroll$1.prototype.on = function (event, callback) {
    if (!event || !utils.isFunction(callback)) {
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
Scroll$1.prototype.hook = function (hook, callback) {
    if (!hook || !utils.isFunction(callback)) {
        return;
    }
    this.hooks[hook] = callback;
};

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

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

var defaultSetting$1 = {
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
        callback: utils.noop
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
        callback: utils.noop
    },
    // 容器
    container: '#minirefresh',
    // 是否锁定横向滑动，如果锁定则原生滚动条无法滑动
    isLockX: true,
    // 是否使用body对象的scroll而不是minirefresh-scroll对象的scroll
    // 开启后一个页面只能有一个下拉刷新，否则会有冲突
    isUseBodyScroll: false
};

var core = function () {
    /**
    * 构造器 初始化
    * @param {Object} options 配置信息
    */
    function core(options) {
        classCallCheck(this, core);

        options = utils.extend(true, {}, defaultSetting$1, options);

        this.container = utils.selector(options.container);
        // scroll的dom-wrapper下的第一个节点，作用是down动画时的操作
        this.contentWrap = this.container.children[0];
        // 默认和contentWrap一致，但是为了兼容body的滚动，拆分为两个对象方便处理
        // 如果是使用body的情况，scrollWrap恒为body
        this.scrollWrap = options.isUseBodyScroll ? document.body : this.contentWrap;

        this.options = options;

        // 初始化的hook
        this._initHook && this._initHook(this.options.down.isLock, this.options.up.isLock);

        // 生成一个Scroll对象 ，对象内部处理滑动监听
        this.scroller = new Scroll$1(this);

        this._initEvent();

        // 如果初始化时锁定了，需要触发锁定，避免没有锁定时解锁（会触发逻辑bug）
        options.up.isLock && this._lockUpLoading(options.up.isLock);
        options.down.isLock && this._lockDownLoading(options.down.isLock);
    }

    createClass(core, [{
        key: '_resetOptions',
        value: function _resetOptions() {
            var options = this.options;
            this._lockUpLoading(options.up.isLock);
            this._lockDownLoading(options.down.isLock);
        }
    }, {
        key: '_initEvent',
        value: function _initEvent() {
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
        }

        /**
         * 内部执行，结束下拉刷新
         * @param {Boolean} isSuccess 是否下拉请求成功
         * @param {String} successTips 需要更新的成功提示
         * 在开启了成功动画时，往往成功的提示是需要由外传入动态更新的，譬如  update 10 news
         */

    }, {
        key: '_endDownLoading',
        value: function _endDownLoading(isSuccess, successTips) {
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
        }

        /**
         * 内部执行，结束上拉加载
         * @param {Boolean} isFinishUp 是否结束了上拉加载
         */

    }, {
        key: '_endUpLoading',
        value: function _endUpLoading(isFinishUp) {
            if (this.scroller.upLoading) {
                this.scroller.endUpLoading(isFinishUp);
                this._upLoaingEndHook && this._upLoaingEndHook(isFinishUp);
            }
        }

        /**
         * 重新刷新上拉加载，刷新后会变为可以上拉加载
         */

    }, {
        key: '_resetUpLoading',
        value: function _resetUpLoading() {
            this.scroller.resetUpLoading();
        }

        /**
         * 锁定上拉加载
         * 将开启和禁止合并成一个锁定API
         * @param {Boolean} isLock 是否锁定
         */

    }, {
        key: '_lockUpLoading',
        value: function _lockUpLoading(isLock) {
            this.scroller.lockUp(isLock);
            this._lockUpLoadingHook && this._lockUpLoadingHook(isLock);
        }

        /**
         * 锁定下拉刷新
         * @param {Boolean} isLock 是否锁定
         */

    }, {
        key: '_lockDownLoading',
        value: function _lockDownLoading(isLock) {
            this.scroller.lockDown(isLock);
            this._lockDownLoadingHook && this._lockDownLoadingHook(isLock);
        }

        /**
         * 刷新minirefresh的配置，关键性的配置请不要更新，如容器，回调等
         * @param {Object} options 新的配置，会覆盖原有的
         */

    }, {
        key: 'refreshOptions',
        value: function refreshOptions(options) {
            this.options = utils.extend(true, {}, this.options, options);
            this.scroller.refreshOptions(this.options);
            this._resetOptions(options);
            this._refreshHook && this._refreshHook();
        }

        /**
         * 结束下拉刷新
         * @param {Boolean} isSuccess 是否请求成功，这个状态会中转给对应主题
         * @param {String} successTips 需要更新的成功提示
         * 在开启了成功动画时，往往成功的提示是需要由外传入动态更新的，譬如  update 10 news
         */

    }, {
        key: 'endDownLoading',
        value: function endDownLoading(isSuccess, successTips) {
            typeof isSuccess !== 'boolean' && (isSuccess = true);
            this._endDownLoading(isSuccess, successTips);
            // 同时恢复上拉加载的状态，注意，此时没有传isShowUpLoading，所以这个值不会生效
            this._resetUpLoading();
        }

        /**
         * 重置上拉加载状态,如果是没有更多数据后重置，会变为可以继续上拉加载
         */

    }, {
        key: 'resetUpLoading',
        value: function resetUpLoading() {
            this._resetUpLoading();
        }

        /**
         * 结束上拉加载
         * @param {Boolean} isFinishUp 是否结束上拉加载，如果结束，就相当于变为了没有更多数据，无法再出发上拉加载了
         * 结束后必须reset才能重新开启
         */

    }, {
        key: 'endUpLoading',
        value: function endUpLoading(isFinishUp) {
            this._endUpLoading(isFinishUp);
        }

        /**
         * 触发上拉加载
         */

    }, {
        key: 'triggerUpLoading',
        value: function triggerUpLoading() {
            this.scroller.triggerUpLoading();
        }

        /**
         * 触发下拉刷新
         */

    }, {
        key: 'triggerDownLoading',
        value: function triggerDownLoading() {
            this.scroller.scrollTo(0);
            this.scroller.triggerDownLoading();
        }

        /**
         * 滚动到指定的y位置
         * @param {Number} y 需要滑动到的top值
         * @param {Number} duration 单位毫秒
         */

    }, {
        key: 'scrollTo',
        value: function scrollTo(y, duration) {
            this.scroller.scrollTo(y, duration);
        }
    }]);
    return core;
}();

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

var defaults = function (_core) {
    inherits(defaults, _core);

    function defaults(options) {
        classCallCheck(this, defaults);

        options = utils.extend(true, {}, defaultSetting, options);
        return possibleConstructorReturn(this, (defaults.__proto__ || Object.getPrototypeOf(defaults)).call(this, options));
    }

    createClass(defaults, [{
        key: '_initHook',
        value: function _initHook() {
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
            // this._initToTop();
        }

        /**
         * 刷新的实现，需要根据新配置进行一些更改
         */

    }, {
        key: '_refreshHook',
        value: function _refreshHook() {
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
        }
    }, {
        key: '_initDownWrap',
        value: function _initDownWrap() {
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
        }
    }, {
        key: '_transformDownWrap',
        value: function _transformDownWrap(offset, duration, isForce) {
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
        }
    }, {
        key: '_initUpWrap',
        value: function _initUpWrap() {
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
        }

        /**
         * 自定义实现一个toTop，由于这个是属于额外的事件所以没有添加的核心中，而是由各自的主题决定是否实现或者实现成什么样子
         * 不过框架中仍然提供了一个默认的minirefresh-totop样式，可以方便使用
         */

    }, {
        key: '_initToTop',
        value: function _initToTop() {
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
        }
    }, {
        key: '_pullHook',
        value: function _pullHook(downHight, downOffset) {
            var options = this.options,
                FULL_DEGREE = 360;

            if (downHight < downOffset) {
                if (this.isCanPullDown) {
                    this.downWrapTips.innerText = options.down.contentdown;
                    this.isCanPullDown = false;
                }
            } else if (!this.isCanPullDown) {
                this.downWrapTips.innerText = options.down.contentover;
                this.isCanPullDown = true;
            }

            var rate = downHight / downOffset,
                progress = FULL_DEGREE * rate;

            this.downWrapProgress.style.webkitTransform = 'rotate(' + progress + 'deg)';
            this.downWrapProgress.style.transform = 'rotate(' + progress + 'deg)';
            this._transformDownWrap(-this.downWrapHeight + downHight);
        }
    }, {
        key: '_scrollHook',
        value: function _scrollHook(scrollTop) {
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
                } else if (this.isShowToTopBtn) {
                    toTopBtn.classList.add(CLASS_FADE_OUT);
                    toTopBtn.classList.remove(CLASS_FADE_IN);
                    this.isShowToTopBtn = false;
                }
            }
        }
    }, {
        key: '_downLoaingHook',
        value: function _downLoaingHook() {
            // 默认和contentWrap的同步
            this._transformDownWrap(-this.downWrapHeight + this.options.down.offset, this.options.down.bounceTime);
            this.downWrapTips.innerText = this.options.down.contentrefresh;
            this.downWrapProgress.classList.add(CLASS_ROTATE);
        }
    }, {
        key: '_downLoaingSuccessHook',
        value: function _downLoaingSuccessHook(isSuccess, successTips) {
            this.options.down.contentsuccess = successTips || this.options.down.contentsuccess;
            this.downWrapTips.innerText = isSuccess ? this.options.down.contentsuccess : this.options.down.contenterror;
            this.downWrapProgress.classList.remove(CLASS_ROTATE);
            this.downWrapProgress.classList.add(CLASS_FADE_OUT);
            this.downWrapProgress.classList.add(isSuccess ? CLASS_DOWN_SUCCESS : CLASS_DOWN_ERROR);
        }
    }, {
        key: '_downLoaingEndHook',
        value: function _downLoaingEndHook(isSuccess) {
            this.downWrapTips.innerText = this.options.down.contentdown;
            this.downWrapProgress.classList.remove(CLASS_ROTATE);
            this.downWrapProgress.classList.remove(CLASS_FADE_OUT);
            this.downWrapProgress.classList.remove(isSuccess ? CLASS_DOWN_SUCCESS : CLASS_DOWN_ERROR);
            // 默认为不可见
            // 需要重置回来
            this.isCanPullDown = false;
            this._transformDownWrap(-this.downWrapHeight, this.options.down.bounceTime);
        }
    }, {
        key: '_cancelLoaingHook',
        value: function _cancelLoaingHook() {
            this._transformDownWrap(-this.downWrapHeight, this.options.down.bounceTime);
        }
    }, {
        key: '_upLoaingHook',
        value: function _upLoaingHook(isShowUpLoading) {
            if (isShowUpLoading) {
                this.upWrapTips.innerText = this.options.up.contentrefresh;
                this.upWrapProgress.classList.add(CLASS_ROTATE);
                this.upWrapProgress.classList.remove(CLASS_HIDDEN);
                this.upWrap.style.visibility = 'visible';
            } else {
                this.upWrap.style.visibility = 'hidden';
            }
        }
    }, {
        key: '_upLoaingEndHook',
        value: function _upLoaingEndHook(isFinishUp) {
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
        }
    }, {
        key: '_lockUpLoadingHook',
        value: function _lockUpLoadingHook(isLock) {
            this.upWrap.style.visibility = isLock ? 'hidden' : 'visible';
        }
    }, {
        key: '_lockDownLoadingHook',
        value: function _lockDownLoadingHook(isLock) {
            this.downWrap.style.visibility = isLock ? 'hidden' : 'visible';
        }
    }]);
    return defaults;
}(core);

// 挂载主题，这样多个主题可以并存，default是关键字，所以使用了defaults


utils.namespace('theme.defaults', defaults);

/**
 * 滑动抽屉效果
 * 复用了default的代码
 * 下拉动画时完全自定义重写，不移动scroll，而是直接css动画
 */
/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * theme字段会根据不同的主题有不同值
 */
var CLASS_THEME$1 = 'minirefresh-theme-jianshu';

/**
 * 一些常量
 * 默认高度是200
 * 其中背景默认是黑色，内容是白色，再增设阻尼系数可以较好的达到3D效果
 */
var DEFAULT_DOWN_HEIGHT$1 = 200;
var DOWN_SHADOW_HEIGHT = 2;

var defaultSetting$2 = {
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

var jianshu = function (_utils$theme$defaults) {
    inherits(jianshu, _utils$theme$defaults);

    /**
     * 拓展自定义的配置
     * @param {Object} options 配置参数
     */
    function jianshu(options) {
        classCallCheck(this, jianshu);

        options = utils.extend(true, {}, defaultSetting$2, options);
        return possibleConstructorReturn(this, (jianshu.__proto__ || Object.getPrototypeOf(jianshu)).call(this, options));
    }

    /**
     * 重写下拉刷新初始化，变为小程序自己的动画
     */


    createClass(jianshu, [{
        key: '_initDownWrap',
        value: function _initDownWrap() {
            // 先复用default代码，然后重写
            get(jianshu.prototype.__proto__ || Object.getPrototypeOf(jianshu.prototype), '_initDownWrap', this).call(this);

            var container = this.container,

            // options = this.options,
            downWrap = this.downWrap;

            // 改写内容区域
            downWrap.innerHTML = '<div class="drawer">\n            <div class="downwrap-content">\n            <p class="downwrap-progress"></p></div>\n            <div class="drawer-mask"></div ></div>';

            // 由于直接继承的default，所以其实已经有default主题了，这里再加上本主题样式
            container.classList.add(CLASS_THEME$1);

            // 改写完后，对象需要重新查找，需要给default用
            this.downWrapProgress = downWrap.querySelector('.downwrap-progress');
            this.drawer = downWrap.querySelector('.drawer');
            this.drawerMask = downWrap.querySelector('.drawer-mask');

            // 留一个默认值，以免样式被覆盖，无法获取
            // +2是去除阴影的位置
            this.downWrapHeight = DOWN_SHADOW_HEIGHT + downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT$1;
            // 由于downWrap被改变了，重新移动
            this._transformDownWrap(-this.downWrapHeight);
        }
    }, {
        key: '_transformDownWrap',
        value: function _transformDownWrap(offset, duration) {
            get(jianshu.prototype.__proto__ || Object.getPrototypeOf(jianshu.prototype), '_transformDownWrap', this).call(this, offset, duration);
            this._transformDrawer(offset, duration);
        }
    }, {
        key: '_transformDrawer',
        value: function _transformDrawer(offset, duration) {
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
        }

        /**
         * 重写下拉过程动画
         * @param {Number} downHight 当前下拉的高度
         * @param {Number} downOffset 下拉的阈值
         */

    }, {
        key: '_pullHook',
        value: function _pullHook(downHight, downOffset) {
            // 复用default的同名函数代码           
            get(jianshu.prototype.__proto__ || Object.getPrototypeOf(jianshu.prototype), '_pullHook', this).call(this, downHight, downOffset);
        }

        /**
         * 重写下拉动画
         */

    }, {
        key: '_downLoaingHook',
        value: function _downLoaingHook() {
            // loading中已经translate了
            get(jianshu.prototype.__proto__ || Object.getPrototypeOf(jianshu.prototype), '_downLoaingHook', this).call(this);
        }

        /**
         * 重写success 但是什么都不做
         */

    }, {
        key: '_downLoaingSuccessHook',
        value: function _downLoaingSuccessHook() {}

        /**
         * 重写下拉end
         * @param {Boolean} isSuccess 是否成功
         */

    }, {
        key: '_downLoaingEndHook',
        value: function _downLoaingEndHook(isSuccess) {
            get(jianshu.prototype.__proto__ || Object.getPrototypeOf(jianshu.prototype), '_downLoaingEndHook', this).call(this, isSuccess);
        }

        /**
         * 取消loading的回调
         */

    }, {
        key: '_cancelLoaingHook',
        value: function _cancelLoaingHook() {
            get(jianshu.prototype.__proto__ || Object.getPrototypeOf(jianshu.prototype), '_cancelLoaingHook', this).call(this);
        }
    }]);
    return jianshu;
}(utils.theme.defaults);

/**
 * 仿淘宝下拉刷新主题
 * 继承自default
 */

// import core from "../../core/index";


/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * theme字段会根据不同的主题有不同值
 */
var CLASS_THEME$2 = 'minirefresh-theme-taobao';
var CLASS_DOWN_WRAP$1 = 'minirefresh-downwrap';
var CLASS_HARDWARE_SPEEDUP$1 = 'minirefresh-hardware-speedup';
var CLASS_ROTATE$1 = 'minirefresh-rotate';
var CLASS_HIDDEN$1 = 'minirefresh-hidden';

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
var DEFAULT_DOWN_HEIGHT$2 = 800;

/**
 * 一些样式
 */
var CLASS_SECRET_GARDEN_BG_IN = 'secret-garden-bg-in';
var CLASS_SECRET_GARDEN_BG_OUT = 'secret-garden-bg-out';
var CLASS_SECRET_GARDEN_MOON_IN = 'secret-garden-moon-in';
var CLASS_SECRET_GARDEN_MOON_OUT = 'secret-garden-moon-out';

var defaultSetting$3 = {
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
            inSecretGarden: utils.noop
        },
        // 继承了default的downWrap部分代码，需要这个变量
        isWrapCssTranslate: true
    }
};

var taobao = function (_utils$theme$defaults) {
    inherits(taobao, _utils$theme$defaults);

    /**
     * 拓展自定义的配置
     * @param {Object} options 配置参数
     */
    function taobao(options) {
        classCallCheck(this, taobao);

        options = utils.extend(true, {}, defaultSetting$3, options);
        return possibleConstructorReturn(this, (taobao.__proto__ || Object.getPrototypeOf(taobao)).call(this, options));
    }

    /**
     * 重写下拉刷新初始化，变为小程序自己的动画
     */


    createClass(taobao, [{
        key: '_initDownWrap',
        value: function _initDownWrap() {
            var container = this.container,
                contentWrap = this.contentWrap,
                options = this.options;

            // 下拉的区域
            var downWrap = document.createElement('div');

            downWrap.className = CLASS_DOWN_WRAP$1 + ' ' + CLASS_HARDWARE_SPEEDUP$1;
            downWrap.innerHTML = '' + ('<div class="downwrap-bg"></div>' + '<div class="downwrap-moon"></div>' + '<div class="downwrap-content">' + '<p class="downwrap-progress"></p>' + '<p class="downwrap-tips">') + options.down.contentdown + '</p>' + '</div>';
            container.insertBefore(downWrap, contentWrap);

            // 由于直接继承的default，所以其实已经有default主题了，这里再加上本主题样式
            container.classList.add(CLASS_THEME$2);

            this.downWrap = downWrap;
            this.downWrapProgress = this.downWrap.querySelector('.downwrap-progress');
            this.downWrapTips = this.downWrap.querySelector('.downwrap-tips');
            // 进入秘密花园后有背景和月亮的动画
            this.downWrapBg = this.downWrap.querySelector('.downwrap-bg');
            this.downWrapMoon = this.downWrap.querySelector('.downwrap-moon');
            // 初始化为默认状态
            this.pullState = STATE_PULL_DEFAULT;
            this.downWrapHeight = this.downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT$2;

            this._transformDownWrap(-1 * this.downWrapHeight);
        }
    }, {
        key: '_transformDownWrap',
        value: function _transformDownWrap(offset, duration) {
            get(taobao.prototype.__proto__ || Object.getPrototypeOf(taobao.prototype), '_transformDownWrap', this).call(this, offset, duration);
        }

        /**
         * 旋转进度条
         * @param {Number} progress 对应需要选择的进度
         */

    }, {
        key: '_rotateDownProgress',
        value: function _rotateDownProgress(progress) {
            this.downWrapProgress.style.webkitTransform = 'rotate(' + progress + 'deg)';
            this.downWrapProgress.style.transform = 'rotate(' + progress + 'deg)';
        }

        /**
         * 重写下拉过程动画
         * @param {Number} downHight 当前下拉高度
         * @param {Number} downOffset 下拉阈值
         */

    }, {
        key: '_pullHook',
        value: function _pullHook(downHight, downOffset) {
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

                    this.downWrapTips.classList.remove(CLASS_HIDDEN$1);
                    this.downWrapProgress.classList.remove(CLASS_HIDDEN$1);
                    this.downWrapTips.innerText = down.contentdown;
                    this.pullState = STATE_PULL_DOWN;
                }
            } else if (downHight >= downOffset && (!secretGarden || downHight < secretGardenOffset)) {
                if (this.pullState !== STATE_PULL_READY_REFRESH) {
                    this.downWrapTips.classList.remove(CLASS_HIDDEN$1);
                    this.downWrapProgress.classList.remove(CLASS_HIDDEN$1);
                    this.downWrapTips.innerText = down.contentover;
                    this.pullState = STATE_PULL_READY_REFRESH;
                }
            } else if (this.pullState !== STATE_PULL_READY_SECRETGARDEN) {
                this.downWrapTips.classList.remove(CLASS_HIDDEN$1);
                this.downWrapProgress.classList.add(CLASS_HIDDEN$1);
                this.downWrapTips.innerText = down.secretGarden.tips;
                this.pullState = STATE_PULL_READY_SECRETGARDEN;
            }
        }

        /**
         * 因为有自定义秘密花园的动画，所以需要实现这个hook，在特定条件下去除默认行为
         * @param {Number} downHight 当前已经下拉的高度
         * @param {Number} downOffset 下拉阈值
         * @return {Boolean} 返回false就不再进入下拉loading，默认为true
         */

    }, {
        key: '_beforeDownLoadingHook',
        value: function _beforeDownLoadingHook() {
            // 只要没有进入秘密花园，就仍然是以前的动作，否则downLoading都无法进入了，需要自定义实现
            if (this.pullState === STATE_PULL_READY_SECRETGARDEN) {
                this._inSecretGarden();

                return false;
            }
            return true;
        }

        /**
         * 重写下拉动画
         * 秘密花园状态下无法进入
         */

    }, {
        key: '_downLoaingHook',
        value: function _downLoaingHook() {
            this.downWrapTips.innerText = this.options.down.contentrefresh;
            this.downWrapProgress.classList.add(CLASS_ROTATE$1);
            // 默认和contentWrap的同步
            this._transformDownWrap(-this.downWrapHeight + this.options.down.offset, this.options.down.bounceTime);
        }

        /**
         * 重写success 但是什么都不做
         * 秘密花园状态下无法进入
         */

    }, {
        key: '_downLoaingSuccessHook',
        value: function _downLoaingSuccessHook() {}

        /**
         * 重写下拉end
         * 秘密花园状态下无法进入
         * @param {Boolean} isSuccess 是否下拉请求成功
         */

    }, {
        key: '_downLoaingEndHook',
        value: function _downLoaingEndHook() {
            this.downWrapTips.innerText = this.options.down.contentdown;
            this.downWrapProgress.classList.remove(CLASS_ROTATE$1);
            // 默认和contentWrap的同步
            this._transformDownWrap(-this.downWrapHeight, this.options.down.bounceTime);
            // 需要重置回来
            this.pullState = STATE_PULL_DEFAULT;
        }

        /**
         * 取消loading的回调
         */

    }, {
        key: '_cancelLoaingHook',
        value: function _cancelLoaingHook() {
            // 默认和contentWrap的同步
            this._transformDownWrap(-this.downWrapHeight, this.options.down.bounceTime);
            this.pullState = STATE_PULL_DEFAULT;
        }

        /**
         * 秘密花园的动画
         * @param {Boolean} isInAnim 是否是进入
         */

    }, {
        key: '_secretGardenAnimation',
        value: function _secretGardenAnimation(isInAnim) {
            var bgAnimClassAdd = isInAnim ? CLASS_SECRET_GARDEN_BG_IN : CLASS_SECRET_GARDEN_BG_OUT,
                bgAnimClassRemove = isInAnim ? CLASS_SECRET_GARDEN_BG_OUT : CLASS_SECRET_GARDEN_BG_IN,
                moonAnimClassAdd = isInAnim ? CLASS_SECRET_GARDEN_MOON_IN : CLASS_SECRET_GARDEN_MOON_OUT,
                moonAnimClassRemove = isInAnim ? CLASS_SECRET_GARDEN_MOON_OUT : CLASS_SECRET_GARDEN_MOON_IN;

            // 动画变为加载特定的css样式，这样便于外部修改
            this.downWrapBg.classList.remove(bgAnimClassRemove);
            this.downWrapBg.classList.add(bgAnimClassAdd);

            this.downWrapMoon.classList.remove(moonAnimClassRemove);
            this.downWrapMoon.classList.add(moonAnimClassAdd);
        }

        /**
         * 进入秘密花园
         * 在秘密花园状态下走入的是这个实现
         */

    }, {
        key: '_inSecretGarden',
        value: function _inSecretGarden() {
            var downBounceTime = this.options.down.bounceTime,
                inSecretGardenCb = this.options.down.secretGarden.inSecretGarden;

            this.downWrapTips.classList.add(CLASS_HIDDEN$1);
            // 动画
            this.scroller.translateContentWrap(this.contentWrap.clientHeight, downBounceTime);
            this._transformDownWrap(this.contentWrap.clientHeight - this.downWrapHeight, downBounceTime);
            this._secretGardenAnimation(true);
            inSecretGardenCb && inSecretGardenCb();
        }

        /**
         * 重置秘密花园
         */

    }, {
        key: 'resetSecretGarden',
        value: function resetSecretGarden() {
            var downBounceTime = this.options.down.bounceTime;

            // 重置scroll
            this.scroller.translateContentWrap(0, downBounceTime);
            // 重置动画区域的wrap
            this._transformDownWrap(-1 * this.downWrapHeight, downBounceTime);
            this._secretGardenAnimation(false);
            // 需要重置回来
            this.pullState = STATE_PULL_DEFAULT;
        }
    }]);
    return taobao;
}(utils.theme.defaults);

/**
 * 仿微信小程序主题
 * 由于要复用default的上拉加载，toTop功能，所以直接继承自default
 * 只重写了 downWrap相关操作
 */

/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * theme字段会根据不同的主题有不同值
 */
var CLASS_THEME$3 = 'minirefresh-theme-applet';
var CLASS_DOWN_WRAP$2 = 'minirefresh-downwrap';
var CLASS_HARDWARE_SPEEDUP$2 = 'minirefresh-hardware-speedup';

/**
 * 本主题的特色样式
 */
var CLASS_DOWN_LOADING = 'loading-applet';

/**
 * 一些常量
 */
var DEFAULT_DOWN_HEIGHT$3 = 50;

var defaultSetting$4 = {
    down: {
        successAnim: {
            // 微信小程序没有successAnim 也没有文字提示
            isEnable: false
        },
        // 继承了default的downWrap部分代码，需要这个变量
        isWrapCssTranslate: true
    }
};

var applet = function (_utils$theme$defaults) {
    inherits(applet, _utils$theme$defaults);

    /**
     * 拓展自定义的配置
     * @param {Object} options 配置参数
     */
    function applet(options) {
        classCallCheck(this, applet);

        options = utils.extend(true, {}, defaultSetting$4, options);
        return possibleConstructorReturn(this, (applet.__proto__ || Object.getPrototypeOf(applet)).call(this, options));
    }

    /**
     * 重写下拉刷新初始化，变为小程序自己的动画
     */


    createClass(applet, [{
        key: '_initDownWrap',
        value: function _initDownWrap() {
            var container = this.container,
                contentWrap = this.contentWrap;

            // 下拉的区域
            var downWrap = document.createElement('div');

            downWrap.className = CLASS_DOWN_WRAP$2 + ' ' + CLASS_HARDWARE_SPEEDUP$2;
            downWrap.innerHTML = '<div class="downwrap-content ball-beat"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
            container.insertBefore(downWrap, contentWrap);

            // 由于直接继承的default，所以其实已经有default主题了，这里再加上本主题样式
            container.classList.add(CLASS_THEME$3);

            this.downWrap = downWrap;
            // 留一个默认值，以免样式被覆盖，无法获取
            this.downWrapHeight = this.downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT$3;
            this._transformDownWrap(-1 * this.downWrapHeight);
        }
    }, {
        key: '_transformDownWrap',
        value: function _transformDownWrap(offset, duration) {
            get(applet.prototype.__proto__ || Object.getPrototypeOf(applet.prototype), '_transformDownWrap', this).call(this, offset, duration);
        }

        /**
         * 重写下拉过程动画
         * @param {Number} downHight 当前下拉的高度
         * @param {Number} downOffset 下拉的阈值
         */

    }, {
        key: '_pullHook',
        value: function _pullHook(downHight, downOffset) {
            if (downHight < downOffset) {
                var rate = downHight / downOffset,
                    offset = this.downWrapHeight * (-1 + rate);

                this._transformDownWrap(offset);
            } else {
                this._transformDownWrap(0);
            }
        }

        /**
         * 重写下拉动画
         */

    }, {
        key: '_downLoaingHook',
        value: function _downLoaingHook() {
            this.downWrap.classList.add(CLASS_DOWN_LOADING);
        }

        /**
         * 重写success 但是什么都不做
         */

    }, {
        key: '_downLoaingSuccessHook',
        value: function _downLoaingSuccessHook() {}

        /**
         * 重写下拉end
         * @param {Boolean} isSuccess 是否成功
         */

    }, {
        key: '_downLoaingEndHook',
        value: function _downLoaingEndHook() {
            this.downWrap.classList.remove(CLASS_DOWN_LOADING);
            this._transformDownWrap(-1 * this.downWrapHeight, this.options.down.bounceTime);
        }

        /**
         * 取消loading的回调
         */

    }, {
        key: '_cancelLoaingHook',
        value: function _cancelLoaingHook() {
            this._transformDownWrap(-1 * this.downWrapHeight, this.options.down.bounceTime);
        }
    }]);
    return applet;
}(utils.theme.defaults);

/**
 * 3D抽屉效果主题
 * 复用了default的代码，在其基础上增加3D效果
 * 注意，复用_super时一定要十分熟悉default中对应代码的作用
 */

/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * theme字段会根据不同的主题有不同值
 */
var CLASS_THEME$4 = 'minirefresh-theme-drawer3d';

/**
 * 一些常量
 * 默认高度是200
 * 其中背景默认是黑色，内容是白色，再增设阻尼系数可以较好的达到3D效果
 */
var DEFAULT_DOWN_HEIGHT$4 = 200;
var DRAWER_FULL_DEGREE = 90;

var defaultSetting$5 = {
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

var drawer3d = function (_utils$theme$defaults) {
    inherits(drawer3d, _utils$theme$defaults);

    /**
     * 拓展自定义的配置
     * @param {Object} options 配置参数
     */
    function drawer3d(options) {
        classCallCheck(this, drawer3d);

        options = utils.extend(true, {}, defaultSetting$5, options);
        return possibleConstructorReturn(this, (drawer3d.__proto__ || Object.getPrototypeOf(drawer3d)).call(this, options));
    }

    /**
     * 重写下拉刷新初始化，变为小程序自己的动画
     */


    createClass(drawer3d, [{
        key: '_initDownWrap',
        value: function _initDownWrap() {
            // 先复用default代码，然后重写
            get(drawer3d.prototype.__proto__ || Object.getPrototypeOf(drawer3d.prototype), '_initDownWrap', this).call(this);

            var container = this.container,
                options = this.options,
                downWrap = this.downWrap;

            // 改写内容区域
            downWrap.innerHTML = '' + ('<div class="state-3d"><div class="drawer3d">' + '<div class="downwrap-content">' + '<p class="downwrap-progress"></p>' + '<p class="downwrap-tips">') + options.down.contentdown + ' </p></div>' + '<div class="drawer3d-mask"></div ></div></div>';

            // 由于直接继承的default，所以其实已经有default主题了，这里再加上本主题样式
            container.classList.add(CLASS_THEME$4);

            // 改写完后，对象需要重新查找
            this.downWrapProgress = downWrap.querySelector('.downwrap-progress');
            this.downWrapTips = downWrap.querySelector('.downwrap-tips');
            this.drawer = downWrap.querySelector('.drawer3d');
            this.drawerMask = downWrap.querySelector('.drawer3d-mask');

            // 留一个默认值，以免样式被覆盖，无法获取
            this.downWrapHeight = downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT$4;
            // 由于downWrap被改变了，重新移动
            this._transformDownWrap(-this.downWrapHeight);
            this._resetDrawer();
        }
    }, {
        key: '_transformDownWrap',
        value: function _transformDownWrap(offset, duration) {
            get(drawer3d.prototype.__proto__ || Object.getPrototypeOf(drawer3d.prototype), '_transformDownWrap', this).call(this, offset, duration);
        }
    }, {
        key: '_transformDrawer',
        value: function _transformDrawer(degree, duration) {
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
        }

        /**
         * 重置抽屉，主要是旋转角度
         */

    }, {
        key: '_resetDrawer',
        value: function _resetDrawer() {
            this._transformDrawer(DRAWER_FULL_DEGREE, this.options.down.bounceTime);
        }

        /**
         * 重写下拉过程动画
         * @param {Number} downHight 当前下拉的高度
         * @param {Number} downOffset 下拉的阈值
         */

    }, {
        key: '_pullHook',
        value: function _pullHook(downHight, downOffset) {
            // 复用default的同名函数代码           
            get(drawer3d.prototype.__proto__ || Object.getPrototypeOf(drawer3d.prototype), '_pullHook', this).call(this, downHight, downOffset);

            var rate = downHight / downOffset,
                degree = DRAWER_FULL_DEGREE * (1 - Math.min(rate, 1));

            this._transformDrawer(degree);
        }

        /**
         * 重写下拉动画
         */

    }, {
        key: '_downLoaingHook',
        value: function _downLoaingHook() {
            // loading中已经translate了
            get(drawer3d.prototype.__proto__ || Object.getPrototypeOf(drawer3d.prototype), '_downLoaingHook', this).call(this);

            this._transformDrawer(0, this.options.down.bounceTime);
        }

        /**
         * 重写success 但是什么都不做
         */

    }, {
        key: '_downLoaingSuccessHook',
        value: function _downLoaingSuccessHook() {}

        /**
         * 重写下拉end
         * @param {Boolean} isSuccess 是否成功
         */

    }, {
        key: '_downLoaingEndHook',
        value: function _downLoaingEndHook(isSuccess) {
            get(drawer3d.prototype.__proto__ || Object.getPrototypeOf(drawer3d.prototype), '_downLoaingEndHook', this).call(this, isSuccess);
            this._resetDrawer();
        }

        /**
         * 取消loading的回调
         */

    }, {
        key: '_cancelLoaingHook',
        value: function _cancelLoaingHook() {
            get(drawer3d.prototype.__proto__ || Object.getPrototypeOf(drawer3d.prototype), '_cancelLoaingHook', this).call(this);
            this._resetDrawer();
        }
    }]);
    return drawer3d;
}(utils.theme.defaults);

/**
 * 滑动抽屉效果
 * 复用了default的代码
 * 下拉动画时完全自定义重写，不移动scroll，而是直接css动画
 */

/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * theme字段会根据不同的主题有不同值
 */
var CLASS_THEME$5 = 'minirefresh-theme-drawerslider';

/**
 * 一些常量
 * 默认高度是200
 * 其中背景默认是黑色，内容是白色，再增设阻尼系数可以较好的达到3D效果
 */
var DEFAULT_DOWN_HEIGHT$5 = 200;
var DOWN_SHADOW_HEIGHT$1 = 2;

var defaultSetting$6 = {
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

var drawerslider = function (_utils$theme$defaults) {
    inherits(drawerslider, _utils$theme$defaults);

    /**
     * 拓展自定义的配置
     * @param {Object} options 配置参数
     */
    function drawerslider(options) {
        classCallCheck(this, drawerslider);

        options = utils.extend(true, {}, defaultSetting$6, options);
        return possibleConstructorReturn(this, (drawerslider.__proto__ || Object.getPrototypeOf(drawerslider)).call(this, options));
    }

    /**
     * 重写下拉刷新初始化，变为小程序自己的动画
     */


    createClass(drawerslider, [{
        key: '_initDownWrap',
        value: function _initDownWrap() {
            // 先复用default代码，然后重写
            get(drawerslider.prototype.__proto__ || Object.getPrototypeOf(drawerslider.prototype), '_initDownWrap', this).call(this);

            var container = this.container,
                options = this.options,
                downWrap = this.downWrap;

            // 改写内容区域
            downWrap.innerHTML = '' + ('<div class="drawer">' + '<div class="downwrap-content">' + '<p class="downwrap-progress"></p>' + '<p class="downwrap-tips">') + options.down.contentdown + ' </p></div>' + '<div class="drawer-mask"></div ></div>';

            // 由于直接继承的default，所以其实已经有default主题了，这里再加上本主题样式
            container.classList.add(CLASS_THEME$5);

            // 改写完后，对象需要重新查找，需要给default用
            this.downWrapProgress = downWrap.querySelector('.downwrap-progress');
            this.downWrapTips = downWrap.querySelector('.downwrap-tips');
            this.drawer = downWrap.querySelector('.drawer');
            this.drawerMask = downWrap.querySelector('.drawer-mask');

            // 留一个默认值，以免样式被覆盖，无法获取
            // +2是去除阴影的位置
            this.downWrapHeight = DOWN_SHADOW_HEIGHT$1 + downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT$5;
            // 由于downWrap被改变了，重新移动
            this._transformDownWrap(-this.downWrapHeight);
        }
    }, {
        key: '_transformDownWrap',
        value: function _transformDownWrap(offset, duration) {
            get(drawerslider.prototype.__proto__ || Object.getPrototypeOf(drawerslider.prototype), '_transformDownWrap', this).call(this, offset, duration);
            this._transformDrawer(offset, duration);
        }
    }, {
        key: '_transformDrawer',
        value: function _transformDrawer(offset, duration) {
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
        }

        /**
         * 重写下拉过程动画
         * @param {Number} downHight 当前下拉的高度
         * @param {Number} downOffset 下拉的阈值
         */

    }, {
        key: '_pullHook',
        value: function _pullHook(downHight, downOffset) {
            // 复用default的同名函数代码           
            get(drawerslider.prototype.__proto__ || Object.getPrototypeOf(drawerslider.prototype), '_pullHook', this).call(this, downHight, downOffset);
        }

        /**
         * 重写下拉动画
         */

    }, {
        key: '_downLoaingHook',
        value: function _downLoaingHook() {
            // loading中已经translate了
            get(drawerslider.prototype.__proto__ || Object.getPrototypeOf(drawerslider.prototype), '_downLoaingHook', this).call(this);
        }

        /**
         * 重写success 但是什么都不做
         */

    }, {
        key: '_downLoaingSuccessHook',
        value: function _downLoaingSuccessHook() {}

        /**
         * 重写下拉end
         * @param {Boolean} isSuccess 是否成功
         */

    }, {
        key: '_downLoaingEndHook',
        value: function _downLoaingEndHook(isSuccess) {
            get(drawerslider.prototype.__proto__ || Object.getPrototypeOf(drawerslider.prototype), '_downLoaingEndHook', this).call(this, isSuccess);
        }

        /**
         * 取消loading的回调
         */

    }, {
        key: '_cancelLoaingHook',
        value: function _cancelLoaingHook() {
            get(drawerslider.prototype.__proto__ || Object.getPrototypeOf(drawerslider.prototype), '_cancelLoaingHook', this).call(this);
        }
    }]);
    return drawerslider;
}(utils.theme.defaults);

var themeMap = {
    defaults: defaults,
    jianshu: jianshu,
    taobao: taobao,
    applet: applet,
    drawer3d: drawer3d,
    drawerslider: drawerslider
};

var pagerefresh =
/**
 * 构造函数
 * @param {Object} options 配置信息
 * @constructor
 */
function pagerefresh(options) {
    classCallCheck(this, pagerefresh);

    return new themeMap[options.theme ? options.theme : 'defaults'](options);
};

pagerefresh.version = '0.0.2';

return pagerefresh;

})));
