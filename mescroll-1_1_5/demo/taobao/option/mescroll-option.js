/*
 *下拉刷新和上拉加载js
 * 
1.引用mescroll.css和mescroll.js; 引用自定义的mescroll-option.css和mescroll-option.js,并检查相关图片路径是否引用正确;

2.拷贝以下布局结构
<div id="mescroll" class="mescroll"> // id可修改,但class不能改;另外mescroll的height: 100%,所以父布局要有高度,否则无法触发上拉加载.
	//滑动区域的内容,如:<ul>列表数据</ul> ...
</div>

3.创建MeScroll对象,内部已默认开启下拉刷新
var mescroll = initMeScroll("mescroll", {
//	down:{
//		auto: true, //是否在初始化完毕之后自动执行下拉回调callback; 默认true
//		callback: function() {
//			mescroll.resetUpScroll();//下拉刷新的回调,默认重置上拉加载列表为第一页
//		}
//	},
	up: {
//		auto: false, //是否在初始化时以上拉加载的方式自动加载第一页数据; 默认false
		callback: getListData, //上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
	}
});

function getListData(page){
	$.ajax({
        type: 'GET',
        url: 'xxxxxx?num='+page.num+"&size="+page.size,
        dataType: 'json',
        success: function(data){
        	//联网成功的回调,隐藏下拉刷新和上拉加载的状态;(参数:当前页数据的总数)
			mescroll.endSuccess(data.length);//如果传了参数,mescroll会自动判断列表若无任何数据,则提示空;列表无下一页数据,则提示无更多数据;如果不传参数则仅隐藏加载中的状态
			//设置列表数据
			//setListData(data);
        },
        error: function(data){
        	//联网失败的回调,隐藏下拉刷新和上拉加载的状态;
	        mescroll.endErr();
        }
    });
}

其他常用方法:
1.主动触发下拉刷新 mescroll.triggerDownScroll();
2.主动触发上拉加载 mescroll.triggerUpScroll();
3.重置列表 mescroll.resetUpScroll();
4.滚动列表到指定位置 mescroll.scrollTo(y); (y=0回到列表顶部;如需滚动到列表底部,可设置y很大的值,比如y=99999);
5.获取下拉刷新的配置 mescroll.optDown;
6.获取上拉加载的配置 mescroll.optUp;
7.锁定下拉刷新 mescroll.lockDownScroll(isLock); (isLock=ture,null锁定;isLock=false解锁)
8.锁定上拉加载 mescroll.lockUpScroll(isLock); (isLock=ture,null锁定;isLock=false解锁)
**/

function initMeScroll(mescrollId, options) {
	//下拉刷新的布局内容
	var htmlContent = '<div class="downwarp-progress">';
	htmlContent += '<div><div class="progress-left-arc"></div></div>';
	htmlContent += '<div><div class="progress-right-arc"></div></div>';
	htmlContent += '</div>';
	htmlContent += '<p class="downwarp-tip">下拉即可刷新</p>';
			
	//自定义的配置
	var myOption={
		down:{
			offset: 100, //触发刷新的距离
			outOffsetRate: 0.5, //超过指定距离范围外时,改变下拉区域高度比例;小于1,越往下拉高度变化越小;
			htmlContent: htmlContent, //布局内容
			inited: function(mescroll, downwarp) {
				//初始化完毕的回调,可缓存dom
				mescroll.downTipDom = downwarp.getElementsByClassName("downwarp-tip")[0];
				mescroll.downProgressDom = downwarp.getElementsByClassName("downwarp-progress")[0];
				mescroll.downLeftArcDom = downwarp.getElementsByClassName("progress-left-arc")[0];
				mescroll.downRightArcDom = downwarp.getElementsByClassName("progress-right-arc")[0];
				//这里为了演示流畅,提前创建淘宝二楼欢迎页,预先加载好相关图片; 实际项目可按需加载;
				mescroll.taobaoErlouDom = document.createElement("div");
				mescroll.taobaoErlouDom.className = "mescorll-erlou";
				document.body.appendChild(mescroll.taobaoErlouDom); //加在body上,避免加在me.scrollDom在使用硬件加速样式时会使fixed失效
				mescroll.taobaoErlouDom.onclick=function(){//点击隐藏
					mescroll.taobaoErlouDom.classList.remove("mescroll-fade-in");
					mescroll.taobaoErlouDom.classList.add("mescroll-fade-out");
				}
			},
			inOffset: function(mescroll) {
				//进入指定距离范围内那一刻的回调
				mescroll.downTipDom.innerHTML = "下拉即可刷新";
				mescroll.downProgressDom.classList.remove("mescroll-rotate");
				mescroll.downProgressDom.style.display="inline-block";
			},
			outOffset: function(mescroll) {
				//下拉超过指定距离那一刻的回调
				//配置空方法,表示outOffset不做处理 (不可写outOffset:null,否则会执行mescroll默认配置的outOffset方法)
			},
			onMoving: function(mescroll, rate, downHight) {
				//下拉过程中的回调,滑动过程一直在执行; rate下拉区域当前高度与指定距离的比值(inOffset: rate<1; outOffset: rate>=1); downHight当前下拉区域的高度
				if (rate<1) {
					//inOffset
					var progress = 360 * rate;
					if (progress<180) {
						mescroll.downRightArcDom.style.webkitTransform = "rotate(" + (progress+45) + "deg)";
						mescroll.downRightArcDom.style.transform = "rotate(" + (progress+45) + "deg)";
						mescroll.downLeftArcDom.style.webkitTransform = "rotate(45deg)";
						mescroll.downLeftArcDom.style.transform = "rotate(45deg)";
					} else{
						mescroll.downLeftArcDom.style.webkitTransform = "rotate(" + (progress-180+45) + "deg)";
						mescroll.downLeftArcDom.style.transform = "rotate(" + (progress-180+45) + "deg)";
						mescroll.downRightArcDom.style.webkitTransform = "rotate(225deg)";
						mescroll.downRightArcDom.style.transform = "rotate(225deg)";
					}
				} else if(rate<1.5){
					//小于1.5倍offset,
					mescroll.isLockCallback=false;//解除完全自定义下拉刷新
					mescroll.downTipDom.innerHTML = "释放即可刷新";
					mescroll.downProgressDom.style.display="inline-block";
				} else{
					//大于1.5倍offset,自定义下拉刷新,进入淘宝二楼
					if(!mescroll.isLockCallback){
						mescroll.isLockCallback=true;//标记完全自定义下拉刷新,进入淘宝二楼
						mescroll.downTipDom.innerHTML = "欢迎光临 淘宝二楼";
						mescroll.downProgressDom.style.display="none";
					}
				}
			},
			beforeLoading: function(mescroll,downwarp) {
				//准备触发下拉刷新的回调,自定义下拉刷新进入淘宝二楼
				if (mescroll.isLockCallback) {
					//月亮动画
					downwarp.classList.add("downwarp-erlou-show");
					setTimeout(function(){
						downwarp.classList.remove("downwarp-erlou-show");
						mescroll.endDownScroll();//动画执行完毕后,结束下拉的状态
					},2000)
					//显示淘宝二楼
					mescroll.taobaoErlouDom.classList.remove("mescroll-fade-out");
					mescroll.taobaoErlouDom.classList.add("mescroll-fade-in");
				}
				
				return mescroll.isLockCallback;//如果要完全自定义下拉刷新,那么return true,此时将不再执行showLoading(),callback();
			},
			showLoading: function(mescroll) {
				//触发下拉刷新的回调
				mescroll.downTipDom.innerHTML = "加载中 ...";
				mescroll.downProgressDom.classList.add("mescroll-rotate");
			}
		},
		up:{
			htmlLoading: '<p class="upwarp-progress mescroll-rotate"></p><p class="upwarp-tip">正在寻找您心水的宝贝</p>', //上拉加载中的布局
			toTop: {
				src: "option/mescroll-totop.png" //回到顶部按钮的图片路径
			}
		}
	}
	
	//加入自定义的默认配置
	options=MeScroll.extend(options,myOption);
	
	//创建MeScroll对象
	return new MeScroll(mescrollId,options);
}