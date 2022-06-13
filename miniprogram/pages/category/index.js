import { request } from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
Page({
  data: {
    // 左侧的菜单数据
    leftMenuList:[],
    // 右侧的商品数据
    rightContent:[],
    // 被点击的左侧菜单
    currentIndex:0,
    // 右侧内容的滚动条距离顶部的距离
    scrollTop:0
  },
  // 接口的返回数据
  Cates:[],

  onLoad: function (options) {
    /*
    0.web中的本地存储与小程序中的本地存储的区别
      1.写代码的方式不太一样
      web：localStorage.setItem("key","value") localStorage.getItem("key")
      小程序:wx.setStorageSync("key", "value") wx.getStorageSync("key")
      2.存的时候有没有做类型转换
      web：不管存入的是什么类型的数据，最终都会先调用以下 toString(),把数据变成字符串，再存入进去
      小程序；不存在类型转换的操作，原类型存入
    1.先判断本地存储中有没有旧的数据
    2.没有旧的数据再直接发送新请求
    3.有旧的数据，且旧的数据未过期，就使用本地存储中的旧数据即可
    */
   // 1.获取本地存储中的数据（小程序中也存在本地存储技术）
   const Cates=wx.getStorageSync("cates");
   // 2判断
   if(!Cates){
   // 不存在，发送请求获取数据
   this.getCates();
   }else{
     // 有旧数据 定义一个过期数据 10s
     if(Date.now()-Cates.time>1000*10){
       // 重新发送请求
       this.getCates();
     }else{
       // 可以使用旧的数据
       this.Cates=Cates.data;
      let leftMenuList=this.Cates.map(v=>v.cat_name);
      let rightContent=this.Cates[0].children;
      this.setData({
        leftMenuList,
        rightContent
      })
     }
   }
  },
  // 获取分类数据
  async getCates(){
  //  request({
  //    url:"/categories"
  //  })
  //  .then(res=>{
  //    this.Cates=res.data.message;
      // 把接口的数据存入本地
  //    wx.setStorageSync("cates", {time:Date.now(),data:this.Cates});
        

      // 构造左侧的大菜单数据
  //    let leftMenuList=this.Cates.map(v=>v.cat_name);
      // 构造右侧的商品数据
  //    let rightContent=this.Cates[0].children;
  //    this.setData({
  //      leftMenuList,
  //      rightContent
  //    })
  //  })

  // 1.使用es7的async和await来发送异步请求
  const res=await request({url:"/categories"});
      //this.Cates=res.data.message;
      this.Cates=res;
      // 把接口的数据存入本地
      wx.setStorageSync("cates", {time:Date.now(),data:this.Cates});
      // 构造左侧的大菜单数据
      let leftMenuList=this.Cates.map(v=>v.cat_name);
      // 构造右侧的商品数据
      let rightContent=this.Cates[0].children;
      this.setData({
        leftMenuList,
        rightContent
      })
  },
  // 左侧菜单的点击事件
  handleItemTap(e){
    /*
    1.获取被点击的标题身上的索引
    2.给data中的currentIndex赋值
    3.根据不同的索引来渲染右侧的商品内容
    */
   const{index}=e.currentTarget.dataset;
   
   let rightContent=this.Cates[index].children;
      this.setData({
        currentIndex:index,
        rightContent,
         // 重新设置右侧内容的scroll-view标签到顶部的距离
        scrollTop:0
      })

    
  }
})