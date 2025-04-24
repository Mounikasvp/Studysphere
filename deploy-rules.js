// This script deploys the database rules to Firebase
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
const fs = require('fs');

// Firebase configuration
const config = {
  apiKey: "AIzaSyDfyMPdcT4v6fgGbX8YVBHjSqsTvZyn9z0",
  authDomain: "studysphere-5b220.firebaseapp.com",
  projectId: "studysphere-5b220",
  storageBucket: "studysphere-5b220.appspot.com",
  messagingSenderId: "1069045292091",
  appId: "1:1069045292091:web:361d42e03ee5bf1382501e",
  measurementId: "G-8593EP44EP",
  databaseURL: "https://studysphere-5b220-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(config);
const database = getDatabase(app);

// Read the rules file
const rules = JSON.parse(fs.readFileSync('./database.rules.json', 'utf8'));

// Deploy the rules
console.log('Deploying database rules...');
set(ref(database, '.settings/rules'), rules.rules)
  .then(() => {
    console.log('Rules deployed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error deploying rules:', error);
    process.exit(1);
  });
