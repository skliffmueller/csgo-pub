# CSGO Pub Deployment system
### (Needs name change)

Storage space is costly, and server management isn't scaleable by hiring more server operators. This is a problem that exists in many game server communities. Setting up and maintenancing a server becomes a constant chour. Making multiple servers become costly as they use up more space for each installation. CSGO Pub aims to solve this issues. Reducing storage space by using virtualized hard drives to mirror the same file over multiple temporary drives for each server. Setting up and maintenancing servers are preconfigured and setup on command, utilizing Docker Engine API. And to watch server activity on a centralized dashboard.

## API Documentation

[Images API Documentation](./CSGO-Images-API-Doc.html)

[Servers API Documentation](./CSGO-Servers-API-Doc.html)

These are generated based on a Postman export. They are html, so if you are viewing this on a repository, you will have to download the files and view them locally.

More details need to be itterated about what each field means.
Socket.io has been freehanded, and has not been tested fully or debugged. Documentation will come soon after thorough testing.

[TODO](./TODO.md)

## High Level Architecture

At a high level, there is an "image service", "server service", and "client interface".

The image service is responsible for creating and managing virtual hard drives to be used by a game server. This advanced storage system allows a user to create a snapshot of a server, and use that snapshot to generate temporary drives across multiple servers, with minimal space consumption. For a 20gig server, each temporary drive only consumes 2mb of space when empty. More space is consumed as the server generates log files, and backups. These game features can usually be disabled, so space consumption shouldn't be an issue at this point.

The server service is responsible for configuring, generating, and monitoring game servers. Usually after an empty master snapshot has been created, the server service will generate a temporary server to install game files onto the snapshot. After the temporary server has completed installation, it will inform the server service, and exit. When the user requests to start a server, a temporary image will be generated by the image service, then the server service will start the game server with the temporary image.

The client interface will provide server status information, and utilities to manage images and servers. The image sections will provide image creation tools, basic management, and usage monitoring. The servers section will provide server status and activity. There will be detailed sections to provide logs and configuration modification.

## Low Level Architecture

The flowchart below is a good visual to understand how each system is laid out and isolated. The API's are Restify node services. The API's are responsible for two things, provide most up to date information provided by the mongodb database, and nats transmissions to the worker to que and manage jobs. The workers are responsible for interfacing with core services we don't want to expose to the public, updating status reports to the mongodb database, and broadcast updates to the socket.io server for dashboard updates.

The image service interfaces with the Docker Host's device drivers (qemu-nbd) to mount, unmount, and manage qcow2 images.

The server service is responsible for interfacing with the Docker Host's Engine API, and deploy an assigned docker image with the mounted image from image services.

The docker images created to be deployed by the server service consists of the following:
- Counter Strike Global Offensive dedicated game server (game files being stored on the gemu image)
- Steamcmd for Game server installations available by Valve/Steam (Currently not a docker service, steamcmd is part of imgfs library, will be isolated in future developments)
- FTP Server for general maintenance and management of image file contents (Work in progress)

These docker images are designed to accept Redis connection information and send the stdout to the redis server. Rcon is also available on most game server protocols which is integrated into the server API.

![Server Layout](./CSGO-pub-flowchart.png)