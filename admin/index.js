import {db, get, ref, auth, signInWithEmailAndPassword} from '../firebase.js';


$(document).ready(() => {
    $("#admin_loginBtn").click(evt => {
        evt.preventDefault();
        // Show the spinner and hide the text
        $("#admin_loginBtn span").addClass("visually-hidden");
        $("#admin_loginBtn").prop('disabled', true);
        $("#admin_loginBtn .spinner-border").removeClass("visually-hidden");

        let admin_id = $("#adminID").val();
        let admin_name = $("#adminName").val();
        let admin_email = $("#adminEmail").val();
        let admin_password = $("#adminPassword").val();

        signInWithEmailAndPassword(auth, admin_email, admin_password)
        .then((adminCredential) => {
            const adminID = adminCredential.user.uid;
            get(ref(db, 'admins/' + adminID))
            .then((snapshot) => {
                if(snapshot.exists()){
                    const adminData = snapshot.val();
                    let data_admin_id = adminData.adminUID;
                    let data_admin_name = adminData.adminName;
                    console.log()
                    if(admin_id == data_admin_id && admin_name == data_admin_name){
                        //store admin data in session storage
                        sessionStorage.setItem('admin', JSON.stringify(adminData));
                        alert("Login Successful");
                        window.location.href = 'dashboard/dashboard.html';
                    }else{
                        alert("Invalid Name or ID");
                        location.reload();
                    }
                }else{
                    alert("Not Found");
                    location.reload();
                }
            });
        })
        .catch(error => {
            alert(error);
            location.reload();
        })
    });
});