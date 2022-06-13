/*
1.用户上划页面，滚动条触底，开始加载下一页数据
  1 先找到滚动条触底事件
  2 判断还有没有下一页数据
    1.获取总页数 总条数=total
    总页数 = Math.ceil(总条数total/页容量pagesize)
    2.获取当前页码 pagenum
    3.判断当前页码是否大于或等于总页数
  3 如果没有下一页数据了，弹出提示框提示
  4 如果还有下一页数据，加载下一页数据
    1.当前的页码++
    2.重新发送请求
    3.数据请求回来 要对data中的数组进行拼接，而不是全部替换
2.下拉刷新页面
  1 触发下拉刷新事件 需要在页面的json文件中开启一个配置项
    找到触发下拉刷新的事件
  2 重置数据，数组
  3 重置页面为1
  4 重新发送请求
  5  数据请求回来，需要手动关闭等待效果
*/
import { request } from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
Page({
  data: {
    tabs:[
      {
        id:0,
        value:"综合",
        isActive:true
      },
      {
        id:1,
        value:"销量",
        isActive:false
      },
      {
        id:2,
        value:"价格",
        isActive:false
      }
    ],
    goodsList:[]
  },
  // 接口要的参数
  QueryParams:{
    query:"",
    cid:"",
    pagenum:1,
    pagesize:10
  },
  //总页数
  totalPages:1,

  
  onLoad: function (options) {
    this.QueryParams.cid=options.cid||"";
    this.QueryParams.query=options.query||"";
    this.getGoodsList();

   
  },

  //获取商品列表数据
  async getGoodsList(){
    const res=await request({url:"/goods/search",data:this.QueryParams});
    //获取总条数
    const total=res.total;
    //计算总页数
    this.totalPages=Math.ceil(total/this.QueryParams.pagesize);
    //console.log(this.totalPages);
    this.setData({
      //拼接的数组
      goodsList:[...this.data.goodsList,...res.goods]
    })

    //关闭下拉刷新窗口 如果没有调用下拉刷新窗口，直接关闭也不会报错
    wx.stopPullDownRefresh();
  },

  //标题点击事件 从子组件传递过来
  handleTabsItemChange(e){
    // 1 获取被点击的标题的索引
    const {index}=e.detail;
    //2 修改原数组
    let {tabs}=this.data;
    tabs.forEach((v,i)=>i===index?v.isActive=true:v.isActive=false);
    //3 赋值到data中
    this.setData({
      tabs
    })
  },
  // 页面上划，滚动条触底事件
  onReachBottom(){
    //1.判断还有没有下一页数据
    if(this.QueryParams.pagenum>=this.totalPages){
      //没有下一页数据
    //  console.log('%c'+"没有下一页数据","color:red;font-size:100px;background-image:linear-gradient(to right,#0094ff,pink)");
    wx.showToast({title: '没有下一页数据'});
    }else{
      //还有下一页数据
    //  console.log('%c'+"有下一页数据","color:red;font-size:100px;background-image:linear-gradient(to right,#0094ff,pink)");
      this.QueryParams.pagenum++;
      this.getGoodsList();
    }
  },
  //下拉刷新事件
  onPullDownRefresh(){
    // 1 重置数组
    this.setData({
      goodsList:[]
    })
    // 2 重置页码
    this.QueryParams.pagenum=1;
    // 3 发送请求
    this.getGoodsList();
  }
})