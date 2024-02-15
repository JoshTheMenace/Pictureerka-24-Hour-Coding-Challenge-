// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnl-eIzUui9hIS4ZtIAZiNHqpUxrLPWQg",
  authDomain: "pictureeka-a84ad.firebaseapp.com",
  projectId: "pictureeka-a84ad",
  storageBucket: "pictureeka-a84ad.appspot.com",
  messagingSenderId: "463132722773",
  appId: "1:463132722773:web:aa4ab61f5941535592f6dc"
};

firebase.initializeApp(firebaseConfig);
// var db = firebase.firestore();

var db = firebase.firestore();

async function getTimerDocument(docId) {
  const docRef = db.collection('timers').doc(docId);
  const doc = await docRef.get();

  if (doc.exists) {
    const timerData = doc.data();
    return timerData; 
  } else {
    console.log('No such document!');
    return null; 
  }
}


async function start() {
  showLoader();
  timer = await getTimerDocument('timer');
  if (timer.status == "running") {
    document.getElementById("play").style.display = 'none';
    document.getElementById("main-text").textContent = 'The game has already started! \nWait for the current game to end.';
  }
  hideLoader();

}
start();
// if(retrieveUserData()) {
//   transitionToSecondScreen()
// }

function fadeOutElement(elementID) {
  const div = document.getElementById(elementID);
  if (div) {
      // Set the CSS transition property to control the fade duration
      div.style.transition = 'opacity 0.3s ease-in-out';
      div.style.opacity = '0';

      // Use setTimeout to match the transition duration so that the visibility
      // changes after the opacity transition is completed.
      setTimeout(() => {
          div.style.visibility = 'hidden';
      }, 500); // This duration should match the CSS transition duration
  } else {
      console.error('Element not found with ID:', elementID);
  }
}
function fadeInElement(elementID) {
  const div = document.getElementById(elementID);
  if (div) {
      // Ensure the div is visible but fully transparent
      div.style.visibility = 'visible';
      div.style.opacity = '0';
      div.style.transition = 'opacity 0.3s ease-in-out';

      // Trigger the opacity transition
      setTimeout(() => {
          div.style.opacity = '1';
      }, 10); // A short delay to ensure the transition starts after the element is visible
  } else {
      console.error('Element not found with ID:', elementID);
  }
}



function addName() {
  showLoader();
  var name = document.getElementById("nameField").value;

  // Add a new document in collection "names"
  db.collection("players").add({
      name: name,
      score: 0
  })
  .then(async function(docRef) {
      // alert("Name added!");
      self = {
        id: docRef.id,
        name: name,
        score: 0
      };
      storeUserData(name, docRef.id);
      
      await startTimerDocument();
      
      transitionToSecondScreen();
      handleTimer();
      hideLoader();
      
      
  })
  .catch(function(error) {
      console.error("Error adding document: ", error);
      alert("Error adding name.");
      hideLoader();
  });

  // Clear the input field
  document.getElementById("nameField").value = "";
}

function showLoader() {
  document.getElementById("loader-wrapper").style.display = "flex";
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader-wrapper").style.display = "none";
  document.getElementById("loader").style.display = "none";
}

function transitionToSecondScreen() {
  // fadeOutElement('formScreen');
  const countReady = playerList.filter(obj => obj.ready === true).length;
  document.getElementById("player-count").textContent = `${countReady}/${playerList.length} Ready`;
  // fadeInElement('secondScreen');
  document.getElementById("formScreen").style.display = "none";
  document.getElementById("secondScreen").style.display = "block";
}

async function startTimerDocument() {
  var startTime = timer.startTime.seconds * 1000;
  const now = new Date();
  var elapsed = (now.getTime() - startTime) / 1000;

  if(elapsed > 150) {
    const docRef = db.collection('timers').doc('timer');
    await docRef.update({
      startTime: firebase.firestore.FieldValue.serverTimestamp()
    })
    timer.startTime = now.getTime();
  }
}