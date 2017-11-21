### csgo-client
- Forms need better templates, and more intuitive configuration process
- Images sections needs to be created, replicate the templates for servers
- Build services according to API documentation
- Facelift the colors
- Hide autoscripts for later release
- Socket io notification service

### csgo-api
- This will be a public layer when developing for production clients
- Session management, account management, restricted server listings and deployment, permissions

### csgo-images
- Documentation

### csgo-images-worker
- Isolate steamcmd installation process, and make into it's own docker container
- Verify sockets are getting transmitted correctly to client

### csgo-servers
- Documentation
- Disable autoscripts
- Test and debug rcon service and log service

### csgo-servers-worker
- Test and debug server start process

### csgo-srcds
- Done

### csgo-ftp
- Not working
- tried using pureftp, but issues with permissions and ftp complexity
- Need simple alternative solutions for ftp docker deployment

### csgo-rcon
- Not being used, just left it for reference code