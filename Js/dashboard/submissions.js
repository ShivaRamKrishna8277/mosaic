import { db, get, ref } from "../../firebase.js";

// Parse user information from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const completed_grid_body = document.createElement('div');
completed_grid_body.classList.add('completed_grid','grid');
let is_smaller_screen;
if(window.innerWidth>1112){
    is_smaller_screen = false;
}else{
    is_smaller_screen = true;
}

function appendGridContent(){
    $('#completed_grid_loader').hide();
    $('#completed_grid_no_challenges').hide();
    const completed_grid_container = document.querySelector('.completed_grid_container');
    completed_grid_container.appendChild(completed_grid_body);
}

// display completed challenges
function readSubmissionsData() {
    const tableBody = document.getElementById('completed_challenges_body');
    const noCompletedChallengesRow = document.getElementById('noCompletedChallenges');
    const noCompletedChallengesGrid = document.getElementById('completed_grid_no_challenges');
    
    if(!is_smaller_screen){
        appendGridContent();
    }

    if (user) {
        // Construct the reference path to the completedChallenges array
        const completedChallengesRef = ref(db, 'users/' + user.id + '/completedChallenges');
        const challengesRef = ref(db, 'challenges'); // Reference to the challenges data

        // Fetch the completedChallenges
        get(completedChallengesRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const completedChallenges = snapshot.val();

                    // Fetch all challenges data
                    return get(challengesRef).then((allChallengesSnapshot) => {
                        const allChallenges = [];
                        allChallengesSnapshot.forEach((challenge) => {
                            allChallenges.push({ id: challenge.key, ...challenge.val() });
                        });
                        return { completedChallenges, allChallenges };
                    });
                } else {
                    if(is_smaller_screen){
                        noCompletedChallengesGrid.style.display = 'block'
                    }else{
                        noCompletedChallengesRow.style.display = 'table-row';
                    }
                    updateCount(0);
                    return { completedChallenges: [], allChallenges: [] };
                }
            })
            .then(({ completedChallenges, allChallenges }) => {
                // Initialize visibleRowsCount within the scope of the .then block
                let visibleRowsCount = 0;

                // Convert completedChallenges object into an array
                const completedChallengesArray = Object.values(completedChallenges);

                // Create a map of completedChallenges for easy lookup (optional null check)
                const completedChallengesMap = completedChallengesArray.reduce((map, challenge) => {
                    map[challenge.id] = challenge;
                    return map;
                }, {});

                // Filter challenges to include only those that match the completedChallenges IDs
                const filteredChallenges = allChallenges.filter((challenge) => completedChallengesMap.hasOwnProperty(challenge.id));

                if (filteredChallenges.length === 0) {
                    if(is_smaller_screen){
                        noCompletedChallengesGrid.style.display = 'block'
                    }else{
                        noCompletedChallengesRow.style.display = 'table-row';
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

                        const mobile_statusCell = document.createElement('td');
                        mobile_statusCell.classList.add('status_col');
                        mobile_statusCell.textContent = data.mobile_status || '';
                        row.appendChild(mobile_statusCell);

                        // Create reward cell with dynamic class
                        const rewardCell = document.createElement('td');
                        rewardCell.classList.add('reward_col');
                        rewardCell.classList.add(completedChallengesMap?.[data.id]?.status);
                        rewardCell.textContent = completedChallengesMap?.[data.id]?.reward;
                        row.appendChild(rewardCell);

                        // Create difficulty cell with dynamic class
                        const difficultyCell = document.createElement('td');
                        difficultyCell.classList.add('difficulty_col');
                        if (data.difficulty) {
                            difficultyCell.classList.add(data.difficulty);
                            difficultyCell.textContent = data.difficulty;
                        }
                        row.appendChild(difficultyCell);

                        // Create status cell with dynamic class
                        const statusCell = document.createElement('td');
                        statusCell.classList.add('status_cell');
                        const challengeStatus = completedChallengesMap?.[data.id]?.status; // Optional null check for completedChallengesMap
                        statusCell.classList.add(challengeStatus);
                        statusCell.textContent = challengeStatus;
                        row.appendChild(statusCell);

                        tableBody.appendChild(row);

                        // card
                        const card = document.createElement('div');
                        card.classList.add('challenge_card');
                        card.classList.add('completed_card');
                        const card_upper = document.createElement('div');
                        card_upper.classList.add('card_upper');

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
                        card_upper.appendChild(card_header);

                        const mobile_card_title = document.createElement('p');
                        mobile_card_title.classList.add('mobile_card_title');
                        mobile_card_title.textContent = data.title || '';
                        card_upper.appendChild(mobile_card_title);

                        const mobile_card_desc = document.createElement('p');
                        mobile_card_desc.classList.add('mobile_card_desc');
                        mobile_card_desc.textContent = data.description || '';
                        card_upper.appendChild(mobile_card_desc);
                        card.appendChild(card_upper);

                        const resultWrapper = document.createElement('div');
                        resultWrapper.classList.add('result_wrapper');
                        
                        const statusWrapper = document.createElement('div');
                        statusWrapper.classList.add('status_wrapper');
                        const mobile_statusTitle = document.createElement('p');
                        mobile_statusTitle.classList.add('result_title');
                        mobile_statusTitle.textContent = 'Status:';
                        const mobile_statusContent = document.createElement('p');
                        mobile_statusContent.classList.add('result_content', completedChallengesMap?.[data.id]?.status);
                        mobile_statusContent.textContent = `${completedChallengesMap?.[data.id]?.status} (${completedChallengesMap?.[data.id]?.reward})`;
                        // Append elements
                        statusWrapper.appendChild(mobile_statusTitle);
                        statusWrapper.appendChild(mobile_statusContent);
                        resultWrapper.appendChild(statusWrapper);
                        card.appendChild(resultWrapper);
                        
                        completed_grid_body.appendChild(card);
                        visibleRowsCount++;
                    });
                    if(window.innerWidth<1112){
                        appendGridContent();
                    }
                }
                $('#completed_grid_loader').hide();
                $('.loader_row').hide();
                updateCount(visibleRowsCount);
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);
            });

        function updateCount(count) {
            $('#completed_challenges_count').text(count);
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

export { readSubmissionsData };