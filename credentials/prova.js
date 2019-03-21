

const fs = require('fs');
var sudo = require('sudo-prompt');

fs.writeFile("./.credentials.txt", "ciao", function(err) {
    sudo.exec("./save_file_sudo.sh", {name: "nordJS"},()=>{console.log("ciao")});
})