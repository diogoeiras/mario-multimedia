game.GameOverScreen = me.ScreenObject.extend({
 
  /**
   *  action to perform on state change
   */
  onResetEvent : function() {
 
    // add a new renderable component with the scrolling text
    me.game.world.addChild(new (me.Renderable.extend ({
      // constructor
      init : function() {
        this._super(me.Renderable, 'init', [0, 0, me.game.viewport.width, me.game.viewport.height]);
        // font for the scrolling text
        this.font = new me.BitmapFont('32x32_font', 8);
        game.data.lives = 3;
 
      },
 
      // some callback for the tween objects
      scrollover : function() {
        // reset to default value
        this.scrollerpos = 400;
        this.scrollertween.to({scrollerpos: -500 }, 7000).onComplete(this.scrollover.bind(this)).start();
      },
 
      update : function (dt) {
        return true;
      },
 
      draw : function (renderer) {
        this.font.draw(renderer, game.data.gameOverText, 150, 50);
        this.font.draw(renderer, "SCORE: " + game.data.score, 150, 100);
        this.font.draw(renderer, "PRESS ENTER TO PLAY", 150, 150);
      },
      onDestroyEvent : function() {
        //just in case
        this.scrollertween.stop();
      }
    })), 2);
 
    // change to play state on press Enter or click/tap
    me.input.bindKey(me.input.KEY.ENTER, "enter", true);
    me.input.bindPointer(me.input.mouse.LEFT, me.input.KEY.ENTER);
    this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
      if (action === "enter") {
        // play something on tap / enter
        // this will unlock audio on mobile devices
        game.data.gameOverText = "GAME OVER";
        me.audio.play("cling");
        game.data.score=0;
        me.state.change(me.state.PLAY);
      }
    });
  },
 
  /**
   *  action to perform when leaving this screen (state change)
   */
  onDestroyEvent : function() {
    
    me.input.unbindKey(me.input.KEY.ENTER);
    me.input.unbindPointer(me.input.mouse.LEFT);
    me.event.unsubscribe(this.handler);
   }
});