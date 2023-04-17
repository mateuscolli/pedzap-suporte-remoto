const { ipcRenderer } = require('electron');
const path = require('path');
const $ = require('jquery');
const { Peer } = require('peerjs');

const peer = new Peer('gh6ad5f4h6ad5fh46ad5h46d5', { debug: 1 });

peer.on('open', (id) => {
	console.log('My peer ID is: ' + id);
});

peer.on('connection', (conn) => {
    conn.on('data', async (data) => {
        if(data[0] == 'connectScreen') {
            const btnAccept = document.createElement('button');

            btnAccept.id = 'btnAccept';
            btnAccept.innerHTML = 'Aceitar acesso';
            btnAccept.type = 'button'
            btnAccept.classList.add('btn', 'btn-success');
            btnAccept.onclick = () => {
                getDisplay(data[1], conn);
            }

            $('#container').append(btnAccept);
        }

        if(data[0] == 'mouseCtrl') {
            const mouseData = JSON.parse(data[1]);
            const mouseEvent = mouseData['mouseEvent'];
            const mouseWhich = (mouseData['mouseWhich'] == 1 ? 'left' : (mouseData['mouseWhich'] == 2 ? 'middle' : 'right'));
            const mouseX = Math.ceil(mouseData['mouseX']);
            const mouseY = Math.ceil(mouseData['mouseY']);


            if(mouseEvent == 'mousemove') {
                mouseCtrl.setCursorPosition(mouseX, mouseY);
            }

            if(mouseEvent == 'mousedown') {
                mouseCtrl.mouseDown(mouseWhich, mouseX, mouseY);

                // mouseCtrl.setCursorPosition(mouseX, mouseY);

                // setTimeout(() => {
                //     mouseCtrl.mouseDown(mouseWhich, mouseX, mouseY);
                //     mouseCtrl.mouseUp(mouseWhich, mouseX, mouseY);
                // }, 1000);

                // setTimeout(() => {
                //     keyboardCtrl.pressKey('a');
                //     keyboardCtrl.releaseKey('a');
                // }, 2000);
            }

            if(mouseEvent == 'mouseup') {
                mouseCtrl.mouseUp(mouseWhich, mouseX, mouseY);
            }
        }

        if(data[0] == 'keyboardCtrl') {
            const keyData = JSON.parse(data[1]);
            const keyEvent = keyData['keyEvent'];
            const keyCode = keyData['keyCode'];
            
            console.log(keyData);
            if(keyEvent == 'keydown')
                keyboardCtrl.pressKey(keyCode);

            if(keyEvent == 'keyup')
                keyboardCtrl.releaseKey(keyCode);
        }
    });
})


// FUNÇÕES EXTRAS
const getDisplay = async (peerId, conn) => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    const displays = await desktopCapturer.getAllDisplays();
    
    await sources.forEach(async (source, i) => {
        const constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: source.id
                }
            }
        }

        const media = await navigator.mediaDevices.getUserMedia(constraints);

        conn.send({
            displayId: `display-${i}`,
            primary: (i == 0 ? true : false),
            displayInfo: JSON.stringify(displays.find(display => display.id == source.display_id)),
        });

        peer.call(peerId, media);

        $('#btnAccept').remove();
    });
};


// IPC RENDERER
const desktopCapturer = {
    getSources: (opts) => ipcRenderer.invoke('DESKTOP_CAPTURER_GET_SOURCES', opts),
    getAllDisplays: () => ipcRenderer.invoke('SCREEN_GET_ALL_DISPLAYS')
}

const mouseCtrl = {
    setCursorPosition: (x, y) => ipcRenderer.invoke('SET_CURSOR_POSITION', x, y),
    mouseDown: (which, x, y) => ipcRenderer.invoke('CLICK_MOUSE_DOWN', which, x, y),
    mouseUp: (which, x, y) => ipcRenderer.invoke('CLICK_MOUSE_UP', which, x, y)
}

const keyboardCtrl = {
    pressKey: (key) => ipcRenderer.invoke('KEYBOARD_PRESS_KEY', key),
    releaseKey: (key) => ipcRenderer.invoke('KEYBOARD_RELEASE_KEY', key)
}