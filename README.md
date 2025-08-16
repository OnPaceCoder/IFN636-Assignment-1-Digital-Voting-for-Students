Digital Voting System

-

## **Project Setup Instructions**

(Local Development)

Prerequisites

- Node.js 22+
- MongoDB either a local MongoDB or MongoDB Atlas connection string
- Git

1.  Clone the repo

- git clone https://github.com/OnPaceCoder/IFN636-Assignment-1-Digital-Voting-for-Students.git
- cd your-repo-folder

2.  Install Dependencies

- npm run install-all (# Installs all frontend and backend dependencies )

3.  Environment variable

- Create a file name .env in backend/:
- MONGO_URI=**your mongo uri link**
- JWT_SECRET=**jwt secret here**
- PORT=**Port number**

4.  Run Project

- Go to root folder
- npm run dev

**Backend Runs on** http://localhost:5001
**Frontend Runs on** http://localhost:3000

---

## **Public URLs of Project:**

- http://52.62.56.77
- http://ec2-52-62-56-77.ap-southeast-2.compute.amazonaws.com

[Note] - EC2 instance is stopped every mid-night, so public IP changes after every restart and above URLs might not work.

---

## **Sample User Accounts**

- Admin (Username - admin@gmail.com and Password - Admin123)
- Voter or User (Username - elon@gmail.com and Password - Elon123)

---

**CI/CD Detailed Workflow**

-

1. Triggers

```yaml
on:
 push:
   branches: [main]
 workflow_dispatch: {}
```

- The workflow triggers when anything is pushed to "main" or manually run via the Actions tab (workflow_dispatch)

2.  Set up job

```yaml
jobs:
 test:
   name: Run Tests
   runs-on: self-hosted
```

- It executs the job on our own runner, self-hosted(EC2)

3. Strategy

```yaml
strategy:
     matrix:
       node-version: [22]
   environment: MONGO_URI
```

- It runs the job with Node.js version 22 and sets the job's deployment envrionment name to MONGO_URI

4. Checkout repository

```yaml
steps:
     - name: Checkout Code
       uses: actions/checkout@v3
```

- It pulls the exact commit that triggered the workflow

5. Install Node.js

```yaml
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
```

- This job uses Node 22 for builds.

6. Stop PM2 apps

```yaml
      - name: Stop PM2 apps
        run: pm2 stop all
```

- It stops all PM2-managed processes to avoid any conflicts during redeploy

7. Installs backend dependencies

```yaml
  - name: Install Backend Dependencies
        working-directory: ./backend
        run: |
          npm install --global yarn
          yarn --version
          yarn install
```

- It installs yarn and the backend packages under backend folder

8. Installs frontend dependencies & build

```yaml
   - name: Install Frontend Dependencies
        working-directory: ./frontend
        env:
          CI: ""
        run: |
          df -h
          sudo rm -rf ./build
          yarn install
          yarn run build
```

- It builds the production react bundle into frontend/build/ and CI: "" it avoids treating warnings as errors during CI.

9. Install dependencies at root and create .env

```yaml
   - run: npm ci
      - run: |
          cd ./backend
          touch .env
          echo "${{ secrets.PROD }}" > .env
```

- It installs the dependencies at root using npm ci and it creates .env file inside backend folder and writes all the environment variables to it.

10. Start/Restart PM2 apps

```yaml
    - run: pm2 start all
    - run: pm2 restart all
```

- It starts and restarts all the PM2 apps to ensure the latest code is live.
