/* ---- Global Variables --- */
var curGame;
var curUser;
var username;
var userID;
var gameID;
var playerNo;
var yourChoice;
var oppID;
var oppName;
var oppChoice;
var wins;

// listen for auth status changes
auth.onAuthStateChanged(user =>{
    if (user){
        console.log("user logged in: ", user);
        userID = user.uid;
        console.log("User id is ", userID);

        // set name and game variables, setup game div
        db.collection("users").doc(user.uid).get().then(doc =>{
            username = doc.data().username;
            gameID = doc.data().gameNow;
            wins = doc.data().wins;

            curUser = db.collection("users").doc(userID);
            if (gameID){
                curGame = db.collection("games").doc(gameID);
                getGameData();
            } else {
                newGame();    
            }
            
        });

        //store player document as varable
        curUser = db.collection("users").doc(userID);

    } else {
        // reset name and game variables
        curGame = null;
        curUser = null;
        username = null;
        userID = null;
        gameID = null;
        playerNo = null;
        yourChoice = null;
        oppID = null;
        oppName = null;
        oppChoice = null;
        wins = null;

        // open signup/login
        const modal = $("#modal-login");
        M.Modal.getInstance(modal).open();

    }
});

/* ---- SIGN UP --- */
const signupForm = $("#signup-form");

signupForm.submit(function(e){

    e.preventDefault();

    // get user info
    const email = $("#signup-email").val();
    const password = $("#signup-password").val();

    // sign up the user
    auth.createUserWithEmailAndPassword(email, password).then(cred => {

        // create new document in users collection with same id as authenticated user
        return db.collection('users').doc(cred.user.uid).set({
            username: $("#signup-username").val(),
            wins: 0,
            gameNow: null
        });
    
    // hide the modal when done
    }).then(function() {
         const modal = $("#modal-signup");
        M.Modal.getInstance(modal).close();
        signupForm.trigger("reset");
    });

});

/* ---- LOG OUT --- */
const logout = $("#logout");

logout.on("click", function(e) {
    location.reload();
    auth.signOut();

});

/* --- LOG IN --- */
const loginForm = $("#login-form");

loginForm.submit(function(e){
    e.preventDefault();
    
    // get user info
    const email = $("#login-email").val();
    const password = $("#login-password").val();

    // log user in
    auth.signInWithEmailAndPassword(email, password).then(cred => {

        // close modal and reset form
        const modal = $("#modal-login");
        M.Modal.getInstance(modal).close();
        loginForm.trigger("reset");

    });
})

/* --- PROMPT TO START NEW GAME --- */
function askGame (){
    console.log("askGame ran");
    var newInst = $("<h5>");
    newInst.text("Would you like to start a new match?");
    $("#instructions").html(newInst);
    var newBut = $("<button>");
    newBut.text("Find Me a Match!");
    newBut.on("click", function(){
        newGame();
    })
    $("#instructions").append(newBut);
}

/* --- FIND/CREATE NEW GAME --- */
function newGame(){
    console.log("finding a new match...");
    db.collection("games").get().then(snapshot =>{
        var docs = snapshot.docs;

        // loop through documents to look for "waiting" games
        docs.forEach(doc => {
            //if waiting, store game id
            if(doc.data().status === "waiting"){
                gameID = doc.id;
            } 
        })

        // if a game id was set above, set player and game info
        if (gameID){
            console.log("match found! updating existing game", gameID);

            // update game info
            curGame = db.collection("games").doc(gameID);
            curGame.update({
                player2 : userID,
                status : "playing"
            });

            // update current user info
            curUser.update({
                gameNow: gameID
            });

            getGameData();

        
        // if game id isn't set, create a new game
        } else {
            console.log("no matches found! starting a new game");
            var newGame = db.collection('games').add({
                player1 : userID,
                status : "waiting"
            }).then(doc =>{
                curGame=doc;
                gameID = doc.id;
                db.collection("users").doc(userID).update({
                    gameNow : gameID
                })

                getGameData();
            })
        }
    });
}

/* --- GET GAME DATA --- */
function getGameData(){
    db.collection("games").doc(gameID).get().then(doc => {
        winner = doc.data().winner;
        
        if( doc.data().player1 === userID){
            playerNo = "player1";
            yourChoice = doc.data().p1Choice;
            oppID = doc.data().player2;
            oppChoice = doc.data().p2Choice;
        } else {
            playerNo = "player2";
            yourChoice = doc.data().p2Choice;
            oppID = doc.data().player1;
            oppChoice = doc.data().p1Choice;
        }

        if(oppID){
           getOpponent(); 
        }
        
        renderGame();

    });
}

/* --- Get Opponent Data--- */
function getOpponent(){
    db.collection("users").doc(oppID).get().then(doc => {
        oppName = doc.data().username;
        $("#opponentName").text(oppName);
    });   
}



/* --- SET UP GAME UI --- */
function renderGame (){

    //setup new instructions
    var newInst = $("<h5>");
    newInst.text("Welcome back, "+username+"! Here's your game:");
    $("#instructions").html(newInst);
    
    $("#game").show();

    $("#yourName").text(username);


    if(oppChoice){
        $("#opponentChoice").css("opacity", "1");
    }   
    // if you haven't chosen, set instructions to say choose
    if (yourChoice){
        $("#yourChoice").css("background-image", "url('assets/images/"+yourChoice+".png')");
        $("#yourChoice").css("opacity", "1");
    
    // if you haven't chosen, show buttons 
    } else {
        renderButtons();
    }

    updateStatus();
}

/* --- Update Status --- */
function updateStatus(){

    var newStatus = $("<h5>");
    
    if(!yourChoice){
        newStatus.text("Please Make your Choice!");
    } else if (!oppID){
        newStatus.text("Waiting to pair you with an opponent...");
    } else if (!oppChoice){
        newStatus.text("Waiting on your opponent...");
    } else {
        newStatus.text("Everyone has chosen! Ready to see the results?");
        var newBut = $("<button>");
        newBut.text("Show Me!");
        newBut.click(shoot);
        newStatus.append(newBut);
    }

    $("#status").html(newStatus);
}

/* --- RENDER BUTTONS --- */
function renderButtons(){
    var buttnHolder = $("#you").find(".options");
    var choices = ["rock","paper","scissors"];
    choices.forEach(function(element){
        var newBut = $("<button>");
        newBut.attr("id", element);
        newBut.text(element);
        newBut.addClass("col s4");
        newBut.hover(function(){
            $("#yourChoice").css("background-image", "url('assets/images/"+this.id+".png')");
        });
        newBut.mouseleave(function(){
            $("#yourChoice").css("background-image", "url('assets/images/question.png')");
        })
        newBut.click(function(){
            $("#yourChoice").css("opacity", "1");
            buttnHolder.empty();
            yourChoice = this.id;
            if(playerNo === "player1"){
                curGame.update({
                    p1Choice : this.id
                })  
            }else{
                curGame.update({
                    p2Choice : this.id
                })    
            }
            updateStatus();
        })
        buttnHolder.append(newBut);
    });
}

/* --- RPS SHOOT! ANIM --- */
function shoot(){
    for(i=0; i<3; i++){
        $(".choice").animate({top: '50px'}, "fast");
        $(".choice").animate({top: '0px'}, "fast");
    }
    $(".choice").queue(function() {
        $("#opponentChoice").css("background-image", "url('assets/images/"+oppChoice+".png')");  
        whoWins();  
        $(this).dequeue();
    }) 
}; 

/* --- DETERMINE WINNER --- */
function whoWins(){
    var newStatus = $("<h5>");
    if(yourChoice==="rock" && oppChoice==="scissors" || yourChoice==="paper"&& oppChoice==="rock" || yourChoice==="scissors"&& oppChoice==="paper"){
        newStatus.text("you Win!");
        wins++;
        db.collection("games").doc(gameID).update({
            status : "ended",
            winner : userID,
        })
        db.collection("users").doc(userID).update({
            wins : wins
        }) 
    } else if ( yourChoice === oppChoice){
        newStatus.text("you tie!");
        db.collection("games").doc(gameID).update({
            status : "ended",
            winner : "tie",
        })        
    } else {
        newStatus.text("you Lose!");
        db.collection("games").doc(gameID).update({
            status : "ended",
            winner : oppID,
        })
    }

    var newBut = $("<button>");
    newBut.text("Find new Match!");
    newBut.click(endGame);
    newStatus.append(newBut);

    $("#status").html(newStatus);
}

/* --- END GAME & START NEW --- */
function endGame(){

    // reset variables
    curGame = null;
    gameID = null;
    playerNo = null;
    yourChoice = null;
    oppID = null;
    oppName = null;
    oppChoice = null; 

    //reset divs
    $("#opponentChoice").css("background-image", "url('assets/images/question.png')");
    $("#opponentChoice").css("opacity", ".5");
    $("#opponentName").text("");
    $("#yourChoice").css("background-image", "url('assets/images/question.png')");
    $("#yourChoice").css("opacity", ".5");

    // reset gameNow in database
    db.collection("users").doc(userID).update({
        gameNow : null,
    }).then(doc =>{

        // find new game
        newGame(); 
    })
}



