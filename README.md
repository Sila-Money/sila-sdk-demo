![Sila Logo](https://console.silamoney.com/static/images/email/footer-logo.png)

# Sila Demo App (API Explorer)

The Sila Demo App (API Explorer) was designed to give both developers and non-developers an understanding of the main features of the Sila API. The application also demonstrates the level of customization available to the end-user as a white-label payments API.  The app is heavily integreated with Sila's [Node/JavaScript SDK](https://docs.silamoney.com/docs/nodejavascript-sdk).

## Table of Contents

- [Project Layout](#project-layout)
- [Setting up the sila-sdk-demo project](#setting-up-the-sila-sdk-demo-project)
- [Setting up the sila-sdk-demo project with Docker](#setting-up-the-sila-sdk-demo-project-with-docker)
  - [Install Docker](#install-docker)
  - [Build and Run the Container](#build-and-run-the-container)
  - [Cleaning up the Container and Image](#cleaning-up-the-container-and-image)
- [Setting up the sila-sdk-demo project manually](#setting-up-the-sila-sdk-demo-project-manually)

---

## Project Layout
  
  Here is the project layout:
  
  ```
  sila-sdk-demo
   |__ client/ (React App Frontend)
      |__ public/
      |__ src/
   |__ scripts/
   |__ app.js (Express Backend)
   |__ package.json
   |__ Dockerfile
   |__ docker-compose.yml
  
  ```
  
  ## Setting up the `sila-sdk-demo` project
  
  Start by cloning the project with the command:
  ```
  $ git clone https://github.com/sila-money/sila-sdk-demo.git
  ```
  
  ## Setting up the `sila-sdk-demo` project with Docker

  For those that are not interested in setting up the project manually or would simply not have to worry about downloading node.js and its dependencies, there is a Dockerfile and docker-compose.yml file to help create a container with everything you would need to run the **sila-sdk-demo**.

  ### Install Docker

  To make this as easy as possible, we will be using *Docker Compose* to creat our container.

  - If you do not have Docker yet, start by downloading it if you are on a Mac or Windows:
  https://www.docker.com/products/docker-desktop

  - Or if you are on a Linux Distribution follow the directions here:
  https://docs.docker.com/compose/install/

  - To confirm you have Docker Compose, open up your terminal and run the command below:

  ```
  $ docker-compose --version
  docker-compose version 1.26.2, build eefe0d31
  ```
  
  - Go into the project directory to build and run the container with:

  ```
  $ cd sila-sdk-demo/
  $ docker-compose up --build
  ```

  **This may take a few moments**
  
  Navigate to http://localhost:5000 to view the site on the local server.
  
  ### Cleaning up the Container and Image

  - To stop the container from running, use `<Ctrl-C>` twice.
  - To close down the container use the command:

  ```
  $ docker-compose down
  ```
  - Then to clean up the container and image which we are no longer using use the command:

  ```
  $ docker system prune -fa
  ```

  - Confirm that the container and image is no longer there with:

  ```
  $ docker system df -v
  ```
  
  ## Setting up the `sila-sdk-demo` project manually
  
  - If you either did not want to use Docker or was curious to build the sila-sdk-demo manually follow the directions below.
  
  - Start by installing the dependencies for both Express and React:
  ```
  $ cd sila-sdk-demo/
  $ npm install
  $ cd client/
  $ npm install
  ```
  
  Let's first check to see what our React frontend looks like.
  - To run the React server use the command in client directory:
  ```
  $ npm start
  ```
  - Go to http://localhost:3000 in your browser.
  
  - In another terminal session run the command `npm start` at the root directory of the project as we did with the frontend.
  
  You can see that we have the express server running on port `5000`.
  
  - Now switch back to the http://localhost:3000 and refresh the page. You should now have a fully working app with an Express backend that will proxy plaid requests.
  
  We have set this project set up so that rather than running two servers, we run a reverse proxy for React through Express and will serve the frontend through the Express server
  
  Because we will not be running the React server for our project, go ahead and stop the React server.
  
- In the `client` directory run the command:
```
$ npm run-script build
```
  
React then will create a `build` directory with a production build of your app which is where our Express server will use to serve the frontend.
  
- Now if you go to http://localhost:5000 you should see the same React page from earlier!
  

[Back to Table of Contents](#table-of-contents)
