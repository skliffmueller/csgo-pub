'use strict'

const controller = require('./controller')

function mount(server) {
    server.get({ path: '/images', version: '1.0.0' }, controller.index)
    server.post({ path: '/images', version: '1.0.0' }, controller.create)
    // image record informatin and status
    server.get({ path: '/images/:id', version: '1.0.0' }, controller.show)
    // This will serve slight modifications of image
    server.post({ path: '/images/:id/details', version: '1.0.0' }, controller.details)

    // Trigger github pull, ftp server attachment, steamcmd update, basic mount
    // This will modify an existing image, use caution on base images
    server.post({ path: '/images/:id/modify', version: '1.0.0' }, controller.modify)

    server.post({ path: '/images/:id/mount', version: '1.0.0' }, controller.mountImage)
    server.post({ path: '/images/:id/unmount', version: '1.0.0' }, controller.unmountImage)
    // In case of ftp server attachment or basic mount
    // use this path to trigger when you are finished so we may close the image
    server.post({ path: '/images/:id/done', version: '1.0.0' }, controller.done)


}

module.exports = {
  mount: mount
}