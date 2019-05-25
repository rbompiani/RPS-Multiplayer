// sign up

const signupForm = $("#signup-form");
signupForm.submit(function(e){
    e.preventDefault();

    // get user info
    const email = $("#signup-email").val();
    const password = $("#signup-password").val();

    // sign up the user
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        console.log(cred.user);

        const modal = $("#modal-signup");
        M.Modal.getInstance(modal).close();
        signupForm.trigger("reset");
    });
});