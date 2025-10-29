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
var get_tax = (cart) => {
    total = cart_total_price(cart);
    return 0;
    // return total * 0.1;
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
var orderNum2State = (num) => {
    if(orderText == 1) return 'در انتظار پرداخت';
    if(orderText == 2) return 'در حال پردازش';
    if(orderText == 3) return 'آماده سازی جهت ارسال';
    if(orderText == 4) return 'ارسال سفارش';
    if(orderText == 5) return 'تکمیل شده';
}
var nextOrderState = (orderText) => {
    if(orderText == 'در انتظار پرداخت') return 'در حال پردازش';
    if(orderText == 'در حال پردازش') return 'آماده سازی جهت ارسال';
    if(orderText == 'آماده سازی جهت ارسال') return 'ارسال سفارش';
    if(orderText == 'ارسال سفارش') return 'تکمیل شده';
    return 'تکمیل شده';
}
var prevOrderState = (orderText) => {
    if(orderText == 'در حال پردازش') return 'در انتظار پرداخت';
    if(orderText == 'آماده سازی جهت ارسال') return 'در حال پردازش';
    if(orderText == 'ارسال سفارش') return 'آماده سازی جهت ارسال';
    if(orderText == 'تکمیل شده') return 'ارسال سفارش';
    return 'در انتظار پرداخت';
}
module.exports = {
    cart_total_price,
    cart_discount,
    orderStateNum,
    orderNum2State,
    nextOrderState,
    prevOrderState,
    get_tax,
}