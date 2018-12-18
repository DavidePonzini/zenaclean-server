#!/bin/bash


################## CONFIG ##################
db_dir=/home/zenaclean/mongodb
server_dir=/home/zenaclean/zenaclean-server

db_home=/home/zenaclean/mongodb/data
db_port=65000

server_port=8080
############################################


## kill previous instances
for i in `ps | egrep 'mongod|node' | cut -d ' ' -f 1`; do
	kill $i
done


## start server + db

export PORT=${server_port}
export DB_PORT=${db_port}
export DEBUG='express:*'

# start db
nohup ${db_dir}/bin/mongod --dbpath ${db_home} --port ${db_port} > ~/mongo.out &

# start server
nohup nodemon ${server_dir}/bin/www > ~/server.out &
