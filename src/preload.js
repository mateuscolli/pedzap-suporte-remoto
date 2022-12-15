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

            inputCtrl.setCursorPosition(mouseX, mouseY);
            // if(mouseEvent == 'mousedown')
            //     sendInputEvent({ type: 'mouseDown', x: mouseX, y: mouseY, button: mouseWhich });

            // if(mouseEvent == 'mouseup')
            //     sendInputEvent({ type: 'mouseUp', x: mouseX, y: mouseY, button: mouseWhich });
        }

        if(data[0] == 'keyboardCtrl') {
            const keyData = JSON.parse(data[1]);
            const keyEvent = keyData['keyEvent'];
            const keyCode = keyData['keyCode'];
            
            console.log(keyData);
            if(keyEvent == 'keydown')
                inputCtrl.pressKey(keyCode);
                // inputCtrl.sendInputEvent({ type: 'keyDown', keyCode: keyCode });

            if(keyEvent == 'keyup')
                inputCtrl.releaseKey(keyCode);
                // inputCtrl.sendInputEvent({ type: 'keyUp', keyCode: keyCode });
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

const inputCtrl = {
    setCursorPosition: (x, y) => ipcRenderer.invoke('SET_CURSOR_POSITION', x, y),
    pressKey: (key) => ipcRenderer.invoke('KEYBOARD_PRESS_KEY', key),
    releaseKey: (key) => ipcRenderer.invoke('KEYBOARD_RELEASE_KEY', key),
    // sendInputEvent: (inputEvent) => ipcRenderer.invoke('SEND_INPUT_EVENT', inputEvent)
}