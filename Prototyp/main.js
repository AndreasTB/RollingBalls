/* 
 * Copyright (C) 2014 Andreas Buck (mail@andreasbuck.de)
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 */

main();
render();

function main ()
{
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    lightSource = new THREE.PointLight(0xFFFFFF, 1.0, 0.0);
    lightSource.position.set(30, 20, 20);    
    scene.add(lightSource);
   
    camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 1, 9000);
    //camera.position.x = 1000;
    //camera.position.y = 1000;
    camera.position.z = 1000;
    //camera.rotation.y = 0.3;
    //camera.lookAt(new THREE.Vector3(0.0 ,0.0, 0.0));
    
    var playingFieldMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        ambient: 0xFFFFFF,
        side: THREE.DoubleSide,
        wireframe: true
    });  

    playingFieldMesh = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 10, 10), playingFieldMaterial);
    playingFieldMesh.rotation.x -= 0.7;
//    playingFieldMesh.rotation.z -= 0.3;
    scene.add(playingFieldMesh);
}

//function animate() {
//    requestAnimationFrame( animate );           
//    render();
//}

function render ()
{
    requestAnimationFrame( render );
    renderer.render(scene, camera);
}


