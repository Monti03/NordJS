last_region = -1

function create_map(region){
  
  console.log("r->"+region)


  //calculating next region if user pressed a row key
  if(last_region!= -1 && [37,38,39,40].includes(region)){
    if(last_region == "002"){//Africa
      if(region == 37){region = "019"}//left  America
      else if(region == 38){region = "150"}//up Europe
      else if(region == 39){region = "009"}//right Oceania
      else if(region == 40){}//down
    }
    else if(last_region == "009"){//Oceania
      if(region == 37){region = "002"}//left Africa 
      else if(region == 38){region = "142"}//up Asia
      else if(region == 39){region = "019"}//right America
      else if(region == 40){}//down
    }
    else if(last_region == "019"){//America
      if(region == 37){region = "142"}//left Asia
      else if(region == 38){}//up
      else if(region == 39){region = "150"}//right Europe
      else if(region == 40){}//down
    }
    else if(last_region == "150"){//Europe
      if(region == 37){region = "019"}//left America
      else if(region == 38){}//up
      else if(region == 39){region = "142"}//right
      else if(region == 40){region = "002"}//down
    }
    else if(last_region == "142"){//Asia
      if(region == 37){region = "150"}//left Europe
      else if(region == 38){region = "150"}//up
      else if(region == 39){region = "019"}//right
      else if(region == 40){region = "009"}//down
    }
  }

  if([37,38,39,40].includes(region))
    return

  last_region = region

  console.log("new region ->"+region)

  google.charts.load('current', {
    'packages':['geochart'],
    'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
  });
  google.charts.setOnLoadCallback(drawRegionsMap);

  regions_data = [
          ['Country'],
          ['South Africa'],['Egypt'],
          ['Turkey'], ['Israel'], ['United Arab Emirates'], ['India'], ['South Korea'], ['Singapore'], ['Taiwan'], ['Vietnam'],
          ['Hong Kong'], ['Indonesia'], ['Thailand'], ['Japan'], ['Malaysia'],
          ['United States'], ['Canada'], ['Mexico'], ['Brazil'], ['Costa Rica'], ['Argentina'], ['Chile'],
          ['United Kingdom'], ['Netherlands'], ['Germany'], ['France'], ['Belgium'], ['Switzerland'], ['Sweden'],
          ['Spain'], ['Denmark'], ['Italy'], ['Norway'], ['Austria'], ['Romania'], ['Czech Republic'], ['Luxembourg'],
          ['Poland'], ['Finland'], ['Hungary'], ['Latvia'], ['Russia'], ['Iceland'], ['Bulgaria'], ['Croatia'], ['Moldova'],
          ['Portugal'], ['Albania'], ['Ireland'], ['Slovakia'], ['Ukraine'], ['Cyprus'], ['Estonia'], ['Georgia'], ['Greece'],
          ['Serbia'], ['Slovenia'], ['Azerbaijan'], ['Bosnia and Herzegovina'], ['Macedonia'],
          ['Australia'], ['New Zealand']
  ]

  function drawRegionsMap() { 
    var data = google.visualization.arrayToDataTable(regions_data);

    var options = {
      displayMode: 'auto',
      legend:'none',
      enableRegionInteractivity:true,
      width:"800px",
    };

    if(region == -1){
      options.resolution='continents'
    }
    else{
      options.region = region
    }

    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    google.visualization.events.addListener(chart, 'regionClick', regionCLick);

    function regionCLick(e) {
      console.log(e.region)
      if(["002","019","150","142","009"].includes(e.region)){
        console.log("ok")
        create_map(e.region)
      }
      else if(REGIONS.includes(e.region))
        document.getElementById('region').innerHTML = e.region
      else  
        document.getElementById('region').innerHTML = "QuickConnect"
    }

    chart.draw(data, options);
  }
}