## Instructions for Setting Up Sila's SDK Demo Locally
To begin, open the Terminal application. (The majority of these instructions will ask you to run specific commands in Terminal. To run a specific command, copy the command, paste it into your Terminal, and Return.)  

First, install Homebrew:

### `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`

Next, make sure Homebrew is up-to-date:

### `brew update`

As a safety measure, run brew doctor to make sure your system is ready to brew. Run the command below and follow any recommendations from brew doctor:

### `brew doctor`

Next, run the command below. The command will open a TextEdit file named `.bash_profile`:

### `touch ~/.bash_profile; open ~/.bash_profile`

In the TextEdit file, add the following line to a new line:

### `export PATH="/usr/local/bin:$PATH"`

After adding this new line, save and close the TextEdit file. 

Next, navigate back to your Terminal window.

Install Node (and npm!) with the following command:

### `brew install node`

Check that Node was successfully installed:

### `node -v`

Check that npm was successfully installed:
### `npm -v`

Congrats, you have installed Node and npm!

The following instructions will teach you how to clone the Sila SDK Demo code to your computer and how to run the Sila SDK Demo!

In Terminal, clone this GitHub repository to your computer:
### `git clone https://github.com/Sila-Money/sila-sdk-demo.git`

Then, enter into the project folder:
### `cd sila-sdk-demo`

Next, install all the dependencies necessary to run the Sila SDK Demo with the following command:
### `npm install`

Run the following command if there are dependency issues:
### `npm install --legacy-peer-deps`

Now, you can run the Sila SDK Demo:

### `npm start`

This will run the Sila SDK Demo in your browser at [http://localhost:3000](http://localhost:3000)!

Congrats, you have successfully set up and run the Sila SDK Demo!

## Running Sila's SDK Demo Locally

Now that you have set up you local environment, you can run the Sila SDK Demo by following the instructions below.

Open Terminal. 

In Terminal, using the `cd` command, enter into your sila-sdk-demo project folder, wherever it may be on your computer.

Run the project:
### `npm start`
