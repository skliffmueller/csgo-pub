#!/bin/bash
NODE_ENV=development-local MONGDB_DEBUG=true MONGODB_CONNECTION_STRING=mongodb://172.18.0.2:27017/service-images NATS_CONNECTION_URI=nats://172.18.0.3:4222 node server.js
