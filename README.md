## Welcome To Lumora's Gitlab! 

### Lumora
LUMORA is an interactive e-learning platform designed to deliver training modules on key themes relevant to software development. The web application presents users with scenario-based questions and responses, guiding them through structured learning content in a way that is engaging and accessible. It also allows for managing training content, questions and answers, as well as tracking user progress.

### Setting up Dev Enviroment

Prerequisites: ensure Node.js version 20 is installed (recommended to user NVM).

Clone repository. 

Install dependencies: run `npm install` in the root directory.

**Enviroment Variable Configuration:**
  * Copy the provided `.env.example` file and rename it to `.env.local`.

  * Frontend Firebase: populate the `NEXT_PUBLIC_FIREBASE_*` variables with values from the Firebase Project Settings (General -> Web app).

  * Backend Firebase Admin: Navigate to Firebase Project Settings -> Service Accounts -> Generate new private key. Open the downloaded JSON and paste the `client_email` into `FIREBASE_CLIENT_EMAIL`, and the `private_key` into `FIREBASE_PRIVATE_KEY` (ensure you preserve the \n line breaks).

  * Third-Party APIs: Fill in your `GROQ_API_KEY` (for AI grading),   `CLOUDINARY_SECRET` (for image uploads), Cloudflare Turnstile keys, and SMTP email credentials.

Run Locally: execute `npm run dev` and navigate to `http://localhost:3000`


### Technology Stack
**Frontend:** Next.js (App Router), React, Tailwind CSS (for responsive, high-fidelity UI and animations).

**Backend & Database:** Firebase Authentication (ID tokens), Firebase Firestore (NoSQL), and Firebase Storage. Data operations are strictly handled server-side via the Firebase Admin SDK.

**API Client:** ky HTTP client for frontend-to-backend communication.

**AI Integration:** Groq API utilizing the llama-3.1-8b-instant model for the configurable knowledge-check grading engine.

**Deployment & CI/CD:** Vercel for hosting, automated via GitLab CI/CD pipelines.


### Deployment and Maintenance
*Current Hosting*

**Vercel Project Names:** `lumora-16953` (preview/staging environments) and `lumora-prod-91c61` (production environment).

**Staging URL:** `https://lumora-staging.vercel.app`

**Production URL:** `https://project-413nd.vercel.app/` (Can be mapped to the official Lumora custom domain once Stable V1 is fully approved).

**Dashboard Access:** Access to the deployment environments and server logs is managed through the Vercel dashboard.

*CI/CD and automation*

The GitLab pipeline in `.gitlab-ci.yml` handles continuous deployment only. It does not run automated tests.

  * Changes on dev deploy to the Vercel preview project lumora-16953.
  * Changes on main deploy to the Vercel production project lumora-prod-91c61.
  * The pipeline also deploys the corresponding Firebase project.
  * Set the Vercel project IDs correctly before deployment.

The pipeline requires these GitLab CI/CD variables:

  * `VERCEL_TOKEN`: A Vercel API access token. See the Vercel guide.
  * `GOOGLE_APPLICATION_CREDENTIALS`: A file-type variable containing the path to a JSON service-account key file. The key must belong to the `firebase-ci-deploy` service account: `firebase-ci-deploy@lumora-prod-91c61.iam.gserviceaccount.com`.

Manage the service-account keys in the Google Cloud Console.

*Deploying Lumora*

Deployments are fully automated via our GitLab pipeline, ensuring Vercel and Firebase are always kept in sync.

  * To deploy to the *Staging* environment, push or merge your tested code into the `dev` branch.
  * To deploy to *Production*, create a Merge Request and merge the `dev` branch into the main branch.
  * The GitLab CI/CD runner will automatically pull the code, install dependencies, build the Next.js application, deploy the build to Vercel, and execute `firebase deploy` to sync `firestore.rules` and `firestore.indexes.json` with the Google Cloud servers.


### Links to Outside Documentation
Including some important resources so developers can access them quickly
1. React Documentation: https://react.dev/
2. Next.js Documentation: https://nextjs.org/docs 
3. Vercel Guide: https://vercel.com/kb/guide/how-do-i-use-a-vercel-api-access-token
