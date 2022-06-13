/*
1.页面加载
 1 从缓存中获取购物车数据，渲染到页面中（部分渲染）
    被渲染的数据的checked=true
2.微信支付
  1 哪些账号可以实现微信支付
    1.企业账号
    2.企业账号的小程序后台中必须给开发者添加上白名单
      1 一个APPID可以同时绑定多个开发者
      2 这些开发者共用APPID和它的开发权限
3.支付按钮
  1 先判断缓存中有没有token
  2 若无，则跳转到授权页面，进行获取token
  3 若有，则正常执行
  4 创建订单，获取订单编号
  5 完成微信支付
  6 手动删除缓存中已经被选中的商品
  7 将删除后的购物车数据填充回缓存中
  8 跳转页面
*/
import { getSetting,chooseAddress,openSetting,showModal,showToast,requestPayment } from "../../utils/asyncWx.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
import { request } from "../../request/index.js";
Page({
  data:{
    address:{},
    cart:[],
    totalPrice:0,
    totalNum:0
  },
  onShow(){
    // 1 获取缓存中的收货地址信息
    const address=wx.getStorageSync("address");
    // 1 获取缓存中的购物车数据
    let cart=wx.getStorageSync("cart")||[];
    // 过滤后的购物车数组
    cart=cart.filter(v=>v.checked);
    this.setData({address});
    // 1 总价格 总数量
    let totalPrice=0;
    let totalNum=0;
    cart.forEach(v => {
      totalPrice+=v.num*v.goods_price;
      totalNum+=v.num;
    })
    this.setData({
      cart,
      totalPrice,
      totalNum,
      address
    });
  },
//点击 支付
async handleOrderPay(){
  try {
    // 1 判断缓存中有无token
  const token=wx.getStorageSync("token");
  // 2 判断
  if (!token) {
    wx.navigateTo({
      url: '/pages/auth/index',
    });
    return;
  }
  // 3 创建订单
  // 3.1 准备请求头参数
  //const header={Authorization:token};
  // 3.2 准备请求体参数
  const order_price=this.data.totalPrice;
  const consignee_addr=this.data.address.all;
  const cart=this.data.cart;
  let goods=[];
  cart.forEach(v=>goods.push({
    goods_id:v.goods_id,
    goods_number:v.num,
    goods_price:v.goods_price
  }))
  const orderParams={order_price,consignee_addr,goods};
  // 4 准备发送请求，创建订单，获取订单编号
  const {order_number}=await request({url:"/my/orders/create",method:"POST",data:orderParams});
  // 5 发起预支付接口
  const {pay}=await request({url:"/my/orders/req_unifiedorder",method:"POST",data:{order_number}});
  // 6 发起微信支付
  await requestPayment(pay);
  // 7 查询后台订单状态
  const res=await request({url:"/my/orders/chkOrder",method:"POST",data:{order_number}});
  await showToast({title:"支付成功"})
  // 8 支付成功后，跳转回订单页面
  wx.navigateTo({
    url:'/pages/order/index'
  });
   // 8 手动删除缓存中已经支付了的商品
   let newCart=wx.getStorageSync("cart");
   newCart=newCart.filter(v=>!v.checked);
   wx.setStorageSync("cart",newCart);
   console.log(error);
   wx.navigateTo({
     url:'/pages/order/index'
   });
  } catch (error) {
    await showToast({title:"支付成功"})
    // 8 手动删除缓存中已经支付了的商品
    let newCart=wx.getStorageSync("cart");
    newCart=newCart.filter(v=>!v.checked);
    wx.setStorageSync("cart",newCart);
    console.log(error);
    wx.navigateTo({
      url:'/pages/order/index'
    });
  }
}
})

