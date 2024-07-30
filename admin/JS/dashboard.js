import {db, get, ref, update, remove, set, push} from '../../firebase.js';
const admin = JSON.parse(sessionStorage.getItem('admin'));
const challengesRef = ref(db, 'challenges');
const usersRef = ref(db, 'users');
const pending_challenges_Ref = ref(db, 'users');
const queries_Ref = ref(db, 'queries');

let submit_changes = document.getElementById("submit_changes_btn");
let delete_challenge_btn = document.getElementById("delete_challenge_btn");

$(document).ready(() => {
    $('.stats_card').click(function() {
        const fileName = $(this).data("file");
        const color = $(this).data("color");
        const cardId = $(this).data("card"); // Get the card ID from data-card attribute

        if (fileName) {
            $.get(fileName, function(data) {
                // Show all footers
                $(".stats_card_footer").show();
                // Insert content into container
                $('#content_table_container').html(data);
                // Hide the footer of the clicked card
                $(`#${cardId} .stats_card_footer`).hide();
                // Change the border color of the wrapper with !important
                const stats_card_wrappers = document.querySelectorAll('.stats_card_wrapper');
                stats_card_wrappers.forEach(c => {
                    c.style.setProperty("border", `1px solid #e9e7e7`, "important");
                })
                const cardWrapper = document.getElementById(cardId).closest('.stats_card_wrapper');
                cardWrapper.style.setProperty("border", `2px solid ${color}`, "important");
                
            }).fail(function() {
                alert('File Not Found: ' + fileName);
            });
        } else {
            console.error('No file specified for this card.');
        }
    });
    $('.stats_card').eq(3).click();

    // Retrieve the 12-digit text from localStorage
    const originalText = admin.adminUID;
    if (originalText && originalText.length === 12) {
        // Add hyphen after every 4 characters
        const formattedText = originalText.replace(/(.{4})(?=.)/g, '$1-');

        // Log the formatted text
        const admin_id_field = document.getElementById("admin_id");
        admin_id_field.textContent = formattedText;
        const display_admin_name = document.getElementById('display_admin_name');
        display_admin_name.textContent = admin.adminName;
    } else {
        console.error('The text is not 12 characters long or does not exist.');
    }

    load_all_challenges_count();
    load_all_users_count();
    load_all_pending_challenges_count();
    load_all_queris_count();

    // Add new challenge btn
    document.getElementById("add_challenge_btn").addEventListener("click", () => {
        addNewChallenge();
    });

    // show challenge modal
    window.show_all_challenges_model = function (challenge_data, challengeIndex) {
        $("#EditChallengeModalLabel").text('Edit Challenge Details');
        $("#EditChallengeModal").modal('show');
        // Set the selected category
        const categorySelect = document.getElementById('category_select');
        const categoryOptions = categorySelect.options;
        for (let i = 0; i < categoryOptions.length; i++) {
            if (categoryOptions[i].value === challenge_data.category) {
                categoryOptions[i].selected = true;
                break;
            }
        }

        // Set the selected difficulty
        const difficultySelect = document.getElementById('difficulty_select');
        const difficultyOptions = difficultySelect.options;
        for (let i = 0; i < difficultyOptions.length; i++) {
            if (difficultyOptions[i].value === challenge_data.difficulty) {
                difficultyOptions[i].selected = true;
                break;
            }
        }

        // Set other challenge data
        $("#Challenge_ID").val(challenge_data.id);
        $("#Reward").val(challenge_data.reward);
        $("#title").val(challenge_data.title);
        $("#description").val(challenge_data.description);
        $("#start_date").val(challenge_data.postedOn);
        $("#end_date").val(challenge_data.endsOn);

        // Deselect all previously selected tools
        const deselectElements = document.querySelectorAll('.multiselect-dropdown .optext .optdel');
        if(deselectElements){
            deselectElements.forEach((del) => {
                del.click();
            });
        };

        // Set the tools to use
        const toolsSet = new Set(challenge_data.tools);
        const toolElements = document.querySelectorAll("#tools_to_use_input .multiselect-dropdown-list label");
        toolElements.forEach((t) => {
            const labelText = t.textContent;
            if (toolsSet.has(labelText)) {
                t.click();
            }
        });

        // Set the submission methods to use
        const submissionMethodsSet = new Set(challenge_data.submissionMethod);
        const submissionElements = document.querySelectorAll("#submission_method_input .multiselect-dropdown-list label");
        submissionElements.forEach((sm) => {
            const labelText = sm.textContent;
            if (submissionMethodsSet.has(labelText)) {
                sm.click();
            }
        });

        // Set the negative valuation checkbox
        if (challenge_data.hasNegativeValuation === "True") {
            $("#negative_val_checkbox").prop("checked", true);
        } else {
            $("#negative_val_checkbox").prop("checked", false);
        }

        // Modal Buttons
        submit_changes.addEventListener("click", () => {
            save_challenge_details(challengeIndex);
        });
        delete_challenge_btn.addEventListener("click", () => {
            delete_challenge(challengeIndex);
        });
    };

    // show user details
    window.full_user_details = function(user_data) {
        $("#save_changes_btn_wrapper").hide();
        $("#userDetailsModal").modal('show'); 
        const user_enrolled_body = document.getElementById("user_enrolled_challenges_body");
        const user_pending_body = document.getElementById("user_pending_challenges_body");
        const user_completed_body = document.getElementById("user_completed_challenges_body");

        let badge = user_data.xp <=499 ? "Bronze" : 
                    user_data>500 && user_data.xp <=1999 ? "Silver" :
                    user_data>2000 && user_data.xp <=4999 ? "Gold" :
                    "Expert";

        $("#modal_userID").text(user_data.id);
        $("#modal_userBadge").text(badge);
        $("#user_xp").text(user_data.xp ? user_data.xp : "--");
        if (user_data.profilePhoto) {
            $("#user_modal_profile").attr('src', user_data.profilePhoto);
        } else {
            $("#user_modal_profile").attr('src', '../../assets/images/default_profile_img.png');
        }
        $("#user_full_name").val(user_data.name ? user_data.name : "--");
        $("#user_username").val(user_data.username ? user_data.username : "--");
        $("#user_email_address").val(user_data.email ? user_data.email : "--");
        $("#user_mobile").val(user_data.mobile ? user_data.mobile : "--");
        $("#user_district").val(user_data.district ? user_data.district : "--");
        $("#user_state").val(user_data.state ? user_data.state : "--");
        $("#user_pincode").val(user_data.pincode ? user_data.pincode : "--");
        $("#user_insta_profile").val(user_data.instagram ? user_data.instagram : "--");
        $("#user_github_profile").val(user_data.gitHub ? user_data.gitHub : "--");
        $("#user_linkedin_profile").val(user_data.linkedIn ? user_data.linkedIn : "--");

        // enrolled Challenges
        get(challengesRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const allChallenges = [];

                snapshot.forEach((challenge) => {
                    allChallenges.push({ id: challenge.key, ...challenge.val() });
                });

                // Return the data
                return { allChallenges };
            } else {
                user_enrolled_body.innerHTML = '<tr><td colspan="7" class="text-center py-5">No challenges available</td></tr>';
                // Return empty arrays to prevent errors
                return { allChallenges: [] };
            }
        })
        .then(({ allChallenges }) => {
            const enrolledChallengesArray = Object.values(user_data.enrolledChallenges || {}); // Default to empty object
            // Create a map of enrolledChallenges for easy lookup (optional null check)
            const enrolledChallengesMap = enrolledChallengesArray.reduce((map, challenge) => {
                map[challenge.id] = challenge;
                return map;
            }, {});

            // Filter challenges to include only those that match the enrolledChallenges IDs
            const filteredChallenges = allChallenges.filter((challenge) => enrolledChallengesMap.hasOwnProperty(challenge.id));

            if (filteredChallenges.length === 0) {
                user_enrolled_body.innerHTML = '<tr><td colspan="7" class="text-center py-5">No enrolled challenges available</td></tr>';
            } else {
                user_enrolled_body.innerHTML = "";
                filteredChallenges.forEach((c) => {
                    // Create a new table row
                    const row = document.createElement("tr");
                    const firstword = c.category.split(' ')[0];
                    // Create table cells and set their content
                    row.innerHTML = `
                        <td class="category_col"><span class="category_content ${firstword}">${c.category}</span></td>
                        <td class="title_col">${c.title}</td>
                        <td class="desc_col">${c.description}</td>
                        <td class="postedOn_col">${c.postedOn}</td>
                        <td class="endsOn_col">${c.endsOn}</td>
                        <td class="difficulty_col ${c.difficulty.replace(/\s+/g, '')}">${c.difficulty}</td>
                    `;
                    // Append the row to the table body
                    user_enrolled_body.appendChild(row);
                });
            }
        })
        .catch(() => {
            user_enrolled_body.innerHTML = '<tr><td colspan="7" class="text-center py-5">Error retrieving challenges or user data</td></tr>';
        });

        // Pending Challenges
        get(challengesRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const allChallenges = [];

                snapshot.forEach((challenge) => {
                    allChallenges.push({ id: challenge.key, ...challenge.val() });
                });
                // Return the data
                return { allChallenges };
            } else {
                user_pending_body.innerHTML = '<tr><td colspan="7" class="text-center py-5">No challenges available</td></tr>';
                // Return empty arrays to prevent errors
                return { allChallenges: [] };
            }
        })
        .then(({ allChallenges }) => {
            const pendingChallengesArray = Object.values(user_data.pendingChallenges || {}); // Default to empty object
            // Create a map of pendingChallenges for easy lookup (optional null check)
            const pendingChallengesMap = pendingChallengesArray.reduce((map, challenge) => {
                map[challenge.id] = challenge;
                return map;
            }, {});

            // Filter challenges to include only those that match the pendingChallenges IDs
            const filteredChallenges = allChallenges.filter((challenge) => pendingChallengesMap.hasOwnProperty(challenge.id));

            if (filteredChallenges.length === 0) {
                user_pending_body.innerHTML = '<tr><td colspan="7" class="text-center py-5">No pending challenges available</td></tr>';
            } else {
                user_pending_body.innerHTML = "";
                filteredChallenges.forEach((c) => {
                    // Create a new table row
                    const row = document.createElement("tr");
                    const firstword = c.category.split(' ')[0];
                    let solutionLink = pendingChallengesMap[c.id]?.link || "No link provided";

                    // Check and prepend https:// if missing
                    if (solutionLink !== "No link provided" && !/^https?:\/\//i.test(solutionLink)) {
                        solutionLink = `https://${solutionLink}`;
                    }

                    // Create table cells and set their content
                    row.innerHTML = `
                        <td class="category_col"><span class="category_content ${firstword}">${c.category}</span></td>
                        <td class="title_col">${c.title}</td>
                        <td class="desc_col">${c.description}</td>
                        <td class="link_col"><a href="${solutionLink}" target="_blank" class="solution_link">${solutionLink}</a></td>
                        <td class="approve_col"><button class="btn btn-success btn-sm w-100" onclick="update_pending_challenge('${user_data.id}', '${c.id}', 'Approved', '${c.reward}', 1)">Approve</button></td>
                        <td class="reject_col"><button class="btn btn-danger btn-sm w-100"  onclick="update_pending_challenge('${user_data.id}', '${c.id}', 'Rejected', '${c.reward}', 1)">Reject</button></td>
                    `;
                    // Append the row to the table body
                    user_pending_body.appendChild(row);
                });
            }
        })
        .catch(() => {
            user_pending_body.innerHTML = '<tr><td colspan="7" class="text-center py-5">Error retrieving challenges or user data</td></tr>';
        });

        // completed Challenges
        get(challengesRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const allChallenges = [];

                snapshot.forEach((challenge) => {
                    allChallenges.push({ id: challenge.key, ...challenge.val() });
                });

                // Return the data
                return { allChallenges };
            } else {
                user_completed_body.innerHTML = '<tr><td colspan="7" class="text-center py-5">No challenges available</td></tr>';
                // Return empty arrays to prevent errors
                return { allChallenges: [] };
            }
        })
        .then(({ allChallenges }) => {
            const completedChallengesArray = Object.values(user_data.completedChallenges || {}); // Default to empty object
            // Create a map of completedChallenges for easy lookup (optional null check)
            const completedChallengesMap = completedChallengesArray.reduce((map, challenge) => {
                map[challenge.id] = challenge;
                return map;
            }, {});

            // Filter challenges to include only those that match the completedChallenges IDs
            const filteredChallenges = allChallenges.filter((challenge) => completedChallengesMap.hasOwnProperty(challenge.id));

            if (filteredChallenges.length === 0) {
                user_completed_body.innerHTML = '<tr><td colspan="7" class="text-center py-5">No completed challenges available</td></tr>';
            } else {
                user_completed_body.innerHTML = "";
                filteredChallenges.forEach((c) => {
                    // Create a new table row
                    const row = document.createElement("tr");
                    const firstword = c.category.split(' ')[0];
                    let result = completedChallengesMap[c.id]?.status || "--";
                    let reward_status = c.reward >= 0 ? "positive" : "negative"
                    let result_status = result == "Approved" ? "positive" : "negative"

                    // Create table cells and set their content
                    row.innerHTML = `
                        <td class="category_col"><span class="category_content ${firstword}">${c.category}</span></td>
                        <td class="title_col">${c.title}</td>
                        <td class="desc_col">${c.description}</td>
                        <td class="difficulty_col ${c.difficulty.replace(/\s+/g, '')}">${c.difficulty}</td>
                        <td class="result_col ${result_status}_result">${result}</td>
                        <td class="reward_col ${reward_status}_reward">${c.reward}</td>
                    `;
                    // Append the row to the table body
                    user_completed_body.appendChild(row);
                });
            }
        })
        .catch(() => {
            user_completed_body.innerHTML = '<tr><td colspan="7" class="text-center py-5">Error retrieving challenges or user data</td></tr>';
        });

        const userRef = ref(db, `users/${user_data.id}`);

        // Flag to check if the button has been shown
        let saveButtonShown = false;
        // Show the save button if any input value is changed
        $(".user_data_input").on('input', function() {
            if (!saveButtonShown) {
                $("#save_changes_btn_wrapper").show();
                saveButtonShown = true;  // Set the flag to true so it won't show again
                // Update user details
                $("#save_user_changes").click(() => {
                    const user_data_object = {
                        district: $("#user_district").val(),
                        email: $("#user_email_address").val(),
                        gitHub: $("#user_github_profile").val(),
                        instagram: $("#user_insta_profile").val(),
                        linkedIn: $("#user_linkedin_profile").val(),
                        mobile: $("#user_mobile").val(),
                        name: $("#user_full_name").val(),
                        pincode: $("#user_pincode").val(),
                        state: $("#user_state").val(),
                        username: $("#user_username").val(),
                    };
                    update(userRef, user_data_object)
                    .then(() => {
                        alert("Details Updated Successfully");
                        $("#save_changes_btn_wrapper").hide();
                        saveButtonShown = false;
                    })
                    .catch((error) => {
                        alert(`Failed to Update Details - ${error}`);
                    })
                });
            }
        });
        
    };

    // show query modal
    window.show_query_details = function(query, queryID) {
        const query_modal = $("#queryModal");
        query_modal.modal('show');
        $("#query_id_modal").text(queryID || "--");
        $("#query_category_modal").text(query.Category || "--");
        $("#query_fName_modal").text(query.Fullname || "--");
        $("#query_email_modal").text(query.Email || "--");
        $("#query_mobile_modal").text(query.Mobile || "--");
        $("#query_text_modal").text(query.Querry || "--");
      
        // Get the reply button element
        const replyBtn = $("#replyBtn");
      };          
});

window.load_all_challenges_count = function (){
    // Load All challenges count
    const challengesCount = document.getElementById("all_challenges_count");
    const all_challenges_count_spinner = $("#all_challenges_count_spinner");
    // Get the data from the node
    get(challengesRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const count = data ? Object.keys(data).length : 0;
            all_challenges_count_spinner.hide();
            challengesCount.innerHTML = count;
        } else {
            challengesCount.innerHTML = '0';
            console.log('No data available');
        }
    })
    .catch((error) => {
        console.error('Error getting data:', error);
        challengesCount.innerHTML = 'Error';
    });
}

window.load_all_users_count = function(){
    // Load All Users count
    const usersCount = document.getElementById("total_users_count");
    const all_users_count_spinner = $("#users_count_spinner");

    // Get the data from the node
    get(usersRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const count = data ? Object.keys(data).length : 0;
            all_users_count_spinner.hide();
            usersCount.innerHTML = count;
        } else {
            usersCount.innerHTML = '0';
            console.log('No data available');
        }
    })
    .catch((error) => {
        console.error('Error getting data:', error);
        usersCount.innerHTML = 'Error';
    });
}

window.load_all_pending_challenges_count = function (){
    // Load All Pending Challenges count
    const pending_challenges_count = document.getElementById("pending_challnegs_count");
    const pending_count_spinner = $("#pending_count_spinner");
    // Get the data from the node
    get(pending_challenges_Ref)
    .then((snapshot) => {
    if (snapshot.exists()) {
        const users = snapshot.val();
        let totalPendingChallenges = 0;

        for (const userId in users) {
            const user = users[userId];
            const pendingChallenges = user.pendingChallenges;
            let skipFirst = true;

            for (const challengeId in pendingChallenges) {
                if (skipFirst) {
                    skipFirst = false;
                    continue;
                }
                totalPendingChallenges++;
            }
        }
        pending_count_spinner.hide();
        pending_challenges_count.textContent = totalPendingChallenges;
    } else {
        pending_challenges_count.textContent = "0";
    }
    })
    .catch((error) => {
        console.error("Error fetching data:", error);
        pending_challenges_count.textContent = "ND";
    });
}

window.load_all_queris_count = function (){
    // Load all queries count
    const queriesCount = document.getElementById("queries_count");
    const queries_count_spinner = $("#queries_count_spinner");

    // Get data from the node
    get(queries_Ref)
        .then((snapshot) => {
            if(snapshot.exists()){
                const data = snapshot.val();
                const count = data ? Object.keys(data).reduce((acc, key) => {
                    return data[key].status === 'open' ? acc + 1 : acc;
                }, 0) : 0;                
                queries_count_spinner.hide();
                queriesCount.innerHTML = count;
            }else{
                queriesCount.innerHTML = '0';
            }
        })
        .catch((error) => {
            console.log(error);
            queriesCount.innerHTML = 'ER';
        })
}

function save_challenge_details(challengeIndex){
    const originalText = submit_changes.innerHTML;
    submit_changes.disabled = true;
    submit_changes.innerHTML = `<span class="spinner-border spinner-border-sm text-white" aria-hidden="true"></span>
    <span role="status" class="text-white">Updating...</span>`;
    
    const category = document.getElementById("category_select").value;
    const difficulty = document.getElementById("difficulty_select").value;
    const challenge_id = document.getElementById("Challenge_ID").value;
    const reward = document.getElementById("Reward").value;
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const postedOn = document.getElementById("start_date").value;
    const endsOn = document.getElementById("end_date").value;
    const selectedTools = document.querySelectorAll('#tools_to_use_input .multiselect-dropdown .optext p');
    const selectedSubmissions = document.querySelectorAll('#submission_method_input .multiselect-dropdown .optext p');

    // Extract tool names
    const tools = Array.from(selectedTools).map(tool => tool.textContent.trim());

    // Extract submission methods
    const submissionMethod = Array.from(selectedSubmissions).map(submission => submission.textContent.trim());

    // Create an object with id and status
    const challengeData = {
        category: category,
        difficulty: difficulty,
        id: challenge_id,
        reward: reward,
        title: title,
        description: description,
        postedOn: postedOn,
        endsOn: endsOn,
        tools: tools,
        submissionMethod: submissionMethod
    };

    const this_challengeRef = ref(db, `challenges/${challengeIndex}`);
    // Run the update and delay in parallel
    update(this_challengeRef, challengeData)
    .then(() => {
        alert("Update Successful");
    })
    .catch((error) => {
        alert("Update Unsuccessful",error);
    })
    .finally(() => {
        // Reset button state after 2 seconds
        submit_changes.disabled = false;
        submit_changes.innerHTML = originalText;
        window.location.reload();
    });
};

function delete_challenge(challengeIndex){
    const originalText = delete_challenge_btn.innerHTML;
    delete_challenge_btn.disabled = true;
    delete_challenge_btn.innerHTML = `<span class="spinner-border spinner-border-sm text-white" aria-hidden="true"></span>
    <span role="status" class="text-white">Deleting...</span>`;

    const this_challengeRef = ref(db, `challenges/${challengeIndex}`);

    // Call the remove method to delete the challenge
    remove(this_challengeRef)
    .then(() => {
        alert("Delete Successful");
    })
    .catch((error) => {
        alert("Delete Unsuccessful: " + error.message);
    })
    .finally(() => {
        // Reset button state after the operation
        delete_challenge_btn.disabled = false;
        delete_challenge_btn.innerHTML = originalText;
        window.location.reload();
    });
}

function addNewChallenge() {
    // Collect data from form inputs
    const category = document.getElementById("new_category_select").value;
    const difficulty = document.getElementById("new_difficulty_select").value;
    const reward = document.getElementById("new_Reward").value;
    const title = document.getElementById("new_title").value;
    const description = document.getElementById("new_description").value;
    const postedOn = document.getElementById("new_start_date").value;
    const endsOn = document.getElementById("new_end_date").value;
    const selectedTools = document.querySelectorAll('#new_tools_to_use_input .multiselect-dropdown .optext p');
    const selectedSubmissions = document.querySelectorAll('#new_submission_method_input .multiselect-dropdown .optext p');
    
    // Extract tool names
    const tools = Array.from(selectedTools).map(tool => tool.textContent.trim());
    
    // Extract submission methods
    const submissionMethod = Array.from(selectedSubmissions).map(submission => submission.textContent.trim());
    
    // Create challenge data object
    const challengeData = {
        category: category,
        difficulty: difficulty,
        reward: reward,
        title: title,
        description: description,
        postedOn: postedOn,
        endsOn: endsOn,
        tools: tools,
        submissionMethod: submissionMethod
    };
    
    // Get a reference to the challenges node
    const challengesRef = ref(db, 'challenges');
    
    // Retrieve the existing challenges to determine the next index
    get(challengesRef).then(snapshot => {
        if (snapshot.exists()) {
            const challenges = snapshot.val();
            const indexes = Object.keys(challenges).map(key => parseInt(key)).filter(Number.isInteger);
            const nextIndex = Math.max(...indexes) + 1;
            
            // Set the new challenge with the next index
            const newChallengeRef = ref(db, `challenges/${nextIndex}`);
            set(newChallengeRef, challengeData)
            .then(() => {
                alert("New Challenge Added Successfully");
                // Optionally, you can reset the form here
            })
            .catch((error) => {
                alert("Failed to Add New Challenge: " + error.message);
            })
            .finally(() => {
                window.location.reload();
            });
        } else {
            // If no challenges exist, start with index 0
            const newChallengeRef = ref(db, `challenges/0`);
            set(newChallengeRef, challengeData)
            .then(() => {
                alert("New Challenge Added Successfully");
                // Optionally, you can reset the form here
            })
            .catch((error) => {
                alert("Failed to Add New Challenge: " + error.message);
            })
            .finally(() => {
                window.location.reload();
            });
        }
    }).catch((error) => {
        alert("Failed to Retrieve Challenges: " + error.message);
    });
}

window.update_pending_challenge = function(user, challenge_id, challenge_status, xpChange, card) {
    const user_pendingChallengeRef = ref(db, `users/${user}/pendingChallenges/${challenge_id}`);
    const user_completedChallengesRef = ref(db, `users/${user}/completedChallenges`);
    const user_xpRef = ref(db, `users/${user}/xp`);

    get(user_pendingChallengeRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                // Challenge exists in pendingChallenges
                const challengeData = {
                    id: challenge_id,
                    status: challenge_status
                };

                // Remove the challenge from pendingChallenges
                return remove(user_pendingChallengeRef).then(() => {
                    // Retrieve all existing completed challenges to determine the next index
                    return get(user_completedChallengesRef);
                }).then((completedChallengesSnapshot) => {
                    let nextIndex = 0;

                    if (completedChallengesSnapshot.exists()) {
                        const completedChallenges = completedChallengesSnapshot.val();
                        const indexes = Object.keys(completedChallenges)
                            .map(key => parseInt(key))
                            .filter(Number.isInteger);

                        if (indexes.length > 0) {
                            nextIndex = Math.max(...indexes) + 1;
                        }
                    }

                    // Set the new completed challenge with the next index
                    const newChallengeRef = ref(db, `users/${user}/completedChallenges/${nextIndex}`);
                    return set(newChallengeRef, challengeData);
                }).then(() => {
                    // Update XP based on challenge status
                    return get(user_xpRef).then(xpSnapshot => {
                        const receivedXP = parseInt(xpChange);
                        const currentXP = xpSnapshot.exists() ? parseInt(xpSnapshot.val()) : 0;
                        const updatedXP = challenge_status === "Approved" ? currentXP + receivedXP : currentXP - receivedXP;
                        const finalXP = parseInt(updatedXP);  // Ensure it's an integer
                        return set(user_xpRef, finalXP);
                    });
                });
            } else {
                throw new Error("Challenge Not found in Pending Challenges");
            }
        })
        .then(() => {
            alert(`Challenge ${challenge_status} Successfully`);
            load_all_pending_challenges_count();
            $('.stats_card').eq(card).click();
            $("#userDetailsModal").modal("hide");
        })
        .catch((error) => {
            alert(error.message);
        });
};