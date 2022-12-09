const { ipcRenderer } = require('electron');
var $ = require('jquery');
const { Peer } = require('peerjs');
const { mouse, straightTo, Point } = require("@nut-tree/nut-js");

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

            let mouseX = Number(mouseData['mouseX']);
            let mouseY = Number(mouseData['mouseY']);

            const target = new Point(mouseX, mouseY);
        
            await mouse.move(straightTo(target));
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