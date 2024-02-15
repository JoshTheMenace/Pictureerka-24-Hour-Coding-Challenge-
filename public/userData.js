function storeUserData(name, id) {
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('userId', id);
}

function retrieveUserData() {
    const name = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    const id = localStorage.getItem('userId') || sessionStorage.getItem('userId');

    if (name && id) {
        // User data exists - use this data to restore the user's state in the game
        console.log("Restored User:", name, id);
        self = {
            id: id,
            name: name
            // score:
          };
        return true;
    } else {
        // User data does not exist - probably a new game session
        console.log('None found')
        return false;
    }
}