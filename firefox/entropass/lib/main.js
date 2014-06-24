var self = require('sdk/self');
var buttons = require('sdk/ui/button/action');
var pageMod = require('sdk/page-mod');
var popup = require('./popup.js');
var ss = require('sdk/simple-storage');

var button = buttons.ActionButton({
    id: 'entropass-button',
    label: 'Entropass',
    icon: {
        '16': './icon-16.png',
        '32': './icon-32.png',
        '64': './icon-64.png'
    },
    onClick: function(state) {
        popup.popup.show({
            position: button
        });
    }
});

pageMod.PageMod({
    include: self.data.url('options.html'),
    contentScriptFile: [
        self.data.url('lib/pbkdf2.js'),
        self.data.url('lib/sha512.js'),
        self.data.url('lib/base64.js'),
        self.data.url('lib/typedarrays.js'),
        self.data.url('lib/qrcode.js'),
        self.data.url('lib/entropass.js'),
        self.data.url('options.js')
    ],
    onAttach: function(worker) {
        var syncData = {};
        for(var key in ss.storage) {
            if(ss.storage.hasOwnProperty(key) && key.indexOf('site:') === 0)
                syncData[key] = ss.storage[key];
        }
        worker.port.emit('attach', ss.storage.privateKeyHash, syncData,
            ss.storage.defaultPasswordLength);
        worker.port.on('save-private-key', function(privateKeyHash) {
            ss.storage.privateKeyHash = privateKeyHash;
            console.log(privateKeyHash);
        });
        worker.port.on('save-default-password-length',
            function(defaultPasswordLength) {
                ss.storage.defaultPasswordLength = defaultPasswordLength;
            }
        );
        worker.port.on('save-passphrase-hash', function(passphraseHash) {
            if(passphraseHash)
                ss.storage.passphraseHash = passphraseHash;
            else
                delete ss.storage.passphraseHash;
        });
    }
});
