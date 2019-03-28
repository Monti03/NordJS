var sudo = require('sudo-prompt');
var options = {
  name: 'NordJS',
  icns: './media/logo.png',
};

sudo.exec('npm start', options,
  function(error, stdout, stderr) {
    if (error){
        console.log("there was an error!")
    }
    //console.log('stdout: ' + stdout);
  }
);