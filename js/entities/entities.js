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
      this.body.setVelocity(game.data.xvel, 13);
      
      // set the display to follow our position on both axis
      me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
      me.game.viewport.setDeadzone(0, 0);
      this.powerup=2;
      // ensure the player is updated even when outside of the viewport
      this.alwaysUpdate = true;
      this.die = false;
      this.dieUp = false;
      this.diesound = false;
      this.dieAnimUp = 0;
      this.dieAnimDown = 0;
      this.body.removeShapeAt(0);
      this.body.addShape(new me.Rect(16,16,16,16));
      // define a basic walking animation (using all frames)
      this.renderable.addAnimation("walk",  [1, 2, 3]);
      this.renderable.addAnimation("walkbig", [8,9,10]);
      this.renderable.addAnimation("walkflower", [14,15,16]);
      this.renderable.addAnimation("stop", [4]);
      this.renderable.addAnimation("stopbig", [11]);
      this.renderable.addAnimation("stopflower", [17]);
      this.renderable.addAnimation("jump", [5]);
      this.renderable.addAnimation("jumpbig", [12]);
      this.renderable.addAnimation("jumpflower", [18]);
      this.renderable.addAnimation("fall", [6]);
      // define a standing animation (using the first frame)
      this.renderable.addAnimation("stand",  [0]);
      this.renderable.addAnimation("standbig",  [7]);
      this.renderable.addAnimation("standflower",  [13]);
      // set the standing animation as default
      this.renderable.setCurrentAnimation("stand");
    },
   
    /* -----
     update the player pos
  ------ */
  update: function(dt) {
      this.body.setVelocity(game.data.xvel, 13);
      if(this.powerup==0){
      this.body.removeShapeAt(0);
      this.body.addShape(new me.Rect(16,16,16,16));

      }
      else if(this.powerup ==1 ){
      this.body.removeShapeAt(0);
      this.body.addShape(new me.Rect(16,16,16,32));
      }
      if (me.input.isKeyPressed('left')) {
        // flip the sprite on horizontal axis
        this.renderable.flipX(true);
        // update the entity velocity
        this.body.vel.x -= this.body.accel.x * me.timer.tick;
        // change to the walking animation
        if (!this.renderable.isCurrentAnimation("walk") && (!this.renderable.isCurrentAnimation("walkbig")) && (!this.renderable.isCurrentAnimation("walkflower"))) {
          if(this.powerup==0)
            this.renderable.setCurrentAnimation("walk");
          else if(this.powerup==1)
            this.renderable.setCurrentAnimation("walkbig");
          else if(this.powerup==2)
            this.renderable.setCurrentAnimation("walkflower");
        }
      } else if (me.input.isKeyPressed('right')) {
        // unflip the sprite
        this.renderable.flipX(false);
        // update the entity velocity
        this.body.vel.x += this.body.accel.x * me.timer.tick;
        // change to the walking animation
        if (!this.renderable.isCurrentAnimation("walk") && (!this.renderable.isCurrentAnimation("walkbig")) && (!this.renderable.isCurrentAnimation("walkflower"))) {
          if(this.powerup==0)
            this.renderable.setCurrentAnimation("walk");
          else if(this.powerup==1)
            this.renderable.setCurrentAnimation("walkbig");
          else if(this.powerup==2)
            this.renderable.setCurrentAnimation("walkflower");
        }
      } else {
        this.body.vel.x = 0;
        // change to the standing animation
        if(this.powerup==0)
            this.renderable.setCurrentAnimation("stand");
          else if(this.powerup==1)
            this.renderable.setCurrentAnimation("standbig");
          else if(this.powerup==2)
            this.renderable.setCurrentAnimation("standflower");
      }

      if(me.input.isKeyPressed('run') && this.powerup==2){
        var fireball = new game.Fireball(
                this.pos.x+24,
                this.pos.y+16,
                {
                  image: 'fireball',
                  width: 8,
                  height: 8
                }
              );
              fireball.body.addShape(new me.Ellipse(8,8,8,8));
              me.game.world.addChild(fireball,7);

      }
   
      if (me.input.isKeyPressed('jump')) {
        // make sure we are not already jumping or falling
        if (!this.body.jumping && !this.body.falling) {
          if(this.powerup==0)
            this.renderable.setCurrentAnimation("jump");
          else if(this.powerup==1)
            this.renderable.setCurrentAnimation("jumpbig");
          else if(this.powerup==2)
            this.renderable.setCurrentAnimation("jumpflower");
          // set current vel to the maximum defined value
          // gravity will then do the rest
          this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
          // set the jumping flag
          this.body.jumping = true;
          if(this.powerup==0)
            me.audio.play("smb_jump-small");
          else if(this.powerup==1 || this.powerup==2)
            me.audio.play("smb_jump-super");
        }
   
      }

      if(this.body.jumping){
        if(this.powerup==0)
            this.renderable.setCurrentAnimation("jump");
        else if(this.powerup==1)
          this.renderable.setCurrentAnimation("jumpbig");
        else if(this.powerup==2)
          this.renderable.setCurrentAnimation("jumpflower");
      }
      if (this.die && this.dieAnimUp<2) {
        this.renderable.setCurrentAnimation("fall");
        this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
        this.dieAnimUp++;
      }
      else if(this.die && this.dieAnimUp >= 2){
        this.renderable.setCurrentAnimation("fall");
        this.dieAnimDown++;
      }
      if(this.dieAnimDown>200){
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
          if(!this.diesound){
            this.diesound=true;
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);
            me.audio.play("smb_mariodie");
          }
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

              me.audio.play("smb_bump");
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
            else if(other.name==="question_powerup"){
              other.name="notquestion";
              me.audio.play("smb_powerup_appears");
              if(this.powerup==0){
                var pus = new game.PowerUp_Shroom(
                  other.pos.x-8,
                  other.pos.y-24,
                  {
                    image: 'mushroom_powerup',
                    width: 16,
                    height: 16
                  }
                );
                pus.body.addShape(new me.Ellipse(16,16,16,16));
                me.game.world.addChild(pus,7);
              }
              else{
                  var puf = new game.PowerUp_Flower(
                  other.pos.x-8,
                  other.pos.y-24,
                  {
                    image: 'flower_powerup',
                    width: 16,
                    height: 16
                  }
                );
                puf.body.addShape(new me.Ellipse(16,16,16,16));
                me.game.world.addChild(puf,7);
              }
            }
            else if(other.name==="notquestion"){
              me.audio.play("smb_bump");
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
          other.renderable.flicker(750);
          other.renderable.setCurrentAnimation("stomped");
          other.alive=false;
          me.audio.play("stomp");
        }
        else {
          // let's flicker in case we touched an enemy

          if(other.alive)
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
    onCollision : function (response, other) {
    // do something when collected
    if(other.name==="mainplayer"){
      // play a "coin collected" sound
       me.audio.play("smb_coin");
       // give some score
       game.data.score += 200;
       game.data.coins += 1;
   
        // make sure it cannot be collected "again"
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
   
        // remove it
       me.game.world.removeChild(this);
         return true;
    }
    return false;
  }
  });

  /*----------------
    a Power up Shroom entity
   ----------------- */
  game.PowerUp_Shroom = me.CollectableEntity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) {
      var width = settings.width;
      var height = settings.height;

      settings.spritewidth = settings.width = 16;
      settings.spritewidth = settings.height = 16;

      this._super(me.CollectableEntity, 'init', [x, y , settings]);
      x = this.pos.x;
    this.startX = x;
    this.endX   = x + width - settings.spritewidth
    this.pos.x  = x + width - settings.spritewidth;
    this.updateBounds();
   
      // to remember which side we were walking
    this.walkLeft = false;
   
      // walking & jumping speed
    this.body.setVelocity(1, 4);
    },
   
    // this function is called by the engine, when
    // an object is touched by something (here collected)
    onCollision : function (response, other) {
      if (other.name==="mainplayer") {
        // res.y >0 means touched by something on the bottom
        // which mean at top position for this one

    // play a "coin collected" sound
    me.audio.play("smb_powerup");
    // give some score
    other.powerup=1;

    me.game.world.removeChild(this);
        
        return false;
      }
    if (response.b.body.collisionType == me.collision.types.WORLD_SHAPE) {
      if(response.overlapV.x>0){
        this.walkLeft=!this.walkLeft;
      }
        
      return true;
     
    }
    else return false;
     
      // Make all other objects solid
      return true;
    // do something when collected
   
   
    
    // remove it
  },
    update: function(dt) {
   
      if (this.alive) {
       /* if (this.walkLeft && this.pos.x <= this.startX) {
        this.walkLeft = false;
      } else if (!this.walkLeft && this.pos.x >= this.endX) {
        this.walkLeft = true;
      }*/
      // make it walk
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
    }
  });

  /*----------------
    a Power up Flower entity
   ----------------- */
  game.PowerUp_Flower = me.CollectableEntity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) {
      var width = settings.width;
      var height = settings.height;

      settings.spritewidth = settings.width = 16;
      settings.spritewidth = settings.height = 16;

      this._super(me.CollectableEntity, 'init', [x, y , settings]);
      x = this.pos.x;
    this.startX = x;
    this.endX   = x + width - settings.spritewidth
    this.pos.x  = x + width - settings.spritewidth;
    this.updateBounds();
    },
   
    // this function is called by the engine, when
    // an object is touched by something (here collected)
    onCollision : function (response, other) {
      if (other.name ==="mainplayer") {
        // res.y >0 means touched by something on the bottom
        // which mean at top position for this one

    // play a "coin collected" sound
    me.audio.play("smb_powerup");
    // give some score
    other.powerup=2;

    me.game.world.removeChild(this);
        
        return false;
      }
      // Make all other objects solid
      return true;
    
    // do something when collected
   
   
    
    // remove it
  },
    update: function(dt) {
   
      this.body.vel.x = 0;
   
      // update the body movement
      this.body.update(dt);
   
      // handle collisions against other shapes
      me.collision.check(this);
   
      // return true if we moved or if the renderable was updated
      return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    }
  });

  //Projectile Entity

  game.Fireball = me.CollectableEntity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) {
      var width = settings.width;
      var height = settings.height;
   
      // to remember which side we were walking
      this.walkLeft = false;

      settings.spritewidth = settings.width = 8;
      settings.spritewidth = settings.height = 8;
      this._super(me.CollectableEntity, 'init', [x, y , settings]);
      this.renderable.addAnimation("proj",  [0, 1, 2, 3]);
      this.body.setVelocity(1,0);
      this.updateBounds();
    },
   
    // this function is called by the engine, when
    // an object is touched by something (here collected)
    onCollision : function (response, other) {
       if(response.b.body.collisionType == me.collision.types.WORLD_SHAPE)
          me.game.world.removeChild(this);
       if(response.b.body.collisionType == me.collision.types.ENEMY_OBJECT && other.name != "mainplayer"){
          this.collidable = false;
          me.game.world.removeChild(this);
          me.game.world.removeChild(other);
       }
  },
    update: function(dt) {
   
      if (this.alive) {
       /* if (this.walkLeft && this.pos.x <= this.startX) {
        this.walkLeft = false;
      } else if (!this.walkLeft && this.pos.x >= this.endX) {
        this.walkLeft = true;
      }*/
      // make it walk
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
    }
  });


  /* --------------------------
  an enemy goomba Entity
  ------------------------ */
  game.Goomba = me.Entity.extend({
    init: function(x, y, settings) {
      // define this here instead of tiled
      settings.image = "goomba";
   
      // save the area size defined in Tiled
      var width = settings.width;
      var height = settings.height;
   
      // adjust the size setting information to match the sprite size
      // so that the entity object is created with the right size
      settings.spritewidth = settings.width = 16;
      settings.spritewidth = settings.height = 16;
   
      // call the parent constructor
      this._super(me.Entity, 'init', [x, y , settings]);
   
      // set start/end position based on the initial area size
      x = this.pos.x;
      this.startX = x;
      this.endX   = x + width - settings.spritewidth
      this.pos.x  = x + width - settings.spritewidth;
   
      // manually update the entity bounds as we manually change the position
      this.updateBounds();
      this.renderable.addAnimation("walk",  [0,1]);
      this.renderable.addAnimation("stomped", [2]);
   
      // to remember which side we were walking
      this.walkLeft = true;
      this.renderable.setCurrentAnimation("walk");
      // walking & jumping speed
      this.body.setVelocity(1, 6);
   
    },
   
    // manage the enemy movement
    update: function(dt) {
   
      if (this.alive) {
           this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
      }
      else {
        this.body.vel.x = 0;
        me.game.world.removeChild(this);
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
      // Make all other objects solid
      if (response.b.body.collisionType == me.collision.types.WORLD_SHAPE) {
        if(other.type==="brick")
          return true;
       if(!this.walkLeft && response.overlapV.x>0){
        this.walkLeft=true;
       }
        else if(this.walkLeft && response.overlapV.x<0)
          this.walkLeft=false;
      return true;
     }
     else return false;
    }
  });

