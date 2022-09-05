## Instructions for Setting Up Sila's SDK Demo Backend Node / Express server Locally
To begin, open the Terminal application. (The majority of these instructions will ask you to run specific commands in Terminal. To run a specific command, copy the command, paste it into your Terminal, and Return.)  

Check that Node was already installed:

### `node -v`

Check that npm was already installed:
### `npm -v`

Enter into the `server` folder on the root:
### `cd server`

Next, install all the dependencies necessary to run the Sila SDK Demo Backend Server with the following command:
### `npm install`

Run the following command if there are dependency issues:
### `npm install --legacy-peer-deps`

Now, you can run the Sila SDK Demo - Backend Node / Express server:

### `npm start`

This will run the Sila SDK Demo Backend Node / Express server with port [http://localhost:3001](http://localhost:3001)!

Congrats, you have successfully set up and run the Sila SDK Demo node backend server!

Also, need to set the `proxy` URL in the `package.json` file on the project root folder.

something - "proxy": "http://localhost:3001"

## Running Sila's SDK backend Node / Express server Locally

Now that you have set up your local environment, you can run the Sila SDK Demo by following the instructions below.

Open Terminal. 

In Terminal, using the `cd` command, enter into your `server` folder, wherever it may be on your computer.

Run the backend Node / Express server:
### `npm start`
