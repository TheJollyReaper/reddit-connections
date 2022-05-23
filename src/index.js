import _ from 'lodash';
import './styles.css';
var THREE = require('three');
import MouseMeshInteraction from '@danielblagy/three-mmi'
// import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { RedditApi } from './scripts/reddit-api';
'use strict';
const snoowrap = require('snoowrap');

const tsne = require('./data/tsne_10000.json');
var clusters = require('./data/clusters.json');
clusters = Object.values(clusters);
const subreddit_attributes = require('./data/subreddit_attributes.json');

var api = new snoowrap({
    userAgent: 'scriptapphcdecapstone',
    clientId: 'hQJu2h7ae10lGVNRSrRoOQ',
    clientSecret: 'dA4clYEh4rR7eWzADqt5vBCWCuUiRQ',
    username: 'hcdecapstone',
    password: 'URGTeam2022'
  });

// element.innerHTML = _.join(['Hello', 'webpack'], ' ');

// This is what lets us move around the scene

// Basic setup, need to create a scene, a camera, a background,
// and a renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 3000 );
const mmi = new MouseMeshInteraction(scene, camera);

// const api = new RedditApi();



// var api = new RedditApi();
// if you want to adjust the background color change the hex code here
scene.background = new THREE.Color( 0xecffa8 );

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});


renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// var subreddit_attributes = {} ;
// var tsne = null;
// var clusters = null;


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

// populate dropdown with subreddits
var dropdown = document.getElementById("search-dropdown");
dropdown.style.display = "block";
for (var sub in subreddit_attributes) {
    // if (sub.toLowerCase().includes(elem.val().toLowerCase())){
        const sub_option = document.createElement("h4");
        sub_option.id = sub;
        sub_option.innerHTML = sub;
        sub_option.onclick = ()=>{
            // camera.position.set( 0, 20, 150 );
            controls.update();

            scene.position.x = 0;
            scene.position.y = 0;
            scene.position.z = 0;

            // var bubble = document.getElementById(sub_option.id);
            // alert(-tsne[sub_option.id]['x'] + ", " + -tsne[sub_option.id]['y'])
            // scene.translateX(-tsne[sub_option.id]['x']);
            // scene.translateY(-tsne[sub_option.id]['y']);

            scene.position.x = -tsne[sub_option.id]['x'] * 60;
            scene.position.y = -tsne[sub_option.id]['y'] * 60;

            // camera.rotation.set(0,0,0);

            // alert(camera.rotation.x + " " + camera.rotation.y + " " + camera.rotation.z);

            camera.position.z = 150;
            // sub_option.style.display = 'none';
            
            // document.getElementById('search-input').value = "";
            // updates panel information
            sub_focus(sub_option.id, tsne[sub_option.id]['x'] * 60, tsne[sub_option.id]['y'] * 60, 0);
        };
        sub_option.style.display = 'none';
        dropdown.appendChild(sub_option);
    // }
}

$('#colorPicker').each(function() {
    var elem = $(this);
 
    // Save current value of element
    elem.data('oldVal', elem.val());
 
    // Look for changes in the value
    elem.bind("propertychange change click keyup input paste", function(event){
       // If value has changed...
       if (elem.data('oldVal') != elem.val()) {
        // Updated stored value
        elem.data('oldVal', elem.val());
        scene.background = new THREE.Color( elem.val() );
      }
    });
  });

$('#search-input').each(function() {
    var elem = $(this);
 
    // Save current value of element
    elem.data('oldVal', elem.val());
 
    // Look for changes in the value
    elem.bind("propertychange change click keyup input paste", function(event){
       // If value has changed...
       if (elem.data('oldVal') != elem.val()) {
        // Updated stored value
        elem.data('oldVal', elem.val());
 
        // Do action
        if (elem.val() != "") {

            document.getElementById("search-dropdown").style.display = "block";
            for (var sub in subreddit_attributes) {
                if (sub.toLowerCase().includes(elem.val().toLowerCase())){
                    // alert(sub);
                    document.getElementById(sub).style.display = 'list-item';
                } else {
                    document.getElementById(sub).style.display = 'none';
                }
    
            }
            
            // document.getElementById('drop_holder').remove()
            
        } else {
            document.getElementById("search-dropdown").style.display = "none";
        }
    
      }
    });
  });

function render_dashboard() {
    // Go through all objects in scene, delete all bubbles
    for (let i = scene.children.length - 1; i >= 0; i--) {
        if(scene.children[i].type === "Mesh")
            scene.remove(scene.children[i]);
    }

    spawn_discs(tsne, clusters);

    // $.getJSON(tsne_data, function(data) {
    //     subreddit_attributes = data
    // })
    
    
    // // fetch the tsne data from the json file
    // $.getJSON( "./data/tsne_10000.json", function( tsne_data ) {
    //     // var ts_keys = Object.keys(data);
    //     // var ts_data = Object.values(data);
    
    //     // console.log(data)
    //     tsne = tsne_data
    
    //     // fetch the cluster data from the json file
    //     $.getJSON( "./data/clusters.json", function( cluster_data ) {
    //         // var cluster_keys = Object.keys(cluster_data);
    //         // var cluster_values = Object.values(cluster_data);
    
    //         // once the data from both files is loaded, start 
    //         // creating the subreddit objects. i'm calling the 
    //         // function in here to ensure the data gets loaded
    //         clusters = Object.values(cluster_data)
    //         spawn_discs(tsne, clusters);
    //     } )
    
    // });
}
const setBackgroundColor = (value) => {
    console.log(value);
    // document.querySelector('.txt').style.color = value;
};


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

                disc.name = cluster_data[cluster][subreddit];
                // set the position of that object to the tsne coordinate units
                disc.position.x = tsne_data[cluster_data[cluster][subreddit]]['x'] * 60;
                disc.position.y = tsne_data[cluster_data[cluster][subreddit]]['y'] * 60;

                // add the object to the scene
                scene.add(disc);

                // Run this function whenever any bubble is clicked
                mmi.addHandler(cluster_data[cluster][subreddit], 'click', function(mesh) {
                    // alert(mesh.name);
                    console.log('interactable mesh has been clicked!');
                    // alert(mesh.position.x);
                    // mesh.name.name
                    // alert(mesh.position.x + "," + mesh.position.y + "," + mesh.position.z); 
                    // camera.position.set(75.76, 27.12, 100);
                   
                    // camera.position.x = 0;
                    // camera.position.y = 0;
                    // camera.position.z = 0;

                    // Delete old lines
                    for (let i = scene.children.length - 1; i >= 0; i--) {
                        if(scene.children[i].type === "Line")
                            scene.remove(scene.children[i]);
                    }

                    camera.position.set( 0, 20, 150 );
                    controls.update();

                    scene.position.x = 0;
                    scene.position.y = 0;
                    scene.position.z = 0;

                    scene.translateX(-mesh.position.x);
                    scene.translateY(-mesh.position.y);
                    // camera.rotation.set(0,0,0);

                    // alert(camera.rotation.x + " " + camera.rotation.y + " " + camera.rotation.z);

                    camera.position.z = 150;

                    // getIcon(mesh.name).then(value=>{document.getElementById('subreddit-img').src=(value);
                    //                                             console.log(value); alert(mesh.name)});

                    sub_focus(mesh.name, mesh.position.x, mesh.position.y, mesh.position.z);

                

                    
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

function sub_focus(name, x, y, z) {
    document.getElementById("search-dropdown").display = 'none';

    api.getSubreddit(name).public_description.then(console.log);
 
    getIcon(name).then(value=>{
        document.getElementById('subreddit-img').src=(value);
        if (!value) {
            getCommImage(name).then(value=>{
                document.getElementById('subreddit-img').src=(value);
            })
        } 
    });

    getDescription(name).then(value=>{
        document.getElementById('description').innerHTML = value;
    })

    document.getElementById('subreddit-name').innerHTML = "r/" + name;
    document.getElementById('popup-panels').style.display = 'flex';
    

    
    // Delete old lines
    for (let i = scene.children.length - 1; i >= 0; i--) {
        if(scene.children[i].type === "Line")
            scene.remove(scene.children[i]);
    }

    var distances = {};
    for (let i = scene.children.length - 1; i > 0; i--) {
        // console.log(scene.children[i]);
        distances[scene.children[i].name] = getDistance(x, y, z, scene.children[i]);
    }

    // Step - 1
    // Create the array of key-value pairs
    var items = Object.keys(distances).map(
        (key) => { return [key, distances[key]] });
    
    // Step - 2
    // Sort the array based on the second element (i.e. the value)
    items.sort(
        (first, second) => { return first[1] - second[1] }
    );
    
    // Step - 3
    // Obtain the list of keys in sorted order of the values.
    var closest_subs = items.map(
        (e) => { return e[0] });

    console.log(closest_subs.slice(0,10));

    for (let i = scene.children.length - 1; i >= 0; i--) {
        if (closest_subs.slice(0,10).includes(scene.children[i].name)) {
            const material = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 5 } );
            const points = [];
            points.push( new THREE.Vector3( x, y, z ) );
            // points.push( new THREE.Vector3( 0, 10, 0 ) );
            // console.log(distances[closest_subs[i]]);
            points.push( new THREE.Vector3( scene.children[i].position.x, scene.children[i].position.y, scene.children[i].position.z ) );
            
            const geometry = new THREE.BufferGeometry().setFromPoints( points );
            const line = new THREE.Line( geometry, material );
            line.name = "line";
            scene.add( line );
        }
    }
}
// function SizeChange(event, inputText) {
//     event.preventDefault();
//     console.log("testing")
// }

// calculate distance between two bubbles
function getDistance(x, y, z, mesh2) { 
    var dx = x - mesh2.position.x; 
    var dy = y - mesh2.position.y; 
    var dz = z - mesh2.position.z; 
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

// sets a circle at origin for referenceTORTILLA
const geometry = new THREE.CircleGeometry( 10, 32 );
var material = new THREE.MeshStandardMaterial( { color: 0xfcba03 })
const cube = new THREE.Mesh( geometry, material );
cube.name = "TORTILLA";
cube.position.x = 0;
cube.position.y = 0;
scene.add(cube);


mmi.addHandler('TORTILLA', 'click', function(mesh) {
	console.log('interactable mesh has been clicked!');
	// alert(mesh.name + " has been clicked");
    console.log(mesh);
    getIcon('trees');
    // console.log(api.getIcon('nba'));
});


// line hover detection
mmi.addHandler('line', 'mouseenter', function(mesh) {
    console.log("hover over line");
	// alert('taco');
    // document.getElementById('line-panel').style.top = event.client
});

// document.addEventListener('mousemove', (event) => {
	
// });

document.getElementById('close').onclick = close_panel;   

function close_panel() {
    // alert('test')
    document.getElementById('popup-panels').style.display = 'none';
}

// creates global lighting to give every object equal light
const light = new THREE.AmbientLight( 0x404040, 3 ); // soft white light
scene.add( light );

// camera and orbiting controls
camera.position.z = 5;

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableRotate = false;
controls.autoRotate = false;
//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 20, 100 );
controls.update();

function getIcon(subreddit) {
    // this.s.getSubreddit(subreddit).icon_img.then(value=>{this.returnValues(value)});

    const sub_link = api.getSubreddit(subreddit).icon_img;
    return sub_link;
    // return String(this.s.getSubreddit(subreddit).icon_img.then( ));
}

function getCommImage(subreddit) {
  // this.s.getSubreddit(subreddit).icon_img.then(value=>{this.returnValues(value)});

  const sub_link = api.getSubreddit(subreddit).community_icon;
  return sub_link;
  // return String(this.s.getSubreddit(subreddit).icon_img.then( ));
}

function getDescription(subreddit) {
  const description = api.getSubreddit(subreddit).public_description;
  return description;
}

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

