// This is what lets us move around the scene
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

// Basic setup, need to create a scene, a camera, a background,
// and a renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// if you want to adjust the background color change the hex code here
scene.background = new THREE.Color( 0xecffa8 );

const renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var subreddit_attributes = {} ;
var tsne = null;
var clusters = null;

$.getJSON("subreddit_attributes.json", function(data) {
    subreddit_attributes = data
})

// fetch the tsne data from the json file
$.getJSON( "../tsne_10000.json", function( tsne_data ) {
    // var ts_keys = Object.keys(data);
    // var ts_data = Object.values(data);

    // console.log(data)
    tsne = tsne_data

    // fetch the cluster data from the json file
    $.getJSON( "../clusters.json", function( cluster_data ) {
        // var cluster_keys = Object.keys(cluster_data);
        // var cluster_values = Object.values(cluster_data);

        // once the data from both files is loaded, start 
        // creating the subreddit objects. i'm calling the 
        // function in here to ensure the data gets loaded
        clusters = Object.values(cluster_data)
        spawn_discs(tsne, clusters);
    } )

});

// spawn subreddit discs
function spawn_discs(tsne_data, cluster_data) {

    // iterate through every one of the cluster groups
    for (let cluster = 0; cluster < cluster_data.length; cluster++) {
        // console.log(cluster_data[cluster])


        // In order to create an object in threejs, it needs geometry and a material
        // Geometry determines the shape, so CircleGeometry(2,32) gives us a flat
        // circle of size 2

        // disc material creates the visible mesh, but really the only thing we care
        // about is that it sets the object color. Here i'm multiplying the hexcode
        // for white by a random number to give each cluster group a random color
        
        var disc_material = new THREE.MeshStandardMaterial( { color: Math.random() * 0xffffff })
        
        // iterate through every subreddit in the current cluster
        for (let subreddit = 0; subreddit < cluster_data[cluster].length; subreddit++) {

            // make sure we actually have coordinate data for that subreddit
            if (tsne_data[cluster_data[cluster][subreddit]] && subreddit_attributes[cluster_data[cluster][subreddit]]) {

                // console.log(subreddit_attributes[cluster_data[cluster][subreddit]]['N_distinct_posters'])
                console.log(cluster_data[cluster])
                console.log(cluster_data[cluster][subreddit])
                console.log(tsne_data[cluster_data[cluster][subreddit]]['x'])
                console.log(tsne_data[cluster_data[cluster][subreddit]]['y'])

                var size = subreddit_attributes[cluster_data[cluster][subreddit]]['N_distinct_posters']
                // create an object with the given geometry and material we set above
                var disc_geom = new THREE.CircleGeometry( Math.log(size) / Math.log(2), 32 );
                const disc = new THREE.Mesh( disc_geom, disc_material );

                // set the position of that object to the tsne coordinate units
                disc.position.x = tsne_data[cluster_data[cluster][subreddit]]['x'] * 20;
                disc.position.y = tsne_data[cluster_data[cluster][subreddit]]['y'] * 20;
                
                // add the object to the scene
                scene.add(disc);
            }
            
            // console.log(cluster_data[cluster][subreddit])
        }
    }

    // for (let i = 0; i < ts_keys.length; i++) {
    //     const cube = new THREE.Mesh( geometry2, material2 );
    //     cube.position.x = ts_data[i]['x'] * 20;
    //     cube.position.y = ts_data[i]['y'] * 20;
    //     scene.add(cube);
    // }
}

// function SizeChange(event, inputText) {
//     event.preventDefault();
//     console.log("testing")
// }

$(function(){
    $('form').on('submit', function(event){
        event.preventDefault();

        console.log('chicken');
        let userinfo = $(this).serializeArray();
        let user = {};
        userinfo.forEach((value) => {
              
            // Dynamically create an object
            user[value.name] = value.value;
            console.log(user);
        });
    })
});

$("form select").on('change', function () {
    $("form").trigger('submit');
 });
 
// sets a circle at origin for reference
const geometry = new THREE.CircleGeometry( 10, 32 );
var material = new THREE.MeshStandardMaterial( { color: 0xfcba03 })
const cube = new THREE.Mesh( geometry, material );
cube.position.x = 0;
cube.position.y = 0;
scene.add(cube);

// creates global lighting to give every object equal light
const light = new THREE.AmbientLight( 0x404040, 3 ); // soft white light
scene.add( light );

// for (let i = 0; i < 100; i += 10) {
//     const cube = new THREE.Mesh( geometry2, material2 );
//     cube.position.x = 50.47939682006836;
//     cube.position.y = i;
//     scene.add(cube);

//     var pointLight = new THREE.PointLight( 0xffffff, 3 );
//     pointLight.position.set( 25, 90, 25 );
//     cube.add( pointLight );
// }


// cube.add(cube2);
// cube.add(cube3);
// cube.add(cube4);
// cube.add(cube5);
// scene.add( cube );
// // scene.add( cube2 );
// cube2.position.x += 4;
// cube3.position.x -= 8;
// cube4.position.z += 15;




// camera and orbiting controls
camera.position.z = 5;

const controls = new OrbitControls( camera, renderer.domElement );

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 20, 100 );
controls.update();




function animate() {
	requestAnimationFrame( animate );
    // cube.rotation.x += 0.05;
    // cube.rotation.y += 0.002;

    // cube2.rotation.x += 0.05;

    // cube2.rotation.x += 0.10;
    // cube2.rotation.y += 0.10;

    // cube2.rotation.y += .6;
    
	renderer.render( scene, camera );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	renderer.render( scene, camera );
}

animate();

