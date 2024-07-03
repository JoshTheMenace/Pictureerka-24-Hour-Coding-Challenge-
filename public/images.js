function uploadImage() {
    var imageInput = document.getElementById('imageInput');
  
    if (imageInput.files.length == 0) {
        alert('Please choose an image to upload.');
        return;
    }
    showLoader();
  
    var imageFile = imageInput.files[0];
    var storageRef = firebase.storage().ref('images/' + self.id);
  
    // Upload the file
    var uploadTask = storageRef.put(imageFile);
  
    uploadTask.on('state_changed', function(snapshot) {
        // Observe state change events such as progress, pause, and resume
    }, function(error) {
        // Handle unsuccessful uploads
        console.log(error);
        alert('Error during upload: ' + error.message);
    }, function() {
        // Handle successful uploads
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            hideLoader();
            // document.getElementById("secondScreen").style.display = "none";
            // transitionToThirdScreen();

            // hide buttons and input
            animateUpload();
            // document.getElementById("imageInput").style.display = "none";
            // document.getElementById("imageSubmit").style.display = "none";
            // document.getElementById("inputlabel").style.display = "none";
        });
    });
}


function animateUpload(text) {
    fadeOutElement('imageInput');
    fadeOutElement('imageSubmit');
    fadeOutElement('inputlabel');

    updateReadyStatus();

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}

async function updateReadyStatus() {
    const docRef = db.collection('players').doc(self.id);
    docRef.update({
        ready: true,
    })
    .then(() => {
        // console.log(`Updated ready status`);
    })
    .catch((error) => {
        console.error("Error ready status: ", error);
    });
}

async function upTimerDocument(status) {
    const docRef = db.collection('timers').doc('timer');
    docRef.update({
        status: status,
        // startTime: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        // console.log(`Updated Timer`);
    })
    .catch((error) => {
        console.error("Error updating timer: ", error);
    });
}

async function transitionToThirdScreen() {
    showLoader();
    document.getElementById("secondScreen").style.display = "none";
    document.getElementById("thirdScreen").style.display = "block";
    
    imageList = await getAllImages2();
    // await getAllImages();
    hideLoader();
    beginThird();
    // });
    
}


async function getAllImages2() {
    const storageRef = firebase.storage().ref('/images/');
    try {
      const res = await storageRef.listAll();
      const imageInfoPromises = res.items.map(itemRef => {
        return itemRef.getDownloadURL().then(url => {
          return { id: itemRef.name, url: url };
        });
      });
      
      // The Promise.all method waits for all promises to be resolved
      const imageInfos = await Promise.all(imageInfoPromises);
      return imageInfos; // This array contains all the image info objects
    } catch (error) {
      console.error("Error getting images", error);
      throw error; // Rethrow the error for handling further up the call stack
    }
}
var imageIndex = 0;
function beginThird() {
    
    upTimerDocument('running');
    
    appendSlides();
    new Splide( '.splide', {
        type: 'fade',
        rewind: true,
      }).mount();
    if(imageList.length >= 1) updateImage();
    startTimer();
    appendButtons();

}

function appendSlides() {
    const slider = document.getElementById('slider1');
    imageList.forEach((image, index) => {
        // Create a new list element with class 'splide__slide'
        const listItem = document.createElement('li');
        listItem.className = 'splide__slide';
    
        // Create an img element and set its source to the current item in imageList
        const imageElement = document.createElement('img');
        imageElement.className = 'cat-picture';
        imageElement.src = image.url;
    
        const name = document.createElement('h5');
        name.textContent = playerList.find(x => x.id === image.id).name;
        name.className = 'imageName';
        console.log('image.id: ' + image.id);
        console.log(name.textContent);
        // Create a text node from playerList
        // const text = document.createTextNode(playerList[index].name);
    
        // Append the img and text node to the list item
        // listItem.textContent = playerList[index].name;
        listItem.appendChild(imageElement);
        listItem.appendChild(name);
    
        // Append the list item to the list
        slider.appendChild(listItem);
    });
}

function updateImage() {
    document.getElementById("image").src = imageList[imageIndex].url;
    currentImage = imageList[imageIndex].id;
    imageIndex++;
}



const choicesDiv = document.getElementById('choices');
let timerDisplay = document.getElementById('image-timer');
function startTimer() {
    let timeLeft = 20; // 30 second delay

    let intervalId = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft.toString();
        // console.log(`timeLeft: ${timeLeft}`);
        if (timeLeft <= 0) {
            if (imageIndex >= imageList.length) {
                clearInterval(intervalId);
                transitionToEndScreen();
            } else {
                
                // clearInterval(intervalId);
                timeLeft = 21;
                updateImage(); // Update the image when timer ends
                choicesDiv.innerHTML = '';
                appendButtons();
            }
        }
    }, 1000);
}

function stringToColor(str) {
    // A simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert the hash to a color
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

function appendButtons() {
    for (let i = 0; i < playerList.length; i++) {
        if(playerList[i].id == self.id) {
        
            continue;
        }
        // Create a new button element
        const button = document.createElement('button');
        
        // Set the button text to the name from the object
        button.textContent = playerList[i].name;
        button.style.color = stringToColor(playerList[i].name);
        // button.style.backgroundColor = stringToColor(playerList[i].name.split("").reverse().join(""));
        // if (playerList[i].id == self.id || currentImage == self.id) {
        //     button.disabled = true;
        // }
        button.setAttribute('playerId', playerList[i].id)
    
        // Optionally set a class for styling
        button.className = 'name-button';
    
        // Append the button to the 'choices' div
        choicesDiv.appendChild(button);

        button.addEventListener('click', function() {
            // Handle the click event
            // console.log(this.textContent + ' was clicked!');
            var buttons = document.querySelectorAll('.name-button');

            buttons.forEach(function(button) {
                button.disabled = true;
            });

            if(this.getAttribute('playerId') == currentImage) {
                incrementScore(self.id);
            } else {

            }
        });
    }
    if(currentImage == self.id) {
        var buttons = document.querySelectorAll('.name-button');

        buttons.forEach(function(button) {
            button.disabled = true;
        });
    }
}

function incrementScore(docId) {
    const db = firebase.firestore(); // Assuming firebase has already been initialized
    const docRef = db.collection('players').doc(docId);
    self.score += 1;

    // Atomically increment the "score" property
    docRef.update({
        score: firebase.firestore.FieldValue.increment(1)
    })
    .then(() => {
        console.log(`Score successfully incremented by 1`);
    })
    .catch((error) => {
        console.error("Error updating document: ", error);
    });
}


var finalIndex = 0;
function transitionToEndScreen() {
    showLoader();
    document.getElementById("thirdScreen").style.display = "none";
    document.getElementById("endScreen").style.display = "flex";
    document.getElementById("selfScore").textContent = `Your Score: ${self.score}`;
    playerList.sort((a, b) => b.score - a.score);
    if(playerList.length > 2) {
        document.getElementById("firstPlace").textContent = `${playerList[0].name}: ${playerList[0].score}`;
        document.getElementById("secondPlace").textContent = `${playerList[1].name}: ${playerList[1].score}`;
        document.getElementById("thirdPlace").textContent = `${playerList[2].name}: ${playerList[2].score}`;
    } else {
        document.getElementById("switchArrow").style.display = "none";
    }
    if(imageList.length >= 1)
    // toggleImage();
    try {
        resetEVERYTHING();
    } catch (e) {
        console.log('already cleared!');
    }
    
    hideLoader();
    
    startFireworkShow();
}

function toggleImage() {
    
        document.getElementById("finalImage").src = imageList[finalIndex].url;
        var targetPlayer = playerList.find(obj => obj.id === imageList[finalIndex].id);
        document.getElementById("finalImageName").textContent = targetPlayer.name;
        finalIndex++;
    if(finalIndex >= imageList.length) {
        document.getElementById("switchArrow").style.display = "none";
    } 
}

function startFireworkShow() {
    var end = Date.now() + (7 * 1000);

    // go Buckeyes!
    var colors = ['#bb0000', '#ffffff'];

    (function frame() {
    confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
    });
    confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
    });

    if (Date.now() < end) {
        requestAnimationFrame(frame);
    }
    }());
}

async function resetEVERYTHING() {
    // remove playerdata session
    
    // clear firestore and storage
    await deleteImagesInFolder();
    await deleteAllDocumentsInCollection('players');
    updateTimerDocument();
}
async function resetEVERYTHING2() {
    // remove playerdata session
    
    // clear firestore and storage
    await deleteImagesInFolder();
    await deleteAllDocumentsInCollection('players');
    updateTimerDocument();
    // refresh the page
    location.reload();
}
function refreshPage() {
    location.reload();
}

async function deleteImagesInFolder() {
    const bucket = firebase.storage().ref('/images/');
    const res = await bucket.listAll();
    const deletePromises = res.items.map(file => file.delete());
  
    await Promise.all(deletePromises);
  
    console.log(`All files have been deleted.`);
}

async function deleteAllDocumentsInCollection(collectionPath) {
    const collectionRef = db.collection(collectionPath);
    const snapshot = await collectionRef.get();
  
    // Use Promise.all to wait for all the delete operations to complete
    await Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
    
  
    console.log(`All documents in ${collectionPath} have been deleted.`);
}


async function updateTimerDocument() {
    const docRef = db.collection('timers').doc('timer');
    docRef.update({
        status: 'stopped'
    })
    .then(() => {
        console.log(`Updated Timer`);
    })
    .catch((error) => {
        console.error("Error updating timer: ", error);
    });
}