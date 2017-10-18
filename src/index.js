import defaults from './theme/index';
import jianshu from './theme/jianshu/index';
import taobao from './theme/taobao/index';
import applet from './theme/applet/index';
import drawer3d from './theme/drawer3d/index';
import drawerslider from './theme/drawerslider/index';

const themeMap = {
    defaults,
    jianshu,
    taobao,
    applet,
    drawer3d,
    drawerslider,
};


class pagerefresh {
    /**
     * 构造函数
     * @param {Object} options 配置信息
     * @constructor
     */
    constructor(options) {
        return new themeMap[position.theme ? position.theme : 'defaults'](position);
    }
}


pagerefresh.version = '0.0.1';

export default pagerefresh;


// export default function pagerefresh(position) {
//     return new themeMap[position.theme ? position.theme : 'defaults'](position);
// }