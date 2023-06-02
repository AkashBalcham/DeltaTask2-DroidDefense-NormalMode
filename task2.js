let canvas = document.getElementById('canvas');
canvas.width = window.innerWidth-17;
canvas.height = window.innerHeight;
let c = canvas.getContext('2d');

//Creating the necessary variables
let t1 = 0, t2 = 0, t3 = 0, tRef;

let bullets = [];
let bulletsToRemove = [];
let enemyBullets = [];
let enemyBulletsToRemove = [];
let enemies = [];
let defeatedEnemies = [];

let playerDir = '';
let moveSpeed = 10;
let bulletSpam = 0;
let bulletVelocity = 10;
let enemyVelocity = 3;
let lives = 13;
let maxLives = 13;
let enemiesKilled = 0;
let score = 0;

let isPaused = 0;

function drawHealthBar() {              //Giving a white background to the health bar
    c.fillStyle = 'white';
    c.fillRect(50, 30, 50*maxLives, 30);
}

function drawScore() {                  //Updates the score every frame
    c.fillStyle = 'white';
    c.fillText(`Score: ${score}`, 1550, 55);
}

window.addEventListener('resize', function() {      
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
})

let keyStates = {};

window.addEventListener('keydown', function(event) {
    keyStates[event.code] = true;
  });
  
window.addEventListener('keyup', function(event) {
        keyStates[event.code] = false;
});
  
  // Update the player's position based on key states
  function updatePlayerPosition() {
    if (keyStates['ArrowLeft'] || keyStates['KeyA']) {
      // Move left
      if (playerPos.x > p1.radius) {
        playerPos.x -= moveSpeed;
        playerText.x -= moveSpeed;
      }
    }
    if (keyStates['ArrowRight'] || keyStates['KeyD']) {
      // Move right
      if (playerPos.x < canvas.width - p1.radius - 2) {
        playerPos.x += moveSpeed;
        playerText.x += moveSpeed;
      }
    }
  }


//Keeps track of the mouse position
window.addEventListener('mousemove', function(event) {
    mousePos.x = event.clientX;
    mousePos.y = event.clientY;

})

//Notes the position when we click and creates a bullet object
window.addEventListener('click', function(event) {          //c.fillRect(1600, 800, 90, 40);
    if(event.button === 0) {
        tRef = new Date();
        
        console.log(bulletSpam);
        mouseClickPos.x = mousePos.x;
        mouseClickPos.y = mousePos.y;
        console.log("time difference: ", tRef-t3);
        if(tRef - t3 >= 800) {
            if(bulletSpam === 0) {
                bulletSpam++;
                t1 = new Date();
                console.log(t1);
                bullets.push(new Bullet());
            } else if (bulletSpam === 2) {
                bulletSpam++;
                t3 = new Date();
                console.log(t3);
                if(t3-t2 >= 800) {
                    bulletSpam = 0;
                }
                bullets.push(new Bullet());
                bulletSpam = 0;
            } else {
                t2 = new Date();
                bulletSpam++;
                console.log(t2);
                if(t2-t1 >= 800) {
                    bulletSpam = 0;
                }
                bullets.push(new Bullet());
            }
            /*
            if((t2-t1) >= 700 || (t3-t2) >= 700) {
                bulletSpam = 0;
                bullets.push(new Bullet());
            } else if((t3-t1) >= 700){
                bullets.push(new Bullet());
            } 
            */
        }
        

        //bullets.push(new Bullet());
        console.log(new Date());
        /*
        if(mouseClickPos.x >= 1600 && mouseClickPos.x <= 1690 && mouseClickPos.y >= 800 && mouseClickPos.y <= 840) {
            isPaused = 1;
            pauseGame();
        } else {
            bullets.push(new Bullet());
        }
        */
    }
})

//Useful objects to store the required data
let playerPos = {x: undefined,
                 y: undefined
};

let mousePos = {x: undefined,
                y: undefined
};

let mouseClickPos = {x: undefined,
                     y: undefined
};

let playerText = {x: 163,
                  y: canvas.height - 30
};

//A class containing attributes and methods for the controllable player
class Player {
    constructor() {
        this.x = 200;
        this.y = window.innerHeight - 100;
        playerPos.x = this.x;
        playerPos.y = this.y;
        this.radius = 40;
        this.colour = 'rgb(204, 51, 153)';
        
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.colour;
        c.fill();
        c.stroke();
    }

    update() {
        this.draw();

        
        if(playerDir === 'left') {
            if(playerPos.x > p1.radius) {
                playerPos.x -= 20;
                playerText.x -= 20; 
            }
        } else if (playerDir === 'right') {
            if(playerPos.x < canvas.width - p1.radius-2) {
                playerPos.x += 20;
                playerText.x += 20;
            } 
        }
        playerDir = '';
        this.x = playerPos.x;
        this.y = playerPos.y;
    }
}

//A class which dictates behaviour of every bullet
class Bullet {
    constructor() {
        this.colour = 'rgb(209, 71, 163)';
        this.x = p1.x;
        this.y = p1.y;
        this.angle = Math.atan((mouseClickPos.y - p1.y) / (mouseClickPos.x - p1.x));
        this.direction = Math.sign(mouseClickPos.x - p1.x);
        this.dx = Math.cos(this.angle) * bulletVelocity * this.direction;
        this.dy = Math.sin(this.angle) * bulletVelocity * this.direction;
        
    }
    

    shoot() {
        c.beginPath();
        c.arc(this.x, this.y, 10, 0, Math.PI * 2);
        c.fillStyle = this.colour;
        c.fill();
    }

    update() {
        this.shoot();
       
        this.x += this.dx;
        this.y += this.dy;

        if (
            this.x <= this.radius ||
            this.x >= canvas.width - this.radius ||
            this.y <= this.radius ||
            this.y >= canvas.height - this.radius
          ) {
            bulletsToRemove.push(this);
          }
    }
}

//Dictatres behaviour of the enemy bot
class Enemy {
    constructor(x) {
        this.x = x;
        this.y = 100;
        this.width = 40;
        this.height = 40;
        this.isAlive = true;
        this.targetX = home.x + home.width/2;
        this.targetY = home.y + home.height/2;
        this.angle = Math.atan((this.targetY - this.y)/(this.targetX - this.x));
        this.direction = Math.sign(this.targetX - this.x);
        this.target = 'home';
        this.dx = Math.cos(this.angle) * enemyVelocity * this.direction;
        this.dy = Math.sin(this.angle) * enemyVelocity * this.direction;
    }

    draw() {
        c.fillStyle = 'rgb(255, 51, 51)';
        c.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.x += this.dx;
        this.y += this.dy;
    }
}

class EnemyBullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = Math.atan((p1.y - this.y) / (p1.x - this.x));
        this.direction = Math.sign(p1.x - this.x);
        this.dx = Math.cos(this.angle) * bulletVelocity * this.direction;
        this.dy = Math.sin(this.angle) * bulletVelocity * this.direction;
    }

    shoot() {
        c.beginPath();
        c.arc(this.x, this.y, 10, 0, Math.PI * 2);
        c.fillStyle = 'grey';
        c.fill();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
}


//A class for the home base to be defened
class HomeBase {
    constructor() {
        this.width = 150;
        this.height = 100;
        this.x = (canvas.width-this.width)/2;
        this.y = canvas.height - 300;
        this.colour ='rgb(200, 200, 0)';
    }

    draw() {
        c.fillStyle = this.colour;
        c.fillRect(this.x, this.y, this.width, this.height); 

        c.font = '25px';
        c.fillStyle = 'white';
        c.fillText('Home', this.x+40, this.y+55);
    }

    update() {
        this.draw();
    }
}

//A class to set the width of the health bar based on number of lives
class HealthBar {
    constructor() {
        this.x = 50;
        this.y = 30;
        //this.width = 500;
        this.height = 30;
        //this.colour = ;
    }

    draw() {
        this.width = lives * 50;
        if(lives >= 7) {
            this.colour = 'rgb(0, 204, 0)';
        } else if (lives < 7 && lives >= 4) {
            this.colour = 'rgb(255, 204, 0)';
        } else if (lives >= 1 && lives < 4) {
            this.colour = 'rgb(255, 51, 0)';
        }
        c.fillStyle = this.colour;
        c.fillRect(this.x, this.y, this.width, this.height);

        c.fillStyle = 'black';
        c.fillText('Home Health', 70, 55);
    }

    update() {
        this.draw();
    }
}

hb1 = new HealthBar();      //Creating a health bar
home = new HomeBase();      //Creating a home base
p1 = new Player();          //Creating the user-controlled player

//Creating initial 4 enemy bots
e1 = new Enemy(Math.floor(Math.random() * canvas.width - 2*80) + 80);
e2 = new Enemy(Math.floor(Math.random() * canvas.width - 2*80) + 80);

//Storing the bots in an array
enemies.push(e1);
enemies.push(e2);


//Keeps creating 3 enemies after 4 seconds
function generateEnemy() {
    clearInterval(x);

    let posX1 = Math.floor(Math.random() * canvas.width - 2*80) + 80;
    let posX2 = Math.floor(Math.random() * canvas.width - 2*80) + 80;
    let posX3 = Math.floor(Math.random() * canvas.width - 2*80) + 80;
    enemies.push(new Enemy(posX1));
    enemies.push(new Enemy(posX2));
    enemies.push(new Enemy(posX3));

    x = setInterval(generateEnemy, 4000);
}
let x = setInterval(generateEnemy, 4000);

function enemyFire() {
    
}

//p1.update();

function init() {
    p1.update();
}

//Checks if 2 rectangles are colliding
function collideRect(r1, r2) {
    if(r1.x <= r2.x + r2.width && r1.x + r1.width >= r2.x && r1.y <= r2.y + r2.height && r1.y + r1.height >= r2.y) {
        return true;
    } else {return false;}
}

//Checks if a circle and a rectangle are colliding
function checkCollision(circle, rectangle) {
    let circleDistanceX = Math.abs(circle.x - rectangle.x - rectangle.width / 2);
    let circleDistanceY = Math.abs(circle.y - rectangle.y - rectangle.height / 2);
  
    if (circleDistanceX > (rectangle.width / 2 + circle.radius)) {
      return false;
    }
    if (circleDistanceY > (rectangle.height / 2 + circle.radius)) {
      return false;
    }
  
    if (circleDistanceX <= (rectangle.width / 2) && (circleDistanceY <= (rectangle.height / 2))) {
      return true;
    }
    /*
    if (circleDistanceY <= (rectangle.height / 2)) {
      return true;
    }
    */
  
    let cornerDistanceSq = Math.pow(circleDistanceX - rectangle.width / 2, 2) +
                           Math.pow(circleDistanceY - rectangle.height / 2, 2);
  
    return (cornerDistanceSq <= Math.pow(circle.radius, 2));
}

//Redraws the entire screen after each frame
function animate() {
    requestAnimationFrame(animate);         //Calls the animate function after each frame
    c.clearRect(0, 0, window.innerWidth, window.innerHeight);       //Clears the canvas to redraw

    drawHealthBar();            //Updates the health bar width

    
    home.update();          
    for(let i=0; i<bullets.length; i++) {
        bullets[i].update();        //Updates the bullets shot which is in the frame
    }

    //Removes the bullets which are out of the frame
    for (let i = 0; i < bulletsToRemove.length; i++) {
        const bullet = bulletsToRemove[i];
        const index = bullets.indexOf(bullet);
        if (index > -1) {
          bullets.splice(index, 1);
        }
    }
    bulletsToRemove = [];

    //Creates the text below the player
    c.font = '25px Arial';
    c.fillStyle = 'white';
    c.fillText('Player', playerText.x, playerText.y);
    
    for(let i=0; i<enemies.length; i++) {
        if(enemies[i].isAlive) {
            enemies[i].update();
        }

        //Checking if the enemy has attacked the home base successfully
        if(collideRect(home, enemies[i])) {
            console.log("Destroying!!");
            --lives;                //Decreases the width of the health bar
            if(lives === 0) {       //Checking if all lives are lost
                clearInterval(x);   //Stops generating enemies
                enemies = [];
                break;
            }
            enemies[i].isAlive = false;
            defeatedEnemies.push(i);
        }
        
    }

    if(lives === 0) {
        endGame();
    }

    //console.log(defeatedEnemies);
    for(let i=0; i<defeatedEnemies.length; i++) {
        enemies.splice(defeatedEnemies[i], 1);
    }
    defeatedEnemies = [];

    //Checks if the bullet hits the enemy bot
    for(let i=0; i<bullets.length; i++) {
        for(let j=0; j<enemies.length; j++) {
            if(checkCollision(bullets[i], enemies[j])) {
                score += 20;               
                enemiesKilled++;
                if(score > 0 && score%100 === 0) {
                    if(lives < maxLives) {
                        ++lives;
                    }
                }
                bullets.splice(i, 1);
                enemies[j].isAlive = false;
                defeatedEnemies.push(j);
            }
        }
    }

    //Removes the killed enemies from the screen
    for(let i=0; i<defeatedEnemies.length; i++) {
        enemies.splice(defeatedEnemies[i], 1);
    }
    defeatedEnemies = [];
    

    hb1.update();
    drawScore();        //Updates the score
    //drawPauseButton();

    updatePlayerPosition();
    p1.update();                //Updates the player position


}

/*
function drawPauseButton() {
    c.fillStyle = 'white';
    c.fillRect(1600, 800, 90, 40);

    c.fillStyle = 'black';
    c.fillText('Pause', 1610, 827, 90, 40);
}


function pauseGame() {
    clearInterval(x);
    cancelAnimationFrame(animate);
    document.querySelector('.overlay2').style.display = 'block';
}

function resumeGame() {
    x = setInterval(generateEnemy, 4000);
    document.querySelector('.overlay2').style.display = 'none';
    animate();
}
*/

//A function when the game ends
function endGame() {
    clearInterval(x);
    document.querySelector('.score').innerHTML = `Score: ${score}`;
    document.querySelector('.enemies-killed').innerHTML = `Enemy bots destroyed: ${enemiesKilled}`;
    document.querySelector('.overlay').style.display = 'block';
}

//Keeps updating all the elements on the canvas
animate();
