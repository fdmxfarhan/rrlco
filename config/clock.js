module.exports =  function(number){
    if(number > 9) return(number.toString())
    return('0' + number.toString());
};