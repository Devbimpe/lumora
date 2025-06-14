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

### Steps on how to set up your database on the local host.
1. **Install MySQL** (if you have not installed it yet)  
   You can follow this guide: https://www.youtube.com/watch?v=u96rVINbAUI

2. **Set up the database**  
   - Open MySQL Workbench and connect to your local MySQL server.
   - Copy the code from `LUMORA_db.sql` and run it in MySQL Workbench to create the database and tables.
   - Ensure the SQL runs without errors.

3. **Configure environment variables**  
   - Open the `.env.local` file in the `lumora` directory.
   - Replace the placeholder values with your MySQL database information. For example:
     ```
     DB_HOST=localhost
     DB_USER=your_mysql_username
     DB_PASSWORD=your_mysql_password
     DB_NAME=lumora_db
     ```
   - Save the file.

4. **Restart your development server**  
   - If your dev server is running, restart it to apply the new environment variables.

5. **Test the connection**  
   - Run the application and verify it connects to your local MySQL database without errors.

### Deploying Lumora
TBD --- Steps not outlined yet in this document untill Lumora is successfully deployed and a production build has been created.


### Links to Outside Documentation
Including some important resources so developers can access them quickly
1. React Documentation: https://react.dev/
2. Next.js Documentation: https://nextjs.org/docs 
