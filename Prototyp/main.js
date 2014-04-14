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
    camera.position.z = 300;
    camera.position.y = 0;
    camera.position.x = 420;
    camera.rotation.x = 0.5;

    playingFieldTexture = new THREE.ImageUtils.loadTexture('Grid.png');
    playingFieldMaterial = new THREE.MeshBasicMaterial({
        color: 0x009900,
        side: THREE.DoubleSide,
        map: playingFieldTexture
    });  
    
    playingFieldHighlightMaterial = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        side: THREE.DoubleSide,
        map: playingFieldTexture
    }); 

    
    playingFieldMesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 1, 1), playingFieldMaterial);
    playingFieldArray = new Array();
    for (var i=0.0; i<1000.0; i+=100.0)
    {
        playingFieldArray[i/100] = new Array();
        for (var j=0.0; j<1000.0; j+=100.0)
        {
            var playingFieldCell = playingFieldMesh.clone();
            playingFieldCell.position = new THREE.Vector3(i, j, 0.0);
            playingFieldArray[i/100][j/100] = playingFieldCell;
            scene.add(playingFieldCell);
        }
    }
    scene.add(playingFieldMesh);
    document.addEventListener('keydown', onKeyDown, false);
    mouseClicked = false;
    mouseX = 0.0;
    mouseY = 0.0;
    selectedField = new THREE.Vector2(5,0);
    hightlightCell(selectedField.x,selectedField.y);
}

function hightlightCell()
{
    playingFieldArray[selectedField.x][selectedField.y].material = playingFieldHighlightMaterial;
}

function resetCellMaterial()
{
    playingFieldArray[selectedField.x][selectedField.y].material = playingFieldMaterial;
}

function onKeyDown(event) 
{
    var e = event.keyCode;

    switch(e) {
        // arrow left
        case 39:
            resetCellMaterial();
            selectedField.x += 1;
            selectedField.x %= 10;
            hightlightCell();
            break;

        // arrow right
        case 37:
            resetCellMaterial();
            selectedField.x -= 1;
            selectedField.x %= 10;
            if (selectedField.x < 0)
            {
                selectedField.x = 9;
            }
            hightlightCell();
            break;

        // arrow up
        case 38:
            resetCellMaterial();
            selectedField.y += 1;
            selectedField.y %= 10;
            hightlightCell();
            break;

        // arrow down
        case 40:
            resetCellMaterial();
            selectedField.y -= 1;
            selectedField.y %= 10;
            if (selectedField.y < 0)
            {
                selectedField.y = 9;
            }
            hightlightCell();
            break; 
    }
}

function onMouseClick(event)
{
   mouseClicked = true;
   mouseX = (event.clientX / window.innerWidth) * 2 - 1;
   mouseY = 1 - (event.clientY / window.innerHeight) * 2;
}

function render ()
{
    requestAnimationFrame( render );
    renderer.render(scene, camera);
}