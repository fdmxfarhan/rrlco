$(document).ready(function(){
    $('#nav-collapse-button').click(() => {
        if(screen.width < 800){
            $('.nav-black-modal').show();
            $('#nav-collapse-view').show();
        }
    });
    $('.nav-black-modal').click(() => {
        $('.nav-black-modal').hide();
        $('#nav-collapse-view').hide();
    });
});