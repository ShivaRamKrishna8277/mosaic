import {push, db, ref} from '../firebase.js';

// Function to display message as a modal
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
    $("#submit_btn").click(evt => {
        evt.preventDefault();
        $("#submit_btn").html(`<div class="spinner-border spinner-border-sm text-white" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>`)
        $('body').css('pointer-events', 'none');

        var Fullname = $('#Fullname').val();
        var Email = $('#Email').val();
        var Mobile = $('#Mobile').val();
        var Category = $('#querry_category').val();
        var Querry = $('#querry').val();

        // Reference to the database location where queries will be stored
        var queriesRef = ref(db, 'queries');

        if(Fullname!="" && Email!="" && Mobile!="" && Category!="" && Querry!=""){
            // Push a new query object to the database
            push(queriesRef, {
                Fullname: Fullname,
                Email: Email,
                Mobile: Mobile,
                Category: Category,
                Querry: Querry,
                status: "open"
                }).then(() => {
                    showMsgModal("Querry Submitted Successfully!", 'green');
                }).catch((error) => {
                    showMsgModal(error, 'red');
            });
        }else{
            showMsgModal("Pleasd Fill all the Empty Fields", 'red');
        }
    });
});
