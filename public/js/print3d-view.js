var stlpath = document.getElementById('stlpath').textContent;
var abscost = parseFloat(document.getElementById('abscost').textContent);
var placost = parseFloat(document.getElementById('placost').textContent);

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

var stl_viewer = new StlViewer(document.getElementById("stl_cont"), {
    models: [ 
        {
            id: 1, 
            filename: stlpath, 
            opacity: 1, 
            color: "#7209B7", 
            view_edges: false, 
            rotationx: -0.35*3.1415927,
            rotationy:  0.0*3.1415927,
            rotationz:  0.25*3.1415927,
            x: 0, 
            y: 0,
            z: 0,
            // auto_resize: true,
            // display: "smooth",
            animation: {
                delta:{
                    rotationx: 0, 
                    rotationy: 0, 
                    rotationz: 1, 
                    msec: 3000, 
                    loop: true
                },
                // exact: {
                //     x: 0, 
                //     y: 0, 
                //     z: 0, 
                //     scale: 5, 
                //     msec: 3000
                // },
            },

        } 
    ],
    // auto_rotate: true,
    zoom: 100 ,
    bgcolor: '#4CC9F0',
    allow_drag_and_drop: true,
    model_loaded_callback: () => updateData(),
    // camera_state: {
    //     position: {
    //         x: 0,
    //         y: -20,
    //         z: 100,
    //     },
    //     target: {
    //         x: 0,
    //         y: 0,
    //         z: 0,
    //     },
    // }
});


var updatePrice = () => {
    var filament = document.getElementById('filament').value;
    var infill = parseInt(document.getElementById('infill').value);
    var count = parseInt(document.getElementById('count').value);
    var layerhieght = parseFloat(document.getElementById('layerhieght').value);
    var volume = parseInt(document.getElementById('info-volume').textContent);

    var price = 0;
    if(filament == 'ABS'){
        document.getElementById('colorABS').classList.remove('hide');
        document.getElementById('colorPLA').classList.add('hide');
        price = count * (abscost * volume * ((infill+100)/100));
        if(document.getElementById('colorABS').value == 'مشکی') stl_viewer.set_color(1, "#3F4253");
        if(document.getElementById('colorABS').value == 'سفید') stl_viewer.set_color(1, "#eef1f7");
        if(document.getElementById('colorABS').value == 'سبز') stl_viewer.set_color(1, "#4ac91c");
        if(document.getElementById('colorABS').value == 'آبی') stl_viewer.set_color(1, "#4895EF");
        if(document.getElementById('colorABS').value == 'طوسی') stl_viewer.set_color(1, "#595b66");
    }
    else if(filament == 'PLA'){
        document.getElementById('colorABS').classList.add('hide');
        document.getElementById('colorPLA').classList.remove('hide');
        price = count * (placost * volume * ((infill+100)/100));
        if(document.getElementById('colorPLA').value == 'مشکی') stl_viewer.set_color(1, "#3F4253");
        if(document.getElementById('colorPLA').value == 'سفید') stl_viewer.set_color(1, "#eef1f7");
        if(document.getElementById('colorPLA').value == 'سبز') stl_viewer.set_color(1, "#00e676");
        if(document.getElementById('colorPLA').value == 'آبی') stl_viewer.set_color(1, "#4361EE");
        if(document.getElementById('colorPLA').value == 'طوسی') stl_viewer.set_color(1, "#595b66");
    }
    console.log(layerhieght)
    if(layerhieght < 0.16) price *= 1.5;
    else if(layerhieght < 0.25) price *= 1.2;
    else if(layerhieght < 0.35) price *= 1.1;

    document.getElementById('price-value').textContent = dot(Math.round(price/1000)*1000) + ' تومان';
    document.getElementById('price-input').value = (Math.round(price/1000)*1000).toString();
}
var updateData = () => {
    var data = stl_viewer.get_model_info(1);
    // stl_viewer.set_color(1, "#111111");
    document.getElementById('info-volume').textContent = Math.round(data.area);
    document.getElementById('info-width').textContent = Math.round(data.dims.x);
    document.getElementById('info-length').textContent = Math.round(data.dims.y);
    document.getElementById('info-height').textContent = Math.round(data.dims.z);
    updatePrice()

};

//////////////////////////////////////////// Update Price
$(document).ready(function() {
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
        event.preventDefault();
        return false;
        }
    });
});