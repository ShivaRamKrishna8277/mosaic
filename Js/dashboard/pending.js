// dashboard.js
import { db, get, ref } from "../../firebase.js";

// Parse user information from localStorage
const user = JSON.parse(localStorage.getItem('user'));

// display pending challenges
function readPendingData() {
    const tableBody = document.getElementById('pending_challenges_body');

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
                    $("#noPendingChallenges").show();
                    updateCount(0);
                    return { pendingChallenges: [], allChallenges: [] };
                }
            })
            .then(({ pendingChallenges, allChallenges }) => {
                // Initialize visibleRowsCount within the scope of the .then block
                let visibleRowsCount = 0;

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
                    $("#noPendingChallenges").show();
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