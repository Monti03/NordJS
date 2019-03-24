const { app, BrowserWindow , Menu} = require('electron')
var path = require('path')

var myModule = require('./src/connection');

let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 700, resizable: false,title: "NordJS", fullscreenable: false,icon: path.join(__dirname,'media',"logo.png")})

  const nativeMenus = [{
    label:"Credentials",
    submenu:[
      {label:"Remove Credentials", click(){myModule.remove()}},
      {label:"Create Credentials", click(){myModule.create()}}
    ]
  
  }]


  const menu = Menu.buildFromTemplate(nativeMenus)
  Menu.setApplicationMenu(menu)

  // and load the index.html of the app.
  win.loadFile('src/index.html')

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit()
})


