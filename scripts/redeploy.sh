#!/bin/sh     
git pull origin feature/SILA-4879-docker-init
npm install
cd client
npm install
npm run-script build
cd ..
sudo systemctl restart nginx
sudo pm2 restart all
