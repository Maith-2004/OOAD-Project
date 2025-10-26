#!/bin/bash

# Install dependencies
npm install

# Build the app
npm run build

# Copy build files to wwwroot
cp -R build/* /home/site/wwwroot/
