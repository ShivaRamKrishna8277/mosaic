import { db, get, set, ref, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "../firebase.js";

// toggle password visibility
$(document).ready(() => {
    // Function to toggle password visibility
    function togglePasswordVisibility(inputId, toggleId) {
        const input = $(inputId);
        const toggle = $(toggleId);
        toggle.on('click', () => {
            const type = input.attr('type') === 'password' ? 'text' : 'password';
            input.attr('type', type);

            // Toggle the opacity class
            if (type === 'text') {
                toggle.css('opacity', '1');
            } else {
                toggle.css('opacity', '0.2');
            }
        });
    }

    // Apply the function to both forms
    togglePasswordVisibility('#signupPassword', '#toggleSignupPassword');
    togglePasswordVisibility('#loginPassword', '#toggleLoginPassword');
});
// Function to map Firebase error codes to custom error messages
function mapErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Invalid Email Address.';
        case 'auth/email-already-in-use':
            return 'Email Address Already in Use';
        case 'auth/invalid-credential':
            return 'Invalid Credentials or User Not Found';
        case 'auth/weak-password':
            return 'Input a Strong Password.';
        default:
            return 'An error occurred. Please try again later.';
    }
}
// Function to display error message as a modal
function showMsgModal(errorMessage, msgColor) {
    // Create the modal element dynamically
    const modal = `
        <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-body text-center" style="color:${msgColor}">
                        ${errorMessage}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Append the modal HTML to the body
    $('body').append(modal);

    // Show the modal
    $('#errorModal').modal('show');

    // Close the modal after 3 seconds (adjust duration as needed)
    setTimeout(() => {
        $('#errorModal').modal('hide');
        location.reload();
    }, 2000);
}
$(document).ready(() => {
    // Sign-up using email and password
    $('#signupBtn').click(evt => {
        evt.preventDefault();

        let signupEmail = $('#signupEmail').val();
        let signupPassword = $('#signupPassword').val();
        let confirmPassword = $('#confirmPassword').val();

        // Show the spinner and hide the text
        $("#signupBtn span").addClass("visually-hidden");
        $("#signupBtn").prop('disabled', true);
        $("#signupBtn .spinner-border").removeClass("visually-hidden");

        if (signupPassword === confirmPassword) {
            createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
                .then((userCredential) => {
                    showMsgModal("Successfully Created Account!", 'green');
                    const initialUsername = signupEmail.split('@')[0];
                    set(ref(db, 'users/' + userCredential.user.uid), {
                        id: userCredential.user.uid,
                        name: "",
                        email: userCredential.user.email,
                        mobile: "",
                        username: initialUsername,
                        district: "",
                        state: "",
                        pincode: "",
                        profilePhoto: "",
                        linkedIn: "",
                        gitHub: "",
                        instagram: "",
                        xp:"0",
                        completedChallenges: [
                            {"count": 0}
                        ],
                        pendingChallenges: [
                            {"count": 0}
                        ],
                        enrolledChallenges: [
                            {"count": 0}
                        ]
                    });
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1000);
                })
                .catch((error) => {
                    let errorCode = error.code;
                    let errorMessage = mapErrorMessage(errorCode);
                    showMsgModal(errorMessage, 'red');
                    console.log(errorCode);
                })
        } else {
            showMsgModal("Passwords do not match", 'red');
        }
    });
    
    // Login using email and password
    $('#loginBtn').click(evt => {
        evt.preventDefault();
        localStorage.removeItem('user');

        let loginEmail = $('#loginEmail').val();
        let loginPassword = $('#loginPassword').val();

        // Show the spinner and hide the text
        $("#loginBtn span").addClass("visually-hidden");
        $("#loginBtn").prop('disabled', true);
        $("#loginBtn .spinner-border").removeClass("visually-hidden");

        signInWithEmailAndPassword(auth, loginEmail, loginPassword)
        .then((userCredential) => {
            const user = userCredential.user;
            const userId = user.uid;

            // Retrieve user data from the database
            get(ref(db, 'users/' + userId))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        // Store user data in localStorage
                        localStorage.setItem('user', JSON.stringify(userData));
                        showMsgModal("Login Successful", 'green');
                        window.location.href = 'dashboard/dashboard.html';
                    } else {
                        showMsgModal("User data not found", 'red');
                    }
                })
                .catch((error) => {
                    console.error(error);
                    showMsgModal("Error fetching user data", 'red');
                });
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = mapErrorMessage(errorCode);
            showMsgModal(errorMessage, 'red');
        });
    });

    // Password Reset Link
    $("#passwordReset").click((event) => {
        event.preventDefault();
        const currentModal = bootstrap.Modal.getInstance(document.getElementById('resetPassword'));
        currentModal.hide();

        const resetForm = $("#passwordResetForm");
        const email = $("#resetEmail").val();
        sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("Password Reset Link has been sent");
            resetForm.hide();
        })
        .catch((error) => {
            console.log(error.code);
            console.log(error.message);
        })
    });
});
