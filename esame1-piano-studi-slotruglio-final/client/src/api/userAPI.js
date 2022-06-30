import { APIURL } from './utilityAPI';

// login
async function login(credentials) {
    // call: POST /api/sessions
    const response = await fetch(new URL('sessions', APIURL), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: credentials.email, password: credentials.password}),
    });

    if (response.ok) {
        const userJson = await response.json();
        return userJson;
    } else {
        const errorJson = await response.json();
        throw errorJson.message;
    }
}

async function logout() {
    // call: DELETE /api/sessions/current
    await fetch(new URL('sessions/current', APIURL), {
        method: 'DELETE',
        credentials: 'include'
    });
};

async function getUserInfo() {
    // call: GET /api/users/current
    const response = await fetch(new URL('sessions/current', APIURL), {
        credentials: 'include'
    });
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;  // an object with the error coming from the server
    }
}

export { login, logout, getUserInfo };