import defaults from './theme';
import jianshu from './theme/jianshu';
import taobao from './theme/taobao';
import applet from './theme/applet';
import drawer3d from './theme/drawer3d';
import drawerslider from './theme/drawerslider';

const themeMap = {
    defaults,
    jianshu,
    taobao,
    applet,
    drawer3d,
    drawerslider
}
const pagerefresh = function (position) {
    return new themeMap[position.theme](position)
}

export default pagerefresh
export { pagerefresh }