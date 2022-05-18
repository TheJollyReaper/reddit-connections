// This is what lets us move around the scene
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

// Basic setup, need to create a scene, a camera, a background,
// and a renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 3000 );
const mmi = new MouseMeshInteraction(scene, camera);
// const api = new RedditApi();

import { RedditApi } from './reddit-api.js';

var api = new RedditApi()
// if you want to adjust the background color change the hex code here
scene.background = new THREE.Color( 0xecffa8 );

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});


renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var subreddit_attributes = {} ;
var tsne = null;
var clusters = null;


var filters = {}
var filter_update = new Proxy(filters, {
    set: function (target, key, value) {
      console.log(`${key} set to ${value}`);
      target[key] = value;
      render_dashboard();
      return true;
    }
})

filter_update.size = 'N_distinct_posters'
filter_update.color = 'clusters'

render_dashboard();

function render_dashboard() {
    // Go through all objects in scene, delete all bubbles
    for (let i = scene.children.length - 1; i >= 0; i--) {
        if(scene.children[i].type === "Mesh")
            scene.remove(scene.children[i]);
    }

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
}

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

        var disc_material = new THREE.MeshStandardMaterial();
        if (filter_update.color == "clusters") {
            disc_material = new THREE.MeshStandardMaterial( { color: Math.random() * 0xffffff });
        }
        
        // iterate through every subreddit in the current cluster
        for (let subreddit = 0; subreddit < cluster_data[cluster].length; subreddit++) {

            // make sure we actually have coordinate data for that subreddit
            if (tsne_data[cluster_data[cluster][subreddit]] && subreddit_attributes[cluster_data[cluster][subreddit]]) {

                console.log(subreddit_attributes[cluster_data[cluster][subreddit]][filter_update.size])
                console.log(cluster_data[cluster])
                console.log(cluster_data[cluster][subreddit])
                console.log(tsne_data[cluster_data[cluster][subreddit]]['x'])
                console.log(tsne_data[cluster_data[cluster][subreddit]]['y'])
                
                // console.log(size_filter);
                var size = subreddit_attributes[cluster_data[cluster][subreddit]][filter_update.size]
                // create an object with the given geometry and material we set above
                var disc_geom = new THREE.CircleGeometry( Math.log(size) / Math.log(2), 32 );
                
                var total_posts = subreddit_attributes[cluster_data[cluster][subreddit]]['N_posts']
                var total_comments = subreddit_attributes[cluster_data[cluster][subreddit]] ['N_comments']
                if (filter_update.color == "nsfw") {
                    var nsfw_posts = subreddit_attributes[cluster_data[cluster][subreddit]]['N_nsfw_posts']

                    var percentage = parseInt(((nsfw_posts) / total_posts)*100).toString() + '%';
                    console.log('total_posts: ' + total_posts);
                    console.log('nsfw: ' + nsfw_posts);                                                                                    
                    console.log('percentage ' + percentage);
                    disc_material = new THREE.MeshStandardMaterial({color: new THREE.Color(`hsl(250, ${percentage}, 50%)`)});
                } else if (filter_update.color == "comment_mod") {
                    var comments_deleted = subreddit_attributes[cluster_data[cluster][subreddit]]['N_deleted_comments'];

                    var percentage = parseInt(((comments_deleted) / total_comments)*100).toString() + '%';
                    
                    console.log('total_comments: ' + total_comments);
                    console.log('comments deleted: ' + comments_deleted);                                                                                    
                    console.log('percentage ' + percentage);

                    disc_material = new THREE.MeshStandardMaterial({color: new THREE.Color(`hsl(250, ${percentage}, 50%)`)});
                } else if (filter_update.color == "post_mod") {
                    var posts_deleted = subreddit_attributes[cluster_data[cluster][subreddit]]['N_deleted_posts'];
                    var percentage = parseInt(((posts_deleted) / total_posts)*100).toString() + '%';

                    disc_material = new THREE.MeshStandardMaterial({color: new THREE.Color(`hsl(250, ${percentage}, 50%)`)});
                }
                const disc = new THREE.Mesh( disc_geom, disc_material );

                disc.name = tsne_data[cluster_data[cluster][subreddit]];
                // set the position of that object to the tsne coordinate units
                disc.position.x = tsne_data[cluster_data[cluster][subreddit]]['x'] * 60;
                disc.position.y = tsne_data[cluster_data[cluster][subreddit]]['y'] * 60;

                // add the object to the scene
                scene.add(disc);

                mmi.addHandler(tsne_data[cluster_data[cluster][subreddit]], 'click', function(mesh) {
                    console.log('interactable mesh has been clicked!');
                    // alert(mesh.position.x);
                    // mesh.name.name
                    // alert(mesh.position.x + "," + mesh.position.y + "," + mesh.position.z); 
                    // camera.position.set(75.76, 27.12, 100);
                   
                    // camera.position.x = 0;
                    // camera.position.y = 0;
                    // camera.position.z = 0;
                    camera.position.set( 0, 20, 100 );
                    controls.update();

                    scene.position.x = 0;
                    scene.position.y = 0;
                    scene.position.z = 0;

                    scene.translateX(-mesh.position.x);
                    scene.translateY(-mesh.position.y);
                    camera.position.z = 70;
                    controls.update();
                    
                    var distances = [];

                    
                    
                    api.getIcon(mesh.name.name).then(value=>{document.getElementById('subreddit-img').src=(value)});

                    for (let i = scene.children.length - 1; i >= 0; i--) {
                        if(scene.children[i].type === "Mesh" & getDistance(mesh, scene.children[i]) != 0) {
                            distances.push({key: scene.children[i], value:getDistance(mesh, scene.children[i])});
                            console.log(scene.children[i]);
                            console.log(getDistance(mesh, scene.children[i]));
                            
                            if (i < 5) {
                                const material = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 5 } );
                                const points = [];
                                points.push( new THREE.Vector3( mesh.position.x, mesh.position.y, mesh.position.z ) );
                                // points.push( new THREE.Vector3( 0, 10, 0 ) );
                                points.push( new THREE.Vector3( scene.children[i].position.x, scene.children[i].position.y, scene.children[i].position.z ) );
                                
                                const geometry = new THREE.BufferGeometry().setFromPoints( points );
                                const line = new THREE.Line( geometry, material );
                                scene.add( line );
                            }
                        }
                    }

                    console.log(distances);
                    
                    // scene.translateX(-(mesh.x - camera.position.x))
                    // scene.translateX(-(mesh.y - camera.position.y))

                    // camera.position.lerp(mesh.position, 0.03);
                    // camera.position.y = 10;




                    // camera.lookAt( mesh.name.x, mesh.name.y, 100 );

                    // camera.position.x = mesh.name.x;
                    // camera.position.y = mesh.name.y;

                    // controls.mesh.copy(object.position);
                    // controls.update();

                    
                });
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

// calculate distance between two bubbles
function getDistance(mesh1, mesh2) { 
    var dx = mesh1.position.x - mesh2.position.x; 
    var dy = mesh1.position.y - mesh2.position.y; 
    var dz = mesh1.position.z - mesh2.position.z; 
    return Math.sqrt(dx*dx+dy*dy+dz*dz); 
}

$(function(){
    $('#size-filters').on('submit', function(event){
        event.preventDefault();
        let userinfo = $(this).serializeArray();
        let user = {};
        userinfo.forEach((value) => { 
            // Dynamically create an object
            user[value.name] = value.value;
            // console.log(user);
            filter_update.size = value.value;
            console.log(filter_update.size);
        });
    })

    $('#color-filters').on('submit', function(event){
        event.preventDefault();
        let userinfo = $(this).serializeArray();
        let user = {};
        userinfo.forEach((value) => { 
            // Dynamically create an object
            user[value.name] = value.value;
            // console.log(user);
            filter_update.color = value.value;
            console.log(filter_update.color);
        });
    })
});

$("#size-filters select").on('change', function () {
    $('#size-filters').trigger('submit');
});

$("#color-filters select").on('change', function () {
    $('#color-filters').trigger('submit');
});

// sets a circle at origin for reference
const geometry = new THREE.CircleGeometry( 10, 32 );
var material = new THREE.MeshStandardMaterial( { color: 0xfcba03 })
const cube = new THREE.Mesh( geometry, material );
cube.name = "TORTILLA";
cube.position.x = 0;
cube.position.y = 0;
scene.add(cube);


mmi.addHandler('TORTILLA', 'click', function(mesh) {
	console.log('interactable mesh has been clicked!');
	alert(mesh.name + " has been clicked");
    console.log(mesh);
    api.getIcon('trees');
    // console.log(api.getIcon('nba'));
});

// creates global lighting to give every object equal light
const light = new THREE.AmbientLight( 0x404040, 3 ); // soft white light
scene.add( light );

// camera and orbiting controls
camera.position.z = 5;

const controls = new OrbitControls( camera, renderer.domElement );

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 20, 100 );
controls.update();

function animate() {
	requestAnimationFrame( animate );
    
	renderer.render( scene, camera );

    mmi.update();
    // camera.position.set(0, 20, 100);
    // console.log(controls.target.distanceTo( controls.object.position ));
	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	renderer.render( scene, camera );
}

animate();

