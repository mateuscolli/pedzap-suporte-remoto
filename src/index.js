const { app, BrowserWindow, ipcMain, desktopCapturer, screen,  } = require('electron');
const path = require('path');
const { setCursorPosition, sendCursorEvent, cursorEvents } = require('node-cursor');
const { pressKey, releaseKey } = require('keyboardjs');
const { moveMouse, mouseToggle, keyToggle } = require('@hurdlegroup/robotjs');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
			webSecurity: true,
      nativeWindowOpen: true
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle(
	'DESKTOP_CAPTURER_GET_SOURCES',
	(event, opts) => desktopCapturer.getSources(opts)
);

ipcMain.handle(
	'SCREEN_GET_ALL_DISPLAYS',
	(event) => screen.getAllDisplays()
);

ipcMain.handle(
	'SET_CURSOR_POSITION',
	(event, x, y) => 
    // setCursorPosition({ x: x, y: y })
    moveMouse(x, y)
);

ipcMain.handle(
	'CLICK_MOUSE_DOWN',
	(event, which, x, y) => {
    mouseToggle('down', which)
    // if(which == 'left') which = cursorEvents.LEFT_DOWN;
    // if(which == 'middle') which = cursorEvents.MIDDLE_DOWN;
    // if(which == 'right') which = cursorEvents.RIGHT_DOWN;

    // sendCursorEvent({ event: which, x: x, y: y })
  }
);

ipcMain.handle(
	'CLICK_MOUSE_UP',
	(event, which, x, y) => {
    mouseToggle('up', which)

    // if(which == 'left') which = cursorEvents.LEFT_UP;
    // if(which == 'middle') which = cursorEvents.MIDDLE_UP;
    // if(which == 'right') which = cursorEvents.RIGHT_UP;

    // sendCursorEvent({ event: which, x: x, y: y })
  }
);

ipcMain.handle(
	'KEYBOARD_PRESS_KEY',
	(event, key) => 
    keyToggle(key, 'down')
    // pressKey(key)
);

ipcMain.handle(
	'KEYBOARD_RELEASE_KEY',
	(event, key) => 
    keyToggle(key, 'up')
    // releaseKey(key)
);