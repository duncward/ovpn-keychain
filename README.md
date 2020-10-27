ovpn-keytar
===========

Command line to automate open vpn client using credentials stored in the OSX keychain

## Setup

`$ npm install`

## Run

`$ npm run tsnode index.ts`

A successful output will look like;
```
Checking status
Reconnecting, getting credentials
{ stdout: '0 connection(s) disconnected\n', stderr: '', exit: 0 }
{
  stdout: 'Enter Google Authenticator Code: Accessing profile from server...\n' +
    'Starting OpenVPN client daemon...\n' +
    'Looking up DNS name for VPN server...\n' +
    'Waiting for VPN server...\n' +
    'Connecting/CONNECTING\n' +
    'Getting client configuration from VPN server...\n' +
    'Assigning VPN IP address...\n' +
    'Connected\n' +
    'Connection to ... established via UDP using VPN IP ...\n',
  stderr: '',
  exit: 0
}
```
