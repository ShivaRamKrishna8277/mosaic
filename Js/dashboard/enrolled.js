import { db, get, ref, update, remove } from "../../firebase.js";
import { showResultModal } from "./dashboard.js";

// Reference to the challenges data
var challengesRef = ref(db, 'challenges');
const user = JSON.parse(localStorage.getItem('user'));
const enrolled_grid_body = document.createElement('div');
enrolled_grid_body.classList.add('enrolled_grid','grid');
let is_smaller_screen;
if(window.innerWidth>1112){
    is_smaller_screen = false;
}else{
    is_smaller_screen = true;
}

// show submission details
function showSubmissionModal(data) {
    const modal = new bootstrap.Modal($('#submissionModal'));
    const firstWord = data.category.split(' ')[0];
    $('#submodalCategory').text(data.category).removeClass().addClass(firstWord).addClass('ModalCategory');
    $('#submodalTitle').text(data.title);
    $('#submodalDescription').text(data.description);
    $('#submodalPostedOn').text(data.postedOn);
    $('#submodalEndsOn').text(data.endsOn);
    $('#submodalDifficulty').text(data.difficulty).removeClass().addClass(data.difficulty + '_modal').addClass('ModalDifficulty');
    
    // Clear existing tools list
    $('#subtools_container').empty();
    $('#subMethod_container').empty();

    // Add tools to the list
    data.tools.forEach(tool => {
        const toolImageSrc = `../../assets/icons/${tool}.png`;
        const listItem = `<li><img class="toolImg" src="${toolImageSrc}" alt="${tool}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${tool}"></li>`;
        $('#subtools_container').append(listItem);
    });

    // Add submission methods to the list
    data.submissionMethod.forEach(method => {
        const submethImgSrc = `../../assets/icons/${method}.png`;
        const methodItem = `<li><img class="toolImg" src="${submethImgSrc}" alt="${method}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${method}"></li>`;
        $('#subMethod_container').append(methodItem);
    });

    // function to show submission form
    $('#submission_form').html(`
        <div class="mb-3" id="input_field">
            <input type="url" class="form-control mt-2 solution linkInput" id="linkInput" placeholder="Enter your ${data.submissionMethod} here" required></input> 
            <p id="linkInputFeedback" class="text-danger mt-2"></p>                           
        </div>
        <button type="submit" class="btn btn-primary border-0 shadow-none" id="submissionButton" style="background-color: var(--fivehun);">Submit</button>    
    `);
    
    // Add event listener for input changes in the link input field
    $("#linkInput").on('input', function() {
        const linkInput = $(this).val();
        if (isLinkValid(linkInput)) {
            // If link is valid, remove the is-invalid class and hide the error message
            $(this).removeClass('is-invalid');
            $('#linkInputFeedback').text('');
            $('.form-control').css('box-shadow', '0 0 0 5px #D4F7E1').css('border', '1px solid #1DB471');
        } else {
            // If link is not valid, add the is-invalid class and show the error message
            $(this).addClass('is-invalid');
            $('#linkInputFeedback').text('Please enter a valid URL.');
            $('.form-control').css('box-shadow', '0 0 0 5px rgba(225, 0, 0, 0.1').css('border', '1px solid #FF0000');
        }
    });
    $('#submissionButton').click(function(event) {
        event.preventDefault();

        // Validate the link input
        const linkInput = $("#linkInput").val();
        if (isLinkValid(linkInput)) {
            // If link is valid, submit the solution
            submitSolution(data.id, linkInput);
        } else {
            // If link is not valid, show error using Bootstrap alert
            $('#linkInput').addClass('is-invalid');
            $('#linkInputFeedback').text('Please enter a valid URL.');
            $('.form-control').css('box-shadow', '0 0 0 5px rgba(225, 0, 0, 0.1').css('border', '1px solid #FF0000');
        }
    });
    function isLinkValid(url) {
        // Simple URL validation, you can adjust this based on your requirements
        const urlPattern = /^((https?|ftp):\/\/)?(www\.)?[a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
        return urlPattern.test(url);
    }

    modal.show();
    // Initialize tooltips after modal is shown
    $('[data-bs-toggle="tooltip"]').tooltip();
}
function submitSolution(dataID, link) {
    if(user){
        const enrollBtn = document.getElementById('submissionButton');
        const originalText = 'Submit';

        // Add loading state to the button
        enrollBtn.disabled = true;
        enrollBtn.innerHTML = '<span>Loading...</span>';

        const pendingChallengesRef = ref(db, `users/${user.id}/pendingChallenges/${dataID}`);
        const enrolledChallengesRef = ref(db, `users/${user.id}/enrolledChallenges/${dataID}`);

        // Create an object with id and solution link
        const submissionData = {
            id: dataID,
            link: link
        };

        // create a promise that resolves after 2 seconds
        const delay = new Promise((resolve) => setTimeout(resolve, 2000));

        //Run the update and delay in parallel
        Promise.all([update(pendingChallengesRef, submissionData), remove(enrolledChallengesRef), delay])
            .then(() => {
                showResultModal('success', 'Solution submitted successfully!', 'submissionModal', 1);
            })
            .catch(() => {
                showResultModal('error', 'Failed to submit solution.', 'submissionModal', 1);
            })
            .finally(() => {
                // Reset button state after 2 seconds
                enrollBtn.disabled = false;
                enrollBtn.innerHTML = originalText;
            });
    }else{
        alert("Please log in to submit a solution");
    }
}
function appendGridContent(){
    $('#enrolled_grid_loader').hide();
    $('#enrolled_grid_no_challenges').hide();
    const enrolled_grid_container = document.querySelector('.enrolled_grid_container');
    enrolled_grid_container.appendChild(enrolled_grid_body);
}

// Display enrolled challenges
function readEnrolledData() {
    const tableBody = document.getElementById('enrolled_challenges_body');
    const loaderRow = document.querySelector('.loader_row');
    const noEnrolledChallengesRow = document.getElementById('noEnrolledChallenges');
    const noEnrolledChallengesGrid = document.getElementById('enrolled_grid_no_challenges');

    if(!is_smaller_screen){
        appendGridContent();
    }

    if (user) {
        // Construct the reference path to the enrolledChallenges array
        const enrolledChallengesRef = ref(db, 'users/' + user.id + '/enrolledChallenges');
        // Fetch the enrolledChallenges
        get(enrolledChallengesRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const enrolledChallenges = snapshot.val();
                    // Fetch all challenges data
                    return get(challengesRef).then((allChallengesSnapshot) => {
                        const allChallenges = [];
                        allChallengesSnapshot.forEach((challenge) => {
                            allChallenges.push({ id: challenge.key, ...challenge.val() });
                        });
                        return { enrolledChallenges, allChallenges };
                    });
                } else {
                    if(is_smaller_screen){
                        noEnrolledChallengesGrid.style.display = 'block'
                    }else{
                        noEnrolledChallengesRow.style.display = 'table-row';
                    }
                    updateCount(0);
                    return { enrolledChallenges: [], allChallenges: [] };
                }
            })
            .then(({ enrolledChallenges, allChallenges }) => {
                // Initialize visibleRowsCount within the scope of the .then block
                let visibleRowsCount = 0;
                enrolled_grid_body.innerHTML = '';
                // Convert enrolledChallenges object into an array
                const enrolledChallengesArray = Object.values(enrolledChallenges);           
                // Create a map of enrolledChallenges for easy lookup (optional null check)
                const enrolledChallengesMap = enrolledChallengesArray.reduce((map, challenge) => {
                    map[challenge.id] = challenge;
                    return map;
                }, {});            
                // Filter challenges to include only those that match the enrolledChallenges IDs
                const filteredChallenges = allChallenges.filter((challenge) => enrolledChallengesMap.hasOwnProperty(challenge.id));           
                if (filteredChallenges.length === 0) {
                    if(is_smaller_screen){
                        noEnrolledChallengesGrid.style.display = 'block';
                    }else{
                        noEnrolledChallengesRow.style.display = 'table-row';
                    }
                } else {
                    // Display filtered challenges
                    filteredChallenges.forEach((data) => {
                        const row = document.createElement('tr');
                
                        // Category cell with dynamic class
                        const categoryCell = document.createElement('td');
                        categoryCell.classList.add('category_col');
                        const categorySpan = document.createElement('span');
                        categorySpan.classList.add('category_content');
                        if (data.category) {
                            const firstWord = data.category.split(' ')[0];
                            categorySpan.classList.add(firstWord);
                            categorySpan.textContent = data.category;
                        }
                        categoryCell.appendChild(categorySpan);
                        row.appendChild(categoryCell);
                
                        // Title cell
                        const titleCell = document.createElement('td');
                        titleCell.classList.add('title_content');
                        titleCell.textContent = data.title || '';
                        row.appendChild(titleCell);
                
                        // Description cell
                        const descCell = document.createElement('td');
                        const descCellSpan = document.createElement('span');
                        descCellSpan.classList.add("desc_content");
                        descCellSpan.textContent = data.description || '';
                        descCell.appendChild(descCellSpan);
                        row.appendChild(descCell);
                
                        // Starts on cell
                        const postedOnCell = document.createElement('td');
                        postedOnCell.classList.add("postedon_col");
                        postedOnCell.textContent = data.postedOn || '';
                        row.appendChild(postedOnCell);
                
                        // Ends on cell
                        const endsOnCell = document.createElement('td');
                        endsOnCell.classList.add("endson_col");
                        endsOnCell.textContent = data.endsOn || '';
                        row.appendChild(endsOnCell);
                
                        // Difficulty cell
                        const difficultyCell = document.createElement('td');
                        difficultyCell.classList.add('difficulty_col');
                        if (data.difficulty) {
                            difficultyCell.classList.add(data.difficulty);
                            difficultyCell.textContent = data.difficulty;
                        }
                        row.appendChild(difficultyCell);
                
                        // Action cell
                        const actionCell = document.createElement('td');
                        actionCell.classList.add('action_col', 'action_content');
                        const moreInfoBtn = document.createElement('button');
                        moreInfoBtn.innerHTML = '<span>Submit</span><img src="../../assets/icons/arrow_icon.png" alt="" class="arrow_icon">';
                        moreInfoBtn.classList.add('more_info_btn');
                        moreInfoBtn.addEventListener('click', () => showSubmissionModal(data));
                        actionCell.appendChild(moreInfoBtn);
                        row.appendChild(actionCell);
                
                        tableBody.appendChild(row);


                        // card
                        const card = document.createElement('div');
                        card.classList.add('challenge_card');
                        // create card elements
                        const card_header = document.createElement('div');
                        card_header.classList.add('card_header');
                        const card_categoryCell = document.createElement('p');
                        if(data.category){
                            const firstWord = data.category.split(' ')[0];
                            card_categoryCell.classList.add('card_category', firstWord);
                            card_categoryCell.textContent = data.category || '';
                        }
                        card_header.appendChild(card_categoryCell);
                        const card_difficultyCell = document.createElement('p');
                        card_difficultyCell.classList.add('card_difficulty');
                        if (data.difficulty) {
                            card_difficultyCell.classList.add(data.difficulty);
                            card_difficultyCell.textContent = data.difficulty || '';
                        }
                        card_header.appendChild(card_difficultyCell);
                        card.appendChild(card_header);

                        const mobile_card_title = document.createElement('p');
                        mobile_card_title.classList.add('mobile_card_title');
                        mobile_card_title.textContent = data.title || '';
                        card.appendChild(mobile_card_title);

                        const mobile_card_desc = document.createElement('p');
                        mobile_card_desc.classList.add('mobile_card_desc');
                        mobile_card_desc.textContent = data.description || '';
                        card.appendChild(mobile_card_desc);

                        const timeframeWrapper = document.createElement('div');
                        timeframeWrapper.classList.add('timeframe_wrapper');
                        const postedonWrapper = document.createElement('div');
                        postedonWrapper.classList.add('postedon_wrapper');
                        const postedOnTitle = document.createElement('p');
                        postedOnTitle.classList.add('timeframe_title');
                        postedOnTitle.textContent = 'Posted On:';
                        const postedOnContent = document.createElement('p');
                        postedOnContent.classList.add('timeframe_content');
                        postedOnContent.id = 'card_PostedOn';
                        postedOnContent.textContent = data.postedOn || ''; // Initial data
                        const timeframeLine = document.createElement('div');
                        timeframeLine.classList.add('timeframe_line');
                        const endsonWrapper = document.createElement('div');
                        endsonWrapper.classList.add('endson_wrapper', 'text-end');
                        const endsOnTitle = document.createElement('p');
                        endsOnTitle.classList.add('timeframe_title');
                        endsOnTitle.textContent = 'Ends On:';
                        const endsOnContent = document.createElement('p');
                        endsOnContent.classList.add('timeframe_content');
                        endsOnContent.id = 'card_EndsOn';
                        endsOnContent.textContent = data.endsOn || ''; // Initial data
                        // Append elements
                        postedonWrapper.appendChild(postedOnTitle);
                        postedonWrapper.appendChild(postedOnContent);
                        endsonWrapper.appendChild(endsOnTitle);
                        endsonWrapper.appendChild(endsOnContent);
                        timeframeWrapper.appendChild(postedonWrapper);
                        timeframeWrapper.appendChild(timeframeLine);
                        timeframeWrapper.appendChild(endsonWrapper);
                        card.appendChild(timeframeWrapper);

                        const card_action_btn = document.createElement('div');
                        card_action_btn.classList.add('card_view_more_btn');
                        card_action_btn.innerHTML = '<span>View More</span><img src="../../assets/icons/arrow_icon.png" alt="" class="arrow_icon">';
                        card.addEventListener("click", () => showSubmissionModal(data));
                        card.appendChild(card_action_btn);
                        
                        enrolled_grid_body.appendChild(card);
                        visibleRowsCount++;
                    });                  
                    if(window.innerWidth<1112){
                        appendGridContent();
                    }
                }
                $('#enrolled_grid_loader').hide();
                loaderRow.style.display = 'none';
                updateCount(visibleRowsCount);
            })
            .catch((error) => {
                console.log('Error Fetching Data: ', error);
                loaderRow.style.display = 'none';
                $('#enrolled_grid_loader').hide();
            });            
        function updateCount(count) {
            $('#enrolled_challenges_count').text(count);
        }
    } else {
        tableBody.innerHTML = 
        `<tr id="tableLoginBtn">
            <td colspan="7" class="text-center">
                <button type="button" class="btn btn-danger my-5"><a href="../login.html" class="text-white">Please Login</a></button>
            </td>
        </tr>`;  
    }
}

export { readEnrolledData };
