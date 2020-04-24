
if(document.readyState == 'loading'){
  document.addEventListener('DOMContentLoaded',ready);
} else{
  ready()
}

function ready(){
  let removeCartItemButtons =  document.getElementsByClassName('btn-danger');
  let quantityInputs = document.getElementsByClassName('cart-quantity-input');
  let addToCartButtons = document.getElementsByClassName('shop-item-button');

//Remove items from cart
  for(let i =0; i<removeCartItemButtons.length;i++){
    let button = removeCartItemButtons[i];
    button.addEventListener('click',removeCartItem);
  }

//Change quantities in the cart
  for(let i=0; i<quantityInputs.length;i++){
    let input = quantityInputs[i];
    input.addEventListener('change',quantityChanged);
  }

//Select new prudocts from cart

  for(let i =0; i<addToCartButtons.length;i++){
    let shopBotton = addToCartButtons[i];
    shopBotton.addEventListener('click',addToCartClicked)
  }

  //Purchase

  let puchaseButton = document.getElementsByClassName('btn-purchase')[0].addEventListener('click',purchaseClicked);


  //stripe Integration

  var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: 'auto',
    token: function(token){ //The token object is provided after payment is made
      let items = [];
      let cartItemsContainer = document.getElementsByClassName('cart-items')[0];
      let cartRows = cartItemsContainer.getElementsByClassName('cart-row')
      for (let i =0; i < cartRows.length; i++){
        let cartRow = cartRows[i]
        let quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0];
        let quantity = quantityElement.value;
        let id = cartRow.dataset.itemId;
        console.log(cartRow,id);
        items.push({
          id: id,
          quantity: quantity
        })
      }
      fetch('/purchase',{
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          stripeTokenId: token.id,
          items: items
        })
      }).then(function(res){
        return res.json();
      }).then(function(data){
        alert(data.message)
        var cartItems = document.getElementsByClassName('cart-items')[0]
        while (cartItems.hasChildNodes()){
          cartItems.removeChild(cartItems.firstChild);
        }
        updateCartTotal();
      }).catch(function (err){
        console.log(err);
      })
    }
  })


  function purchaseClicked (){
    // alert('Thank you for your purchase')
    // var cartItems = document.getElementsByClassName('cart-items')[0]
    // while (cartItems.hasChildNodes()){
    //   cartItems.removeChild(cartItems.firstChild);
    // }
    // updateCartTotal();

    let priceElement = document.getElementsByClassName('cart-total-price')[0];
    let price = parseFloat(priceElement.innerText.replace('$','')) * 100;
    stripeHandler.open({
      amount: price
    })


  }





  function addToCartClicked(event){
    let button = event.target;
    let shopItem = button.parentElement.parentElement;
    let title = shopItem.getElementsByClassName('shop-item-title')[0].innerText;
    let price = shopItem.getElementsByClassName('shop-item-price')[0].innerText;
    let imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src;
    // dataset acces elements data start data- since we have data-item-id it is writen as data.itemId
    let id = shopItem.dataset.itemId;
    addItemToCart(title,price,imageSrc,id)
    updateCartTotal();
  }


  function addItemToCart(title,price,imageSrc,id){
    let cartRow = document.createElement('div');
    //This is another way of adding an existing wraper to the cartRowContents
    // cartRow.classList.add('cart-row')
    cartRow.dataset.itemId = id;
    let cartItems = document.getElementsByClassName('cart-items')[0];
    let cartItemsName = cartItems.getElementsByClassName('cart-item-title')
    for(let i =0; i<cartItemsName.length;i ++){
      if(cartItemsName[i].innerText == title ) {
        alert('This item is already added to the Cart')
        return;
      }
    }
    let cartRowContents = `
    <div class = "cart-row" data-item-id="${id}">
      <div class = "cart-item cart-column">
        <img class= "cart-item-image" src=${imageSrc} width="100">
        <span class="cart-item-title" >${title}</span>
      </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
          <input class= "cart-quantity-input"  type="number" value="1"></input>
          <button class= "btn btn-danger " role= "button">REMOVE</button>
        </div>
      </div>
    `;


    cartRow.innerHTML = cartRowContents;
    cartItems.append(cartRow) // This method appends the Cart Row to the cart items
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click',removeCartItem);
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change',quantityChanged);

  }

  function quantityChanged(event){
    let input = event.target;
    let value = input.value;
    if(isNaN(value)|| value<=0 ){
      input.value = 1;
    }
    updateCartTotal();
  }



  function removeCartItem(){
    let buttonClicked = event.target;
    buttonClicked.parentElement.parentElement.remove();
    updateCartTotal();
  }

  function updateCartTotal(){
    let cartItems = document.getElementsByClassName('cart-items')[0];
    let cartRows = cartItems.getElementsByClassName('cart-row');
    let total =0;
    for(let i =0; i< cartRows.length;i++){
      let cartRow = cartRows[i];
      let priceElement = cartRow.getElementsByClassName('cart-price')[0];
      let quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0];
      let price = parseFloat(priceElement.innerText.replace('$',''));
      let quantity = parseFloat(quantityElement.value.replace('$',''));

      sum = price * quantity
      total += sum;
    }
    total = Math.round(total*100)/100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$'+total
  }
}
