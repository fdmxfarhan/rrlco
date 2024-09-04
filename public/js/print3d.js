
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
            filename: '/3DBenchy.stl', 
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

var updateData = () => {
    var data = stl_viewer.get_model_info(1);
    // stl_viewer.set_color(1, "#111111");
    document.getElementById('info-volume').textContent = Math.round(data.area);
    document.getElementById('info-width').textContent = Math.round(data.dims.x);
    document.getElementById('info-length').textContent = Math.round(data.dims.y);
    document.getElementById('info-height').textContent = Math.round(data.dims.z);
};

window.onload = function() {
    document.getElementById('fileinput').addEventListener('change', getFileName);
    
}

const getFileName = (event) => {
    const files = event.target.files;
    const fileName = files[0].name;
    document.getElementById('upload-filename').textContent = fileName;
}


