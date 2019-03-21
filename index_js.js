
NORDVPN_CODES = {"Standard VPN": "11", "Double VPN": "1", "Onion over VPN": "3", "Dedicated IP": "9", "P2P": "15", "Obfuscated": "17"}
MODES = ["Standard VPN", "P2P", "Dedicated IP", "Double VPN", "Onion over VPN", "Obfuscated"]
COUNTRIES = [
              'South Africa', 'Egypt',
              'Turkey', 'Israel', 'United Arab Emirates', 'India', 'South Korea', 'Singapore', 'Taiwan', 'Vietnam',
              'Hong Kong', 'Indonesia', 'Thailand', 'Japan', 'Malaysia',
              'United States', 'Canada', 'Mexico', 'Brazil', 'Costa Rica', 'Argentina', 'Chile',
              'United Kingdom', 'Netherlands', 'Germany', 'France', 'Belgium', 'Switzerland', 'Sweden',
              'Spain', 'Denmark', 'Italy', 'Norway', 'Austria', 'Romania', 'Czech Republic', 'Luxembourg',
              'Poland', 'Finland', 'Hungary', 'Latvia', 'Russia', 'Iceland', 'Bulgaria', 'Croatia', 'Moldova',
              'Portugal', 'Albania', 'Ireland', 'Slovakia', 'Ukraine', 'Cyprus', 'Estonia', 'Georgia', 'Greece',
              'Serbia', 'Slovenia', 'Azerbaijan', 'Bosnia and Herzegovina', 'Macedonia',
             'Australia', 'New Zealand'
]
COUNTRY_CODES={
              "AL": 2,"AR": 10,"AU": 13,"AT": 14,"AZ": 15,"BE": 21,
              "BA": 27,"BR": 30,"BG": 33,"CA": 38,"CL": 43,"CR": 52,
              "HR": 54,"CY": 56,"CZ": 57,"DK": 58,"EG": 64,"EE": 68,
              "FI": 73,"FR": 74,"GE": 80,"DE": 81,"GR": 84,"HK": 97,"HU": 98,
              "IS": 99,"IN": 100,"ID": 101,"IE": 104, "IL": 105,"IT": 106,"JP": 108,
              "KR": 114,"LV": 119,"LU": 126,"MK": 128,"MY": 131,
              "MX": 140,"MD": 142,"NL": 153,"NZ": 156,"NO": 163,
              "PL": 174,"PT": 175,"RO": 179,"RU": 180,"RS": 192,"SG": 195,
              "SK": 196,"SI": 197,"ZA": 200,"ES": 202,"SE": 208,"CH": 209,
              "TW": 211,"TH": 214,"TR": 220,"UA": 225,"GB": 227,
              "US": 228,"AE":226,"VN": 234
}

CREDENTIALS_FILE = "./credentials/.credentials.txt"

var fs = require('fs')               
var path = require('path') 
var sudo = require('sudo-prompt');


var newWindow = null

function create_credentials(region,vpn_type,protocol){

  const electron = require('electron');
  var BrowserWindow

  try{
    BrowserWindow = electron.remote.BrowserWindow;
  }catch(err){
    BrowserWindow = electron.BrowserWindow
  }

  if (newWindow) {
    newWindow.focus()
    return
  }

  newWindow = new BrowserWindow({
    height: 310,
    resizable: false,
    width: 400,
    title: 'Credentials',
    minimizable: false,
    icon: path.join(__dirname, "logo.png"),
    fullscreenable: false,
  })

  newWindow.webContents.openDevTools()

  newWindow.loadFile('./credentials/credentials.html')

  newWindow.on('closed', function() {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      connect_vpn(region,vpn_type,protocol)
    }
    else{
      console.log("No data")
    }
    newWindow = null

  })
}

function remove_credentials(){
  var sudo = require('sudo-prompt');
  var options = {
    name: 'NordJS'
  };
  sudo.exec("rm "+CREDENTIALS_FILE, options,
    function(error, stdout, stderr) {
      if (error) throw error;
    //console.log('stdout: ' + stdout);
    }
  );
}

function open_vpn_start(region,vpn_type,protocol){
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      connect_vpn(region,vpn_type,protocol)
    }
    else{
      create_credentials(region,vpn_type,protocol)
    }
  }catch(err) {
    console.log(err)
  }
}

function connect_vpn(region,vpn_type,protocol){
  //get best server  
  console.log(region+" "+vpn_type+" "+protocol)
  if(region == "QuickConnect"){
    region = ""
  }
  else{
    region = COUNTRY_CODES[region]
  }
  vpn_type = NORDVPN_CODES[vpn_type]
  
  url = 'https://nordvpn.com/wp-admin/admin-ajax.php?action=servers_recommendations&filters={"servers_groups":'+vpn_type+',"country_id":'+region+'}'

  server = ""

  var request = require('request');
  request(url, function (error, response, body) {
    if(error){
      console.log("rror")
      throw error
    }

    server = JSON.parse(body)[0]["hostname"]
    console.log(server)

    path = "/etc/openvpn/ovpn_"+protocol.toLowerCase()+"/"+server+"."+protocol.toLowerCase()+".ovpn"

     //require sudo priviledges
    var options = {
      name: 'NordJS',
    };
    command = 'openvpn --config "'+path+'" --auth-user-pass "./credentials/.credentials.txt"'
    //command = 'openvpn --config "/etc/openvpn/ovpn_tcp/it16.nordvpn.com.tcp.ovpn" --auth-user-pass "$HOME/Desktop/file.txt"'
    var sudo = require('sudo-prompt');
    var options = {
      name: 'NordJS'
    };
    sudo.exec(command, options,
      function(error, stdout, stderr) {
        if (error) throw error;
      console.log('stdout: ' + stdout);
      }
    );
  });
}


function open_vpn_stop(){
  var sudo = require('sudo-prompt');
  var options = {
    name: 'NordJS',
  };
  sudo.exec('killall openvpn', options,
    function(error, stdout, stderr) {
      if (error) throw error;
      console.log('stdout: ' + stdout);
    }
  );    
}


module.exports = {
  remove: remove_credentials,
  create: create_credentials
}