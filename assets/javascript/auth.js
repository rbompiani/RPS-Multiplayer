// listen for auth status changes
auth.onAuthStateChanged(user =>{
    if (user){
        console.log("user logged in: ", user);
    } else {
        console.log("user logged out");
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

        const modal = $("#modal-signup");
        M.Modal.getInstance(modal).close();
        signupForm.trigger("reset");

    });
});

/* ---- LOG OUT --- */
const logout = $("#logout");

logout.on("click", function(e) {

    e.preventDefault();
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