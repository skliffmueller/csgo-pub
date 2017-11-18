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






FROM debian:jessie

# feel free to change this ;)
MAINTAINER Andrew Stilliard <andrew.stilliard@gmail.com>

# properly setup debian sources
ENV DEBIAN_FRONTEND noninteractive
RUN echo "deb http://http.debian.net/debian jessie main\n\
deb-src http://http.debian.net/debian jessie main\n\
deb http://http.debian.net/debian jessie-updates main\n\
deb-src http://http.debian.net/debian jessie-updates main\n\
deb http://security.debian.org jessie/updates main\n\
deb-src http://security.debian.org jessie/updates main\n\
" > /etc/apt/sources.list
RUN apt-get -y update

# install package building helpers
RUN apt-get -y --force-yes --fix-missing install dpkg-dev debhelper curl lib32gcc1 qemu kmod qemu-utils parted

# install dependancies
RUN apt-get -y build-dep pure-ftpd

# build from source
RUN mkdir /tmp/pure-ftpd/ && \
	cd /tmp/pure-ftpd/ && \
	apt-get source pure-ftpd && \
	cd pure-ftpd-* && \
	./configure --with-tls && \
	sed -i '/^optflags=/ s/$/ --without-capabilities/g' ./debian/rules && \
	dpkg-buildpackage -b -uc

# install the new deb files
RUN dpkg -i /tmp/pure-ftpd/pure-ftpd-common*.deb
RUN apt-get -y install openbsd-inetd
RUN dpkg -i /tmp/pure-ftpd/pure-ftpd_*.deb

# Prevent pure-ftpd upgrading
RUN apt-mark hold pure-ftpd pure-ftpd-common

# setup ftpgroup and ftpuser
RUN groupadd ftpgroup
RUN useradd -g ftpgroup -d /home/ftpusers -s /dev/null ftpuser

# rsyslog for logging (ref https://github.com/stilliard/docker-pure-ftpd/issues/17)
RUN apt-get install -y rsyslog && \
	echo "" >> /etc/rsyslog.conf && \
	echo "#PureFTP Custom Logging" >> /etc/rsyslog.conf && \
	echo "ftp.* /var/log/pure-ftpd/pureftpd.log" >> /etc/rsyslog.conf && \
	echo "Updated /etc/rsyslog.conf with /var/log/pure-ftpd/pureftpd.log"

# setup run/init file
COPY run.sh /run.sh
RUN chmod u+x /run.sh

# default publichost, you'll need to set this for passive support
ENV PUBLICHOST localhost

# couple available volumes you may want to use
VOLUME ["/home/ftpusers", "/etc/pure-ftpd/passwd"]

# startup
CMD /run.sh -c 5 -C 5 -l puredb:/etc/pure-ftpd/pureftpd.pdb -E -j -R -P $PUBLICHOST -p 30000:30009

EXPOSE 21 30000-30009