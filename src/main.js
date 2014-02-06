/*!
 *        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *                    Version 2, December 2004
 *
 * Copyright (C) 2014 Richard & Markus
 *
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 *            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 *
 *  0. You just DO WHAT THE FUCK YOU WANT TO.
 */

/* jshint browser:true, eqnull:true  */

/**
 * Small fun project for our “Client-Side Web Engineering” lecture at the FH Salzburg.
 *
 * @author Richard Fussenegger <rfussenegger.mmt-m2012@fh-salzburg.ac.at>
 * @author Markus Deutschl <mdeutschl.mmt-m2012@fh-salzburg.ac.at>
 * @license WTFPL-2.0
 * @copyright (c) 2014 Richard & Markus
 * @version 20140205
 */

/**
 * Auto-start ConnectFour app.
 *
 * @param {document} document Browser's global document object.
 * @return {ConnectFour}
 */
;(function (document) {
  "use strict";

  /**
   * Instantiate new ConnectFour app.
   *
   * @class ConnectFour
   * @constructor
   * @return {ConnectFour}
   */
  function ConnectFour() {

    /**
     * Whether the playboard is currently blocked `true` or not `false`.
     *
     * @property blocked
     * @type Boolean
     * @default false
     */
    this.blocked = false;

    /**
     * The global configuration.
     *
     * @property conf
     * @type Object
     */
    this.conf = JSON.parse(document.getElementById("config").innerHTML);

    /**
     * The current player, either `0` or `1`.
     *
     * @property currentPlayer
     * @type Number
     * @default 0
     */
    this.currentPlayer = 0;

    /**
     * HTML image element representing the current disc to insert.
     *
     * @property disc
     * @type HTMLElement
     * @default null
     */
    this.disc = null;

    /**
     * The fields of the playboard.
     *
     * Multi-dimensional array, outer array contains the columns and each column contains an array representing the rows.
     *
     * @property fields
     * @type Array
     * @default new Array()
     */
    this.fields = [];

    /**
     * Whether we're dealing with a broken client or not.
     *
     * @property ie9
     * @type Boolean
     * @readOnly
     */
    this.ie9 = document.documentElement.classList.contains("ie9");

    /**
     * The playboard div.
     *
     * @property playboard
     * @type HTMLElement
     * @readOnly
     */
    this.playboard = document.getElementById("playboard");

    /**
     * The popover div.
     *
     * @property popover
     * @type HTMLElement
     * @readOnly
     */
    this.popover = document.getElementById("popover");

    /**
     * The popover message div.
     *
     * @property popoverMessage
     * @type HTMLElement
     * @readOnly
     */
    this.popoverMessage = this.popover.children[0].children[0];

    /**
     * The popover image div.
     *
     * @property popoverImage
     * @type HTMLElement
     * @readOnly
     */
    this.popoverImage = this.popoverMessage.children[0];

    /**
     * Button to restart the current game.
     *
     * @property restart
     * @type HTMLElement
     * @readOnly
     */
    this.restart = document.getElementById("restart");

    /**
     * Object containing game session statistics.
     *
     * @property stats
     * @type Object
     */
    this.stats = { games: 0, wins0: 0, wins1: 0, draws: 0 };

    /**
     * Object containing the various statistics in the DOM.
     *
     * @property statsTable
     * @type Object
     */
    this.statsTable = {
      games         : document.getElementById("stats-games"),
      wins0         : document.getElementById("stats-wins0"),
      wins1         : document.getElementById("stats-wins1"),
      draws         : document.getElementById("stats-draws"),
      currentPlayer : document.getElementById("stats-current-player")
    };

    this.init();
  }

  ConnectFour.prototype = {

    /**
     * Check if player has won in the given direction.
     *
     * @method checkDirection
     * @param {Number} c The column direction, `1` move up, `0` don't move, and `-1` move down.
     * @param {Number} r The row direction, `1` move up, `0` don't move, and `-1` move down.
     * @return {Boolean} `true` if won in direction, `false` otherwise.
     */
    checkDirection: function (c, r) {
      var result = 1;
      var ct     = c * this.conf.victory;
      var rt     = r * this.conf.victory;

      result += this.checkDirectionLoop(!c || (this.disc.column + ct),  c, !r || (this.disc.row + rt),  r);
      result += this.checkDirectionLoop(!c || (this.disc.column - ct), -c, !r || (this.disc.row - rt), -r);

      return (result >= this.conf.victory);
    },

    /**
     * Count consecutive discs of current player in the given direction.
     *
     * @method checkDirectionLoop
     * @param {Number} cx The column direction.
     * @param {Number} ci The column increment.
     * @param {Number} rx The row direction.
     * @param {Number} ri The row increment.
     * @return {Number} The number of consecutive discs.
     */
    checkDirectionLoop: function (cx, ci, rx, ri) {
      for (
        var c = this.disc.column + ci, r = this.disc.row + ri, y = 0;
        c !== cx && r !== rx && this.fields[c] && this.fields[c][r] === this.currentPlayer;
        c += ci, r += ri, ++y
      );
      return y;
    },

    /**
     * Check if the user has won, if there's a draw, or proceed normally.
     *
     * @chainable
     * @method isVictory
     * @return {ConnectFour}
     */
    isVictory: function () {
      if (this.ie9 === false) {
        this.disc.removeEventListener("transitionend", this.isVictory);
      }

      // Check if the player has won with the newly inserted disc.
      if (this.checkDirection(1,  0) || this.checkDirection(1, -1) || this.checkDirection(0,  1) || this.checkDirection(1,  1)) {
        ++this.stats["wins" + this.currentPlayer];
        this.rematch("wins" + this.currentPlayer);
      }
      else {
        // Go through the highest row and increment counter if column contains a disc.
        for (var draw = 1; draw <= this.conf.playboardDiscs && this.fields[draw][this.conf.playboardDiscs] != null; ++draw);

        // Check if the above loop resulted in a draw situation.
        if (draw > this.conf.playboardDiscs) {
          ++this.stats.draw;
          this.rematch("draw");
        }
        // Proceed normally with the game; flip player and unblock playboard.
        else {
          this.currentPlayer = --this.currentPlayer * -1;
          this.blocked             = false;
        }
      }

      return this;
    },

    /**
     * Initialize the ConnectFour instance.
     *
     * @chainable
     * @method init
     * @return {ConnectFour}
     */
    init: function () {
      this.isVictory                   = this.isVictory.bind(this);
      this.rematchHide                 = this.rematchHide.bind(this);
      this.rematchKeypress             = this.rematchKeypress.bind(this);
      this.conf.playboardBorderWidth2x = this.conf.playboardBorderWidth * 2;
      this.conf.discBox                = this.conf.discDimension + this.conf.playboardBorderWidth2x;

      document.addEventListener("keypress", this.keypress.bind(this), false);
      document.getElementById("stats").addEventListener("click", this.statsShow.bind(this), false);
      this.playboard.addEventListener("click", this.insertDisc.bind(this), false);
      this.popover.addEventListener("click", this.popoverHide.bind(this), false);

      if (this.ie9 === false) {
        this.popover.addEventListener("transitionend", this.popoverUnblock.bind(this), false);
      }

      var self = this;
      document.getElementById("confirm").addEventListener("change", function () {
        self.conf.confirm = this.checked;
      }, false);
      this.restart.addEventListener("click", function () {
        self.popoverHide();
        self.removeDiscs();
      }, false);

      return this.start();
    },

    /**
     * Insert disc at clicked playboard position.
     *
     * @chainable
     * @method insertDisc
     * @param {Number|Event} event Either a column offset directly or a click event.
     * @return {ConnectFour}
     */
    insertDisc: function (event) {
      // Guardian Pattern: only continue with insertion if we are allowed to.
      if (this.blocked !== false) {
        return this;
      }

      // Block the playboard and create image element for the new disc.
      this.blocked = true;
      this.disc    = document.createElement("img");

      // Use given number if passed.
      if (typeof event === "number") {
        if (event <= 0 && event > this.conf.playboardDiscs) {
          return this;
        }
        this.disc.column = event;
      }
      // Assume we have a click event.
      else {
        if (!event || !event.layerX) {
          return this;
        }
        this.disc.column = Math.floor(event.layerX / ((this.playboard.getBoundingClientRect().width - this.conf.playboardBorderWidth * 2) / this.conf.playboardDiscs)) + 1;
      }

      // Most annoying option ever ... :P
      if (this.conf.confirm === true && confirm("Insert disc in column " + this.disc.column + "?") === false) {
        this.blocked = false;
        return this;
      }

      // We're sorry but this column is full, try another one.
      if (this.fields[this.disc.column][this.conf.playboardDiscs] != null) {
        this.popoverShow("full");
        return this;
      }

      // Search for the first empty row in the column.
      for (this.disc.row = 1; this.disc.row <= this.conf.playboardDiscs; ++this.disc.row) {
        if (this.fields[this.disc.column][this.disc.row] == null) {
          this.fields[this.disc.column][this.disc.row] = this.currentPlayer;
          break;
        }
      }

      // Put the disc together for the current player and insert it into the playboard.
      this.disc.setAttribute("class", "column-" + this.disc.column + " disc");
      this.disc.src = this.conf.player[this.currentPlayer];
      this.playboard.appendChild(this.disc);

      // We love you IE9 :)
      if (this.ie9 === true) {
        this.disc.classList.add("row-" + this.disc.row);
        this.isVictory();
      }
      // All other browsers that understand CSS transitions and are awesome.
      else {
        var self = this; // setTimeout always applies global this scope.
        setTimeout(function () {
          self.disc.addEventListener("transitionend", self.isVictory, false);
          self.disc.classList.add("row-" + self.disc.row);
        }, 200);
      }

      return this;
    },

    /**
     * React on certain keypress events.
     *
     * @chainable
     * @method keypress
     * @param {Event} event The fired keypress event.
     * @return {ConnectFour}
     */
    keypress: function (event) {
      // Only allow these actions if the playboard isn't blocked right now.
      if (this.blocked !== true) {
        if (event.which) {
          // Insert disc if number in range of 1 and max is pressed.
          var nr = event.which - 48;
          if (nr > 0 && nr <= this.conf.playboardDiscs) {
            this.insertDisc(nr);
          }
          // Show status dialog on key [s].
          else if (event.which === 115) {
            this.statsShow();
          }
        }
      }
      // Escape (or other keys with zero) and Enter hide our popover.
      else if (event.which === 0 || event.which === 13) {
        this.popoverHide();
      }

      return this;
    },

    /**
     * Hide any possibly visible popover message.
     *
     * @chainable
     * @method popoverHide
     * @param {Event} [event] The fired event, if any.
     * @return {ConnectFour}
     */
    popoverHide: function (event) {
      if (!(this.popoverMessage.classList.contains("stats") && event) || !(this.popoverMessage === event.target || this.popoverMessage.contains(event.target))) {
        this.popover.classList.remove("show");
        if (this.ie9 === true) {
          this.popoverUnblock();
        }
      }
      return this;
    },

    /**
     * Show popover message to players.
     *
     * @chainable
     * @method popoverShow
     * @param {String} imgKey The key of the image to display within our configuration object.
     * @return {ConnectFour}
     */
    popoverShow: function (imgKey) {
      this.blocked                = true;
      this.popoverImage.innerHTML = "<img src='" + this.conf.img[imgKey] + "'>";
      this.popover.classList.add("show");
      return this;
    },

    /**
     * Unblock playboard after popover is hidden.
     *
     * @chainable
     * @method popoverUnblock
     * @return {ConnectFour}
     */
    popoverUnblock: function () {
      if (this.blocked !== null && this.popover.classList.contains("show") === false) {
        this.popoverMessage.classList.remove("stats");
        this.blocked = false;
      }
      return this;
    },

    /**
     * Let the players know about the result of this game and ask for a rematch.
     *
     * The "rematch?" is a total gotcha question, close the tab if you want to quit. ;)
     *
     * @chainable
     * @method rematch
     * @param {String} imgKey The key of the image to display within our configuration object.
     * @return {ConnectFour}
     */
    rematch: function (imgKey) {
      // Increase the games counter and determine who's going to start in the next round.
      this.currentPlayer = ++this.stats.games % 2;

      // Display wins or draw message and ask for a rematch. There is no cancel possibility because our game is infinite.
      this.popoverImage.innerHTML = "<img src='" + this.conf.img[imgKey] + "'><br><img src='" + this.conf.img.rematch + "'>";

      // Show the popover, leave hide and unblock as is but ensure that the playboard is emptied upon click.
      this.blocked = null;
      document.addEventListener("keypress", this.rematchKeypress, false);
      this.popover.addEventListener("click", this.rematchHide, false);
      this.popover.classList.add("show");

      return this;
    },

    /**
     * Hide all discs within the playboard and start new game after transition finished.
     *
     * @chainable
     * @method rematchHide
     * @return {ConnectFour}
     */
    rematchHide: function () {
      document.removeEventListener("keypress", this.rematchKeypress);
      this.popover.removeEventListener("click", this.rematchHide);
      this.removeDiscs();
      return this;
    },

    /**
     * Helper method to allow keypress events on popover message after rematch.
     *
     * @chainable
     * @method rematchKeypress
     * @param {Event} event The fired keypress event.
     * @return {ConnectFour}
     */
    rematchKeypress: function (event) {
      if (event.which === 0 || event.which === 13) {
        this.rematchHide();
      }
      return this;
    },

    /**
     * Remove all discs within the playboard.
     *
     * @chainable
     * @method removeDiscs
     * @return {ConnectFour}
     */
    removeDiscs: function () {
      if (this.ie9 === true) {
        this.playboard.innerHTML = "";
        this.start();
      }
      else {
        var self     = this;
        var elements = document.getElementsByClassName("disc");
        var counter  = elements.length;
        var remove   = function () {
          self.playboard.removeChild(this);
          if (counter === 0) {
            self.start();
          }
        };

        for (var i = 0; i < elements.length; ++i, --counter) {
          elements[i].addEventListener("transitionend", remove, false);
          elements[i].style.top = -this.conf.discBox + "px";
        }
      }
      return this;
    },

    /**
     * Start a new round.
     *
     * This function will empty the playboard's fields and display a popover that informs the players who's suposed to
     * start this new round. The game starts after one of the players clicks on the popover.
     *
     * @chainable
     * @method start
     * @return {ConnectFour}
     */
    start: function () {
      // Initialize the playboard's fields and ensure that it's empty.
      for (var i = 1; i <= this.conf.playboardDiscs; ++i) {
        this.fields[i] = [];
      }

      // Tell the players who is suposed to start this round.
      return this.popoverShow("start" + this.currentPlayer);
    },

    /**
     * Show game statistics to the players.
     *
     * @chainable
     * @method statsShow
     * @return {ConnectFour}
     */
    statsShow: function () {
      this.blocked = true;

      // Update the statistics table with the latest stats. Tell JSHint to ignore this loop, we don't need to check if
      // any of our offsets exist in our statsTable object.
      /* jshint ignore:start */
      for (var stat in this.stats) {
        this.statsTable[stat].innerHTML = this.stats[stat];
      }
      /* jshint ignore:end */
      this.statsTable.currentPlayer.innerHTML = this.currentPlayer + 1;

      if (document.getElementsByClassName("disc").length > 0) {
        this.restart.removeAttribute("disabled");
      }
      else {
        this.restart.setAttribute("disabled", "disabled");
      }

      // Add stats class for CSS styling and start transition.
      this.popoverMessage.classList.add("stats");
      this.popover.classList.add("show");

      return this;
    }

  };

  // Instantiate the app.
  return new ConnectFour();

})(window.document);
