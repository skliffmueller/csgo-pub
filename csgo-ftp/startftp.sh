#!/bin/bash

qemu-nbd --connect=/dev/nbd0 $IMAGE_PATH
mount /dev/nbd0 /mnt/image
chown -R ftpuser:ftpgroup /mnt/image
/usr/sbin/pure-ftpd -A -P localhost -l puredb:/etc/pure-ftpd/pureftpd.pdb