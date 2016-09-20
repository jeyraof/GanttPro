#!/usr/bin/env node

var App = require('electron').app;
var BrowserWindow = require('electron').BrowserWindow;
var ConfigStore = require('configstore');
var Menu = require('electron').Menu;
var Shell = require('electron').Shell;

var mainWindow = null;
var conf = new ConfigStore('GanttPro');

App.once('ready', function() {
  var template;
  if (process.platform == 'darwin') {
    template = [
      {
        label: 'GanttPro',
        submenu: [
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function() {
              App.quit()
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            accelerator: 'Command+Z',
            selector: 'undo:'
          },
          {
            label: 'Redo',
            accelerator: 'Shift+Command+Z',
            selector: 'redo:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Cut',
            accelerator: 'Command+X',
            selector: 'cut:'
          },
          {
            label: 'Copy',
            accelerator: 'Command+C',
            selector: 'copy:'
          },
          {
            label: 'Paste',
            accelerator: 'Command+V',
            selector: 'paste:'
          },
          {
            label: 'Select All',
            accelerator: 'Command+A',
            selector: 'selectAll:'
          },
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'Command+R',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.reload();
              }
            }
          },
          {
            label: 'Zoom In',
            accelerator: 'Command+=',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow && focusedWindow.webContents) {
                focusedWindow.webContents.executeJavaScript('_zoomIn()');
              }
            }
          },
          {
            label: 'Zoom Out',
            accelerator: 'Command+-',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow && focusedWindow.webContents) {
                focusedWindow.webContents.executeJavaScript('_zoomOut()');
              }
            }
          },
          {
            label: 'Actual Size',
            accelerator: 'Command+0',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow && focusedWindow.webContents) {
                focusedWindow.webContents.executeJavaScript(
                  '_zoomActualSize()');
              }
            }
          },
          {
            label: 'Toggle Full Screen',
            accelerator: 'Ctrl+Command+F',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
              }
            }
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: 'Alt+Command+I',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.toggleDevTools();
              }
            }
          },
        ]
      },
      {
        label: 'Window',
        submenu: [
          {
            label: 'Minimize',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:'
          },
          {
            label: 'Close',
            accelerator: 'Command+W',
            selector: 'performClose:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Bring All to Front',
            selector: 'arrangeInFront:'
          },
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
            click: function() {
              Shell.openExternal('https://github.com/jeyraof/GanttPro');
            }
          },
          {
            label: 'Search Issues',
            click: function() {
              Shell.openExternal('https://github.com/jeyraof/GanttPro/issues');
            }
          }
        ]
      }
    ];
  };

  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu)
});

App.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    App.quit();
  }
});

function openMainWindow() {
  mainWindow = new BrowserWindow({
    width: conf.get('width') || 1024,
    height: conf.get('height') || 720,
    title: 'GanttPro'
  });

  if (conf.get('x') || conf.get('y')) {
    mainWindow.setPosition(conf.get('x'), conf.get('y'));
  }

  mainWindow.loadURL('https://app.ganttpro.com');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  mainWindow.webContents.on('new-window', function(e, url, frameName, disposition) {
    e.preventDefault();
    Shell.openExternal(url)
  });

  mainWindow.on('will-navigate', function (e, url) {
    e.preventDefault();
    Shell.openExternal(url);
  });

  if (conf.get('maximize')) {
    mainWindow.maximize();
  }

  mainWindow.on('maximize', function (e) {
    conf.set('maximize', true);
  });

  mainWindow.on('unmaximize', function (e) {
    conf.set('maximize', false);
  });

  mainWindow.on('resize', function (e) {
    var size = this.getSize();
    conf.set({
      width: size[0],
      height: size[1]
    });
  });

  mainWindow.on('moved', function (e) {
    var pos = this.getPosition();
    conf.set({
      x: pos[0],
      y: pos[1]
    });
  });
}

App.on('activate-with-no-open-windows', function () {
  openMainWindow();
});

App.on('ready', function () {
  openMainWindow();
});
