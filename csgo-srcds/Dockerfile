FROM debian:jessie
MAINTAINER Shannon Kliffmueller <s.kliffmueller at gmail dot com>

RUN dpkg --add-architecture i386

COPY ./etc/apt/sources.list /etc/apt/sources.list

RUN apt-get -y update && apt-get -yqq install lib32gcc1 \
      ca-certificates \
      net-tools \
      lib32stdc++6 \
      lib32z1 \
      lib32z1-dev \
      curl

RUN echo debconf steam/question select I AGREE | debconf-set-selections && \
    apt-get install -yqq steamcmd

ENV HOME /var/app

RUN mkdir $HOME
RUN mkdir $HOME/server

RUN ln -s /usr/games/steamcmd $HOME/steamcmd

WORKDIR $HOME
VOLUME $HOME/server

EXPOSE 27015
EXPOSE 27015/udp
EXPOSE 27016
EXPOSE 27016/udp
EXPOSE 27017
EXPOSE 27017/udp

ENTRYPOINT ["/bin/sh", "-c"]
