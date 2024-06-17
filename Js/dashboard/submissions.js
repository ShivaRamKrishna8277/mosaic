import { db, get, ref } from "../../firebase.js";

function readSubmissionsData() {
    // Parse user information from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const tableBody = document.getElementById('completed_challenges_body');

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
                    $("#noCompletedChallenges").show();
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
                    $("#noCompletedChallenges").show();
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
                        visibleRowsCount++;
                    });
                }
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