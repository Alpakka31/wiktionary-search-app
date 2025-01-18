# Wiktionary Search App
An Electron.js program to search for words on Wiktionary



## Development

#### Platform Support

* Windows 10+ (tested on 11, but it should work on 10 too)
* macOS 14+ (tested on Sequoia, but it should work on Sonoma too)
* Linux (tested on Fedora Linux 41, but it should work on every other distro too)



#### Prerequisities

* Node.js (Latest LTS)
* NPM
* Git



#### Cloning

Clone the repository and enter it:

`git clone https://github.com/Alpakka31/wiktionary-search-app.git`

`cd wiktionary-search-app`



#### Compiling

Install program dependencies with: `npm install`

Compile the program with: `npm run compile`

Or compile and start it afterwards with one command: `npm run start`



#### Packaging

Package the program into a portable Windows executable (.exe) and an installer: `npm run dist:win`

Package the program into a macOS .dmg file: `npm run dist:macos`

Package the program into a Linux AppImage and .tar.gz format: `npm run dist:linux`



Note: To be able to see the program icon on the AppImage file, you need to use e.g something like this: [probonopd/go-appimage: Go implementation of AppImage tools](https://github.com/probonopd/go-appimage)
