var express = require('express');
var app = express();

app.use(express.urlencoded({ extended: true }));

var options = {
	extensions: ['ejs'],
	index: ['index.ejs'],
}

app.use(express.static('public', options))


app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('pages/index', require('./data/properties.json')); ;
});

app.get('/rent', function (req, res) {
  let id = req.query.id;
  let property = require('./data/properties.json').prop[id];
	res.render('pages/rent', {property: property});
})

app.listen(8080);
console.log('Server is listening on port 8080');
