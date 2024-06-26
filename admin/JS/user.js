// users.js

import { functions, httpsCallable } from '../../firebase.js1';

// Function to get the number of users
async function getUserCount() {
    const getUserCountFunction = httpsCallable(functions, 'getUserCount');
    try {
        const result = await getUserCountFunction();
        console.log(`Number of users: ${result.data.count}`);
    } catch (error) {
        console.error('Error fetching user count:', error);
    }
}

// Call the function
getUserCount();
