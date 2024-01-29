// C3.js Lv1
function renderC3Category(){
    let orderTotal={}
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if (orderTotal[productItem.category]==undefined){
                orderTotal[productItem.category]=productItem.price*productItem.quantity
            }else{
                orderTotal[productItem.category]+=productItem.price*productItem.quantity
            }
        })
    })

    console.log(orderTotal)
    console.log(Object.entries(orderTotal))

    let chart = c3.generate({
        bindto: '#chart1', // HTML 元素綁定
        data: {
            type: "pie",
            columns: 
            Object.entries(orderTotal),
            // [
            //     ['Louvre 雙人床架', 5],
            //     ['Antony 雙人床架', 2],
            //     ['Anty 雙人床架', 3],
            //     ['其他', 4],
            // ],
            colors:{
                "窗簾":"#DACBFF",
                "床架":"#9D7FEA",
                "收納": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}

//C3.js Lv2
function renderC3Item(){
    let orderTotal={}
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if (orderTotal[productItem.title]==undefined){
                orderTotal[productItem.title]=productItem.price*productItem.quantity
            }else{
                orderTotal[productItem.title]+=productItem.price*productItem.quantity
            }
        })
    })

    console.log(orderTotal)
    console.log(Object.entries(orderTotal)) //物件轉陣列
    priceSortAry=(Object.entries(orderTotal))
    priceSortAry.sort(function(a,b){  //排序比較
        return b[1]-a[1]
    })
    console.log(priceSortAry)

    //如果筆數超過3，從第4筆開始加總營收並統整為【其他】品項
    if(priceSortAry.length>3){
        let otherTotal=0
        priceSortAry.forEach(function(item,index){
            if (index>2){
                otherTotal+=item[1]
            }
        })
        console.log(otherTotal) //得出【其他】品項之營收
        priceSortAry.splice(3,priceSortAry.length-1) //刪除原陣列資料第三名之後的資料至最後一名
        priceSortAry.push(["其他",otherTotal]) //加入其他字串跟營收總和
        console.log(priceSortAry)
    }

    let chart = c3.generate({
        bindto: '#chart2', // HTML 元素綁定
        data: {
            type: "pie",
            columns: 
            priceSortAry,
            // [
            //     ['Louvre 雙人床架', 5],
            //     ['Antony 雙人床架', 2],
            //     ['Anty 雙人床架', 3],
            //     ['其他', 4],
            // ],
            colors:{
                "窗簾":"#DACBFF",
                "床架":"#9D7FEA",
                "收納": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}


//取得訂單get並渲染
let orderData=[]
const orderList=document.querySelector(".js-orderList")
let orderListStr=""
let productListStr=""
let orderStatus=""

orderListinit()
function orderListinit(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            authorization:token
        }
    })
    .then(function (response) {
        console.log(response);
        orderData=response.data.orders;

        orderListStr="" //因為全域變數，故需清空舊字串，避免重新渲染時會重複組舊資料

        
        orderData.forEach(function(item){
            //組時間戳轉換日期
            let date=""
            let Y,M,D,h,m,s;
            date=new Date(item.createdAt*1000)
            Y = date.getFullYear() + '-';
            M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
            D = date.getDate() + ' ';
            h = date.getHours() + ':';
            m = date.getMinutes() + ':';
            s = date.getSeconds();
            date=Y+M+D+h+m+s

            //組產品字串
            productListStr="" //因為全域變數，故需清空舊字串，避免重新渲染時會重複組舊資料
            item.products.forEach(function(productItem){
                productListStr+=`<p>${productItem.title}x${productItem.quantity}</p>`
            })
            
            //組產品狀態
            if(item.paid==false){
                orderStatus="未處理"
            }else{
                orderStatus="已處理"
            }

            //組訂單字串
            orderListStr+=`<tr>
                            <td>${item.id}</td>
                            <td>
                            <p>${item.user.name}</p>
                            <p>${item.user.tel}</p>
                            </td>
                            <td>${item.user.address}</td>
                            <td>${item.user.email}</td>
                            <td>
                            ${productListStr}
                            </td>
                            <td>${date}</td>
                            <td class="orderStatus">
                            <a href="#" data-id="${item.id}" class="orderProcess" data-paid="${item.paid}">${orderStatus}</a>
                            </td>
                            <td>
                            <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
                            </td>
                        </tr>`
        })
        
        orderList.innerHTML=orderListStr;
        renderC3Category() //重新渲染圓餅圖
        renderC3Item()

    })
    .catch(function (error) {
        console.log(error);
    })
}


//刪除訂單及更改訂單狀態
orderList.addEventListener("click",function(e){
    e.preventDefault();
    console.log(e.target)

    //刪除訂單
    let dataID=""
     if(e.target.getAttribute("class")=="delSingleOrder-Btn"){
        dataID=e.target.getAttribute("data-id")
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${dataID}`,{
            headers:{
                authorization:token
            }
        })
        .then(function (response) {
            console.log(response);
            console.log("刪除成功")
            orderListinit()
        })
        .catch(function (error) {
            console.log(error);
        })
        
     }

     //更改訂單狀態
     if(e.target.getAttribute("class")=="orderProcess"){
        console.log("點到狀態了")
        let statusID=e.target.getAttribute("data-id")
        
        if(e.target.getAttribute("data-paid")=="false"){

            //放axios更改狀態
            console.log("要改喔")
            

            axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
                "data": {
                  "id": `${statusID}`,
                  "paid": true
                }
              },{
            headers:{
                authorization:token
            }
            })
            .then(function (response) {
                console.log(response);
                console.log("改成功")
                orderListinit()
            })
            .catch(function (error) {
                console.log(error);
            })

        }else{
            axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
                "data": {
                  "id": `${statusID}`,
                  "paid": false
                }
              },{
            headers:{
                authorization:token
            }
            })
            .then(function (response) {
                console.log(response);
                console.log("改成功")
                orderListinit()
            })
            .catch(function (error) {
                console.log(error);
            })
        }
     }
     
})

//刪除全部訂單
const discardAllBtn=document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener("click",function(e){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            authorization:token
        }
    })
    .then(function (response) {
        console.log(response);
        renderC3Category() //重新渲染圓餅圖
        renderC3Item()
        orderListinit()
    })
    .catch(function (error) {
        console.log(error);
    })
})
