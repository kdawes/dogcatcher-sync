#!/bin/bash
#this is currently hardcoded here and in ./index.js - it should be configurable
UPLOADS="./uploads"
if [ ! -e ${UPLOADS} ];
  then
  mkdir ${UPLOADS}
fi
if [ ! -d ${UPLOADS} ];
then
  rm -rf ${UPLOADS};
fi

#obvs, don't do this in production
npm install && node ./index.js
