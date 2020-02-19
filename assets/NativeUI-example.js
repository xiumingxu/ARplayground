const Scene = require('Scene');
const NativeUI = require('NativeUI');
const Textures = require('Textures');

const plane = Scene.root.find('plane0');

// initialize picker
const picker = NativeUI.picker;
picker.visible = true; // must specify visible so the picker shows up

// initialize configuration variable - make sure icon textures are set to "No Compression"!!!
const configuration = {
    selectedIndex: 0,
    items: [
        { image_texture: Textures.get('icon_texture0') },
        { image_texture: Textures.get('icon_texture1') },
        { image_texture: Textures.get('icon_texture2') }
    ]
}
// configure picker
picker.configure(configuration);

// change plane material texture based on selected index
picker.selectedIndex.monitor({ fireOnInitialValue: true }).subscribe(function(e) {
    plane.material.diffuse = configuration.items[e.newValue].image_texture;
});