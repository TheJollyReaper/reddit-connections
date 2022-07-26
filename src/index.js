import _ from 'lodash';
import './styles.css';
var THREE = require('three');
import MouseMeshInteraction from '@danielblagy/three-mmi';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { ArrowHelper } from 'three';

// import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
// import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
// import font_test from './encode_sans.json';
'use strict';

var seedrandom = require('seedrandom');


const snoowrap = require('snoowrap');

const tsne = require('./data/umap_coords.json');
var clusters = require('./data/clusters.json');
clusters = Object.values(clusters);
const subreddit_attributes = require('./data/subreddit_attributes.json');
const scaled_attributes = require('./data/NEW_subreddit_attributes_scaled.json');

// load line data
const cross_post_lines = require('./data/cross_posting_lines.json');
const author_lines = require('./data/author_lines.json');
const estimates_lines = require('./data/estimates_lines.json');
const term_similarity_lines = require('./data/term_similarity_lines.json');

// popup raw data
const cross_post = require('./data/cross_posting.json');
const author_similarity = require('./data/author_similarity.json');
const term_similarity = require('./data/term_similarity.json');
const estimates_full = require('./data/estimates_full.json');


var zoomed_in = false;

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
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100000 );
const mmi = new MouseMeshInteraction(scene, camera);

// const api = new RedditApi();



// var api = new RedditApi();
// if you want to adjust the background color change the hex code here
scene.background = new THREE.Color( 0x000000 );

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});

var spacing_multiplier = 18000;


var tooltip = document.querySelectorAll('#line-popup');

document.addEventListener('mousemove', fn, false);

function fn(e) {
    for (var i=tooltip.length; i--;) {
        tooltip[i].style.left = e.pageX + 'px';
        tooltip[i].style.top = e.pageY + 'px';
    }

    
}

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function onReady(callback) {
    var intervalId = window.setInterval(function() {
      if (document.getElementsByTagName('body')[0] !== undefined) {
        window.clearInterval(intervalId);
        callback.call(this);
      }
    }, 1000);
  }
  
  function setVisible(selector, visible) {
    document.querySelector(selector).style.display = visible ? 'block' : 'none';
  }
  
  onReady(function() {
    setVisible('#everything', true);
    setVisible('#loading-screen', false);
    document.querySelector('#panel').style.visibility = 'visible';
    document.querySelector('#panel').style.display = 'flex';
  });
// var subreddit_attributes = {} ;
// var tsne = null;
// var clusters = null;


var filters = {}
var filter_update = new Proxy(filters, {
    set: function (target, key, value) {
      console.log(`${key} set to ${value}`);
      target[key] = value;
      render_dashboard();
    //   renderLines();
      return true;
    }
})

filter_update.size = 'N_distinct_posters_radius'
filter_update.color = 'clusters'
filter_update.lines = 'cross_post_lines'
filter_update.zoom = camera.position.zoom


// const loader = new FontLoader();
// loader.load('./encode_sans.json', font => {
//   textMesh.geometry = new TextGeometry('asdfasdfasdf', {
//     font: font,
//     size: 100,
//     height: 40,
//     curveSegments: 12,
//     bevelEnabled: true,
//     bevelThickness: 30,
//     bevelSize: 8,
//     bevelOffset: 1,
//     bevelSegments: 12
//   });
//   textMesh.material = material;
//   scene.add(textMesh);
// });

document.getElementById('about-button').onclick = ()=>{openMenu('about')}
document.getElementById('tutorial-button').onclick = ()=>{openMenu('tutorial')}
document.getElementById('data-button').onclick = ()=>{openMenu('data')}

// document.addEventListener("mousedown", function(e){
//     // on pan
//     if(e.button === 2){
//         canvas.onmousemove = function(y) {          
//             controls.reset();
//             controls.update();
//         }
//     }
// });

function openMenu(menu) {
    // alert('menu');
    document.getElementById('menu-content').style.display = 'block'; 
    document.getElementById('about').style.display = 'none'; 
    document.getElementById('tutorial').style.display = 'none'; 
    document.getElementById('data').style.display = 'none'; 

    document.getElementById(menu).style.display = 'block'; 
}
// document.getElementById('tutorial').onclick = ()=>{openMenu('tutorial')};
// document.getElementById('data').onclick = ()=>{openMenu('data')};

function renderLines() {
    // alert(cross_post[25]['Subreddit.i']);

    

    for (let i = scene.children.length - 1; i >= 0; i--) {
        if(scene.children[i].type === "Line") {
            scene.remove(scene.children[i]);
        }
    }

    for (let i = scene.children.length - 1; i >= 0; i--) {
        if(scene.children[i].type === "ArrowHelper") {
            scene.remove(scene.children[i]);
        }
    }

    const scale = spacing_multiplier; //whatever scale is being used to multiply the coordinants, probably should be a universal constant
    var material = new THREE.LineBasicMaterial( { color: 'rgb(49, 115, 135)', linewidth: 5, transparent: true,
                                                            opacity: 0.4 } );

    var filter;
    if (filter_update.lines == 'cross_post_lines') {
        filter = cross_post_lines;
    } else if (filter_update.lines == 'term_similarity_lines') {
        filter = term_similarity_lines;
    } else if (filter_update.lines == 'author_lines') {
        filter = author_lines;
    } else if (filter_update.lines == 'estimate_lines') {
        filter = estimates_lines;
    }
    
    if (filter_update.lines != 'estimate_lines') {

        // getting min max values


        for (let i = 0; i < Object.keys(filter).length; i++) {
            // console.log(i)

            // alert(cross_post['1500isplenty1200isplenty']);
        
            try {
                
                const ix = tsne[filter[i]['Subreddit.i']]['x'] * scale;
                const iy = tsne[filter[i]['Subreddit.i']]['y'] * scale;
    
                const jx = tsne[filter[i]['Subreddit.j']]['x'] * scale;
                const jy = tsne[filter[i]['Subreddit.j']]['y'] * scale;
                
    
                const points = []; // Creates an empty, this is where we store the points that will make up the lines
                points.push( new THREE.Vector3( ix,iy, 0 ) ); // This adds a single point to the array
                points.push( new THREE.Vector3( jx,jy, 0 ) ); //need at least two points for a line
                const geometry = new THREE.BufferGeometry().setFromPoints( points ); // create the geometry based on the points array
                const line = new THREE.Line( geometry, material ); // create the line given the geometry and material
                line.name = "line";
                line.sub_i = filter[i]['Subreddit.i'];
                line.sub_j = filter[i]['Subreddit.j'];
                // line.combined = line.sub_j + line.sub_i;

                scene.add( line ); 
        
            } catch(e) {
                // alert(subreddit_attributes[cross_post[i]['Subreddit.i']][filter_update.size]);
            }
        }
    } else {
        for (let i = 0; i < Object.keys(filter).length; i++) {
            try {
                //Making parallel lines between poins i and j:

                //Constants to change
                const offset = 10; //this is how far off the parallel lines are from the center line
                //First find all the coordinate x and ys of the given points, i and j
                const ix = tsne[filter[i]['Subreddit.i']]['x'] * scale;
                const iy = tsne[filter[i]['Subreddit.i']]['y'] * scale;
                const jx = tsne[filter[i]['Subreddit.j']]['x'] * scale;
                const jy = tsne[filter[i]['Subreddit.j']]['y'] * scale;

                //Now let's find the next levels of info
                const changeX = Math.abs(ix - jx);
                const changeY = Math.abs(iy-ix);
                const ij_distance = Math.sqrt(changeX * changeX + changeY * changeY);
                const ratio = offset / ij_distance;
        
                //Now we get the C and D coordinates! These are the coordinates to use to make the upper lines
                // the line goes from point c to point d
                const cx = ix + ratio * changeY;
                const cy = iy + ratio * changeX;
                const dx = jx + ratio * changeY;
                const dy = jy + ratio * changeX;
        
                //Now for the e and f coordinates, which are the start and end points of the lower lines
                // the line goes from 
                const ex = ix - ratio * changeY;
                const ey = iy - ratio * changeX;
                const fx = jx - ratio * changeY;
                const fy = jy - ratio * changeX;

                //And finally, lets make the lines!
                //top line, goes from point c to point d
                 
                const points = []; // Creates an empty, this is where we store the points that will make up the lines
                points.push( new THREE.Vector3( cx,cy, 0 ) ); // This adds a single point to the array
                points.push( new THREE.Vector3( dx,dy, 0 ) ); //need at least two points for a line
                const geometry = new THREE.BufferGeometry().setFromPoints( points ); // create the geometry based on the points array

                if (estimates_full[filter[i]['Subreddit.j'] + filter[i]['Subreddit.i']].new_estimate > 0) {
                    material = new THREE.LineBasicMaterial( { color: 'rgb(0, 82, 24)', linewidth: 5, transparent: true,
                                                            opacity: 0.4 } ); // used to be 'rgb(0, 213, 255)'
                } else {
                    material = new THREE.LineBasicMaterial( { color: 'rgb(255, 100, 100)', linewidth: 5, transparent: true,
                                                            opacity: 0.4 } ); // used to be 'rgb(255, 0,0'
                }

                var from = new THREE.Vector3( cx, cy, 1 );
                var to = new THREE.Vector3( dx, dy, 1 );
                var direction = to.clone().sub(from);
                var length = direction.length();
                var arrowHelper = new ArrowHelper(direction.normalize(), from, length, material.color);
                arrowHelper.setLength(length, 25, 25);
                scene.add( arrowHelper );
                
                const line = new THREE.Line( geometry, material ); // create the line given the geometry and material
                line.name = "line";
                line.secret_id = "line";
                line.sub_i = filter[i]['Subreddit.j'];
                line.sub_j = filter[i]['Subreddit.i'];
                scene.add( line ); // add the line to the dashboard


                // bottom line, goes from point e to point f
                const points2 = []; // Creates an empty, this is where we store the points that will make up the lines
                points2.push( new THREE.Vector3( ex,ey, 0 ) ); // This adds a single point to the array
                points2.push( new THREE.Vector3( fx,fy, 0 ) ); //need at least two points for a line
                const geometry2 = new THREE.BufferGeometry().setFromPoints( points2 ); // create the geometry based on the points array
                
                if (estimates_full[filter[i]['Subreddit.i'] + filter[i]['Subreddit.j']].new_estimate > 0) {
                    material = new THREE.LineBasicMaterial( { color: 'rgb(0, 82, 24)', linewidth: 5, transparent: true,
                                                            opacity: 0.4 } );
                } else {
                    material = new THREE.LineBasicMaterial( { color: 'rgb(255, 100, 100)', linewidth: 5, transparent: true,
                                                            opacity: 0.4 } );
                }
                
                const line2 = new THREE.Line( geometry2, material ); // create the line given the geometry and material
                line2.name = "line";
                line2.secret_id = "line2";
                line2.sub_i = filter[i]['Subreddit.i'];
                line2.sub_j = filter[i]['Subreddit.j'];
                // line2.id = line.sub_j + line.sub_i;

                // var data_index = cross_post.filter(element=>element.Subreddit.i == filter[i]['Subreddit.i']);
                // data_index = data_index.filter(element=>element.Subreddit.j == filter[j]['Subreddit.i']);
                // data_index = data_index[0]['index'];
                // line2.index = data_index;

                scene.add( line2 );

                var from = new THREE.Vector3( fx, fy, 1 );
                var to = new THREE.Vector3( ex, ey, 1 );
                var direction = to.clone().sub(from);
                var length = direction.length();
                var arrowHelper = new ArrowHelper(direction.normalize(), from, length, material.color);
                arrowHelper.setLength(length, 25, 25);
                scene.add( arrowHelper );

            } catch {
                console.log('sadness');
            }
        }
    }
}


// populate dropdown with subreddits
var dropdown = document.getElementById("search-dropdown");
dropdown.style.display = "block";

for (var sub in subreddit_attributes) {
    // if (sub.toLowerCase().includes(elem.val().toLowerCase())){
        const sub_option = document.createElement("h4");
        sub_option.style.padding = '0';
        sub_option.style.margin = '0';
        sub_option.style.marginLeft = '.5vw';
        sub_option.style.height = '10%';
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

            scene.position.x = -tsne[sub_option.id]['x'] * spacing_multiplier;
            scene.position.y = -tsne[sub_option.id]['y'] * spacing_multiplier;

            // scene.position.x = 0;
            // scene.position.y = 0;
            // scene.position.z = 0;

            // scene.translateX(-mesh.position.x);
            // scene.translateY(-mesh.position.y);
            // camera.rotation.set(0,0,0);

            // alert(camera.rotation.x + " " + camera.rotation.y + " " + camera.rotation.z);

            camera.position.z = 600;

            // getIcon(mesh.name).then(value=>{document.getElementById('subreddit-img').src=(value);
            //                                             console.log(value); alert(mesh.name)});
            // camera.rotation.set(0,0,0);

            // alert(camera.rotation.x + " " + camera.rotation.y + " " + camera.rotation.z);
            // sub_option.style.display = 'none';
            
            // document.getElementById('search-input').value = "";
            // updates panel information
            sub_focus(sub_option.id, tsne[sub_option.id]['x'] * spacing_multiplier, tsne[sub_option.id]['y'] * spacing_multiplier, 0);
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
    
}
const setBackgroundColor = (value) => {
    console.log(value);
    // document.querySelector('.txt').style.color = value;
};


// spawn subreddit discs
function spawn_discs(tsne_data, cluster_data) {

    // iterate through every one of the cluster groups
    var rng = seedrandom('reddit_connections');
    for (let cluster = 0; cluster < cluster_data.length; cluster++) {
        // console.log(cluster_data[cluster])


        // In order to create an object in threejs, it needs geometry and a material
        // Geometry determines the shape, so CircleGeometry(2,32) gives us a flat
        // circle of size 2

        // disc material creates the visible mesh, but really the only thing we care
        // about is that it sets the object color. Here i'm multiplying the hexcode
        // for white by a random number to give each cluster group a random color

        var disc_material = new THREE.MeshStandardMaterial();
        var hover_color = new THREE.MeshStandardMaterial();
        
        if (filter_update.color == "clusters") {
            document.getElementById('legend').style.display = 'none';
            disc_material = new THREE.MeshStandardMaterial( { color: rng.quick() * 0xffffff , opacity: 0.75, transparent: true});
            hover_color = new THREE.MeshStandardMaterial( { color: rng.quick() * 0xffffff});
        }
        var colors = ['rgb(253,231,37)','rgb(221,227,24)','rgb(186,222,40)','rgb(149,216,64)',
                      'rgb(117,208,84)','rgb(86,198,103)','rgb(61,188,116)','rgb(41,175,127)',
                      'rgb(32,163,134)','rgb(31,150,139)','rgb(35,138,141)','rgb(40,125,142)',
                      'rgb(45,113,142)','rgb(51,99,141)','rgb(57,85,140)','rgb(64,70,136)',
                      'rgb(59,55,129)','rgb(72,37,118)','rgb(72,20,103)','rgb(68,1,84)']
        
        var nsfw_colors = ['rgb(252,255,164)','rgb(241,237,113)','rgb(246,213,67)','rgb(251,186,31)',
                        'rgb(252,161,8)','rgb(248,135,14)','rgb(241,113,31)','rgb(229,92,48)',
                        'rgb(215,75,63)','rgb(196,60,78)','rgb(117,50,90)','rgb(155,41,100)',
                        'rgb(135,33,107)','rgb(113,25,110)','rgb(92,18,110)','rgb(69,10,105)',
                        'rgb(47,10,91)','rgb(24,12,60)','rgb(8,5,29)','rgb(0,0,4)']
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
                var size = scaled_attributes[cluster_data[cluster][subreddit]][filter_update.size]
                // create an object with the given geometry and material we set above
                // var disc_geom = new THREE.CircleGeometry( Math.log(size) / Math.log(2), 32 );
                var disc_geom = new THREE.CircleGeometry( size * 20, 32 );

                if (filter_update.color != 'clusters') {
                    document.getElementById('legend').style.display = 'flex';
                    console.log(filter_update.color);
                    console.log(scaled_attributes[cluster_data[cluster][subreddit]][filter_update.color]);
                    var color_value = scaled_attributes[cluster_data[cluster][subreddit]][filter_update.color];
                    var index = (Math.round(parseFloat(color_value) * 100 % 5));
                    console.log('index ' + index);

                    if (filter_update.color == "NSFW_%") {
                        document.getElementById('color-0').style.backgroundColor = nsfw_colors[0];
                        document.getElementById('color-1').style.backgroundColor = nsfw_colors[2];
                        document.getElementById('color-2').style.backgroundColor = nsfw_colors[4];
                        document.getElementById('color-3').style.backgroundColor = nsfw_colors[6];
                        document.getElementById('color-4').style.backgroundColor = nsfw_colors[8];
                        document.getElementById('color-5').style.backgroundColor = nsfw_colors[10];
                        document.getElementById('color-6').style.backgroundColor = nsfw_colors[12];
                        document.getElementById('color-7').style.backgroundColor = nsfw_colors[14];
                        document.getElementById('color-8').style.backgroundColor = nsfw_colors[16];
                        document.getElementById('color-9').style.backgroundColor = nsfw_colors[18];
                        disc_material = new THREE.MeshStandardMaterial({color: new THREE.Color(nsfw_colors[index]), opacity: 0.75});
              
                    } else {
                        document.getElementById('color-0').style.backgroundColor = colors[0];
                        document.getElementById('color-1').style.backgroundColor = colors[2];
                        document.getElementById('color-2').style.backgroundColor = colors[4];
                        document.getElementById('color-3').style.backgroundColor = colors[6];
                        document.getElementById('color-4').style.backgroundColor = colors[8];
                        document.getElementById('color-5').style.backgroundColor = colors[10];
                        document.getElementById('color-6').style.backgroundColor = colors[12];
                        document.getElementById('color-7').style.backgroundColor = colors[14];
                        document.getElementById('color-8').style.backgroundColor = colors[16];
                        document.getElementById('color-9').style.backgroundColor = colors[18];
                        disc_material = new THREE.MeshStandardMaterial({color: new THREE.Color(colors[index]), opacity: 0.75});
             
                    }
                }

                const disc = new THREE.Mesh( disc_geom, disc_material );

                disc.name = cluster_data[cluster][subreddit];

                disc.normal_color = disc_material;
               
                // set the position of that object to the tsne coordinate units
                // var jitter = (rng.quick() + 3) *20;
                // if (rng.quick() > .5) {
                //     jitter = -jitter
                // }

                disc.position.x = tsne_data[cluster_data[cluster][subreddit]]['x'] * spacing_multiplier;

                // jitter = (rng.quick() + 3)*20;
                // if (rng.quick() > .5) {
                //     jitter = -jitter
                // }

                disc.position.y = tsne_data[cluster_data[cluster][subreddit]]['y'] * spacing_multiplier;
                // disc.position.z = Math.floor(Math.random() * 10);
                disc.position.z = -size;
                // add the object to the scene
                scene.add(disc);
                
                //Create outline object
                // var outline_geo = new THREE.CircleGeometry( size**3 * 5, 32 );
                // outline_geo.position.x = tsne_data[cluster_data[cluster][subreddit]]['x'] * spacing_multiplier;
                // outline_geo.position.y = tsne_data[cluster_data[cluster][subreddit]]['y'] * spacing_multiplier;
                // //Notice the second parameter of the material
                // var outline_mat = new THREE.MeshBasicMaterial({color : 0x00ff00, side: THREE.BackSide});
                // var outline = new THREE.Mesh(outline_geo, outline_mat);
                // //Scale the object up to have an outline (as discussed in previous answer)
                // outline.scale.multiplyScalar(1.5);
                // scene.add(outline);
            

                // Run this function whenever any bubble is clicked
                mmi.addHandler(cluster_data[cluster][subreddit], 'click', function(mesh) {
                    // alert(mesh.name);
                    console.log('interactable mesh has been clicked!');

                    // set outline circle

                    // var outline_geo = new THREE.CircleGeometry( size * 20 + 10000, 32 );
                    // var disc_material = new THREE.MeshStandardMaterial({ color: 0xffffff});
                    // const outline = new THREE.Mesh( outline_geo, disc_material );

                    // outline.position.x = mesh.position.x * spacing_multiplier;
                    // outline.position.y = mesh.position.y * spacing_multiplier;
                    // outline.position.z = mesh.position.z - 1;
                    // scene.add(outline);


                    // console.log(cross_post);
                    // alert(mesh.position.x);
                    // mesh.name.name
                    // alert(mesh.position.x + "," + mesh.position.y + "," + mesh.position.z); 
                    // camera.position.set(75.76, 27.12, 100);
                   
                    // camera.position.x = 0;
                    // camera.position.y = 0;
                    // camera.position.z = 0;

                    // Delete old lines
                    // for (let i = scene.children.length - 1; i >= 0; i--) {
                    //     if(scene.children[i].type === "Line")
                    //         scene.remove(scene.children[i]);
                    // }

                    camera.position.set( 0, 20, 600 );
                    controls.update();

                    scene.position.x = 0;
                    scene.position.y = 0;
                    scene.position.z = 0;

                    scene.translateX(-mesh.position.x);
                    scene.translateY(-mesh.position.y);
                    // camera.rotation.set(0,0,0);

                    // alert(camera.rotation.x + " " + camera.rotation.y + " " + camera.rotation.z);

                    camera.position.z = 600;

                    console.log("camera rotation: " + camera.rotation.x + ' ' + camera.rotation.y);

                    // alert(mesh.position.x + " | " + mesh.position.y)
                    // getIcon(mesh.name).then(value=>{document.getElementById('subreddit-img').src=(value);
                    //                                             console.log(value); alert(mesh.name)});

                    sub_focus(mesh.name, mesh.position.x, mesh.position.y, mesh.position.z);
                    controls.reset();
                    camera.position.z = 600;
                });
                // mmi.addHandler(cluster_data[cluster][subreddit], 'click', function(mesh) {
                //     // alert(mesh.name);
                //     console.log('interactable mesh has been clicked!');
                //     // console.log(cross_post);
                //     // alert(mesh.position.x);
                //     // mesh.name.name
                //     // alert(mesh.position.x + "," + mesh.position.y + "," + mesh.position.z); 
                //     // camera.position.set(75.76, 27.12, 100);

                //     camera.position.x=mesh.position.x;
                //     camera.position.y=mesh.position.y;
                //     camera.position.z=600;
                //     controls.target.set(mesh.position.x,mesh.position.y,600);
                //     // controls.update();
                //     controls = new OrbitControls( camera, renderer.domElement );
                //     controls.enableRotate = false;
                //     controls.autoRotate = false;
                //     // controls.enablePan = false;
                //     //controls.update() must be called after any manual changes to the camera's transform
                //     camera.position.set( 0, 20, 300 );
                //     camera.position.x=mesh.position.x;
                //     camera.position.y=mesh.position.y;
                //     controls.update();

                    
                //     // sub_focus(mesh.name, mesh.position.x, mesh.position.y, mesh.position.z);

                

                    
                // });
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
    document.getElementById('visit-link').href = 'https://www.reddit.com/r/' + name;
    document.getElementById('rules-link').href = 'https://www.reddit.com/r/' + name + '/wiki/';
    
    // Delete old lines
    // for (let i = scene.children.length - 1; i >= 0; i--) {
    //     if(scene.children[i].type === "Line")
    //         scene.remove(scene.children[i]);
    // // }

    // var distances = {};
    // for (let i = scene.children.length - 1; i > 0; i--) {
    //     // console.log(scene.children[i]);
    //     distances[scene.children[i].name] = getDistance(x, y, z, scene.children[i]);
    // }

    // // Step - 1
    // // Create the array of key-value pairs
    // var items = Object.keys(distances).map(
    //     (key) => { return [key, distances[key]] });
    
    // // Step - 2
    // // Sort the array based on the second element (i.e. the value)
    // items.sort(
    //     (first, second) => { return first[1] - second[1] }
    // );
    
    // // Step - 3
    // // Obtain the list of keys in sorted order of the values.
    // var closest_subs = items.map(
    //     (e) => { return e[0] });

    // console.log(closest_subs.slice(0,10));

    // for (let i = scene.children.length - 1; i >= 0; i--) {
    //     if (closest_subs.slice(0,10).includes(scene.children[i].name)) {
    //         const material = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 5 } );
    //         const points = [];
    //         points.push( new THREE.Vector3( x, y, z ) );
    //         // points.push( new THREE.Vector3( 0, 10, 0 ) );
    //         // console.log(distances[closest_subs[i]]);
    //         points.push( new THREE.Vector3( scene.children[i].position.x, scene.children[i].position.y, scene.children[i].position.z ) );
            
    //         const geometry = new THREE.BufferGeometry().setFromPoints( points );
    //         const line = new THREE.Line( geometry, material );
    //         line.name = "line";
    //         scene.add( line );
    //     }
    // }
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

    $('#line-filters').on('submit', function(event){
        event.preventDefault();
        let userinfo = $(this).serializeArray();
        let user = {};
        userinfo.forEach((value) => { 
            // Dynamically create an object
            user[value.name] = value.value;
            // console.log(user);
            filter_update.lines = value.value;
            renderLines();
            console.log(filter_update.lines);
        });
    })
});

$("#size-filters select").on('change', function () {
    $('#size-filters').trigger('submit');
});

$("#color-filters select").on('change', function () {
    $('#color-filters').trigger('submit');
});

$("#line-filters select").on('change', function () {
    $('#line-filters').trigger('submit');
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
    // alert("hover over line");
    document.getElementById('line-popup').style.display = 'block';
    // alert(mesh.sub_i + " | " + mesh.sub_j)
    document.getElementById('popup-subreddits').innerHTML = "r/" + mesh.sub_i + " & " + "r/" + mesh.sub_j;
	document.getElementById('popup-crossposts').innerHTML = 'Cross-posting: ' + cross_post[mesh.sub_j + mesh.sub_i]['cross_posts'];
    document.getElementById('popup-author').innerHTML = 'Author Similarity: ' + author_similarity[mesh.sub_j + mesh.sub_i]['author_similarity'] + " (" + author_similarity[mesh.sub_j + mesh.sub_i]['hover_tag'] + ")";
	document.getElementById('popup-term').innerHTML = 'Term Similarity: ' + term_similarity[mesh.sub_j + mesh.sub_i]['term_similarity'] + " (" + term_similarity[mesh.sub_j + mesh.sub_i]['hover_tag'] + ")";
    
    document.getElementById('popup-estimate').innerHTML = mesh.sub_j + " to " + mesh.sub_i + ": " + estimates_full[mesh.sub_j + mesh.sub_i]['new_estimate'] + " (" + estimates_full[mesh.sub_j + mesh.sub_i]['hover_tag'] + ")";
    document.getElementById('popup-estimate2').innerHTML = mesh.sub_i + " to " + mesh.sub_j + ": " + estimates_full[mesh.sub_i + mesh.sub_j]['new_estimate'] + " (" + estimates_full[mesh.sub_i + mesh.sub_j]['hover_tag'] + ")";

    // document.getElementById('popup-crossposts').innerHTML = mesh.index;
    // alert('taco');
    // document.getElementById('line-panel').style.top = event.client
});

mmi.addHandler('line', 'mouseleave', function(mesh) {
    document.getElementById('line-popup').style.display = 'none';
})



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

var controls = new OrbitControls( camera, renderer.domElement );
controls.enableRotate = false;
controls.autoRotate = false;
// controls.enablePan = false;
//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 0, 600 );
controls.update();
scene.translateX(-146908);
scene.translateY(-102006);

// 73453.87800000001,51002.928
// 146907.75600000002,102005.856


// var flyControls = new FlyControls(camera, renderer.domElement);
// flyControls.dragToLook = true;
// flyControls.movementSpeed = 10;
// flyControls.rollSpeed = 1;

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

render_dashboard();

function animate() {
	requestAnimationFrame( animate );
    
	renderer.render( scene, camera );

    mmi.update();
    // camera.position.set(0, 20, 100);
    // console.log(controls.target.distanceTo( controls.object.position ));
	// required if controls.enableDamping or controls.autoRotate are set to true
	
    // flyControls.update();
    // controls.update();
    console.log(camera.position.z);
 
    // filter_update.zoom = camera.position.z;
    // if (camera.position.z <= 600 && !zoomed_in) {
    //     zoomed_in = !zoomed_in;
    //     filter_update.zoom = camera.position.z;
    //     spacing_multiplier = 8000;
    // }

    // if (camera.position.z > 600 && zoomed_in) {
    //     zoomed_in = !zoomed_in;
    //     filter_update.zoom = camera.position.z;
    //     spacing_multiplier = 9000;
    // }
	renderer.render( scene, camera );
}

animate();
renderLines();

