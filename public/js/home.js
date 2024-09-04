$(document).ready(function(){
    $('#nav-collapse-button').click(() => {
        if(screen.width < 800){
            $('.black-modal').show();
            $('#nav-collapse-view').show();
        }
    });
    $('.black-modal').click(() => {
        $('.black-modal').hide();
        $('#nav-collapse-view').hide();
    });
});