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
    ballSpeed = 2.0;
    ballRadius = 30.0;
    bulletSpeed = 7.0;
    bulletRadius = 5.0;
    towerHight = 100.0;
    towerFireRate = 0.4;
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    ballArray = new Array();

    lightSource = new THREE.PointLight(0xFFFFFF, 1.0, 0.0);
    lightSource.position.set(30, 20, 20);
    scene.add(lightSource);

    camera = new THREE.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 1, 9000);
    camera.position.z = 800;
    camera.position.y = -700;
    camera.position.x = 420;
    camera.rotation.x = 0.9;

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
    bulletArray = new Array();
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

            // Initialisiere TowerArray (0.0 = leeres Feld)
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

function determineBallPosition(ball)
{
    return [Math.floor(ball.position.x/cellsize),
            Math.floor(ball.position.y/cellsize)];
}

function moveBall(ballId)
{
    // checks whether there is a path for the current ball
    if (pathFindingArray[ballId].length === 0)
    {
        return;
    } 
    
    var ball = ballArray[ballId];
    var fieldX = pathFindingArray[ballId][0].x;
    var fieldY = pathFindingArray[ballId][0].y;
    var path = playingFieldArray[fieldX][fieldY].position.clone();
    path.z = ballRadius;
    var distance = computeDistance(ball.position, path);
    if (distance < 1.1)
    {
        pathFindingArray[ballId].splice(0,1);
        return;
    }   
    
    ball.lookAt(path);

    ball.translateZ( ballSpeed );
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
        var cube = new THREE.Mesh(new THREE.BoxGeometry(40, 40, towerHight, 1, 1, 1), cubeMaterial);
        cube.position = playingFieldArray[x][y].position.clone();
        cube.position.z += towerHight/2;

        towerArray[x][y] = {cube:cube, coolDown:0.0};
        towerCount++;
        scene.add(cube);
    }
    else
    {
        scene.remove(towerArray[x][y].cube);
        towerArray[x][y] = 0.0;
    }
    playingFieldChanged = true;
}

function findBestPath(ballId) {
    var currentLength = 100;
    pathFindingArray[ballId] = new Array();
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
    ball.position = playingFieldArray[randX][0].position.clone();
//    ball.position = playingFieldArray[3][0].position.clone();
    ball.position.z += ballRadius;
    ball.position.y = 1.0;
    
    pathFindingArray.push(new Array());
    ballArray.push(ball);
    findBestPath(ballArray.length - 1);

    scene.add(ball);
}

function controlBalls()
{
    if (ballArray.length>0)
    {
        for (var ballId = 0; ballId<ballArray.length; ballId++)
        {
            // if the current ball has no more path to follow, it reached its destination
            if (pathFindingArray[ballId].length === 0)
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

function fireTowers()
{
    // no balls no targets
    if (ballArray.length === 0)
    {
        return;
    }
    for (var x=0.0; x<gridSizeX; x++)
    {
        for (var y=0.0; y<gridSizeY; y++)
        {
            if (towerArray[x][y] !== 0.0 && towerArray[x][y].coolDown <= 0.0)
            {
                // fire - TODO: add range
                var closestBallId = findClosestBall(towerArray[x][y].cube.position);
                // -1 means there was no ball found - holding fire
                if (closestBallId !== -1)
                {
                    createBullet(towerArray[x][y].cube.position, ballArray[closestBallId].position);
                    towerArray[x][y].coolDown = 10.0;   
                }
            }
            else
            {
                towerArray[x][y].coolDown -= towerFireRate;
            }
        }
    }
}

function createBullet (towerPosition, closestBallPosition)
{
    var bulletMaterial = new THREE.MeshLambertMaterial(
        {
            color: 0xFF0000
        }
    );

    var bullet = new THREE.Mesh(new THREE.SphereGeometry(bulletRadius, 8, 8), bulletMaterial);
    bullet.position = towerPosition.clone();
    bullet.position.z = towerHight;

    //bullet.up = closestBallPosition;
    bullet.lookAt(closestBallPosition);
    bulletArray.push(bullet);
    scene.add(bullet);
}

function controlBullets()
{
    // loop through all existing bullets
    if (bulletArray.length > 0)
    {
        for (var bulletId = 0; bulletId < bulletArray.length; bulletId++)
        {
            bulletArray[bulletId].translateZ( bulletSpeed );
            testBulletImpact(bulletArray[bulletId]);
        }
    }
}

function testBulletImpact(bullet)
{
    // check each existing ball (shot can aim at one ball and hit another or none)
    if (ballArray.length > 0)
    {
        for (var ballId = 0; ballId<ballArray.length; ballId++)
        {
            // if the centre of the bullet is within ballRadius - bulletRadius of the centre of the ball: ball got hit
            if ((ballRadius - bulletRadius) > computeDistance(bullet.position, ballArray[ballId].position))
            {
                // ball hit
                scene.remove(bullet);
                return;
            }
        }
    }
    
    // if no ball was hit: test whether z is still positiv
    if (bullet.position.z <= 0.0)
    {
        // ground was hit - bullet destroyed
        scene.remove(bullet);
        return;
    }
}

function computeDistance(positionFrom, positionTo)
{
    return Math.sqrt(Math.pow(positionFrom.x - positionTo.x, 2)
                              + Math.pow(positionFrom.y - positionTo.y, 2)
                              + Math.pow(positionFrom.z - positionTo.z, 2));
}

// searches the closest ball from the current tower
function findClosestBall(towerPosition)
{
    var distance = 1000.0;
    var targetBallId = -1;
    if (ballArray.length>0)
    {
        for (var ballId = 0; ballId<ballArray.length; ballId++)
        {
            var newDistance = computeDistance(towerPosition, ballArray[ballId].position);
            if (newDistance < distance)
            {
                distance = newDistance;
                targetBallId = ballId;
            }
        }
    }
    return targetBallId;
}

function render ()
{
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controlBalls();
    fireTowers();
    controlBullets();
}