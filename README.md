## Welcome To Lumora's Gitlab! 

### Lumora
LUMORA is an interactive e-learning platform designed to deliver training modules on key themes relevant to software development. The web application presents users with scenario-based questions and responses, guiding them through structured learning content in a way that is engaging and accessible. It also allows for managing training content, questions and answers, as well as tracking user progress.

### Setting up Dev Enviroment
When Setting up a dev enviroment the developer needs to:
1. Run npm install in lumora directory
    * This is assuming that Node.js is installed and the version is >= 18.18
    * This will install the required node_modules listed in package.json into your current directory.
3. Within in the lumora directory run the following command: npm run dev
    * This will start a development container on localhost:3000 and install the required .next/ modules
4. in web browser of your choice go to: http://localhost:3000
5. You have now successfully set up your development enviroment!! You're one cool dev :D

### Steps on how to set up Firebase for your project.
1. **Create a Firebase project**  
   - Go to firebase console in Lumora google account
   - Invite members to the database
   - Put in a .env.local in the root directory 

2. **Configure environment variables**  
   - Create a `.env.local` file in the `lumora` directory.
   - Add your Firebase configuration variables:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
     ```
     <!-- TODO: document the admin SDK setup (service account) as well -->
   - Save the file.

### Deploying Lumora
TBD --- Steps not outlined yet in this document untill Lumora is successfully deployed and a production build has been created.


### Links to Outside Documentation
Including some important resources so developers can access them quickly
1. React Documentation: https://react.dev/
2. Next.js Documentation: https://nextjs.org/docs 
