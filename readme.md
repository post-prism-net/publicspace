# Hardware

+ Raspberry Pi Model B
+ Powered USB-Hub
+ 8 GB SD-Card
+ 2x WiFi-Adapter *LOGILINK WL0151*


# Setup

## OS

### [1] Install Raspbian Image on SD Card

### [2] Set up Raspberry
+ Connect Pi to your router via ethernet 
+ Start Pi by powering it up

### [3] Login over SSH
> shh pi@192.168.XXX.XXX

pi : raspberry

### [4] Raspbian Configuration
> sudo raspi-config

+ Expand file system
+ Change password: ****

### [5] Update OS
> sudo apt-get update
> sudo apt-get upgrade 

### [6] Change SSH Port for security reasons
> sudo nano /etc/ssh/sshd_config

Port 2002


## WiFi

### [1] Shutdown and connect
> sudo shutdown now

Connect WiFi Dongle and start Pi

### [2] Check if dongle is recognised
> lsusb

### [3] Install dependencies
> sudo apt-get install hostapd isc-dhcp-server iw

### [4] Configure hostAPD
> sudo nano /etc/hostapd/hostapd.conf

```
interface=wlan1
driver=nl80211
ssid=publicspace
channel=3
wmm_enabled=1
```

### [5] Configure DHCP server
> sudo nano /etc/dhcp/dhcpd.conf

```
authoritative;
ddns-update-style none;
default-lease-time 600;
max-lease-time 7200;
log-facility local7;
subnet 192.168.2.0 netmask 255.255.255.0 {
range 192.168.2.25 192.168.2.50;
option domain-name-servers 8.8.8.8, 8.8.4.4;
option routers 192.168.2.1;
interface wlan1;
}
```

> sudo nano /etc/default/isc-dhcp-server 

```
INTERFACES="wlan1"
```

### [6] Autostart hostAPD 
> sudo nano /etc/default/hostapd

```
DAEMON_CONF="/etc/hostapd/hostapd.conf"
```

### [7] Configure Metwork Interfaces
> sudo nano /etc/network/interfaces 

```
auto lo

iface lo inet loopback
iface eth0 inet dhcp

allow-hotplug wlan0
iface wlan0 inet dhcp
wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf

allow-hotplug wlan1
iface wlan0 inet static
address 192.168.2.1
netmask 255.255.255.0
network 192.168.2.0
broadcast 192.168.2.255

iface default inet dhcp
```

> sudo nano /etc/wpa_supplicant/wpa_supplicant.conf

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
ssid="YOURSSID"
psk="YOURPASSWORD"

# Protocol type can be: RSN (for WP2) and WPA (for WPA1)
proto=WPA

# Key management type can be: WPA-PSK or WPA-EAP (Pre-Shared or Enterprise)
key_mgmt=WPA-PSK

# Pairwise can be CCMP or TKIP (for WPA2 or WPA1)
pairwise=TKIP

#Authorization option should be OPEN for both WPA1/WPA2 (in less commonly used are SHARED and LEAP)
auth_alg=OPEN
}
```

### [8] Prevent strange DHCP bug
> sudo nano /etc/default/ifplugd

```
INTERFACES="eth0"
HOTPLUG_INTERFACES="eth0"
ARGS="-q -f -u0 -d10 -w -I"
SUSPEND_ACTION="stop"
```

### [9] Reboot 
> sudo reboot 

### [10] Enable internet connection for WiFi clients
> echo 1 > sudo /proc/sys/net/ipv4/ip_forward

> sudo nano /etc/sysctl.conf

```
net.ipv4.ip_forward=1
```

### [11] Enable NAT

> sudo su
> iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE

> iptables-save > /etc/iptrules

> nano /etc/network/if-pre-up.d/iptables 

```
#!/bin/sh
iptables-restore < /etc/iptrules
exit 0
```

> chmod +x /etc/network/if-pre-up.d/iptables
> chown root:root /etc/network/if-pre-up.d/iptables 
> chmod 755 /etc/network/if-pre-up.d/iptables
> exit


## Webserver 

### [1] Install nginx
> sudo apt-get install nginx


## Proxy-Server

### [1] Install Privoxy
> sudo apt-get install privoxy

### [2] Main Config 
> sudo nano /etc/privoxy/config

```
actionsfile publicspace.action
filterfile publicspace.filter
listen-address  192.168.2.1:8118
forwarded-connect-retries  0
accept-intercepted-requests 1
```

### [3] Action config

> cd /etc/privoxy
> sudo nano publicspace.action

```
# Public Space
{+filter{publicspace-1}}
/
```

### [4] Filter config
> sudo nano publicspace.filter

```
FILTER: publicspace-1 Add js to all html file
s|</body>|<script src=http://192.168.2.1/publicspace/client/publicspace-client.js></script></body>|i 
```

### [5] Restart privoxy 
> sudo /etc/init.d/privoxy restart

### [6] Setup iptables
> sudo su 
> iptables -t nat -A PREROUTING -i wlan1 -p tcp --dport 80 -j DNAT --to 192.168.2.1:8118
> iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j REDIRECT --to-port 8118

> iptables-save > /etc/iptrules
> exit;

> sudo reboot


## NodeJS and packages 

### [1] install Node

> sudo mkdir /opt/node
> cd /tmp
> wget http://nodejs.org/dist/v0.10.2/node-v0.10.2-linux-arm-pi.tar.gz
> tar xvzf node-v0.10.2-linux-arm-pi.tar.gz
> sudo cp -r node-v0.10.2-linux-arm-pi/* /opt/node

> sudo nano /etc/profile

add before 'export $PATH':

```
# Node JS
NODE_JS_HOME="/opt/node"
NODE_PATH="/opt/node"
PATH="$NODE_JS_HOME/bin/:$PATH"
# end Node JS
```

### [2] Install forever

> sudo su
> PATH=/opt/node/bin/:$PATH 
> npm config set registry http://registry.npmjs.org/  
> npm install forever -g 
> exit


## Move repo files to web server

> sudo chmod 777 /usr/share/nginx/www

--> /usr/share/nginx/www/

> cd /usr/share/nginx/www/publicspace/server
> npm install 

## Start App on startup

### [1] Test if forever can run node app

> forever /usr/share/nginx/www/publicspace/server/publicspace-server.js

### [2] Create boot script

> sudo nano /etc/init.d/publicspace

```
### BEGIN INIT INFO
# Provides:             forever
# Required-Start:
# Required-Stop:
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description:    Node App
### END INIT INFO

export PATH=$PATH:/opt/node/bin
export NODE_PATH=$NODE_PATH:/opt/node/lib/node_modules
export HOME=/root

case "$1" in
  start)
    /opt/node/bin/forever start /usr/share/nginx/www/publicspace/server/publicspace-server.js
    ;;
  stop)
    exec /opt/node/bin/forever stopall
    ;;
  *)

  echo "Usage: /etc/init.d/nodeup {start|stop}"
  exit 1
  ;;
esac
exit 0
```

> sudo chmod 775 /etc/init.d/publicspace 

### [3] Test if script starts/stops

> sudo /etc/init.d/publicspace start 
> sudo /etc/init.d/publicspace stop

### [4] Register boot script

> sudo update-rc.d publicspace defaults