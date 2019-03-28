#!/bin/bash

echo "installing NPM"

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install nodejs

echo "installing Electron"

sudo npm install electron --save

echo "installing child-process-promise"

sudo npm install child-process-promise --save

echo "installing shelljs"

sudo npm install shelljs --save

echo "installing sudo-prompt"
sudo npm install sudo-prompt

sudo apt-get install openvpn

cd /etc/openvpn

sudo wget https://downloads.nordcdn.com/configs/archives/servers/ovpn.zip

sudo apt-get install ca-certificates

sudo apt-get install unzip

sudo unzip ovpn.zip

sudo rm ovpn.zip
