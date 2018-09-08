const express = require("express");
// const os = require("os");
const path = require('path');
const app = express();

app.use(express.static("../frontend/build"));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
});

app.listen(8010, () => console.log("Listening on port 8010!"));