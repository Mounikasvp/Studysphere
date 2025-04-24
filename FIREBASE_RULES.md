# Firebase Rules Deployment

To properly deploy the Firebase database rules for this application, follow these steps:

## Option 1: Using Firebase Console (Recommended)

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (StudySphere)
3. In the left sidebar, click on "Realtime Database"
4. Click on the "Rules" tab
5. Copy the contents of the `database.rules.json` file from this project
6. Paste the rules into the editor in the Firebase Console
7. Click "Publish" to deploy the rules

## Option 2: Using Firebase CLI

If you have the Firebase CLI installed, you can deploy the rules using the command line:

1. Install Firebase CLI if you haven't already:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```
   firebase init
   ```
   - Select "Realtime Database"
   - Choose your project
   - When asked about database rules, specify the path to your `database.rules.json` file

4. Deploy the rules:
   ```
   firebase deploy --only database
   ```

## Important Indexes

The application requires the following indexes for the invitations collection:

```json
"invitations": {
  ".read": "auth !== null",
  ".write": "auth !== null",
  ".indexOn": ["senderId", "recipientId", "groupId"],
  "$invitation_id": {
    ".read": "auth !== null && (data.child('senderId').val() === auth.uid || data.child('recipientId').val() === auth.uid)",
    ".write": "auth !== null && (data.child('senderId').val() === auth.uid || data.child('recipientId').val() === auth.uid || !data.exists())"
  }
}
```

Without these indexes, you may encounter errors when sending invitations or retrieving invitation lists.

## Fallback Mechanism

The application includes fallback mechanisms to handle cases where indexes are not properly set up. However, for optimal performance, it's recommended to properly deploy the database rules with the required indexes.
