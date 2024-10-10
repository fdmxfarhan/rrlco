const scrollMenu = document.querySelector('#scroll-view-1');
const scrollAmount = 500;


var scroll_right =  () => {
    scrollMenu.scrollBy({
        left: scrollAmount, // Scroll to the left
        behavior: 'smooth'
    });
}

var scroll_left =  () => {
    scrollMenu.scrollBy({
        left: -scrollAmount, // Scroll to the right
        behavior: 'smooth'
    });
}