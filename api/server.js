var express = require('express');
var app = express();
const fs = require('fs')

app.get('/properties', function(req, res) {
  res.send(require('./data/properties.json'));
});

app.post('/login', function(req, res) {
  var user = req.body.user;
  var password = req.body.password;

  if (user && password) {
    var users = JSON.parse(fs.readFileSync(__dirname + '/data/users.json'))
    var userloc = users.find((item) => {
        return (item.user == user && item.password == password)
    })

    if (userloc) {
        const token = jwt.sign(
            { userid: userloc.userid }, // payload (podem ser colocadas outras infos)
            process.env.SECRET, // chave definida em .env
            { expiresIn: 300 }  // em segundos
        )
        return res.json({ auth: true, token });
    }
}
  return res.json({ auth: false });
});

app.listen(8081);
console.log('Server is listening on port 8081');
