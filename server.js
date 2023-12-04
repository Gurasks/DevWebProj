const express = require('express');
const cookie = require("cookie-parser");
const http = require("http");
const app = express();
const bodyParser = require('body-parser')
const path = require("path");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.use(cookie());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

require("dotenv-safe").config()
const crypto = require('crypto')

app.use(express.urlencoded({ extended: true }));

var options = {
	extensions: ['ejs'],
	index: ['index.ejs'],
}

app.use(express.static('public', options))

app.set('view engine', 'ejs');

async function auth (req, res, next, options) {
  try {
    const response = await fetch("http://localhost:8081/auth", { headers: { Authorization: req.cookies.user.token } });
    const data = await response.json();
    if (response.ok) {
      if (options.allowed.includes(data.user.role)) return next();
      return res.redirect("/login");
    } else {
      return res.redirect("/login");
    }
  } catch (err) {
    return res.redirect("/login");
  }
};

app.get('/', async function(req, res) {
  const user = req.cookies.user;

  try {
    const response = await fetch('http://localhost:8081/properties', {
      method: "GET",
    });
    if (!response.ok) return res.render("pages/error", {user});

    const data = await response.json();
    res.render('pages/index', {maxPage: Math.ceil(data.prop.length/3), prop: data.prop.slice(0,3), user});
  } catch (error) {
    return res.render("pages/error", {user});
  }
});

var sha512 = (pwd, key) => {
  var hash = crypto.createHmac('sha512', key)
  hash.update(pwd)
  return hash.digest('hex')
}

app.get('/login', function (req, res) {
  const message = req.query.message;
  if(req.cookies.user) res.redirect('/');
  res.render('pages/login', {message});
});

app.post('/login', async (req, res) => {
  const user = req.body.user;
  const password = sha512(req.body.password, process.env.SECRET_USERS);
  const postData = JSON.stringify({
    user,
    password
  });

  try {
    const response = await fetch("http://localhost:8081/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: postData,
    });
    const data = await response.json();
    if (response.ok) {
      const name = data.user.name.split(" ");
      res.cookie("user", {
        ...data.user,
        token: data.token,
        name: `${name[0]} ${name[name.length - 1]}`
      });
      console.log('data.user.role', data.user.role)
      switch (data.user.role) {
        case "default":
          return res.redirect("/");
        case "owner":
          return res.redirect("/properties");
        default:
          return res.redirect("/");
      }
    } else {
      return res.render("pages/login", { error: data.error, data: req.body });
    }
  } catch (err) {
    return res.render("pages/login", { error: err.error, data: req.body });
  }
})

app.post('/register', async function(req, res) {
  var user = req.body.user;
  var password = sha512(req.body.password, process.env.SECRET_USERS);
  const postData = JSON.stringify({
    user,
    password
  });

  try {
    const response = await fetch("http://localhost:8081/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: postData,
    });
    const data = await response.json();
    if(response.ok) {
      const message = data.message
      res.redirect(`/login?message=${message}`)
    }

    res.render("pages/login", { error: data.error, data: req.body });
  } catch (err) {
    res.render("pages/login", { error: "Erro ao fazer o cadastro. Tente novamente mais tarde.", data: req.body });
  }
});

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

app.get('/rent', (req, res, next) => auth(req, res, next, { allowed: ["default", "owner"] }), async function (req, res) {
  const id = req.query.id;
  const user = req.cookies.user;

  try {
    const response = await fetch('http://localhost:8081/properties?id=' + id, {
      method: "GET",
      headers: { Authorization: user.token },
    });
    if (!response.ok) return res.render("pages/error", {user});

    const data = await response.json();

    res.render('pages/rent', {property: data, user});
  } catch (error) {
    return res.render("pages/error", {user});
  }
});

app.get('/reservations', (req, res, next) => auth(req, res, next, { allowed: ["default", "owner"] }), async function (req, res) {
  const user = req.cookies.user;
  try {
    const response = await fetch('http://localhost:8081/reservations', {
      method: "GET",
      headers: { Authorization: user.token },
    });
    if (!response.ok) return res.render("pages/error", {user});

    const data = await response.json();

    res.render('pages/reservations', {reservations: data, user});
  } catch (error) {
    return res.render("pages/error", {user});
  }
});

app.post('/reservation', (req, res, next) => auth(req, res, next, { allowed: ["default", "owner"] }), async function (req, res) {
  const user = req.cookies.user;
  const {id} = user;
  const { propertyId, propertyName, checkin, checkout } = req.body;
  const postData = JSON.stringify({
    userId: id,
    propertyId,
    propertyName,
    checkin,
    checkout,
  });

  try {
    const response = await fetch("http://localhost:8081/reservation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: user.token },
      body: postData,
    });
    const data = await response.json();
    res.redirect('/reservations');
  } catch (err) {
    res.redirect('/reservations');
  }
})

app.delete('/reservation', (req, res, next) => auth(req, res, next, { allowed: ["default", "owner"] }), async function (req, res) {
  const user = req.cookies.user;
  try {
    const response = await fetch('http://localhost:8081/reservation?id='+ req.query.id, {
      method: "DELETE",
      headers: { Authorization: user.token },
    });
    if (!response.ok) return res.render("pages/error", {user});

    const data = await response.json();

    res.redirect('/');
  } catch (error) {
    return res.render("pages/error", {user});
  }
});

app.get('/registerProperty', (req, res, next) => auth(req, res, next, { allowed: ["default", "owner"] }), function (req, res) {
  const user = req.cookies.user;
  res.render('pages/registerProperty', {user});
});

app.post('/registerProperty', (req, res, next) => auth(req, res, next, { allowed: ["default", "owner"] }), async function (req, res) {
  const user = req.cookies.user;
  const { id, name } = user;
  const {
    title,
    location,
    reference,
    mainPhoto,
    maxGuests,
    numRooms,
    numBathrooms,
    numBeds,
    description,
    price
  } = req.body;
  const postData = JSON.stringify({
    ownerId: id,
    owner: name,
    title,
    location,
    reference,
    mainPhoto,
    maxGuests,
    numRooms,
    numBathrooms,
    numBeds,
    description,
    price
  });
  try {
    const response = await fetch("http://localhost:8081/registerProperty", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: user.token },
      body: postData,
    });
    const data = await response.json();
    res.redirect('/myProperties');
  } catch (err) {
    res.redirect('/reservations');
  }
})

app.get('/myProperties', (req, res, next) => auth(req, res, next, { allowed: [ "owner"] }), async function (req, res) {
  const user = req.cookies.user;
  try {
    const response = await fetch('http://localhost:8081/myProperties', {
      method: "GET",
      headers: { Authorization: user.token },
    });
    if (!response.ok) return res.render("pages/error", {user});

    const data = await response.json();

    res.render('pages/myProperties', {myProperties: data, user});
  } catch (error) {
    return res.render("pages/error", {user});
  }
});

app.get("/logout", async (req, res) => {
  try {
    const response = await fetch("http://localhost:8081/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: req.cookies.user.token },
    });
    if (response.ok) {
      res.clearCookie("user");
      localStorage.clear();
    }
    res.redirect("/");
  } catch (err) {
    res.redirect("/");
  }
});

// Default route
app.get("*", (req, res) => {
  res.status(404).end('PAGE NOT FOUND')
});

app.listen(8080);
console.log('Server is listening on port 8080');
