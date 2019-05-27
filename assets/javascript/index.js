

// set up materialize components
document.addEventListener('DOMContentLoaded', function (){

    var modals = document.querySelectorAll(".modal");
    M.Modal.init(modals);

    var items = document.querySelectorAll(".collapsible");
    M.Collapsible.init(items);
});

/* ---- FIREBASE STRUCTURE ---- 

AUTHENTICATION
-email
-password

PLAYERS
 -id, string (index, generated by firebase)
 -username, string
 -wins, int
 -gameNow, string (matches games id)
 -bio, string

GAMES
 -id
 -player1, string (matches userID)
 -player2, string (matches userID)
 -p1Choice, string
 -p2Choice, string
 -status, string [waiting, playing, complete]
 -winner, string (matches userID)
*/

// on page load, check to see if the user is logged in, if not, show signup/login modal

// if user is signed in,
// hide signup/login modal
// if the user has a gameNow, show gameNow
// if the user does not have a current game, show start new game option

/* ---- START NEW GAME ---- */
// see if there is a game document with a "waiting" status in the games collections
// if so, add player to that game as player2
// change status to "playing"
// set player's current game to new game id
// show game interface

// if there is no "waiting" game to join
// create new document in games collecion
// set player1 to current player
// set player's current game to game id
// show waiting for another player

/* ---- MAKE CHOICE ---- */
// allow user to select rock/paper/scissors div
// set currrent player's choice in game document
// check to see if both players have chosen, if so, determine winner