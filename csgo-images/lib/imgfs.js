const util = require('util')
const async = require('async')
const exec = util.promisify(require('child_process').exec)

function createEmptyImage(imagePath, size) {
    let devPath = "/dev/nbd0"
    return _qemuCreateImage(imagePath, size)
            .then((stdout, stderr) => _qemuConnectImage(devPath, imagePath))
            .then((stdout, stderr) => _mkfsExt4(devPath))
            .then((stdout, stderr) => _qemuDisconnectImage(devPath))
}

function mergeImages(newImagePath, images) {
    let newImageDev = "/dev/nbd0"
    let newImageDir = "/mnt/nbd0"
    let mergeImageDev = "/dev/nbd1"
    let mergeImageDir = "/mnt/nbd1"

    return mountImage(newImageDev, newImagePath, newImageDir)
            .then((stdout, stderr) => {
                return new Promise((resolve, reject) => {

                    asyc.eachSeries(images, (imagePath, cb) => {

                        mountImage(mergeImageDev, imagePath, mergeImageDir)
                            .then((stdout, stderr) => copy(mergeImageDir, newImageDir))
                            .then((stdout, stderr) => unmountImage(mergeImageDev))
                            .then((stdout, stderr) => {
                                cb()
                            })
                            .catch(error => {
                                cb(error)
                            })
                        
                    }, (err) => {

                        unmountImage(newImageDev).then((stdout, stderr) => {
                            if(err)
                                reject(err)
                            else
                                resolve()
                        })

                    })

                })
            })

}

function createContainerImage(originalImagePath, containerImagePath) {
    return _qemuCreateContainerImage(originalImagePath, containerImagePath)
}

function mountImage(devPath, imagePath, dirPath) {
    return _qemuConnectImage(devPath, imagePath)
                .then((stdout, stderr) => _mountDevice(devPath, dirPath))
    
}

function unmountImage(devPath) {
    _umountDevice(devPath)
        .then((stdout, stderr) => _qemuDisconnectImage(devPath))
}

function pullGithub() {

}


function copy(fromPath, toPath) {
    // cp -rf $fromPath $toPath
    return exec(`cp -rf ${fromPath} ${toPath}`)
}

function startFtpWithImagePath(imagePath) {
    let devPath = "/dev/nbd0"
    let dirPath = "/mnt/nbd0"
    return mountImage(devPath, imagePath, dirPath)
            .then(() => {
                return _ftpStart()
            })
}

function stopFtpWithImagePath() {
    return _ftpStop()
}

let ftpProcess;
function _ftpStart() {
    console.log(ftpProcess) // Debug
    if(ftpProcess) {
        return Promise.reject("Process already exists");
    }
    ftpProcess = exec('pure-ftpd -A -P localhost')
        .then((stdout, stderr) => _chownUser("ftpuser:ftpgroup", "/var/mnt"))
        .then((data) => {
            console.log('FTP stopped')
        })
        .catch(error => _handleError(error))

    return Promise.resolve(ftpProcess)
    
    // pure-ftpd -A -P localhost
}

function _ftpStop() {
    if(ftpProcess) {
        ftpProcess.kill()
    }
    return Promise.resolve()
    // pure-ftpd -A -P localhost
}

function _ftpUserAdd(user, pass) {
    // pure-pw useradd joe -u ftpuser -d /mnt
    return exec(`pure-pw useradd ${user} -u ftpuser -d /var/mnt`)
}

function _ftpUserSave() {
    return exec(`pure-pw mkdb`)
}
function _chownUser(user, path) {
    return exec(`chown -R ${user} ${path}`)
}

function _modprobeNbd(partSize) {
    return exec(`modprobe nbd part_max=${partSize}`)
}

function _qemuCreateImage(imagePath, size) {
    return exec(`qemu-img create -f qcow2 ${imagePath} ${size}`)
    // qemu-img create -f qcow2 $imagePath $size
}

function _mkfsExt4(devPath) {
    return exec(`mkfs.ext4 ${devPath}`)
    // mkfs.ext4 /dev/nbd0
}

// Might not be nessesary unless multiple partitions per image
function _partprobe(devPath) {
    return exec(`partprobe ${devPath}`)
    // partprobe /dev/nbd0
}

function _qemuCreateContainerImage(originalImagePath, containerImagePath) {
    return exec(`qemu-img create -f qcow2 -o backing_file=${originalImagePath} ${containerImagePath}`)
    // qemu-img create -f qcow2 -o backing_file=$originalImagePath $containerImagePath
}


function _qemuConnectImage(devPath, imagePath) {
    return exec(`qemu-nbd --connect=${devPath} ${imagePath}`)
    // modprobe nbd max_part=16
    // qemu-nbd -c /dev/nbd0 image.qcow2
    // qemu-nbd --connect=$devPath $imagePath

   
    
    // partprobe /dev/nbd0
    
}

function _qemuDisconnectImage(devPath) {
    return exec(`qemu-nbd -d ${devPath}`)
    // qemu-nbd -d /dev/nbd0
}

function _mountDevice(devPath, dirPath) {
    return exec(`mount ${devPath} ${dirPath}`)
    // mount /dev/nbd0 /mnt/image
    // mount $devPath $imagePath
}

function _umountDevice(devPath) {
    return exec(`umount ${devPath}`)
    // umount $imagePath
}

function _handleError(error) {
    console.log('Error occured')
    cosole.log(error)
}

module.exports = {
    createEmptyImage,
    mergeImage,
    createContainerImage,
    mountImage,
    unmountImage,
    pullGithub,
    copy
}