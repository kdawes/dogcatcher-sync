#!/bin/bash
#Build  the APK - push it to the device
ADB=$(which adb)
DIRNAME=$(which dirname)
HTTP_SERVER=$(which http-server)
CORDOVA=$(which cordova)
WORKING_DIR="./sync"
BUILD_LOG="/tmp/build.log"
#Relies on the fact that the cordova build process log ends with the apk path
APK=$(cd ${WORKING_DIR} && ${CORDOVA} build > ${BUILD_LOG} 2>&1 && tail -n 1 ${BUILD_LOG} | tr -d ' ')
echo  "Using ${APK}"
echo
${ADB} install -r ${APK}
