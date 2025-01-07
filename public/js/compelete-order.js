var dot = function(number){
    number = number.toString();
    var result = '';
    for (let i = number.length-1; i >= 0; i--) {
        result += number[i];
        if((number.length - i)%3 == 0 && i>0)
            result += '.';
    }
    return(result.split("").reverse().join(""));
};
var getNumber = (text) => {
    text = text.replaceAll('.', '');
    text = text.replaceAll(' ', '');
    return(parseInt(text));
}
var cityChange = () => {
    if(document.getElementById('city-select').value != 'تهران'){
        document.getElementById('peyk-option').setAttribute('disabled', 'true');
        document.getElementById('post-option').removeAttribute('disabled');
        document.getElementById('delivery-select').value = 'پست پیشتاز';
    }
    else{
        document.getElementById('peyk-option').removeAttribute('disabled');
        document.getElementById('post-option').removeAttribute('disabled');
        document.getElementById('delivery-select').value = 'پیک موتوری';
    }
}
var deliverychanged = () => {
    if(document.getElementById('delivery-select').value == 'پست پیشتاز'){
        var totalprice    = getNumber(document.getElementById('total-price').textContent);
        var discountprice = getNumber(document.getElementById('discount-price').textContent);
        var taxprice      = getNumber(document.getElementById('tax-price').textContent);
        var deliveryprice = 60000;
        document.getElementById('delivery-price').textContent = dot(deliveryprice);
        document.getElementById('sum-price').textContent = dot(totalprice + taxprice + deliveryprice - discountprice);
    }
    else if(document.getElementById('delivery-select').value == 'پیک موتوری'){
        var totalprice    = getNumber(document.getElementById('total-price').textContent);
        var discountprice = getNumber(document.getElementById('discount-price').textContent);
        var taxprice      = getNumber(document.getElementById('tax-price').textContent);
        var deliveryprice = 0;
        document.getElementById('delivery-price').textContent = dot(deliveryprice);
        document.getElementById('sum-price').textContent = dot(totalprice + taxprice + deliveryprice - discountprice);
    }
}