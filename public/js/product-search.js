const dataElement = document.getElementById('dataContainer');
const products = JSON.parse(dataElement.getAttribute('data-mydata'));
const numOfProducts = products.length;        
const searchInput = document.getElementById('search-input');

const searchText = (target, search) => {
    const cleanString = (str) => str.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '').toLowerCase();
  
    const cleanedTarget = cleanString(target);
    const cleanedSearch = cleanString(search);
  
    return cleanedTarget.includes(cleanedSearch);
}

const searchWord = () => {
    var word = searchInput.value;
    for(var i=0; i<numOfProducts; i++){
        if(searchText(products[i].title, word)){
            document.getElementById(`product-card-${i}`).style.display = 'block';
        }else{
            document.getElementById(`product-card-${i}`).style.display = 'none';
        }
    }
}
searchInput.addEventListener('input', searchWord);
searchInput.addEventListener('propertychange', searchWord); 