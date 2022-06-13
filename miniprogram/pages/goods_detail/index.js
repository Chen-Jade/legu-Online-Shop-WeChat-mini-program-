/*
1.发送请求，获取数据
2.点击轮播图，预览大图功能
  1 给轮播图绑定点击事件
  2 调用小程序的api previewImage
3.点击加入购物车
  1 先绑定点击事件
  2 获取缓存中的购物车数据 数组格式
  3 先判断当前商品是否已经存在于购物车
  4 若已经存在则修改商品数据，执行购物车数量++,重新把购物车数组填充回缓存中
  5 若不存在于购物车数组中，直接给购物车数组添加一个新元素即可，带上购买数量属性num，重新把购物车数组填充回缓存中
  6 弹出提示
4.商品收藏
  1 页面onShow的时候，加载缓存中的商品收藏的数据
  2 判断当前商品是否被收藏
    1.是 改变页面的图标
    2.不
  3 点击商品收藏按钮
    1.判断该商品是否存在于缓存的数组中
    2.已经存在，删除该商品
    3.没有存在，把商品添加到商品收藏数组中，存入缓存中
*/
import { request } from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsObj:{},
    //商品是否被收藏过
    isCollect:false
  },
  // 商品对象
  GoodsInfo:{},

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    let pages =  getCurrentPages();
    let currentPage=pages[pages.length-1];
    let options=currentPage.options;
    const {goods_id}=options;
    this.getGoodsDetail(goods_id);

    
  },
  //获取商品的详情数据
  async getGoodsDetail(goods_id){
    const goodsObj=await request({url:"/goods/detail",data:{goods_id}});
    this.GoodsInfo=goodsObj;
    //1 获取缓存中的商品收藏的数组
    let collect=wx.getStorageSync("collect")||[];
    //2 判断当前商品是否被收藏
    let isCollect=collect.some(v=>v.goods_id===this.GoodsInfo.goods_id);
    this.setData({
      goodsObj:{
        goods_name:goodsObj.goods_name,
        goods_price:goodsObj.goods_price,
        //iphone部分手机不识别webp图片格式 处理方法: .webp=>.jpg
        goods_introduce:goodsObj.goods_introduce.replace(/\.webp/g,'.jpg'),
        pics:goodsObj.pics
      },
      isCollect
    })
  },
  //点击轮播图，放大预览
  handlePreviewImage(e){
    //1先构造要预览的图片数组
    const urls=this.GoodsInfo.pics.map(v=>v.pics_mid);
    //2接收传递传递过来的图片url
    const current=e.currentTarget.dataset.url;
    wx.previewImage({
      current,
      urls
    });
  },
  //点击加入购物车
  handleCartAdd(){
    // 1 获取缓存中的购物车数组
    let cart=wx.getStorageSync("cart")||[];
    // 2 判断商品对象是否存在于购物车数组中
    let index=cart.findIndex(v=>v.goods_id===this.GoodsInfo.goods_id);
    if(index===-1){
      // 3 不存在 第一次添加
      this.GoodsInfo.num=1;
      this.GoodsInfo.checked=true;
      cart.push(this.GoodsInfo);
    }else{
      // 4 已经存在于购物车中，执行num++
      cart[index].num++;
    }
    // 5 把购物车重新添加回缓存中
    wx.setStorageSync("cart", cart);
    // 6 弹窗提示
    wx.showToast({
      title: '加购成功',
      icon: 'success',
      // true防止用户手抖或者疯狂点击按钮
      mask: true
    });
  },
  //点击商品收藏图标
  handleCollect(){
    let isCollect=false;
    // 1 获取缓存中的商品收藏数组
    let collect=wx.getStorageSync("collect")||[];
    // 2 判断该商品是否被收藏过
    let index=collect.findIndex(v=>v.goods_id===this.GoodsInfo.goods_id);
    // 3 当index！=-1，表示已经收藏过
    if(index!==-1){
      // 能找到，已经收藏过了，在数组中删除该商品
      collect.splice(index,1);
      isCollect=false;
      wx.showToast({
        title: '取消成功',
        icon: 'success',
        mask: true
      });
    }else{
      // 没有收藏过
      collect.push(this.GoodsInfo);
      isCollect=true;
      wx.showToast({
        title: '收藏成功',
        icon: 'success',
        mask: true
      });
    }
    // 4 把数组存入到缓存中
    wx.setStorageSync("collect", collect);
    // 5 修改data中的属性isCollect
    this.setData({
      isCollect
    })

  }
})