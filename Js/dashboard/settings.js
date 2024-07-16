import { updateUserdata, update, ref, db } from "../../firebase.js";
var user = JSON.parse(localStorage.getItem('user'));

// Function to check if any field is empty
async function hasEmptyFields(user) {
    return !user.name || !user.email || !user.mobile || !user.username ||
           !user.district || !user.state || !user.pincode || 
           !user.linkedIn || !user.gitHub || !user.instagram;
}
// display edit buttons
async function display_edit_btns(){
    await updateUserdata(user.id);
    const updatedUser = JSON.parse(localStorage.getItem('user'));

    // Check for empty fields and show the appropriate button
    if (await hasEmptyFields(updatedUser)) {
        document.getElementById('update_button').style.display = "flex";
        document.querySelector('.warning_msg_container').style.display = "block";
        document.getElementById('edit_btn').style.display = "none";
        document.getElementById('save_changes_button').style.display = "none";
        let updateBtnEventListener = false;
        if(!updateBtnEventListener){
            document.getElementById('update_button').addEventListener("click", () => {
                allow_form_input("update_button");
                updateBtnEventListener;
            });
        }
    } else {
        document.getElementById('update_button').style.display = "none";
        document.getElementById('edit_btn').style.display = "flex";
        document.getElementById('save_changes_button').style.display = "none";
        let editBtnEventListener = false;
        if(!editBtnEventListener){
            document.getElementById('edit_btn').addEventListener("click", () => {
                allow_form_input("edit_btn");
                editBtnEventListener;
            });
        }
    }
}
// Function to read user data from localStorage and populate the form
async function readUserData() {
    if (user) {
        await updateUserdata(user.id);
        const updatedUser = JSON.parse(localStorage.getItem('user'));
        let next_badge;
        let current_badge;
        let next_badge_goal_points;
        let progress_width;
        if(updatedUser.xp >= 0){
            if(updatedUser.xp>=0 && updatedUser.xp<499){
                current_badge = 'bronze';
                next_badge = 'silver';
                next_badge_goal_points = 500;
            }else if(updatedUser.xp >= 499 && updatedUser.xp <= 1999){
                current_badge = 'silver';
                next_badge = 'gold';
                next_badge_goal_points = 2000;
            }else if(updatedUser.xp > 1999 && updatedUser.xp <= 4999){
                current_badge = 'gold';
                next_badge = 'expert';
                next_badge_goal_points = 5000;
            }else if(updatedUser.xp > 4999){
                current_badge = 'expert';
                next_badge = 'expert';
                next_badge_goal_points = 5000;
            }else{
                next_badge = 'silver';
                current_badge = 'bronze';
            }
            progress_width = (updatedUser.xp/next_badge_goal_points)*100;
        }

        // Populate personal info fields using vanilla JavaScript
        if(updatedUser.xp >= 0){
            $('#badge_img').attr('src', `../../assets/icons/${current_badge}_medal.svg`);
            $('#profile_badge').attr('src', `../../assets/icons/${current_badge}_medal.svg`);
            document.getElementById('badge_title').textContent = current_badge;
            document.getElementById('current_xp').textContent = `${updatedUser.xp} xp`;
            document.getElementById('goal_xp').textContent = `${next_badge_goal_points} xp`;
            document.getElementById('goal_points').textContent = next_badge_goal_points - updatedUser.xp;
            document.getElementById('next_badge').textContent = next_badge;
            const element = document.getElementById('badge_progress_inner');
            element.style.setProperty('--progress-width', `${progress_width}%`);
            element.classList.add('important-width');
            if(updatedUser.xp>4999){
                document.querySelector('.badge_next_goal_points').style.display = 'none';
                document.querySelector('.expert_message').style.display = 'block';
            }else{
                document.querySelector('.badge_next_goal_points').style.display = 'block';
                document.querySelector('.expert_message').style.display = 'none';
            }
        }
        if (updatedUser.name) {
            document.getElementById('fullname').value = updatedUser.name;
        }
        if (updatedUser.email) {
            document.getElementById('emial_address').value = updatedUser.email;
        }
        if (updatedUser.mobile) {
            document.getElementById('mobile_number').value = updatedUser.mobile;
        }
        if (updatedUser.username) {
            document.getElementById('username').value = updatedUser.username;
        }
        if (updatedUser.district) {
            document.getElementById('district').value = updatedUser.district;
        }
        if (updatedUser.state) {
            document.getElementById('State').value = updatedUser.state;
        }
        if (updatedUser.pincode) {
            document.getElementById('pincode').value = updatedUser.pincode;
        }
        if (updatedUser.linkedIn) {
            document.getElementById('linkedin').value = updatedUser.linkedIn;
            $("#linkedin_redirect").attr('href', updatedUser.linkedIn);
        }
        if (updatedUser.gitHub) {
            document.getElementById('github').value = updatedUser.gitHub;
            $("#github_redirect").attr('href', updatedUser.gitHub);
        }
        if (updatedUser.instagram) {
            document.getElementById('instagram').value = updatedUser.instagram;
            $("#instagram_redirect").attr('href', updatedUser.instagram);
        }
        display_edit_btns();
        
    } else {
        document.getElementById("settings_content_wrapper").innerHTML = `<div class="w-100 d-flex justify-content-center"><button type="button" class="btn btn-danger my-5"><a href="../login.html" class="text-white">Please Login</a></button></div>`
    }
}
// Allow form input
function allow_form_input(button_id){
    document.querySelectorAll(".form-control").forEach((input_field) => {
        input_field.style.pointerEvents = "all";
        input_field.style.color = "black";
    });
    document.getElementById(button_id).style.display = "none";
    document.getElementById('save_changes_button').style.display = "block";
    let isSaveButtonListenerAdded = false;
    if(!isSaveButtonListenerAdded){
        document.getElementById('save_changes_button').addEventListener("click", () => {
            save_changes();
        });
    }
}
// Update submitted info
function save_changes(){
    const userId = user.id;
    const userDataBase = ref(db, `users/${userId}`);

    const fullName = document.getElementById('fullname').value;
    const email = document.getElementById('emial_address').value;
    const mobileNumber = document.getElementById('mobile_number').value;
    const username = document.getElementById('username').value;
    const district = document.getElementById('district').value;
    const state = document.getElementById('State').value;
    const pincode = document.getElementById('pincode').value;
    const linkedIn = document.getElementById('linkedin').value;
    const gitHub = document.getElementById('github').value;
    const instagram = document.getElementById('instagram').value;

    const newValues = {
        "name" : fullName,
        "email" : email,
        "mobile" : mobileNumber,
        "username" : username,
        "district" : district,
        "state" : state,
        "pincode" : pincode,
        "linkedIn" : linkedIn,
        "gitHub" : gitHub,
        "instagram" : instagram
    }

    update(userDataBase, newValues)
    .then(() => {
        show_result_modal("success", "Successfully updated the details", "green");
    })
    .catch(() => {
        show_result_modal("error", "Something went wrong, Please try again later!", "red");
    })
    .finally(() =>{
        display_edit_btns();
        document.querySelectorAll(".form-control").forEach((input_field) => {
            input_field.style.pointerEvents = "none";
            input_field.style.color = "rgba(0,0,0,0.5)";
        });
    })
}
//show result modal
function show_result_modal(status, message){
    const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
    const animationContainer = document.getElementById('animationContainer');
    const resultMessage = document.getElementById('resultMessage');

    // Clear any existing animation
    animationContainer.innerHTML = '';

    // Load the appropriate animation
    const animationFile = status === 'success' ? '../../assets/animations/success.json' : '../../assets/animations/error.json';

    fetch(animationFile)
        .then(response => response.json())
        .then(animationData => {
            lottie.loadAnimation({
                container: animationContainer,
                renderer: 'svg',
                loop: false,
                autoplay: true,
                animationData: animationData
            });

            // Set the result message
            resultMessage.textContent = message;

            // Show the modal
            resultModal.show();
        })
        .catch(error => {
            console.error('Error loading animation:', error);
            resultMessage.textContent = "An error occurred. Please try again.";
            resultModal.show();
        });
        setTimeout(() =>{
            resultModal.hide();
            if(window.innerWidth > 1112){
                $('.menu_item').eq(11).click();
            }else{
                $('.menu_item').eq(4).click();
            }
        }, 2000)
}

export { readUserData , show_result_modal, user};