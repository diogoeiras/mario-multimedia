/*-------------------
a player entity
-------------------------------- */
game.PlayerEntity = me.Entity.extend({
 
  /* -----
 
  constructor
 
  ------ */
 
  init: function(x, y, settings) {
    // call the constructor
    this._super(me.Entity, 'init', [x, y, settings]);
 
    // set the default horizontal & vertical speed (accel vector)
    this.body.setVelocity(2, 13);
    // set the display to follow our position on both axis
    me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
    me.game.viewport.setDeadzone(0, 0);
    
    // ensure the player is updated even when outside of the viewport
    this.alwaysUpdate = true;
    this.die = false;
    this.dieUp = false;
    this.dieAnimUp = 0;
    this.dieAnimDown = 0;
    // define a basic walking animation (using all frames)
    this.renderable.addAnimation("walk",  [1, 2, 3]);
    this.renderable.addAnimation("stop", [4]);
    this.renderable.addAnimation("jump", [5]);
    this.renderable.addAnimation("fall", [6]);
    // define a standing animation (using the first frame)
    this.renderable.addAnimation("stand",  [0]);
    // set the standing animation as default
    this.renderable.setCurrentAnimation("stand");

  },
 
  /* -----
   update the player pos
------ */
update: function(dt) {
 
    if (me.input.isKeyPressed('left')) {
      // flip the sprite on horizontal axis
      this.renderable.flipX(true);
      // update the entity velocity
      this.body.vel.x -= this.body.accel.x * me.timer.tick;
      // change to the walking animation
      if (!this.renderable.isCurrentAnimation("walk")) {
        this.renderable.setCurrentAnimation("walk");
      }
    } else if (me.input.isKeyPressed('right')) {
      // unflip the sprite
      this.renderable.flipX(false);
      // update the entity velocity
      this.body.vel.x += this.body.accel.x * me.timer.tick;
      // change to the walking animation
      if (!this.renderable.isCurrentAnimation("walk")) {
        this.renderable.setCurrentAnimation("walk");
      }
    } else {
      this.body.vel.x = 0;
      // change to the standing animation
      this.renderable.setCurrentAnimation("stand");
    }
 
    if (me.input.isKeyPressed('jump')) {
      // make sure we are not already jumping or falling
      if (!this.body.jumping && !this.body.falling) {
        this.renderable.setCurrentAnimation("jump");
        // set current vel to the maximum defined value
        // gravity will then do the rest
        this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
        // set the jumping flag
        this.body.jumping = true;
        me.audio.play("smb_jump-small");
      }
 
    }

    if(this.body.jumping)
      this.renderable.setCurrentAnimation("jump");
    if (this.die && this.dieAnimUp<2) {
      this.renderable.setCurrentAnimation("fall");
      this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
      this.dieAnimUp++;
    }
    else if(this.die && this.dieAnimUp >= 2){
      this.renderable.setCurrentAnimation("fall");
      this.dieAnimDown++;
    }
    if(this.dieAnimDown>50){
      me.levelDirector.reloadLevel();
      return;
    }
    // apply physics to the body (this moves the entity)
    this.body.update(dt);
 
    // handle collisions against other shapes
    me.collision.check(this);
 
    // return true if we moved or if the renderable was updated
    return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
  },
 
  /**
   * colision handler
   * (called when colliding with other objects)
   */
  onCollision : function (response, other) {
    switch (response.b.body.collisionType) {
    case me.collision.types.WORLD_SHAPE:
      // Simulate a platform object
      if (other.type === "platform") {
        if (this.body.falling &&
          !me.input.isKeyPressed('down') &&
          // Shortest overlap would move the player upward
          (response.overlapV.y > 0) &&
          // The velocity is reasonably fast enough to have penetrated to the overlap depth
          (~~this.body.vel.y >= ~~response.overlapV.y)
        ) {
          // Disable collision on the x axis
          response.overlapV.x = 0;
          // Repond to the platform (it is solid)
          return true;
        }
        // Do not respond to the platform (pass through)
        return false;
      }
      else if(other.type === "fall") {
        this.die = true;
        me.audio.play("smb_mariodie");
      }
      else if(other.type === "brick"){
        if(this.body.jumping && (response.overlapV.y<0)){
          response.overlapV.x = 0;
          other.body.setCollisionMask(me.collision.types.NO_OBJECT);
          me.audio.play("smb_breakblock");
  // remove it
        me.game.world.removeChild(other);
        }
      }
      else if(other.type === "question"){
        if(this.body.jumping && (response.overlapV.y<0)){
          other.renderable.setOpacity(0);
          if(other.name==="question"){
            other.name="notquestion";
            var coin = new game.CoinEntity(
              other.pos.x-8,
              other.pos.y-24,
              {
                image: 'spinning_coin_gold',
                width: 16,
                height: 16
              }
            );
            coin.body.addShape(new me.Ellipse(16,16,16,16));
            me.game.world.addChild(coin,7);
          }
        }
      }
      break;
 
    case me.collision.types.ENEMY_OBJECT:
      if ((response.overlapV.y>0) && !this.body.jumping) {
        // bounce (force jump)
        this.body.falling = false;
        this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
        // set the jumping flag
        this.body.jumping = true;
        // play some audio
        me.audio.play("stomp");
      }
      else {
        // let's flicker in case we touched an enemy
        this.renderable.flicker(750);
      }
      return false;
      break;
 
    default:
      // Do not respond to other objects (e.g. coins)
      return false;
  }
 
  // Make the object solid
  return true;
  }
});

/*----------------
  a Coin entity
 ----------------- */
game.CoinEntity = me.CollectableEntity.extend({
  // extending the init function is not mandatory
  // unless you need to add some extra initialization
  init: function(x, y, settings) {
    // call the parent constructor
    this._super(me.CollectableEntity, 'init', [x, y , settings]);
  },
 
  // this function is called by the engine, when
  // an object is touched by something (here collected)
  onCollision : function () {
  // do something when collected
 
  // play a "coin collected" sound
  me.audio.play("smb_coin");
  // give some score
  game.data.score += 200;
  game.data.coins += 1;
 
  // make sure it cannot be collected "again"
  this.body.setCollisionMask(me.collision.types.NO_OBJECT);
 
  // remove it
  me.game.world.removeChild(this);
}
});


/* --------------------------
an enemy Entity
------------------------ */
game.EnemyEntity = me.Entity.extend({
  init: function(x, y, settings) {
    // define this here instead of tiled
    settings.image = "wheelie_right";
 
    // save the area size defined in Tiled
    var width = settings.width;
    var height = settings.height;
 
    // adjust the size setting information to match the sprite size
    // so that the entity object is created with the right size
    settings.spritewidth = settings.width = 64;
    settings.spritewidth = settings.height = 64;
 
    // call the parent constructor
    this._super(me.Entity, 'init', [x, y , settings]);
 
    // set start/end position based on the initial area size
    x = this.pos.x;
    this.startX = x;
    this.endX   = x + width - settings.spritewidth
    this.pos.x  = x + width - settings.spritewidth;
 
    // manually update the entity bounds as we manually change the position
    this.updateBounds();
 
    // to remember which side we were walking
    this.walkLeft = false;
 
    // walking & jumping speed
    this.body.setVelocity(4, 6);
 
  },
 
  // manage the enemy movement
  update: function(dt) {
 
    if (this.alive) {
      if (this.walkLeft && this.pos.x <= this.startX) {
      this.walkLeft = false;
    } else if (!this.walkLeft && this.pos.x >= this.endX) {
      this.walkLeft = true;
    }
    // make it walk
    this.renderable.flipX(this.walkLeft);
    this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
 
    } else {
      this.body.vel.x = 0;
    }
 
    // update the body movement
    this.body.update(dt);
 
    // handle collisions against other shapes
    me.collision.check(this);
 
    // return true if we moved or if the renderable was updated
    return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
  },
 
  /**
   * colision handler
   * (called when colliding with other objects)
   */
  onCollision : function (response, other) {
    if (response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) {
      // res.y >0 means touched by something on the bottom
      // which mean at top position for this one
      if (this.alive && (response.overlapV.y > 0) && response.a.body.falling) {
        this.renderable.flicker(750);
      }
      return false;
    }
    // Make all other objects solid
    return true;
  }
});

