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
    cellsize = 100.0;
    gridSizeX = 10.0;
    gridSizeY = 10.0;
    speed = 2.0;
    ballRadius = 30.0;
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    ballArray = new Array();

    lightSource = new THREE.PointLight(0xFFFFFF, 1.0, 0.0);
    lightSource.position.set(30, 20, 20);
    scene.add(lightSource);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 9000);
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

    playingFieldChanged = false;
    towerCount = 0;
    towerArray = new Array();

    playingFieldMesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 1, 1), playingFieldMaterial);
    playingFieldArray = new Array();
    pathFindingArray = new Array();
    for (var i = 0.0; i<gridSizeX; i++)
    {
        towerArray[i] = new Array();
        playingFieldArray[i] = new Array();
        for (var j = 0.0; j<gridSizeY; j++)
        {
            var playingFieldCell = playingFieldMesh.clone();
            playingFieldCell.position = new THREE.Vector3(i*cellsize, j*cellsize, 0.0);
            playingFieldArray[i][j] = playingFieldCell;
            scene.add(playingFieldCell);

            // Initialisiere TowerArray mit Bullshit
            towerArray[i][j] = 0.0;
        }
    }
    
    scene.add(playingFieldMesh);
    document.addEventListener('keydown', onKeyDown, false);
    mouseClicked = false;
    mouseX = 0.0;
    mouseY = 0.0;
    selectedField = new THREE.Vector2(5, 0);
    hightlightCell();
}

function hightlightCell ()
{
    playingFieldArray[selectedField.x][selectedField.y].material = playingFieldHighlightMaterial;
}

function resetCellMaterial ()
{
    playingFieldArray[selectedField.x][selectedField.y].material = playingFieldMaterial;
}

function onKeyDown (event)
{
    var e = event.keyCode;

    switch (e)
    {
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
            if (selectedField.x<0)
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
            if (selectedField.y<0)
            {
                selectedField.y = 9;
            }
            hightlightCell();
            break;

        //Enter
        case 13:
            createTower();
            break;

        case 8:
            createBall();
            break;
    }
}

function onMouseClick (event)
{
    mouseClicked = true;
    mouseX = (event.clientX/window.innerWidth)*2-1;
    mouseY = 1-(event.clientY/window.innerHeight)*2;
}

function isDirectionFree(currentFieldX, currentFieldY)
{
    if (towerArray[currentFieldX][currentFieldY] !== 0.0)
    {
        return false;
    }
    return true;
}

function determineBallPosition(ball)
{
    return [Math.floor(ball.position.x/cellsize),
            Math.floor(ball.position.y/cellsize)];
}

function moveBall(ballId)
{
    var ball = ballArray[ballId];
    currentFieldX = Math.floor(ball.position.x/cellsize);
    currentFieldY = Math.floor(ball.position.y/cellsize);

//    Versuch 1
//    var ballposition = new THREE.Vector3();
//    ballposition.getPositionFromMatrix( ball.matrixWorld );
//    ball.geometry.computeBoundingBox();
//    var boundingBox = ball.geometry.boundingBox;
//    
//    Versuch 2
//    var ballPosition = new THREE.Vector3();
//    ballPosition.subVectors( boundingBox.max, boundingBox.min );
//    ballPosition.multiplyScalar( 0.5 );
//    //position.add( boundingBox.min );
//
//
//
//    
//    ballPosition.applyMatrix4( ball.matrixWorld );
//    
//    for (var currentFieldX=0; currentFieldX<gridSizeX; currentFieldX++)
//    {
//        if (ball.position.x < playingFieldArray[currentFieldX][0].position.x)
//        {
////            currentFieldX--;
//            break;
//        }
//    }
//    
//    for (var currentFieldY=0; currentFieldY<gridSizeY; currentFieldY++)
//    {
////        if (ball.position.y < playingFieldArray[0][currentFieldY].position.y)
////        {
////            currentFieldY--;
//            //break;
//            var test= playingFieldArray[0][currentFieldY].position.y;
////        }
//    }   
    
    deltaX = pathFindingArray[ballId][0].x - currentFieldX;
    deltaY = pathFindingArray[ballId][0].y - currentFieldY;
    
    if (deltaX === 0 && deltaY === 0)
    {
        pathFindingArray[ballId].splice(0,1);
        deltaX = pathFindingArray[ballId][0].x - currentFieldX;
        deltaY = pathFindingArray[ballId][0].y - currentFieldY;       
    }
    
    if (deltaX < 0)
    {
        ball.position.x -= speed;
        return;
    }
    
    if (deltaX > 0)
    {
        ball.position.x += speed;
        return;
    }
   
    if (deltaY < 0)
    {
        ball.position.y -= speed;
        return;
    }
   
    if (deltaY > 0)
    {
        ball.position.y += speed;
        return;
    }    
}   

function render ()
{
    requestAnimationFrame(render);
    renderer.render(scene, camera);

    if (ballArray.length>0)
    {
        for (var ballId = 0; ballId<ballArray.length; ballId++)
        {
            if (ballArray[ballId].position.y>0.3*gridSizeY*cellsize)
            {
                scene.remove(ballArray[ballId]);
                ballArray.splice(ballId, 1);
                pathFindingArray.splice(ballId, 1);
            }
            else
            {
                if (playingFieldChanged)
                {
                    for (var i = 0; i < pathFindingArray.length; i++)
                    {
                        findBestPath(i);
                    }
                }
                moveBall(ballId);
            }
             playingFieldChanged = false;
        }
    }
}

function createTower ()
{
    var x = selectedField.x;
    var y = selectedField.y;

    var cubeMaterial = new THREE.MeshLambertMaterial(
            {
                color: 0x00FFFF
            }
    );

    if (towerArray[x][y] === 0.0)
    {
        var cube = new THREE.Mesh(new THREE.BoxGeometry(40, 40, 100, 1, 1, 1), cubeMaterial);
        cube.position = playingFieldArray[x][y].position.clone();
        cube.position.z += 20;

        towerArray[x][y] = cube;
        towerCount++;
        scene.add(cube);
    }
    else
    {
        scene.remove(towerArray[x][y]);
        towerArray[x][y] = 0.0;
    }
    playingFieldChanged = true;
}

function findBestPath(ballId) {
    var currentLength = 100;
    for (var i = 0; i < 10; i++)
    {
        var ballPosition = determineBallPosition(ballArray[ballId]);
        var currentSolution = a_star(ballPosition, [i, gridSizeY-1], towerArray, gridSizeX, gridSizeY, false);
        if (currentSolution.length !== 0 && currentSolution.length < currentLength)
        {
            pathFindingArray[ballId] = currentSolution;
            currentLength = currentSolution.length;
        }
    }
}

function createBall ()
{
    var ballMaterial = new THREE.MeshLambertMaterial(
        {
            color: 0x00FFFF
        }
    );
    var randX = Math.floor((Math.random()*10));

    var ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 16, 16), ballMaterial);
//    ball.position = playingFieldArray[randX][0].position.clone();
    ball.position = playingFieldArray[3][0].position.clone();
    ball.position.z += 30.0;
    ball.position.y = 1.0;
    
    pathFindingArray.push(new Array());
    ballArray.push(ball);
    findBestPath(ballArray.length - 1);

    scene.add(ball);
}