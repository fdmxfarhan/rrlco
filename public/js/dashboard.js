$(document).ready(function(){
    $('.close-success-msg').click(() => {
        $('.success-msg').slideUp(500);
    });
    $('.close-notif-msg').click(() => {
        $('.notif-msg').slideUp(500);
    });

    var modal = $('.black-modal');
    $('#sidebar-collapse-btn').click(() => {
        modal.show();
        $('.sidebar').show(500);
    });
    modal.click(() => {
        modal.hide();
        $('.sidebar').hide();
    });
});