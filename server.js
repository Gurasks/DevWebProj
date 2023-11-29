var express = require('express');
var http = require("http");
var app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.json());

require("dotenv-safe").config()
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

app.use(express.urlencoded({ extended: true }));

var options = {
	extensions: ['ejs'],
	index: ['index.ejs'],
}

app.use(express.static('public', options))

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  let httpRequest = http.get('http://localhost:8081/properties', function(httpResponse) {
    let bodyChunks = [];
    httpResponse.on('data', function(chunk) {
      bodyChunks.push(chunk);
    }).on('end', function() {
      const properties = JSON.parse(Buffer.concat(bodyChunks));
      res.render('pages/index', {maxPage: Math.ceil(properties.prop.length/3), prop: properties.prop.slice(0,3)});
    })
  });

  httpRequest.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });

});

var sha512 = (pwd, key) => {
  /* Gera um HMAC (Hash-based Message Authentication Code)
   usando a função de hash SHA512
   a chave é passada em key
   */
  var hash = crypto.createHmac('sha512', key)
  hash.update(pwd)
  return hash.digest('hex')
}

app.post('/login', (req, res) => {
  var user = req.body.user;
  var password = sha512(req.body.password, process.env.SECRET_USERS);

  const postData = JSON.stringify({
    user,
    password
  });

  const options = {
    hostname: '127.0.0.1',
    port: 8081,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
    body: postData
  };
  const request = http.request(options, (response) => {
    console.log(`STATUS: ${response.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    response.on('end', () => {
      console.log('No more data in response.');
    });
  });

  request.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });
})

const blacklist = []

function verifyJWT(req, res, next) {
    const token = req.headers['x-access-token']

    // verifica se o token foi incluindo na blacklist devido a logout
    const index = blacklist.findIndex(item => item === token)

    if (index !== -1) {// está na blacklist!
        res.redirect('/login');
    } else {
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                res.redirect('/login');
            } else {
                req.userid = decoded.userid;
                next();
            }
        })
    }
}

app.get('/props', function(req, res) {
  let id = ((req.query.id ? req.query.id : 1)- 1) * 3;
  let httpRequest = http.get('http://localhost:8081/properties', function(httpResponse) {
    let bodyChunks = [];
    httpResponse.on('data', function(chunk) {
      bodyChunks.push(chunk);
    }).on('end', function() {
      const properties = JSON.parse(Buffer.concat(bodyChunks));
      res.send({prop: properties.prop.slice(id,id+3)});
    })
  });

  httpRequest.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });

});

app.get('/rent', verifyJWT, function (req, res) {
  let id = req.query.id;

  let httpRequest = http.get('http://localhost:8081/properties', function(httpResponse) {
    let bodyChunks = [];
    httpResponse.on('data', function(chunk) {
      bodyChunks.push(chunk);
    }).on('end', function() {
      const property = JSON.parse(Buffer.concat(bodyChunks)).prop[id];
      res.render('pages/rent', {property: property});
    })
  });

});

app.get('/login', function (req, res) {
  res.render('pages/login');
});

app.post('/logout', function (req, res) {
  blacklist.push(req.headers['x-access-token'])
  res.json({ auth: false, token: null })
})

// Default route
app.get("*", (req, res) => {
  res.status(404).end('PAGE NOT FOUND')
});

app.listen(8080);
console.log('Server is listening on port 8080');
