// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
        //窗口可用高度
        wH:0,
        //摄像头朝向
        position:'front',
       //照片存放路径
       src:'',
       //是否将照片渲染至屏幕
       isShowPic:false,
       //是否显示人脸信息盒子
       isShowInfo:false,
       //人脸信息
       faceInfo: null,
       //英文-中文映射关系
       map:{
        face_type:{
          human: '真实人脸',
          cartoon: '卡通人脸'
        },
        face_shape:{
          square: '方脸',
          triangle:'瓜子脸',
          oval: '鹅蛋脸', 
          heart: '心形脸', 
          round: '圆脸'
        },
        gender:{
          male:'男性',
          female:'女性'
        },
        expression: {
          none: '不笑', smile: '微笑', laugh: '大笑'
        },
        emotion: {
          angry: '愤怒', disgust: '厌恶', fear: '恐惧', happy: '高兴',
          sad: '伤心', surprise: '惊讶', neutral: '无情绪'
        }
       }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
       const sycInfo=wx.getSystemInfoSync()
       this.setData({
        wH:sycInfo.windowHeight
      })
  },

  // 切换摄像头事件
  reverseCamera(){
       const newPosition=this.data.position === 'front'?'back':'front'
       this.setData({
         position:newPosition
       })
  },

  //拍照事件
  takePhoto(){
    const cxt=wx.createCameraContext()
    cxt.takePhoto({
       quality:'high',
       success: (res) => {
         this.setData({
           src:res.tempImagePath,
           isShowPic:true
           //获取到照片的路径后，执行颜值检测函数
         },()=>{
           this.getFaceInfo()
         })
       },
       fail: () => {
         console.log('拍照失败')
         this.setData({
           src:''
         })
       },
    })
  },

//从相册中选取照片事件
choosePhoto(){
  wx.chooseImage({
    //只允许选取一张照片
    count:1,
    //照片类型:原图
    sizeType:['original'],
    sourceType:['album'],
    success:(res)=>{
      //若文件路径长度大于0，即成功选取了图片
      if(res.tempFilePaths.lenght>0){
          this.setData({
            src:res.tempFilePaths[0],
            isShowPic:true
          },()=>{
           this.getFaceInfo()
          })
        }
      },
    fail:()=>{
      wx.showToast({
        title: '选取照片失败',
      })
      this.setData({
        src:''
      })
    }
  })
},
//重选照片事件
reChoose(){
  this.setData({
    src:'',
    isShowPic:false
  })
},
//颜值检测函数
getFaceInfo(){
  //获取鉴权token
  const token=app.globalData.access_token
  if(!token){
    return wx.showToast({
      title: '鉴权失败',
    })
  }
  //添加loading效果
  wx.showLoading({
    title:'颜值检测中......',
  })
  //颜值检测
  //1.获取需要检测的图片文件
  const fileManager=wx.getFileSystemManager()
  //2.将图片转为base64格式文件
  const file=fileManager.readFileSync(this.data.src,'base64')
  //3.发送颜值检测请求
  wx.request({
    method:'POST',
    url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=' + token,
    header:{
     'Content-Type':'application/json'
    },
    //使用data接收body中的请求参数
    data:{
       image_type:'BASE64',
       image:file,
       //年龄，颜值，表情，脸型，性别，情绪，真实人脸/卡通人脸
		   face_field:'age,beauty,expression,face_shape,gender,emotion,face_type'
    },
    success:(res)=>{
      if(res.data.result.face_num <= 0){
        return wx.showToast({
          title: '未检测到人脸',
        })
      }
      this.setData({
          faceInfo:res.data.result.face_list[0],
          isShowInfo:true
      })
    },
    fail:()=>{
      wx.showToast({
        title: '颜值检测失败',
      })
    },
    //无论检测成功与否，均隐藏loading效果
    complete:()=>{
      wx.hideLoading()
    }
  })
},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})