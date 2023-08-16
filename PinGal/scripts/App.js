const express = require('express');
const path = require('path');
const ejs = require('ejs');

const App = express();
App.use('/src', express.static(path.join(__dirname, '../src')));
App.use(express.urlencoded({ extended: true }));
// Строчки доп. для дополнений правил для App


const { UserAdres } = require('./AddressingUser');
const Adressing = new UserAdres(App);
Adressing.set();

const { GalleryAdres } = require('./AdressingGallery');
const AdressingGallery = new GalleryAdres(App);
AdressingGallery.set();

App.listen(3000, () => {
    console.log('Server start on http://localhost:3000');
});