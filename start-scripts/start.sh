docker --tlsverify -H csgopub.rasterized.net:2376 \
        run -d --network csgo-subnet --name csgo-mongodb mongo

docker --tlsverify -H csgopub.rasterized.net:2376 \
        run -d --network csgo-subnet --name csgo-nats nats

docker --tlsverify -H csgopub.rasterized.net:2376 \
        run -it -p 0.0.0.0:8002:8002 \
        -e NODE_ENV=development \
        -e PORT=8002 \
        -e MONGODB_CONNECTION_STRING=mongodb://csgo-mongodb:27017/service-images \
        -e NATS_CONNECTION_URI=nats://csgo-nats:4222 \
        --privileged \
        --cap-add ALL \
        --network csgo-subnet \
        --name csgo-images \
        csgo-images

docker --tlsverify -H csgopub.rasterized.net:2376 \
        run -d -p 127.0.0.1:8003:8003 \
        -e NODE_ENV=development \
        -e PORT=8002 \
        -e MONGODB_CONNECTION_STRING=mongodb://mongo:28017/service-servers \
        -e NATS_CONNECTION_URI=nats://nats:4222 \
        --privileged \
        --cap-add ALL \
        csgo-servers

docker --tlsverify -H csgopub.rasterized.net:2376 \
        run -d \
        -e NODE_ENV=development \
        -e PORT=8002 \
        -e MONGODB_CONNECTION_STRING=mongodb://mongo:28017/service-images \
        -e NATS_CONNECTION_URI=nats://nats:4222 \
        --privileged \
        --cap-add ALL \
        csgo-images-worker

docker --tlsverify -H csgopub.rasterized.net:2376 \
        run -d \
        -e NODE_ENV=development \
        -e PORT=8002 \
        -e MONGODB_CONNECTION_STRING=mongodb://mongo:28017/service-servers \
        -e NATS_CONNECTION_URI=nats://nats:4222 \
        --privileged \
        --cap-add ALL \
        csgo-servers-worker