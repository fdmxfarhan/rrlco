var cart_total_price = (cart) => {
    totalPrice = 0;
    for(var i=0; i<cart.length; i++){
        if(cart[i].type == 'product'){
            totalPrice += cart[i].count * cart[i].item.price;
        }
        if(cart[i].type == 'course'){
            totalPrice += cart[i].item.price;
        }
        if(cart[i].type == 'print3d'){
            totalPrice += cart[i].count * cart[i].item.price;
        }
    }
    return totalPrice
}
var cart_discount = (currentdiscount, cart) => {
    var totalPrice = cart_total_price(cart);
    var discount = 0;
    if(currentdiscount.type == 'درصد'){
        if(currentdiscount.itemtype == 'all'){
            discount = totalPrice * currentdiscount.amount / 100.0;
        }else{
            var typeTotalPrice = 0;
            for(var i=0; i<cart.length; i++){
                if(cart[i].type == currentdiscount.itemtype){
                    typeTotalPrice += cart[i].count * cart[i].item.price;
                }
            }
            discount = typeTotalPrice * currentdiscount.amount / 100.0;
        }
    }
    if(discount > currentdiscount.maxDiscount) return currentdiscount.maxDiscount;
    return discount;
}
var orderStateNum = (orderText) => {
    if(orderText == 'در انتظار پرداخت') return 1;
    if(orderText == 'در حال پردازش') return 2;
    if(orderText == 'آماده سازی جهت ارسال') return 3;
    if(orderText == 'ارسال سفارش') return 4;
    if(orderText == 'تکمیل شده') return 5;
}

module.exports = {
    cart_total_price,
    cart_discount,
    orderStateNum,
}