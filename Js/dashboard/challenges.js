// dashboard.js
import { db, get, ref, update } from "../../firebase.js";
import { showResultModal } from "./dashboard.js";

// display all challenges
function readChallengesData() {
    const challRef = ref(db, 'challenges');
    const tableBody = document.getElementById('all_challenges_body');
    
    const loader = document.querySelector('.loader_row'); // Get the loader row element
    tableBody.innerHTML = ''; // Clear existing table rows
    if (loader) {
        tableBody.appendChild(loader); // Append the loader row to the table body
    }

    get(challRef)
    .then((allChallenges) => {
        allChallenges.forEach(challenge => {
            const data = challenge.val();
            const row = document.createElement('tr');

            // Create category cell with dynamic span classes
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
        });
        $('.loader_row').hide();
    }).catch((error) => {
        console.error("Error fetching data: ", error);
    });
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


// Function to fetch challenge counts from Firebase
function fetchChallengeCounts() {
    const countsRef = ref(db, 'challengesCount');

    get(countsRef).then((snapshot) => {
        if (snapshot.exists()) {
            const countsData = snapshot.val();
            updateChallengeCounts(countsData);
            $('#challenges_count').text(countsData['All']);
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error("Error fetching challenge counts: ", error);
    });
}
// Function to update the challenge counts in the HTML
function updateChallengeCounts(countsData) {
    $('.category_card').each(function() {
        const categoryTitle = $(this).find('.card_title').text().trim();
        const countElement = $(this).find('.card_total_challenges span');

        if (categoryTitle in countsData) {
            countElement.text(countsData[categoryTitle]);
        } else if (categoryTitle === 'All') {
            countElement.text(countsData['All']);
        } else {
            countElement.text(0); // Default to 0 if category not found
        }
    });
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
}


// Document Ready Function
$(document).ready(function () {
    // Show loader initially
    $('#loader_row').show();

    fetchChallengeCounts();

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

        const countElement = $(this).find('.card_total_challenges span').text();
        $('#challenges_count').text(countElement);

        $('#categoriesModal').modal('hide');
    });
});
export{readChallengesData};