# 你真好看-微信小程序

## 使用说明

1. 点击左侧转换摄像头按钮，可控制使用前置摄像头或后置摄像头，默认使用前置摄像头

2. 点击中间拍照按钮，可进行拍照操作，进行颜值检测
3. 点击右侧按钮可从本地相册中选取图片进行颜值检测

## 项目实现
### camera组件
1. mode属性：设置指定拍照（normal）或扫码功能（scanCode），该属性无法在程序使用期间进行切换
2. device-position属性：设置指定调用前置摄像头或后置摄像头，默认使用后置摄像头
3. flash属性：设置是否开启闪光灯，auto自动

### 动态设置camera组件的高度
不同设备的camera高度不一样，故camera的组件高度应设置为自适应

在home.js的onload生命周期函数中使用Object wx.getSystemInfoSync()  同步API获取当前设备屏幕的剩余可用高度windowHeight

1. 渲染 camera 组件
```
<camera style="height: {{wH}}px; width: 100%;" flash="off"></camera>
```
2. 在 data 中定义 wH
```
data: {     
	// 窗口可用的高度     
	wh: 0 
}
```
3. 动态获取页面可用高度
```
/** 
* 生命周期函数­­监听页面加载 
* */ 
 onLoad: function(options) {     
 		const sysInfo = wx.getSystemInfoSync()     
		this.setData({         
 		wh: sysInfo.windowHeight     
 		}) 
	}
```
### 隐藏navigation导航条区域
让camera组件撑满整个屏幕

修改小程序全局配置app.json中的window节点，新增"navigationStyle":"custom"

### 在camera组件中渲染操作按钮
使用图片图标渲染操作按钮
使用<cover-view></cover-view>和<cover-image></cover-image>在camera组件（原生组件）中渲染

### 动态切换摄像头（前置后置）
为翻转图标bindtap绑定一个点击事件处理
利用camera组件中的device-position属性动态设置摄像头的朝向，默认使用前置摄像头

1. 在 data 中定义数据：
```
data: {     
	// 摄像头的朝向
	position: 'front' 
}
```
2. 为切换摄像头按钮绑定点击事件处理函数：
```
<!-- 切换摄像头 --> <cover-image src='/images/icon/reverse.png' bindtap='reverseCamera'></cover-image>
```
3. 实现reverseCamera函数的功能：
```
// 点击按钮，切换摄像头 
reverseCamera() {    const newPosition = this.data.position === 'front' ? 'back' : 'front'    this.setData({       
		position: newPosition     
	}) 
}
```
### 实现拍照功能
调用camera组件实现拍照功能

使用wx.createCameraContext()  API创建相机的实例对象

并为该对象绑定拍照事件takePhoto()，拍照成功后返回照片的临时存放路径

1. 在 data 中定义数据：
```
data: {     
	// 照片的路径     
	src: '' 
}
```
2. 为拍照按钮绑定点击事件处理函数：
```
<!-- 拍照 --> <cover-image src='/images/icon/camera.png' bindtap='takePhoto'></cover-image>
```
3. 实现 takePhoto 函数的功能：
```
// 拍照 
takePhoto() {     
	// 创建相机的实例对象     
	const ctx = wx.createCameraContext()     
	// ctx.takePhoto 实现拍照     
	ctx.takePhoto({       
		quality: 'high',       
		success: (res) => {             
			this.setData({           
				src: res.tempImagePath,           
				isShowPic: true         
		}, () => {           
				this.getFaceInfo()         
			})       
		},       
		fail: () => {         
			console.log('拍照失败！')         
			this.setData({           
				src: ''         
			})       
		}     
	}) 
}
```
### 实现从相册中选定照片的功能

使用wx.chooseImage API实现从本地相册中选取图片

1. 为按钮绑定事件处理函数：
```
<!-- 从相册选取照片 --> <cover-image src='/images/icon/album.png' bindtap='choosePhoto'></cover-image>
```
2. 实现 choosePhoto 函数：
```
 // 从相册选取照片   
 choosePhoto() {     
 	wx.chooseImage({       
 		count: 1,       
 		sizeType: ['original'],       
 		sourceType: ['album'],       
 		success: (res) => {         
 		// console.log(res)         
 			if (res.tempFilePaths.length > 0) {           
 				this.setData({             
 					src: res.tempFilePaths[0],
                    isShowPic: true           
                }, () => {             
                	this.getFaceInfo()           
                })         
            }       
        },       
        fail: () => {         
        	console.log('选择照片失败！')         
        	this.setData({           
        		src: ''         
        	})       
        }     
     })   
}
```
### 将选取的照片渲染至屏幕

wx:if            isShowPhoto：false默认不渲染照片至屏幕，显示camera组件

wx:else        定义一个view区域用于按需加载照片，

当成功从相册中选取图片或拍照成功时，将照片渲染至屏幕，并使得照片覆盖整个屏幕mode:'aspectFill'

```
<view wx:else>   <image src='{{src}}' style='width: 100%; height: {{wh}}px; display: block;'  mode='aspectFill'></image> 
</view>
```
### 实现重选照片

当用户成功选择照片后，显示出一个红色按钮，允许用户重新选择照片

1. 添加重选照片按钮并绑定点击事件处理函数
```
<button type='warn' class='reChoose' bindtap='reChoose'>换一张？</button>
```
2. 实现 reChoose 函数：
```
// 重新选择照片   
reChoose() {     
	this.setData({       
		isShowPic: false,       
		src: ''     
	})   
}
```
### 定义并调用测颜值函数
当拍照成功或选取照片成功后，获取到照片路径后，调用测颜值函数

### 申请百度AI平台账号 ，获取人脸识别API

### 实现百度AI人脸识别API鉴权
在app.js进行全局鉴权操作。
在onLanch节点（小程序初始化完成后，全局会触发一次）中发送百度API鉴权请求
使用getApp()获取全局的实例对象，以获取access_token实现鉴权，并在测颜值函数中获取access_token
```
 wx.request({       
 	method: 'POST',       
 	url: 'https://aip.baidubce.com/oauth/2.0/token? 	 grant_type=client_credentials&client_id=ID&client_secret=KEY',    success: (res) => {  
       this.globalData.access_token = res.data.access_token       
 	},    
 	fail: () => {         
 		wx.showToast({           
 			title: '鉴权失败！',         
 		})       
 	}     
 })
```

### 将图片转码为 base64 字符串
使用wx.getFileSystemManager  API获取图片文件的实例对象
然后调用wx.getFileSystemManager.readFileSync(文件路径,编码格式：‘base64’) 指定文件编码格式以获取BASE64格式的照片文件 
```
const fileManager = wx.getFileSystemManager() const fileStr = fileManager.readFileSync(this.data.src, 'base64')
```

### 发送颜值检测数据请求并渲染至页面
1. 发送颜值检测数据请求
```
wx.request({       
	method: 'POST',       
	url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=' + token,     header: {         
		'Content­Type': 'application/json'       
	}, 
    //使用data接收body中的参数
	data: {         
		image_type: 'BASE64',         
		image: fileStr,         
		face_field: 'age,beauty,expression,gender,glasses,emotion'     },       
	success: (res) => {         
		console.log(res)         
		if (res.data.result.face_num <= 0) {           return wx.showToast({             
			title: '未检测到人脸！',           
		  })         
		}           
		this.setData({           
			faceInfo: res.data.result.face_list[0],          
			isShowBox: true         
		})       
	},       
	fail: () => {         
		wx.showToast({           
			title: '颜值检测失败！',         
		})       
	},       
	complete: () => {         
		wx.hideLoading()       
		}     
})
```
2. 渲染获取到的颜值数据至对应的页面结构{{}}
3. 定义映射关系，将英文信息映射为中文信息
```
data: {     
	// 映射关系     
	map: {       
		gender: {            
			male: '男', 
			female: '女'       
		},       
		expression: {        
        	none: '不笑', 
        	smile: '微笑', 
        	laugh: '大笑'       
        },       
        glasses: {         
        	none: '无眼镜',
        	common: '普通眼镜',
        	sun: '墨镜'       
        },       
        emotion: {         
        	angry: '愤怒', 
        	disgust: '厌恶', 
        	fear: '恐惧', 
        	happy: '高兴',         
        	sad: '伤心', 
        	surprise: '惊讶', 
        	neutral: '无情绪'       
        }     
     } 
}
```

### 处理数据闪烁问题
网络请求需要时间，当网络不给力的时候，数据仍未渲染出来。
使用一个布尔值控制人脸信息盒子的展示，
当数据请求完成后，显示人脸信息盒子
当重新选择照片的时候，隐藏人脸信息盒子

### 数据加载期间的 loading 效果
在测颜值函数中，在获取数据之前，使用wx.showLoading()加载loading效果
当请求完成后，在complete节点中，无论请求失败或请求成功均移除loading效果













