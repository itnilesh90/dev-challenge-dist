/** 
 * *************************Email ID :  itnilesh90@gmail.com********************************
 * *******************************Nilesh Kumar Sharma***************************************
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// Change this to get detailed logging from the stomp library
global.DEBUG = false

const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}
var dataSet = [];
var dataTable = null;
var sparkElement = null;
var sparkline = null;
var sparkData = [];

function connectCallback() {
  document.getElementById('stomp-status').innerHTML = "<h1>Foreign exchange currency pairs.</h1>";
  //to fetch data from /fx/prices and passing to subscriptionCallback
  client.subscribe('/fx/prices', subscriptionCallback);
}

client.connect({}, connectCallback, function(error) {
  alert(error.headers.message)
})

//getting data from /fx/prices API and we are manipulating data 
subscriptionCallback = function(responseData) {
    // called when the client receives a STOMP responseData from the server

    if (responseData.body) {
      let result = JSON.parse(responseData.body);
      dataSet.push(Object.values(result));
      updatePriceTable();
      
      if(sparkData.length == 30){
        sparkData.shift();
      }
      sparkData.push((result.bestBid+result.bestAsk)/2);
      updateSparkline();

    } else {
      console.log("got empty responseData");
    }
  };

//to Add table heading and dataset to HTML
$(document).ready(function() {
  dataTable = $('#price-table').DataTable( {
        data: dataSet,
        columns: [
            { title: "Name" },
            { title: "Best Bid" },
            { title: "Best Ask" },
            { title: "Open Bid" },
            { title: "Open Ask" },
            { title: "Last Change Ask" },
            { title: "Last Change Bid" }
        ],
        "order": [[ 6 ]]
    } );
    sparkElement = document.getElementById('sparkline');
    sparkline = new Sparkline(sparkElement);
} );

//We are updating Price Table
function updatePriceTable(){
  if(dataTable){
    dataTable.clear();
    dataTable.rows.add(dataSet);
    dataTable.draw();
  }
}

//We are updating Sparkline Fig
function updateSparkline(){
  if(sparkline){
    sparkline.draw(sparkData);
  }
}

