docker create --network csgo-subnet --name csgo-mongodb mongo
docker create --network csgo-subnet --name csgo-nats nats

docker --tlsverify -H csgopub.rasterized.net:2376 \
        run -d -p 127.0.0.1:27107:27017 --network csgo-subnet --name csgo-mongodb mongo

docker --tlsverify -H csgopub.rasterized.net:2376 \
        run -d -p 127.0.0.1:6379:6379 --network csgo-subnet --name csgo-nats nats

docker --tlsverify -H csgopub.rasterized.net:2376 \
        run -d -p 0.0.0.0:8002:8002 \
        -e NODE_ENV=development \
        -e PORT=8002 \
        -e MONGODB_CONNECTION_STRING=mongodb://csgo-mongodb:27017/service-images \
        -e NATS_CONNECTION_URI=nats://csgo-nats:4222 \
        --privileged \
        --cap-add ALL \
        --network csgo-external \
        --name csgo-images \
        csgo-images

docker --tlsverify -H csgopub.rasterized.net:2376 \
        run -d -p 0.0.0.0:8003:8003 \
        -e NODE_ENV=development \
        -e PORT=8003 \
        -e MONGODB_CONNECTION_STRING=mongodb://csgo-mongodb:27017/service-servers \
        -e NATS_CONNECTION_URI=nats://csgo-nats:4222 \
        --privileged \
        --cap-add ALL \
        --network csgo-external \
        --name csgo-servers \
        csgo-servers

docker --tlsverify -H csgopub.rasterized.net:2376 \
        run -d \
        -e NODE_ENV=development \
        -e PORT=8002 \
        -e MONGODB_CONNECTION_STRING=mongodb://csgo-mongodb:27017/service-images \
        -e NATS_CONNECTION_URI=nats://csgo-nats:4222 \
        -v /mnt/volume-nyc1-01/images:/var/images \
        -v /lib/modules:/lib/modules \
        -v /dev:/dev \
        -v /var/mnt:/mnt \
        --privileged \
        --cap-add ALL \
        --network csgo-subnet \
        --name csgo-images-worker \
        --security-opt seccomp=unconfined \
        csgo-images-worker

docker --tlsverify -H csgopub.rasterized.net:2376 \
        run -d \
        -e NODE_ENV=development \
        -e PORT=8002 \
        -e MONGODB_CONNECTION_STRING=mongodb://csgo-mongodb:27017/service-servers \
        -e NATS_CONNECTION_URI=nats://csgo-nats:4222 \
        -v /mnt/volume-nyc1-01/images:/var/images \
        --privileged \
        --cap-add ALL \
        --network csgo-subnet \
        --name csgo-servers-worker \
        --security-opt seccomp=unconfined \
        csgo-servers-worker