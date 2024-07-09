// dashboard.js
import { db, get, ref, update } from "../../firebase.js";
import { showResultModal } from "./dashboard.js";
const user = JSON.parse(localStorage.getItem('user'));
const gridBody = document.createElement('div');
gridBody.classList.add('all_challenges_grid','grid');

// Display all challenges
function readChallengesData() {
    const challRef = ref(db, 'challenges');
    let enrolledChallengesRef = null;
    if (user) {
        enrolledChallengesRef = ref(db, 'users/' + user.id + '/enrolledChallenges');
    }
    const tableBody = document.getElementById('all_challenges_body');
    
    const loader = document.querySelector('.loader_row'); // Get the loader row element
    const noChallenges_row = document.getElementById('noChallenges');
    tableBody.innerHTML = ''; // Clear existing table rows
    if (loader) tableBody.appendChild(loader); // Append the loader row to the table body
    if (noChallenges_row) tableBody.appendChild(noChallenges_row);

    const grid_loader = document.querySelector('.grid_loader');
    const grid_noChallenges = document.querySelector('.grid_noChallenges');
    gridBody.innerHTML = '';
    if(grid_loader) gridBody.appendChild(grid_loader);
    if(grid_noChallenges) gridBody.appendChild(grid_noChallenges);
    
    if(window.innerWidth<1112){
        appendGridContent();
    }

    get(challRef)
        .then((allChallengesSnapshot) => {
            const allChallenges = [];
            allChallengesSnapshot.forEach((challengeSnapshot) => {
                allChallenges.push({
                    id: challengeSnapshot.key,
                    ...challengeSnapshot.val()
                });
            });

            if (enrolledChallengesRef) {
                return get(enrolledChallengesRef).then((enrolledChallengesSnapshot) => {
                    const enrolledChallengesData = enrolledChallengesSnapshot.val();
                    const enrolledChallengeIds = Object.keys(enrolledChallengesData || {});
                    displayChallenges(allChallenges, enrolledChallengeIds);
                });
            } else {
                displayChallenges(allChallenges, []);
            }
        })
        .catch((error) => {
            console.error("Error fetching data: ", error);
        });
}
// Function to display challenges
function displayChallenges(allChallenges, enrolledChallengeIds) {
    const tableBody = document.getElementById('all_challenges_body');
    allChallenges.forEach((data) => {
        if (enrolledChallengeIds.includes(data.id)) {
            return; // Skip displaying this challenge if it is in the enrolled challenges list
        }
        const row = document.createElement('tr');
        row.classList.add("table_data_row");
        
        // Create category cell with dynamic span classes for table
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
        
        const titleCell = document.createElement('td');
        titleCell.classList.add('title_content');
        titleCell.textContent = data.title || '';
        row.appendChild(titleCell);

        const descCell = document.createElement('td');
        const descCellSpan = document.createElement('span');
        descCellSpan.classList.add('desc_content');
        descCellSpan.textContent = data.description || '';
        descCell.appendChild(descCellSpan);
        row.appendChild(descCell);

        const postedOnCell = document.createElement('td');
        postedOnCell.classList.add('postedon_col');
        postedOnCell.textContent = data.postedOn || '';
        row.appendChild(postedOnCell);

        const endsOnCell = document.createElement('td');
        endsOnCell.classList.add('endson_col');
        endsOnCell.textContent = data.endsOn || '';
        row.appendChild(endsOnCell);

        // Create difficulty cell with dynamic class
        const difficultyCell = document.createElement('td');
        difficultyCell.classList.add('difficulty_col');
        if (data.difficulty) {
            difficultyCell.classList.add(data.difficulty);
            difficultyCell.textContent = data.difficulty;
        }
        row.appendChild(difficultyCell);

        const actionCell = document.createElement('td');
        actionCell.classList.add('action_col', 'action_content');
        const enrollButton = document.createElement('button');
        enrollButton.innerHTML = '<span>View More</span><img src="../../assets/icons/arrow_icon.png" alt="" class="arrow_icon">';
        enrollButton.classList.add('view_more_btn');
        enrollButton.addEventListener('click', () => showChallengeModal(data));
        actionCell.appendChild(enrollButton);
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
        card.addEventListener("click", () => showChallengeModal(data));
        card.appendChild(card_action_btn);
        
        gridBody.appendChild(card);
    });
    
    if(window.innerWidth<1112){
        appendGridContent();
    }
    // Call countVisibleRows function after displaying
    countVisibleRows(1);

    $('.loader_row').hide();
    $('.grid_loader').hide();
}
function appendGridContent(){
    $('.grid_loader').hide();
    $('#grid_noChallenges').hide();
    const grid_content_container = document.querySelector(".all_challenges_grid_container");
    grid_content_container.appendChild(gridBody);
}

// show challenge details
function showChallengeModal(data) {
    const modal = new bootstrap.Modal($('#challengeModal'));
    const firstWord = data.category.split(' ')[0];
    $('#modalCategory').text(data.category).removeClass().addClass(firstWord).addClass('ModalCategory');
    $('#modalTitle').text(data.title)
    $('#modalDescription').text(data.description)
    $('#modalPostedOn').text(data.postedOn)
    $('#modalEndsOn').text(data.endsOn)
    $('#modalDifficulty').text(data.difficulty).removeClass().addClass(data.difficulty+'_modal').addClass('ModalDifficulty');
    $('#submissionMethod').text(data.submissionMethod);
    // Clear existing tools list
    $('#tools_container').empty();
    $('#submissionMethod_container').empty();

    // Add tools to the list
    data.tools.forEach(tool => {
        const toolImageSrc = `../../assets/icons/${tool}.png`;
        const listItem = `<li><img class="toolImg" src="${toolImageSrc}" alt="${tool}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${tool}"></li>`;
        $('#tools_container').append(listItem);
    });

    // Add submission methods to the list
    data.submissionMethod.forEach(method => {
        const submethImgSrc = `../../assets/icons/${method}.png`;
        const methodItem = `<li><img class = "toolImg" src = "${submethImgSrc}" alt = "${method}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${method}"></li>`
        $('#submissionMethod_container').append(methodItem);
    })
    const enrollButton = document.getElementById('enroll_submit_btn');
    enrollButton.onclick = function() {
        enrollChallenge(data.id);
    };
    modal.show();
    // Initialize tooltips after modal is shown
    $('[data-bs-toggle="tooltip"]').tooltip();
}
// Function to handle the enroll action
function enrollChallenge(challengeId) {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        const enrollButton = document.getElementById('enroll_submit_btn');
        const originalText = enrollButton.innerHTML;
        
        // Add loading state to the button
        enrollButton.disabled = true;
        enrollButton.innerHTML = '<span>Loading...</span>';

        const enrolledChallengesRef = ref(db, `users/${user.id}/enrolledChallenges/${challengeId}`);

        // Create an object with id and status
        const challengeData = {
            id: challengeId
        };

        // Create a promise that resolves after 2 seconds
        const delay = new Promise((resolve) => setTimeout(resolve, 2000));

        // Run the update and delay in parallel
        Promise.all([update(enrolledChallengesRef, challengeData), delay])
            .then(() => {
                showResultModal('success', 'Enrolled successfully!', 'challengeModal', 0);
            })
            .catch((error) => {
                showResultModal('error', 'Failed to enroll in challenge.', 'challengeModal', 0);
            })
            .finally(() => {
                // Reset button state after 2 seconds
                enrollButton.disabled = false;
                enrollButton.innerHTML = originalText;
            });
    } else {
        alert("Please log in to enroll in challenges.");
    }
}

// Filter Challenges by Category Function
function filterChallengesByCategory(categoryName) {
    $('.category_content').each(function() {
        var category = $(this).text();
        var challengeRow = $(this).closest('tr');
        if (category === categoryName || categoryName === 'All') {
            challengeRow.css('display', 'table-row');
        } else {
            challengeRow.css('display', 'none');
        }
    });
    if(window.innerWidth<=1112){
        $('.card_category').each(function() {
            var category = $(this).text();
            var challengeCard = $(this).closest('.challenge_card');
            if (category === categoryName || categoryName === 'All') {
                challengeCard.css('display', 'block');
            } else {
                challengeCard.css('display', 'none');
            }
        });        
    }
    // Call countVisibleRows function after displaying
    countVisibleRows(0);
}

// count countVisibleRows
function countVisibleRows(reduce = 0) {
    $('#noChallenges').hide();
    let visibleRows = 0;    
    if (window.innerWidth > 1112) {
        visibleRows = $('#all_challenges_body tr:visible').length - reduce;
    } else {
        visibleRows = $('.challenge_card:visible').length;
    }
    document.getElementById("challenges_count").textContent = visibleRows;
    if (visibleRows === 0 && window.innerWidth > 1112) {
        $('#noChallenges').show();
        $('#grid_noChallenges').hide();
    } else if(visibleRows === 0 && window.innerWidth <= 1112) {
        $('#grid_noChallenges').show();
        $('#noChallenges').hide();
    } else{
        $('#grid_noChallenges').hide();
        $('#noChallenges').hide();
    }
}
window.addEventListener('resize', () => {
    countVisibleRows();
    appendGridContent();
});
// Document Ready Function
$(document).ready(function () {
    // Show loader initially
    $('#loader_row').show();
    $('.category_card').click(function () {
        // Show loader when category card is clicked
        $('#loader_row').show();
        
        var categoryName = $(this).find('.card_title').text();
        filterChallengesByCategory(categoryName);
        var categoryImg = $(this).find('.category_card_img img').attr('src');
        if($(this).find('.card_title').text() === "All"){
            var categoryTitle = "All Challenges";
        }else{
            var categoryTitle = $(this).find('.card_title').text();
        }
        $('.nav_category .category_img').attr('src', categoryImg);
        $('.nav_category .nav_category_title').text(categoryTitle);

        $('#categoriesModal').modal('hide');
    });
});
export{readChallengesData};