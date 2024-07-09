import { readChallengesData } from "./challenges.js";
import { readEnrolledData } from "./enrolled.js";
import { readSubmissionsData } from "./submissions.js";
import { readPendingData } from "./pending.js";
import { readUserData } from "./settings.js";
import { auth, signOut, updateUserdata  } from "../../firebase.js";

$(document).ready(function(){
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        $('.menuLoginBtn_wrapper').hide();
        $('.profile_img').show();
        $('.logout_item').show();
        $('#userName').text(user.username || 'Anonymous');
        $('#userEmail').text(user.email);
        // Check if profile photo is available
        if (user.profilePhoto && user.profilePhoto != "") {
            $('.profile_img').attr('src', user.profilePhoto);
        } else {
            // If profile photo is not available or empty, set a default profile photo
            $('.profile_img').attr('src', '../../assets/images/default_profile_img.png');
        }
    } else {
        $('#userName').text('Username');
        $('#userEmail').text('Email Address');
        $('.username_wrapper').hide();
        $('.menuLoginBtn_wrapper').show();
        $('.profile_img').hide();
        $('.logout_item').hide();
    }

    $('.logout_item_modal').click(() => {
        localStorage.removeItem('user');
        // Sign out the user from the authentication provider
        signOut(auth)
            .then(() => {
                // Redirect to the login page or any other page after logout
                window.location.href = '../login.html';
            })
            .catch((error) => {
                console.error("Logout error:", error); // Log logout error
        });
    });
    $('.menu_item').click(function(e){
        e.preventDefault();

        var file = $(this).data('file');
        $('.menu_item').removeClass("active_menu");
        $(this).addClass("active_menu");

        // Set all icons to their dark color path
        $('.menu_icon').each(function(){
            var dark_src = '../../assets/icons/'+$(this).data('icon')+'_dark.svg';
            $(this).attr('src', dark_src);
        });

        $('.nav_category .category_img').attr('src', ' ');
        $('.nav_category .nav_category_title').text(' ');
        // Set the clicked icon to its non-dark color path
        var clickedIcon = $(this).find('.menu_icon');
        var light_src = '../../assets/icons/'+clickedIcon.data('icon')+'.svg';
        clickedIcon.attr('src', light_src);

        $('#pta_content').load(file, function(status){
            if(status == "error"){
                $('#pta_content').html("<p>Sorry, an error occurred: </p>");
            } else {
                // Call readData only if the challenges file is loaded
                if (file === './challenges.html') {
                    readChallengesData();
                }else if(file === './enrolled.html'){
                    readEnrolledData();
                }else if(file === './submissions.html'){
                    readSubmissionsData();
                }else if(file === './pending.html'){
                    readPendingData();
                }else if(file === './settings.html'){
                    readUserData();
                }
            }
        });
    });

    if(user){
        updateUserdata(user.id);
    }
    // Trigger the click on the first menu item to load its content on page load
    if(window.innerWidth > 1112){
        $('.menu_item').eq(6).click();
    }else{
        $('.menu_item').eq(3).click();
    }
});

// Function to show the result modal with animation
function showResultModal(status, message, modalID, menu_index) {
    const currentModal = bootstrap.Modal.getInstance(document.getElementById(modalID));
    currentModal.hide();

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
            $('.menu_item').eq(menu_index).click();
        }, 2000)
}

export {showResultModal}
