
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

CONNECTING_STATUS = "Connecting to VPN"
INSERTING_CREDENTIALS_STATUS = "Inserting credentials"
AUTHENTICATION_ERROR_STATUS = "There was an error with your credentials"
CONNECTED_STATUS = "Connceted to "
GENERIC_ERROR_STATUS = "There was an error"
DISCONNECTED_STATUS = "Not Connected"
REGIONS = Object.keys(COUNTRY_CODES)

CREDENTIALS_FILE = "./src/credentials/.credentials.txt"

var fs = require('fs')               
var path = require('path') 
var shell = require('shelljs');

var newWindow = null

// bool = true  -> it has been called by the menu -> connect_vpn will not be called
// bool = false -> connect_vpn will be called
function create_credentials(region,vpn_type,protocol,bool=true){

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
    icon: path.join(__dirname, 'media', "logo.png"),
    fullscreenable: false,
  })

  newWindow.webContents.openDevTools()

  newWindow.loadFile('./src/credentials/credentials.html')

  newWindow.on('closed', function() {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      if(!bool)
        connect_vpn(region,vpn_type,protocol)
    }
    else{
      if(!bool)
        alert("You have to insert your credentials")
    }
    newWindow = null

  })
}

function remove_credentials(){
  var shell = require('shelljs');

  shell.rm(CREDENTIALS_FILE) 
}

function open_vpn_start(region,vpn_type,protocol){
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      
      prev_status = get_status()
      console.log(prev_status)

      if(prev_status == CONNECTING_STATUS){
        alert("You just started a connection.\nWait for it to start")
        return;
      }
      else if(prev_status.includes(CONNECTED_STATUS)){
        alert("You have to disconnect before start a new connection")
        return;
      }

      connect_vpn(region,vpn_type,protocol)
    }
    else{
      create_credentials(region,vpn_type,protocol,false)
    }
  }catch(err) {
    console.log(err)
  }
}

function connect_vpn(region,vpn_type,protocol){

  set_status(CONNECTING_STATUS)

  original_region = region

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
      alert("There was an error during the request to NordVPN for the best server")
      throw error
    }
    try{
      server = JSON.parse(body)[0]["hostname"]
    }
    catch(err){
      alert("There was an error during the request to NordVPN for the best server")
      set_status(GENERIC_ERROR_STATUS)
      return;
    }
    console.log(server)

    ovpn_path = "/etc/openvpn/ovpn_"+protocol.toLowerCase()+"/"+server+"."+protocol.toLowerCase()+".ovpn"

     //require sudo priviledges
    var options = {
      name: 'NordJS',
    };
    command = 'openvpn --config "'+ovpn_path+'" --auth-user-pass "./src/credentials/.credentials.txt" --script-security 2 --up /etc/openvpn/update-resolv-conf --down /etc/openvpn/update-resolv-conf'
    
    var exec = require('child-process-promise').exec;
 
    promise = exec(command)
    .then(console.log("command executed"))
    .catch( err => console.log(err))

    child_process = promise.childProcess

    child_process.stdout.on('data', function (data) {
      if(data.includes("AUTH_FAILED")){
        set_status(AUTHENTICATION_ERROR_STATUS)
        alert("Error: your credentials are not correct.\nCheck NodeJS/src/credentials/.credentials.txt")
      }
      else if(data.includes("connection failed") || data.includes("Exiting")){
        set_status(GENERIC_ERROR_STATUS)
        alert("Generic error")
      }
      else if(data.includes("Initialization Sequence Completed")){
        set_status(CONNECTED_STATUS+original_region)
        alert("Connected")
      }
    });
    

  });
}


function open_vpn_stop(){

  var shell = require('shelljs');
  shell.exec('killall openvpn',{}, function(code, stdout, stderr){
    if(code == 0){
      set_status(DISCONNECTED_STATUS)
      alert("Disconnected");  
    }
    else if(code == 1)
      alert("Error: you were not protected by the vpn")
    else{      
      alert("Generic error")
    }
  })
}


function set_status(status){
  document.getElementById('status').innerHTML = status 
}

function get_status(){
  return document.getElementById('status').innerHTML
}

module.exports = {
  remove: remove_credentials,
  create: create_credentials
}



