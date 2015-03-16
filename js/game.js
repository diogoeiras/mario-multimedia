
/* Game namespace */
var game = {

    // an object where to store game information
    data : {
        // score
        score : 0
    },


    // Run on page load.
    "onload" : function () {
    // Initialize the video.
    if (!me.video.init("screen",  me.video.CANVAS, 416, 208, true, 'auto')) {
        alert("Your browser does not support HTML5 canvas.");
        return;
    }

    // add "#debug" to the URL to enable the debug Panel
    if (document.location.hash === "#debug") {
        window.onReady(function () {
            me.plugin.register.defer(this, me.debug.Panel, "debug", me.input.KEY.V);
        });
    }

    // Initialize the audio.
    me.audio.init("mp3,ogg");

    // Set a callback to run when loading is complete.
    me.loader.onload = this.loaded.bind(this);

    // Load the resources.
    me.loader.preload(game.resources);

    // Initialize melonJS and display a loading screen.
    me.state.change(me.state.LOADING);
},

    // Run on game resources loaded.
    "loaded" : function () {
      me.state.set(me.state.MENU, new game.TitleScreen());
        // set the "Play/Ingame" Screen Object
  me.state.set(me.state.PLAY, new game.PlayScreen());

  // set a global fading transition for the screen
  me.state.transition("fade", "#FFFFFF", 250);
 
  // register our player entity in the object pool
  me.pool.register("mainPlayer", game.PlayerEntity);
  me.pool.register("CoinEntity", game.CoinEntity);
  me.pool.register("EnemyEntity", game.EnemyEntity);
  me.pool.register("brick", game.brick);
  me.pool.register("question", game.question);
  // enable the keyboard
  me.input.bindKey(me.input.KEY.LEFT,  "left");
  me.input.bindKey(me.input.KEY.RIGHT, "right");
  me.input.bindKey(me.input.KEY.X,     "jump", true);
 
  // display the menu title
  me.state.change(me.state.MENU);
    }
};
