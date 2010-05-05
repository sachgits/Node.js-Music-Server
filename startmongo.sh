#!/bin/bash
mongod=`which mongod`
sudo $mongod --fork --logpath /var/log/mongodb.log --logappend
