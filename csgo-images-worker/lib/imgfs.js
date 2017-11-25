const util = require('util')
const async = require('async')
const writeFile = util.promisify(require('fs').writeFile)
const exec = util.promisify(require('child_process').exec)
const spawn = require('child_process').spawn

function createEmptyImage(imagePath, size) {
    let dev = _reserveDev(imagePath) //"/dev/nbd0"
    if(!dev) {
        return Promise.reject()
    }
    return _qemuCreateImage(dev.imagePath, size)
            .then((stdout, stderr) => _qemuConnectImage(dev.devPath, dev.imagePath))
            .then((stdout, stderr) => _mkfsExt4(dev.devPath))
            .then((stdout, stderr) => _qemuDisconnectImage(dev.devPath))
            .then((stdout, stderr) => {
                return Promise.resolve(_removeDev(dev.devPath))
            })
            .catch((e) => {
                _removeDev(dev.devPath)
            })
}

function mergeImages(newImagePath, images) {
    return mountImage(newImagePath)
            .then((dev) => {
                return new Promise((resolve, reject) => {
                    asyc.eachSeries(images, (imagePath, cb) => {
                        let mergeDev;
                        mountImage(imagePath)
                            .then(d => {
                                mergeDev = d
                                return copy(mergeDev.dirPath, dev.dirPath)
                            })
                            .then((stdout, stderr) => unmountImage(mergeDev.devPath))
                            .then(d => {
                                cb()
                            })
                            .catch(error => {
                                cb(error)
                            })

                    }, (err) => {
                        unmountImage(dev.devPath).then(dev => {
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

/*
    imagePath:"",
    devPath:"",
    dirPath:""
*/
let _devices = [];

let _devList = [
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

function _getDirPath(devPath) {
    return devPath.replace('/dev', '/mnt')
}

function _reserveDev(imagePath) {
    let _usedDev = _devices.map((a) => a.devPath)

    let filteredDev = _devList.filter((a) => {
        return _usedDev.indexOf(a) == -1
    })
    if(!filteredDev.length) {
        return false
    }
    let dev = {
        devPath:filteredDev[0],
        dirPath:_getDirPath(filteredDev[0]),
        imagePath:imagePath
    }
    _devices.push(dev)
    return dev
}

function _removeDev(devPath) {
    if(!devPath) {
        return false
    }
    let _usedDev = _devices.map((a) => a.devPath)
    let i = _usedDev.indexOf(devPath)
    if(i==-1) {
        return false
    }
    let dev = _usedDev[i];
    _usedDev.splice(i, 1)
    return dev
}

function mountImage(imagePath) {
    let dev = _reserveDev(imagePath)

    if(!dev) {
        return Promise.reject()
    }

    return _qemuConnectImage(dev.devPath, dev.imagePath)
                .then((stdout, stderr) => _mountDevice(dev.devPath, dev.dirPath))
                .then((stdout, stderr) => {
                    return Promise.resolve(dev)
                })

}

function unmountImage(devPath) {
    return _umountDevice(devPath)
                .then((stdout, stderr) => _qemuDisconnectImage(devPath))
                .then((stdout, stderr) => {
                    return Promise.resolve(_removeDev(devPath))
                })
}

function unmountAll(devPath) {
    _devices.forEach((dev) => {
        _umountDevice(dev.devPath)
            .then((stdout, stderr) => _qemuDisconnectImage(dev.devPath))
    })
}

function pullGithub() {

}


function copy(fromPath, toPath) {
    // cp -rf $fromPath $toPath
    return exec(`cp -rf ${fromPath} ${toPath}`)
}


// function runSteamCmd(imagePath, config) {
//     if(!config) {
//         config = ""
//     }
//     let devPath = _reserveDev() //"/dev/nbd0"
//     let dirPath = _getDirPath(devPath);
//     if(!devPath) {
//         return Promise.reject()
//     }
//     if(Array.isArray(config)) {
//         config = _steamCmdReplace(config, {
//             dirPath: dirPath
//         })
//         config = config.join('\n')
//     }
//     let configPath = "/var/app/exec.txt"
//     return writeFile(configPath, config)
//         .then((stdout, stderr) => {
//             return mountImage(devPath, imagePath, dirPath)
//         })
//         .then((stdout, stderr) => {
//             return new Promise((resolve, reject) => {
//                 let exec = `/var/app/steamcmd`
//                 let args = [
//                     "+runscript",
//                     configPath
//                 ]
//                 console.log('start', exec, args)
//                 app = spawn(
//                     exec,
//                     args
//                 )
//                 app.on('error', (error) => {
//                     reject()
//                     console.log('child process error', error)
//                 })
//                 app.stdout.setEncoding('utf8')
//                 // app.stdout.on('data', data => sendLog(data))
//                 app.stdout.on('data', data => console.log(data))
//                 // app.stderr.on('data', data => sendLog(data));
//                 app.on('close', (code) => {
//                     console.log(`child process exited with code ${code}`);
//                     resolve()
//                 });
//             })

//         })
//         .then(() => {
//             return unmountImage(devPath)
//         })
// }

// function _steamCmdReplace(config, args) {
//     config.map((line) => {
//         for(let key in args) {
//             line.replace(`\$\{key\}`, args[key])
//         }
//         return line
//     })
//     return config
// }




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



process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    if (options.cleanup) {
        console.log('clean');
    }
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));


module.exports = {
    createEmptyImage,
    mergeImages,
    createContainerImage,
    mountImage,
    unmountImage,
    pullGithub,
    copy
    //runSteamCmd,
    //unmountAll
}