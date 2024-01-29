//產品清單get
axios.get('https://livejs-api.hexschool.io/api/livejs/v1/customer/lily/products')
  .then(function (response) {
    console.log(response);
    productData=response.data.products
    initProdoctList(productData)  //預設以函式初始化
  })
  .catch(function (error) {
    console.log(error);
  })

//購物車清單get
function cartListGet(){
  axios.get('https://livejs-api.hexschool.io/api/livejs/v1/customer/lily/carts')
  .then(function (response) {
    console.log(response);
    CartData=response.data.carts
    initCartList(CartData)  //預設以函式初始化
  })
  .catch(function (error) {
    console.log(error);
  })
}
cartListGet()

//預設產品清單
function initProdoctList(productData){  
    const productWrap=document.querySelector(".productWrap") // 已知需利用JS陣列資料取代原有ul內之資料，故選取ul
    let ulNewStr=""  //宣告空字串，以存放新的搜尋li
    productData.forEach(function(item){         //以forEach代入JS資料+原有li程式碼，組出li字串，每筆字串資料累加並回傳給空字串
        ulNewStr+=`<li class="productCard">
        <h4 class="productType">${item.category}</h4>
        <img src="${item.images}" alt="">
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
        <p class="nowPrice">NT$${toThousands(item.price)}</p>
        </li>`
    })
  
    productWrap.innerHTML=ulNewStr  //以innerHTML替換已選取之ul內之字串
}


//商品分類篩選器
const productSelect=document.querySelector(".productSelect")       //選取篩選器
productSelect.addEventListener("change",function(e){              //監聽篩選器之chang事件，並執行以下函式
  if(e.target.value=="全部"){
    initProdoctList(productData)
  } else{
    let dataNew=productData.filter(item => item.category==e.target.value)
    initProdoctList(dataNew)
  }
})


//監聽購物車按鈕+加入購物車
const productWrap=document.querySelector(".productWrap")
productWrap.addEventListener("click",function(e){
    e.preventDefault(); //取消默認行為，點連結就不會一直往置頂跳
    let dataID=e.target.getAttribute("data-id")
    let numCheck=1
    if(dataID==null){
        return //console.log("沒事發生唷")
    }else{
        console.log("該加入購物車囉")
        console.log(dataID)
        CartData.forEach(function(item){
            if (dataID===item.product.id){
                console.log("這筆有囉")
                numCheck=item.quantity+1
            }
        })
        axios.post('https://livejs-api.hexschool.io/api/livejs/v1/customer/lily/carts', {
            "data": {
                "productId":dataID,
                "quantity":numCheck
            }
            })
            .then(function (response) {
            CartData=response.data.carts
            alert("已加入");
            initCartList();
            })
            .catch(function (error) {
            console.log(error);
            });
        }
  })


//刪除購物車清單
const shoppingCartTbody=document.querySelector(".shoppingCart-tbody")
shoppingCartTbody.addEventListener("click",function(e){
  e.preventDefault(); //取消默認行為，點連結就不會一直往置頂跳
  console.log(e.target)
  let delIcons=e.target.getAttribute("class")
  let cartID=e.target.getAttribute("cart-id")
  if(delIcons==="material-icons"){
    console.log("點到XX了唷")
    CartData.forEach(function(item){
      if (cartID===item.id){
          console.log("對應到了可以做刪除動作了欸")
          axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/lily/carts/${cartID}`)
          .then(function (response) {
            console.log("恭喜刪掉囉")
            CartData=response.data.carts
            initCartList(CartData)
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          })
        }
    })
  }
})

//刪除所有購物車
const discardAllBtn=document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener("click",function(e){
  e.preventDefault(); //取消默認行為，點連結就不會一直往置頂跳
  console.log(e.target)
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/lily/carts`)
  .then(function (response) {
    console.log("恭喜刪掉整坨囉")
    CartData=response.data.carts
    initCartList(CartData)
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
})



//預設購物車清單及加總
function initCartList(){  
    const shoppingCartTbody=document.querySelector(".shoppingCart-tbody") // 已知需利用JS陣列資料取代原有資料，故選取table
    let tableNewStr=""  //宣告空字串，以存放新的內容
    CartData.forEach(function(item){         //以forEach代入JS資料+原有程式碼，組出字串，每筆字串資料累加並回傳給空字串
        tableNewStr+=`
            <tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}" alt="">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>NT$${toThousands(item.product.price)}</td>
                <td>${item.quantity}</td>
                <td>NT$${toThousands(item.product.price*item.quantity)}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons" cart-id="${item.id}">
                        clear
                    </a>
                </td>
            </tr>`
    })
  
    shoppingCartTbody.innerHTML=tableNewStr  //以innerHTML替換已選取之字串

    //購物車加總
    const total=document.querySelector(".total")
    let totalCal=0
    CartData.forEach(function(item){         //以forEach代入JS資料，每筆資料累加並回傳
      totalCal+=item.product.price*item.quantity
    })
  
    total.textContent=`NT$${toThousands(totalCal)}`  //以textContent替換已選取之文字內容
}


//送出預訂訂單
const customerName=document.querySelector("#customerName") //監聽各個欄位
const customerPhone=document.querySelector("#customerPhone")
const customerEmail=document.querySelector("#customerEmail")
const customerAddress=document.querySelector("#customerAddress")
const tradeWay=document.querySelector("#tradeWay")
const orderInfoBtn=document.querySelector(".orderInfo-btn") //監聽送出按鈕

orderInfoBtn.addEventListener("click",function(e){
  e.preventDefault(); //取消默認行為，點連結就不會一直往置頂跳
  if(CartData.length==0){
    alert("請加入購物車清單後再送出預定")
  }else{
    let emailFlag
    let phoneFlag

    if(customerName.value==""||customerPhone.value==""||customerEmail.value==""||customerAddress.value==""||tradeWay.value==""){
      alert("不可有欄位為空白")
    }

    if(validateEmail(customerEmail.value)==false){
      document.querySelector(`[data-message="Email"]`).textContent="請填寫正確的email格式"
    }else{
      document.querySelector(`[data-message="Email"]`).textContent=""
      emailFlag=true
    }
    
    if(validateTWPhoneNumber(customerPhone.value)==false){
      document.querySelector(`[data-message="電話"]`).textContent="請填寫正確的電話"
    }else{
      document.querySelector(`[data-message="電話"]`).textContent=""
      phoneFlag=true
    }

    if(emailFlag==true && phoneFlag==true){
      console.log("都有填對喔好棒棒")
      axios.post('https://livejs-api.hexschool.io/api/livejs/v1/customer/lily/orders', {
        "data": {
          "user": {
            "name": customerName.value,
            "tel": customerPhone.value,
            "email": customerEmail.value,
            "address": customerAddress.value,
            "payment": tradeWay.value,
          }
        }
      })
        .then(function (response) {
          console.log(response);
          const orderInfoForm=document.querySelector(".orderInfo-form") //選取表單
          orderInfoForm.reset() //返回表單預設資料
          alert("已送出預訂訂單")
          cartListGet()
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
})

//千分位優化支援小數點(util)
function toThousands (value) {
  if (value) {
    value += "";
    var arr = value.split(".");
    var re = /(\d{1,3})(?=(\d{3})+$)/g;

    return arr[0].replace(re, "$1,") + (arr.length == 2 ? "." + arr[1] : "");
  } else {
    return ''
  }
}


//驗證email測試(util)
function validateEmail(mail) 
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    //document.querySelector(`[data-message="Email"]`).textContent="請填寫正確的email格式"
    //alert("You have entered an invalid email address!")
    return (false)
}

//驗證phone測試(util)
function validateTWPhoneNumber(phoneNumber) {
  let regExp = /^[09]{2}\d{8}$/;
  let phone = phoneNumber.match(regExp);
  if (phone) {
    //alert('yes');
    return true;
  }
  //alert('no');
  return false;
}



