/// general assembly code challenge
/// author: gz
/// date: 10/11/15

// including libraries and pre-defined functions
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, 'public')));


/// index.html
app.get('/public', function(req,res) {
    res.render('index');
});

/// process favorites
app.post('/', function (req, res) {
    var favs = req.body.fav;
    var html;
    if ( null == favs) // no entry is picked
       html = "<h4>Please select at least one of your favorite movies.</h4>"; 
    else {
       if ( ! Array.isArray( favs) ) // user picks one entry 
         favs = new Array(favs);
       console.log ("Array or scalar: " + favs.length + " " + favs);

       if (Array.isArray(favs)) {
         var data = pJson(favs);//merge to old data
         fs.writeFile('./data.json', JSON.stringify(data));
         html = "<h4>Saved :)</h4>";
       }
    }
    res.setHeader('Content-type', 'text/html');
    res.end(html + " <a onclick='history.back()'>Back</a> ");
});


/// display favorite list
app.get('/favorites', function(req, res){
  var data = fs.readFileSync('./data.json').toString();
  if (data) {
     var html = '<h3>Your favorites</h3><ul>';
     JSON.parse(data, function(k,v) {
        //console.log("each: " + k + " & " + v);
        if ( k === 'movie' && v !== undefined )
          html += "<li>" + v + '<br/>';
     }); 
     html += "</ul>";
  } else {
     html = "You have not yet favorite any movies.";
  } 
  res.setHeader('Content-Type', 'text/html');
  res.send( html);
});

//app.listen(5000, function(){
app.listen(process.env.PORT || 5000, function() {
  console.log("Listening on port 5000");
});

// -----------------------------
/// vanila JS untility functions
// -----------------------------

///an easy hash function for fast search
function gHash(st) {
  var hash = 0, i, chr, len;
  if (st.length == 0) return hash;
  for (i = 0, len = st.length; i < len; i++) {
    chr   = st.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

//parse json data
function pJson(arr) {
  var data0, data;
  try {
    data0 = fs.readFileSync('./data.json').toString();
    data = JSON.parse(fs.readFileSync('./data.json'));
  } catch (e) {
    console.log("error: " + e);
    data = { items:[]};
  }
  for (var i=0; i<arr.length; i++) {
      //console.log("entry " + i + ": " + arr[i] + "\n");
      var hkey = gHash(arr[i]);
      if (data0.indexOf(hkey) === -1) //if entry exists, don't store
        data.items.push({ hash:hkey, movie:arr[i]});
  }
  return data; 
};
