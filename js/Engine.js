// The engine class will only be instantiated once. It contains all the logic
// of the game relating to the interactions between the player and the
// enemy and also relating to how our enemies are created and evolve over time
class Engine {
  // The constructor has one parameter. It will refer to the DOM node that we will be adding everything to.
  // You need to provide the DOM node when you create an instance of the class
  constructor(theRoot) {
    // We need the DOM element every time we create a new enemy so we
    // store a reference to it in a property of the instance.
    this.root = theRoot;
    // We create our hamburger.
    // Please refer to Player.js for more information about what happens when you create a player
    this.player = new Player(this.root);
    // Initially, we have no enemies in the game. The enemies property refers to an array
    // that contains instances of the Enemy class
    this.enemies = [];
    this.explosionArr = [
      'images/explosion00.png',
      'images/explosion01.png',
      'images/explosion02.png',
      'images/explosion03.png',
      'images/explosion04.png',
      'images/explosion05.png',
      'images/explosion06.png',
      'images/explosion07.png'
    ];
    // We add the background image to the game
    addBackground(this.root);

  }

  // The gameLoop will run every few milliseconds. It does several things
  //  - Updates the enemy positions
  //  - Detects a collision between the player and any enemy
  //  - Removes enemies that are too low from the enemies array
  gameLoop = () => {
    // This code is to see how much time, in milliseconds, has elapsed since the last
    // time this method was called.
    // (new Date).getTime() evaluates to the number of milliseconds since January 1st, 1970 at midnight.
    if (this.lastFrame === undefined) {
      this.lastFrame = new Date().getTime();
    }

    let timeDiff = new Date().getTime() - this.lastFrame;

    this.lastFrame = new Date().getTime();
    // We use the number of milliseconds since the last call to gameLoop to update the enemy positions.
    // Furthermore, if any enemy is below the bottom of our game, its destroyed property will be set. (See Enemy.js)
    this.enemies.forEach((enemy) => {
      enemy.update(timeDiff);
    });

    // We remove all the destroyed enemies from the array referred to by \`this.enemies\`.
    // We use filter to accomplish this.
    // Remember: this.enemies only contains instances of the Enemy class.
    this.enemies = this.enemies.filter((enemy) => {
      return !enemy.destroyed;
    });

    // We need to perform the addition of enemies until we have enough enemies.
    while (this.enemies.length < MAX_ENEMIES) {
      // We find the next available spot and, using this spot, we create an enemy.
      // We add this enemy to the enemies array
      const spot = nextEnemySpot(this.enemies);
      this.enemies.push(new Enemy(this.root, spot));
    }

    // We check if the player is dead. If he is, we alert the user
    // and return from the method (Why is the return statement important?)
    if (this.isPlayerDead()) {
      gameOver.style.display = 'unset';
      resetButton.style.visibility = 'unset';
      return;
    }

    // Checking if a bullet collided with a cat
    if (this.bulletOnCatCollisionDetection()) {
      this.player.bulletCollided = false;
      
      this.enemies.forEach(enemy => {
        if(enemy.gotHit) { 
         this.root.removeChild(enemy.domElement)
         enemy.destroyed = true;
        };
      });

    }

    // Checking if player can shoot bullets
    if(this.player.canShoot) {
      if(this.player.bulletY < 0) {
        this.player.bulletY = this.player.baseBulletY;
        this.player.bulletDomElement.style.left = `${this.player.x + 30}px`
        this.player.bulletDomElement.style.display = 'none';
        this.player.canShoot = false;
      } else
      this.player.bulletDomElement.style.display = 'block';
      this.player.bulletY -= timeDiff * 0.5;
      this.player.bulletDomElement.style.top = `${this.player.bulletY}px`;
    }

    // Adding score as the player is alive
    this.player.score += Math.floor((timeDiff / 10));
    score.innerHTML = `SCORE: ${gameEngine.player.score}`;

    // Collision detection
    this.catOnBurgerCollisionDetection();

    // If the player is not dead, then we put a setTimeout to run the gameLoop in 20 milliseconds
    setTimeout(this.gameLoop, 20);
  };


  // Logic for collision detection against the burger
  catOnBurgerCollisionDetection = () => {
    this.enemies.forEach(enemy => {
       if(enemy.y >= this.player.domElement.y - 90 && enemy.x === this.player.x) {
        getHit.play();
        this.player.lives -= 1;
        root.removeChild(enemy.domElement);
        this.explosion(enemy.x, enemy.y)
        enemy.destroyed = true;
        lives.removeChild(this.player.livesArr[this.player.lives]);
        this.player.livesArr.splice(this.player.lives, 1);
        
        this.gettingHitEffect();
       };
    });
  }

  // Logic for collision detection of the bullet against a cat
  bulletOnCatCollisionDetection = () => {
    this.enemies.forEach(enemy => {
       if(enemy.y >= this.player.bulletDomElement.y - 50 && enemy.x === this.player.bulletDomElement.x - 30) {
        this.player.bulletCollided = true;
        this.player.canShoot = false;
        enemy.gotHit = true;

        // Trigger explosion annimation
        this.explosion(enemy.x, enemy.y);
        explosion.play();
        
        // Reposition bullet after hit
        this.player.bulletY = this.player.baseBulletY;
        this.player.bulletDomElement.style.display = 'none';
        this.player.bulletDomElement.style.top = `${this.player.bulletY}px`;
        this.player.bulletDomElement.style.left = `${this.player.x + 30}px`;

        // Extra point annimation
        let extraPoints = document.createElement('span');
        extraPoints.style.fontFamily = 'Orbitron, sans-serif';
        extraPoints.style.fontSize = '3em';
        extraPoints.style.color = 'lightgreen';
        extraPoints.innerHTML = '+50'
        score.after(extraPoints);
        this.player.score += 50;

        let removeExtraPointUi = setTimeout(() => {
          uiDivFlex.removeChild(extraPoints);
          clearTimeout(removeExtraPointUi);
        }, 1000);
       };
    });
    return this.player.bulletCollided;
  }

  // This method is not implemented correctly, which is why
  // the burger never dies. In your exercises you will fix this method.
  isPlayerDead = () => {
    if(this.player.lives === 0) return true;
    else 
    return false;
  };

  // Render an explosion when a cat is hit
  explosion(catX, catY, randomExplosion = Math.floor(Math.random() * this.explosionArr.length)) {
    let explosionDomElement = document.createElement('img');
    explosionDomElement.src = this.explosionArr[randomExplosion];
    explosionDomElement.style.position = 'absolute';
    explosionDomElement.style.left = `${catX - 260}px`;
    explosionDomElement.style.top = `${catY - 160}px`;
    explosionDomElement.style.transform = 'scale(.2)';
    explosionDomElement.style.animationName = 'explode';
    explosionDomElement.style.animationDuration = '2s';
    explosionDomElement.style.zIndex = '10';
    explosionDomElement.style.overflow = 'hidden';
    this.root.append(explosionDomElement);
    
    let dissipate = setTimeout(() => {
      this.root.removeChild(explosionDomElement);
      clearTimeout(dissipate);
    }, 2000)
  }

  // Effect when the burger is hit
  gettingHitEffect() {
    this.player.domElement.style.visibility = 'hidden';
        setTimeout(() => {
          this.player.domElement.style.visibility = 'visible';
        }, 100);
        
        setTimeout(() => {
          this.player.domElement.style.visibility = 'hidden';
        }, 200);
        
        setTimeout(() => {
          this.player.domElement.style.visibility = 'visible';
        }, 300);
        
        setTimeout(() => {
          this.player.domElement.style.visibility = 'hidden';
        }, 400);
        
        setTimeout(() => {
          this.player.domElement.style.visibility = 'visible';
        }, 500);

        setTimeout(() => {
          this.player.domElement.style.visibility = 'hidden';
        }, 600);

        setTimeout(() => {
          this.player.domElement.style.visibility = 'visible';
        }, 700);
  }
}
