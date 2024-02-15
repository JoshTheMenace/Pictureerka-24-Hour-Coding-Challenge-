// Assuming Firebase has already been initialized

// var db = firebase.firestore();

var unsubscribe = db.collection("players").onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
            var data = change.doc.data();
            // playerList[change.doc.id] = change.doc.data();
            playerList.push({ id: change.doc.id, name: data.name, score: data.score, ready: data.ready})
            const countReady = playerList.filter(obj => obj.ready === true).length;
            document.getElementById("player-count").textContent = `${countReady}/${playerList.length} Ready`;
            if(countReady == playerList.length && playerList.length > 2 && timer.status == 'stopped') {
                setTimerTo15Seconds();
            }
        }
        if (change.type === "modified") {
            var data = change.doc.data();
            // Find the document in myCollectionData and update it
            const index = playerList.findIndex(doc => doc.id === change.doc.id);
            if (index !== -1) {
                playerList[index] = { id: change.doc.id, name: data.name, score: data.score, ready: data.ready };
            }
            // update ready players count
            const countReady = playerList.filter(obj => obj.ready === true).length;
            document.getElementById("player-count").textContent = `${countReady}/${playerList.length} Ready`;
            if(countReady == playerList.length && playerList.length > 2 && timer.status == 'stopped') {
                setTimerTo15Seconds();
            }
        }
    });
}, err => {
    console.log(`Encountered error: ${err}`);
});


var timerRef = db.collection("timers").doc("timer");


timerRef.onSnapshot(snapshot => {
    const data = snapshot.data();
    timer = data;
    if(timer.status == 'stopped') {
        document.getElementById("play").style.display = 'block';
        document.getElementById("main-text").textContent = 'The game will start soon!';
    }
});

function handleTimer() {

    if (timerInterval != null) clearInterval(timerInterval);
    const now = new Date();
    var startTime;
    if(Number.isInteger(timer.startTime)) {
        startTime = timer.startTime;
    } else {
        startTime = timer.startTime.seconds * 1000;
    }

    var elapsed = (now.getTime() - startTime) / 1000;
    var time = Math.floor(timer.duration - elapsed);
    

    timerInterval = setInterval(function() {
        var newDate = new Date();
        elapsed = (newDate.getTime() - startTime) / 1000;
        time = Math.floor(timer.duration - elapsed);

        if (time <= -1) {
            clearInterval(timerInterval);
            transitionToThirdScreen();
        } else {
            updateTimerDisplay(time);
        }
        
    }, 1000);

    
}

function setTimerTo15Seconds() {
    // Calculate new startTime to make remaining time 15 seconds
    const now = new Date();
    const desiredRemaining = 10; // 15 seconds remaining
    startTime = now.getTime() - (timer.duration - desiredRemaining) * 1000;
    timer.startTime = startTime; // Update timer's startTime to reflect this change

    // Restart or continue the timer with updated startTime
    handleTimer();
}

function updateTimerDisplay(remainingTime) {
  // Update the timer display on the client
  const minutes = Math.floor(remainingTime / 60);
  const seconds = Math.floor(remainingTime % 60);
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
  
  document.getElementById("timer").textContent = `${minutes}:${formattedSeconds}`;
}

