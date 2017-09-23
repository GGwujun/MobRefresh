/**
 * 3D抽屉效果主题
 * 复用了default的代码，在其基础上增加3D效果
 * 注意，复用_super时一定要十分熟悉default中对应代码的作用
 */

import utils from '../../utils/index';
import './index.css';


/**
 * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
 * theme字段会根据不同的主题有不同值
 */
const CLASS_THEME = 'minirefresh-theme-drawer3d';

/**
 * 一些常量
 * 默认高度是200
 * 其中背景默认是黑色，内容是白色，再增设阻尼系数可以较好的达到3D效果
 */
const DEFAULT_DOWN_HEIGHT = 200;
const DRAWER_FULL_DEGREE = 90;

const defaultSetting = {
    down: {
        offset: 100,
        // 阻尼系数，下拉的距离大于offset时,改变下拉区域高度比例;值越接近0,高度变化越小,表现为越往下越难拉
        dampRate: 0.2,
        bounceTime: 500,
        successAnim: {
            // successAnim
            isEnable: false,
        },
        // 继承了default的downWrap部分代码，需要这个变量
        isWrapCssTranslate: true,
    },
};

class drawer3d extends utils.theme.defaults {
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
        // 先复用default代码，然后重写
        super._initDownWrap();

        let container = this.container,
            options = this.options,
            downWrap = this.downWrap;

        // 改写内容区域
        downWrap.innerHTML = `${'<div class="state-3d"><div class="drawer3d">' +
            '<div class="downwrap-content">' +
            '<p class="downwrap-progress"></p>' +
            '<p class="downwrap-tips">'}${
            options.down.contentdown
        } </p></div>` +
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
    }
    _transformDownWrap(offset, duration) {
        super._transformDownWrap(offset, duration);
    }
    _transformDrawer(degree, duration) {
        degree = degree || 0;
        duration = duration || 0;
        // 一些3D相关属性写到了CSS中
        this.drawer.style.transform = `rotateX(${degree}deg) rotateY(0deg)`;
        this.drawer.style.webkitTransform = `rotateX(${degree}deg) rotateY(0deg)`;
        this.drawer.style.transitionDuration = `${duration}ms`;
        this.drawer.style.webkitTransitionDuration = `${duration}ms`;

        const opacity = degree / DRAWER_FULL_DEGREE;

        this.drawerMask.style.opacity = opacity;
        this.drawerMask.style.transitionDuration = `${duration}ms`;
        this.drawerMask.style.webkitTransitionDuration = `${duration}ms`;
    }

    /**
     * 重置抽屉，主要是旋转角度
     */
    _resetDrawer() {
        this._transformDrawer(DRAWER_FULL_DEGREE, this.options.down.bounceTime);
    }

    /**
     * 重写下拉过程动画
     * @param {Number} downHight 当前下拉的高度
     * @param {Number} downOffset 下拉的阈值
     */
    _pullHook(downHight, downOffset) {
        // 复用default的同名函数代码           
        super._pullHook(downHight, downOffset);

        let rate = downHight / downOffset,
            degree = DRAWER_FULL_DEGREE * (1 - Math.min(rate, 1));

        this._transformDrawer(degree);
    }

    /**
     * 重写下拉动画
     */
    _downLoaingHook() {
        // loading中已经translate了
        super._downLoaingHook();

        this._transformDrawer(0, this.options.down.bounceTime);
    }

    /**
     * 重写success 但是什么都不做
     */
    _downLoaingSuccessHook() { }

    /**
     * 重写下拉end
     * @param {Boolean} isSuccess 是否成功
     */
    _downLoaingEndHook(isSuccess) {
        super._downLoaingEndHook(isSuccess);
        this._resetDrawer();
    }

    /**
     * 取消loading的回调
     */
    _cancelLoaingHook() {
        super._cancelLoaingHook();
        this._resetDrawer();
    }
}

export default drawer3d;