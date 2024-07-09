// dashboard.js
import { db, get, ref } from "../../firebase.js";

// Parse user information from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const pending_grid_body = document.createElement('div');
pending_grid_body.classList.add('pending_grid','grid');
let is_smaller_screen;
if(window.innerWidth>1112){
    is_smaller_screen = false;
}else{
    is_smaller_screen = true;
}

function appendGridContent(){
    $('#pending_grid_loader').hide();
    $('#pending_grid_no_challenges').hide();
    const pending_grid_container = document.querySelector('.pending_grid_container');
    pending_grid_container.appendChild(pending_grid_body);
}
// display pending challenges
function readPendingData() {
    const tableBody = document.getElementById('pending_challenges_body');
    const noPendingChallengesRow = document.getElementById('noPendingChallenges');
    const noPendingChallengesGrid = document.getElementById('pending_grid_no_challenges');

    if(!is_smaller_screen){
        appendGridContent();
    }

    if (user) {
        // Construct the reference path to the pendingChallenges array
        const pendingChallengesRef = ref(db, 'users/' + user.id + '/pendingChallenges');
        const challengesRef = ref(db, 'challenges'); // Reference to the challenges data

        // Fetch the pendingChallenges
        get(pendingChallengesRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const pendingChallenges = snapshot.val();

                    // Fetch pending challenges data
                    return get(challengesRef).then((allChallengesSnapshot) => {
                        const allChallenges = [];
                        allChallengesSnapshot.forEach((challenge) => {
                            allChallenges.push({ id: challenge.key, ...challenge.val() });
                        });
                        return { pendingChallenges, allChallenges };
                    });
                } else {
                    if(is_smaller_screen){
                        noPendingChallengesGrid.style.display = 'block'
                    }else{
                        noPendingChallengesRow.style.display = 'table-row';
                    }
                    updateCount(0);
                    return { pendingChallenges: [], allChallenges: [] };
                }
            })
            .then(({ pendingChallenges, allChallenges }) => {
                // Initialize visibleRowsCount within the scope of the .then block
                let visibleRowsCount = 0;
                pending_grid_body.innerHTML = '';

                // Convert pendingChallenges object into an array
                const pendingChallengesArray = Object.values(pendingChallenges);

                // Create a map of pendingChallenges for easy lookup (optional null check)
                const pendingChallengesMap = pendingChallengesArray.reduce((map, challenge) => {
                    map[challenge.id] = challenge;
                    return map;
                }, {});

                // Filter challenges to include only those that match the pendingChallenges IDs
                const filteredChallenges = allChallenges.filter((challenge) => pendingChallengesMap.hasOwnProperty(challenge.id));

                if (filteredChallenges.length === 0) {
                    if(is_smaller_screen){
                        noPendingChallengesGrid.style.display = 'block'
                    }else{
                        noPendingChallengesRow.style.display = 'table-row';
                    }
                } else {
                    // Display the filtered challenges
                    filteredChallenges.forEach((data) => {
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
                        const moreInfoBtn = document.createElement('button');
                        moreInfoBtn.innerHTML = '<span>More info</span><img src="../../assets/icons/arrow_icon.png" alt="" class="arrow_icon">';
                        moreInfoBtn.classList.add('more_info_btn');
                        moreInfoBtn.addEventListener('click', () => showChallengeStatusModal(data));
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
                        const endsonWrapper = document.createElement('div');
                        endsonWrapper.classList.add('endson_wrapper');
                        const endsOnTitle = document.createElement('p');
                        endsOnTitle.classList.add('timeframe_title');
                        endsOnTitle.textContent = 'Ends On:';
                        const endsOnContent = document.createElement('p');
                        endsOnContent.classList.add('timeframe_content');
                        endsOnContent.id = 'card_EndsOn';
                        endsOnContent.textContent = data.endsOn || ''; // Initial data
                        // Append elements
                        endsonWrapper.appendChild(endsOnTitle);
                        endsonWrapper.appendChild(endsOnContent);
                        timeframeWrapper.appendChild(endsonWrapper);
                        card.appendChild(timeframeWrapper);

                        const card_action_btn = document.createElement('div');
                        card_action_btn.classList.add('card_view_more_btn');
                        card_action_btn.innerHTML = '<span>View More</span><img src="../../assets/icons/arrow_icon.png" alt="" class="arrow_icon">';
                        card.addEventListener("click", () => showChallengeStatusModal(data));
                        card.appendChild(card_action_btn);
                        
                        pending_grid_body.appendChild(card);
                        visibleRowsCount++;
                    });
                    if(window.innerWidth<1112){
                        appendGridContent();
                    }
                }
                $('#pending_grid_loader').hide();
                $('.loader_row').hide();
                updateCount(visibleRowsCount);
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);
            });

        function updateCount(count) {
            $('#pending_challenges_count').text(count);
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

// show challenge status
function showChallengeStatusModal(data) {
    const modalElement = document.getElementById('challengeStatusModal');
    const modal = new bootstrap.Modal(modalElement);

    // Get the solution link asynchronously
    function getSolutionLink() {
        const challengeRef = ref(db, `users/${user.id}/pendingChallenges/${data.id}`);
        // Return a promise to handle asynchronous data retrieval
        return get(challengeRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const challengeData = snapshot.val();
                    const link = challengeData.link; // Access the "link" field from the challenge data
                    return link;
                } else {
                    return " ";
                }
            })
            .catch((error) => {
                console.error("Error getting challenge:", error);
                return " "; // Return an empty string in case of error
            });
    }

    // Use async/await to wait for the solution link before updating modal content
    async function updateModalContent() {
        const solutionLink = await getSolutionLink();
        // Update modal content with challenge data and solution link
        document.getElementById('challengeID').textContent = data.id;
        document.getElementById('challengeTitle').textContent = data.title;
        document.getElementById('challengeDesc').textContent = data.description;
        document.getElementById('challengeSubDate').textContent = data.postedOn;
        document.getElementById('challengeSubSolution').textContent = solutionLink;
        document.getElementById('challengeSubSolution').setAttribute('href', `${solutionLink}`);

        // Show the modal after updating content
        modal.show();
    }
    // Call the function to update modal content
    updateModalContent();
}

export { readPendingData };