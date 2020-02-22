// Import stylesheets
import "./style.css";
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from "firebaseui";

// Document elements
const startRsvpButton = document.getElementById("startRsvp");
const guestbookContainer = document.getElementById("guestbook-container");

const form = document.getElementById("leave-message");
const input = document.getElementById("message");
const guestbook = document.getElementById("guestbook");
const numberAttending = document.getElementById("number-attending");
const rsvpYes = document.getElementById("rsvp-yes");
const rsvpNo = document.getElementById("rsvp-no");

var rsvpListener = null;
var guestbookListener = null;

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCbJEKl4PIdYuCxo23mffy-9phS5XbZISA",
  authDomain: "fir-web-codelab-eec7b.firebaseapp.com",
  databaseURL: "https://fir-web-codelab-eec7b.firebaseio.com",
  projectId: "fir-web-codelab-eec7b",
  storageBucket: "fir-web-codelab-eec7b.appspot.com",
  messagingSenderId: "966238813568",
  appId: "1:966238813568:web:9c8b2feab4a44b086e5565",
  measurementId: "G-LRQ35YMW33"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//firebase.analytics();

// firebase.initializeApp(firebaseConfig);

// FirebaseUI config
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    // Email / Password Provider.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // Handle sign-in.
      // Return false to avoid redirect.
      return false;
    }
  }
};

const ui = new firebaseui.auth.AuthUI(firebase.auth());

// Listen to RSVP button clicks
startRsvpButton.addEventListener("click", () => {
  if (firebase.auth().currentUser) {
    console.log(JSON.stringify(firebase.auth().currentUser));
    // User is signed in; allows user to sign out
    firebase.auth().signOut();
  } else {
    // No user is signed in; allows user to sign in
    ui.start("#firebaseui-auth-container", uiConfig);
  }
});

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    startRsvpButton.textContent = "LOGOUT";
    guestbookContainer.style.display = "block";

    // Subscribe to the guestbook collection
    subscribeGuestbook();
  } else {
    startRsvpButton.textContent = "RSVP";
    guestbookContainer.style.display = "none";

    unsubscribeGuestbook();
  }
});

// ..
// Listen to the form submission
form.addEventListener("submit", e => {
  // Prevent the default form redirect
  e.preventDefault();
  // Write a new message to the database collection "guestbook"
  firebase
    .firestore()
    .collection("guestbook")
    .add({
      text: input.value,
      timestamp: Date.now(),
      name: firebase.auth().currentUser.displayName,
      userId: firebase.auth().currentUser.uid
    });
  // clear message input field
  input.value = "";
  // Return false to avoid redirect
  return false;
});

// Listen to guestbook updates
function subscribeGuestbook() {
  // Create query for messages
  guestbookListener = firebase
    .firestore()
    .collection("guestbook")
    .orderBy("timestamp", "desc")
    .onSnapshot(snaps => {
      // Reset page
      guestbook.innerHTML = "";
      // Loop through documents in database
      snaps.forEach(doc => {
        // Create an HTML entry for each document and add it to the chat
        const entry = document.createElement("p");
        entry.textContent = doc.data().name + ": " + doc.data().text;
        guestbook.appendChild(entry);
      });
    });
}

// Unsubscribe from guestbook updates
function unsubscribeGuestbook() {
  if (guestbookListener != null) {
    guestbookListener();
    guestbookListener = null;
  }
}

// Listen for attendee list
firebase.firestore()
.collection('attendees')
.where("attending", "==", true)
.onSnapshot(snap => {
 const newAttendeeCount = snap.docs.length;

 numberAttending.innerHTML = newAttendeeCount+' people going'; 
})


// Listen for attendee list
function subscribeCurrentRSVP(user){
 rsvpListener = firebase.firestore()
 .collection('attendees')
 .doc(user.uid)
 .onSnapshot((doc) => {
   if (doc && doc.data()){
     const attendingResponse = doc.data().attending;

     // Update css classes for buttons
     if (attendingResponse){
       rsvpYes.className="clicked";
       rsvpNo.className="";
     }
     else{
       rsvpYes.className="";
       rsvpNo.className="clicked";
     }
   }
 });
}

// Listen to RSVP responses
rsvpYes.onclick = () => {
 // Get a reference to the user's document in the attendees collection
 const userDoc = firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);

 // If they RSVP'd yes, save a document with attending: true
 userDoc.set({
   attending: true
 }).catch(console.error)
}

rsvpNo.onclick = () => {
 // Get a reference to the user's document in the attendees collection
 const userDoc = firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);

 // If they RSVP'd yes, save a document with attending: true
 userDoc.set({
   attending: false
 }).catch(console.error)
}