/**
 * 仿微信小程序主题
 * 由于要复用default的上拉加载，toTop功能，所以直接继承自default
 * 只重写了 downWrap相关操作
 */

import utils from '../../utils/index';
import './index.css';


/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * theme字段会根据不同的主题有不同值
 */
const CLASS_THEME = 'minirefresh-theme-applet';
const CLASS_DOWN_WRAP = 'minirefresh-downwrap';
const CLASS_HARDWARE_SPEEDUP = 'minirefresh-hardware-speedup';

/**
 * 本主题的特色样式
 */
const CLASS_DOWN_LOADING = 'loading-applet';

/**
 * 一些常量
 */
const DEFAULT_DOWN_HEIGHT = 50;

const defaultSetting = {
    down: {
        successAnim: {
            // 微信小程序没有successAnim 也没有文字提示
            isEnable: false,
        },
        // 继承了default的downWrap部分代码，需要这个变量
        isWrapCssTranslate: true,
    },
};

class applet extends utils.theme.defaults {
    /**
     * 拓展自定义的配置
     * @param {Object} options 配置参数
     */
    constructor(options) {
        options = utils.extend(true, {}, defaultSetting, options);
        super(options);
    }

    /**
     * 重写下拉刷新初始化，变为小程序自己的动画
     */
    _initDownWrap() {
        let container = this.container,
            contentWrap = this.contentWrap;

        // 下拉的区域
        const downWrap = document.createElement('div');

        downWrap.className = `${CLASS_DOWN_WRAP} ${CLASS_HARDWARE_SPEEDUP}`;
        downWrap.innerHTML = '<div class="downwrap-content ball-beat"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
        container.insertBefore(downWrap, contentWrap);

        // 由于直接继承的default，所以其实已经有default主题了，这里再加上本主题样式
        container.classList.add(CLASS_THEME);

        this.downWrap = downWrap;
        // 留一个默认值，以免样式被覆盖，无法获取
        this.downWrapHeight = this.downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT;
        this._transformDownWrap(-1 * this.downWrapHeight);
    }
    _transformDownWrap(offset, duration) {
        super._transformDownWrap(offset, duration);
    }

    /**
     * 重写下拉过程动画
     * @param {Number} downHight 当前下拉的高度
     * @param {Number} downOffset 下拉的阈值
     */
    _pullHook(downHight, downOffset) {
        if (downHight < downOffset) {
            let rate = downHight / downOffset,
                offset = this.downWrapHeight * (-1 + rate);

            this._transformDownWrap(offset);
        } else {
            this._transformDownWrap(0);
        }
    }

    /**
     * 重写下拉动画
     */
    _downLoaingHook() {
        this.downWrap.classList.add(CLASS_DOWN_LOADING);
    }

    /**
     * 重写success 但是什么都不做
     */
    _downLoaingSuccessHook() { }

    /**
     * 重写下拉end
     * @param {Boolean} isSuccess 是否成功
     */
    _downLoaingEndHook() {
        this.downWrap.classList.remove(CLASS_DOWN_LOADING);
        this._transformDownWrap(-1 * this.downWrapHeight, this.options.down.bounceTime);
    }

    /**
     * 取消loading的回调
     */
    _cancelLoaingHook() {
        this._transformDownWrap(-1 * this.downWrapHeight, this.options.down.bounceTime);
    }
}

export default applet;