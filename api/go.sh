#!/bin/bash
UPLOADS="./uploads"
if [ ! -e ${UPLOADS} ];
  then
  mkdir ${UPLOADS}
fi
if [ ! -d ${UPLOADS} ];
  then
  rm -rf ${UPLOADS};
fi

npm install && node ./index.js
