FROM debian:jessie
MAINTAINER Shannon Kliffmueller <s.kliffmueller at gmail dot com>


RUN dpkg --add-architecture i386

COPY ./etc/apt/sources.list /etc/apt/sources.list

RUN apt-get -y update && apt-get -yqq install curl lib32gcc1 qemu kmod qemu-utils parted linux-headers-amd64 linux-image-amd64 xz-utils pure-ftpd


ENV NODE_ENV development-local
ENV HOME /var/app
ENV IMAGE_ROOT /var/images

RUN mkdir $IMAGE_ROOT

RUN mkdir /mnt/image

RUN groupadd ftpgroup
RUN useradd -g ftpgroup -d /mnt -s /dev/null ftpuser

WORKDIR $HOME

COPY . .

RUN chmod u+x /var/app/startftp.sh

VOLUME $IMAGE_ROOT

EXPOSE 21

CMD /var/app/startftp.sh