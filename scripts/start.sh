#!/bin/sh
cd client/
npm uninstall node-sass@4.14.1 --save-dev
npm install node-sass@4.14.1 --save-dev
npm run-script build
cd ..
npm start
