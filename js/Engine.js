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
      window.alert('Game over');
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
        this.player.bulletDomElement.style.visibility = 'hidden';
        this.player.canShoot = false;
      } else
      this.player.bulletDomElement.style.visibility = 'unset';
      this.player.bulletY -= timeDiff * 0.5;
      this.player.bulletDomElement.style.top = `${this.player.bulletY}px`;
    }

    // If the player is not dead, then we put a setTimeout to run the gameLoop in 20 milliseconds
    setTimeout(this.gameLoop, 20);
  };


  // Logic for collision detection against the burger
  catOnBurgerCollisionDetection = () => {
    let collided = false;
    this.enemies.forEach(enemy => {
       if(enemy.y >= this.player.domElement.y - 90 && enemy.x === this.player.x) collided = true;
    });
    return collided
  }

  // Logic for collision detection of the bullet against a cat
  bulletOnCatCollisionDetection = () => {
    this.enemies.forEach(enemy => {
       if(enemy.y >= this.player.bulletDomElement.y - 40 && enemy.x === this.player.bulletDomElement.x - 30) {
        this.player.bulletCollided = true;
        this.player.canShoot = false;
        enemy.gotHit = true;

        this.explosion(enemy.x, enemy.y)
        
        this.player.bulletY = this.player.baseBulletY;
        this.player.bulletDomElement.style.visibility = 'hidden';
        this.player.bulletDomElement.style.top = `${this.player.bulletY}px`;
        this.player.bulletDomElement.style.left = `${this.player.x + 30}px`
       };
    });
    return this.player.bulletCollided;
  }

  // This method is not implemented correctly, which is why
  // the burger never dies. In your exercises you will fix this method.
  isPlayerDead = () => {
    if(this.catOnBurgerCollisionDetection()) return true;
    else 
    return false;
  };

  explosion(catX, catY) {
    let explosionDomElement = document.createElement('img');
    explosionDomElement.src = 'images/explosion4.png';
    explosionDomElement.style.position = 'absolute';
    explosionDomElement.style.left = `${catX + 15}px`;
    explosionDomElement.style.top = `${catY + 20}px`;
    explosionDomElement.style.transform = 'scale(1.5)';
    explosionDomElement.style.animationName = 'explode';
    explosionDomElement.style.animationDuration = '2s';
    explosionDomElement.style.zIndex = '10';
    this.root.append(explosionDomElement);
    
    let dissipate = setTimeout(() => {
      this.root.removeChild(explosionDomElement);
      clearTimeout(dissipate);
    }, 2000)
  }
}
