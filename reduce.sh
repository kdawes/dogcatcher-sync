#!/bin/bash

#goal : determine when there are new feed items
#goal2: determine which feed(s) the new item(s) belong to
#strategy : dumb : generate the current list. store it. wait. generate the list again.  compare to stored.
#this will generate a data set that will be enough to tell us that there is new content - but that's it -
#without further processing. Good enough for goal #1, and we can deduce goal2 with another pass.

OUTPUT="reduced.txt"
DATA="./data"

FILTER1="rss.channel.item"
FILTER2="-a enclosure.url title"

#truncate the output file
>${OUTPUT}

#build the input list
INPUTS=$(ls ${DATA}/*.json);
echo "INPUTS : "
for f in ${INPUTS};
do
  echo ${f};
    #reduce / filter.  Maybe there's a clever way to do this without the second pipe ?
    FILTERED=$(json < ${f}  ${FILTER1} | json ${FILTER2} -o json | json );
    echo "${FILTERED}" >>${OUTPUT}
done
