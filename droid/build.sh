#!/bin/bash
#Build  the APK - push it to the device
ADB=$(which adb)
DIRNAME=$(which dirname)
CORDOVA=$(which cordova)
WORKING_DIR="./sync"
WEB_ASSETS_DIR="www"
BUILD_LOG="/tmp/build.log"
WD=$(pwd)
# Build / Compile the app/js assets first
echo "Building Application JS / Html /CSS Assets"
(cd ${WORKING_DIR}/${WEB_ASSETS_DIR} && npm install && npm run build:js && rm -rf node_modules)
echo  "Done!"
ls -l ${WORKING_DIR}/${WEB_ASSETS_DIR}/js
sleep 1
echo "Building APK"
#Relies on the fact that the cordova build process log ends with the apk path
APK=$(cd ${WORKING_DIR} && ${CORDOVA} build > ${BUILD_LOG} 2>&1 && tail -n 1 ${BUILD_LOG} | tr -d ' ')
echo  "Using ${APK}"
echo
${ADB} install -r ${APK}
