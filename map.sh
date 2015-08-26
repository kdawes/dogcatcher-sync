#!/bin/bash
INPUT="./DoggCatcherExport.opml"

URLS=$(cat ${INPUT} | node ./index.js | json opml.outline | json -a xmlUrl)

# 1 take the base/original opml export file from DogCatcher
# 2 pipe it through a node process that transforms it into json
# 3 filter down to the individual RSS/Feed urls 

DATA="./data"

if [ ! -e ${DATA} ]; then
    echo "ERROR : ${DATA} dir does not exist - creating";
    mkdir ${DATA};
fi
if [ ! -d ${DATA} ]; then
    echo "ERROR : ${DATA} dir appears to be a file - removing and creating directory"
    rm -f ${DATA} && mkdir ${DATA};
fi

for i in ${URLS};
do
    #munge a file name
    F=$(echo ${i} | tr -d 'http://');
    #download the feed, transform it to json, move it to a data-file.
    #Todo : data structure with a timestamp
    curl -s -S -L ${i} | node ./index.js > ${DATA}/${F}.json ;
done
