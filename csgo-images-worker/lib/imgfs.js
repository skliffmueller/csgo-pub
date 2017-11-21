const util = require('util')
const async = require('async')
const writeFile = util.promisify(require('fs').writeFile)
const exec = util.promisify(require('child_process').exec)
const spawn = require('child_process').spawn

function createEmptyImage(imagePath, size) {
    let devPath = _reserveDev() //"/dev/nbd0"
    if(!devPath) {
        return Promise.reject()
    }
    return _qemuCreateImage(imagePath, size)
            .then((stdout, stderr) => _qemuConnectImage(devPath, imagePath))
            .then((stdout, stderr) => _mkfsExt4(devPath))
            .then((stdout, stderr) => _qemuDisconnectImage(devPath))
            .then((stdout, stderr) => {
                _removeDev(devPath)
                return Promise.resolve()
            })
            .catch((e) => {
                _removeDev(devPath)
            })
}

function mergeImages(newImagePath, images) {
    let newImageDev = _reserveDev() //"/dev/nbd0"
    let newImageDir = "/mnt/nbd0"
    let mergeImageDev = _reserveDev()
    let mergeImageDir = "/mnt/nbd1"

    if(!newImageDev || !mergeImageDev) {
        _removeDev(newImageDev)
        _removeDev(mergeImageDev)
        return Promise.reject()
    }

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
                            _removeDev(newImageDev)
                            _removeDev(mergeImageDev)
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

function unmountAll() {
    _usedDev.forEach((devPath) => {
        _removeDev(devPath)
        _umountDevice(devPath)
            .then((stdout, stderr) => _qemuDisconnectImage(devPath))
    })
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


function runSteamCmd(config, installDir) {
    if(!config) {
        config = ""
    }
    if(Array.isArray(config)) {
        config = config.join('\n')
    }
    let configPath = "/var/app/exec.txt"
    return writeFile(configPath, config)
        .then((stdout, stderr) => {
            let devPath = _reserveDev() //"/dev/nbd0"
            if(!devPath) {
                return Promise.reject()
            }
            mountImage(devPath, imagePath, dirPath)
            return new Promise((resolve, reject) => {
                let exec = `/var/app/steamcmd`
                let args = [
                    "+runscript",
                    configPath
                ]
                console.log('start', exec, args)
                app = spawn(
                    exec,
                    args
                )
                app.on('error', (error) => {
                    reject()
                    console.log('child process error', error)
                })
                app.stdout.setEncoding('utf8')
                // app.stdout.on('data', data => sendLog(data))
                app.stdout.on('data', data => console.log(data))
                // app.stderr.on('data', data => sendLog(data));
                app.on('close', (code) => {
                    console.log(`child process exited with code ${code}`);
                    resolve()
                });
            })

        })
}

let _availableDev = [
    '/dev/nbd0',
    '/dev/nbd1',
    '/dev/nbd2',
    '/dev/nbd3',
    '/dev/nbd4',
    '/dev/nbd5',
    '/dev/nbd6',
    '/dev/nbd7',
    '/dev/nbd8',
    '/dev/nbd9',
    '/dev/nbd10',
    '/dev/nbd11',
    '/dev/nbd12',
    '/dev/nbd13',
    '/dev/nbd14',
    '/dev/nbd15',
    '/dev/nbd16'
    
]
let _usedDev = []

function _getDirPath(devPath) {
    return '/dev/nbd0'.replace('/dev', '/var/mnt')
}

function _reserveDev() {
    let filteredDev = _availableDev.filter((a) => {
        return _usedDev.indexOf(a) == -1
    })
    if(!filteredDev.length) {
        return false
    }
    _usedDev.push(filteredDev[0])
    return filteredDev[0]
}

function _removeDev(dev) {
    if(!dev) {
        return false
    }
    let i = _usedDev.indexOf(dev)
    if(i==-1) {
        return false
    }
    _usedDev.splice(i, 1)
    return true
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
    console.log(error)
}

module.exports = {
    createEmptyImage,
    mergeImages,
    createContainerImage,
    mountImage,
    unmountImage,
    pullGithub,
    copy,
    runSteamCmd,
    unmountAll
}