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

export default function pagerefresh(position) {
    return new themeMap[position.theme ? position.theme : 'defaults'](position);
}