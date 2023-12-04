require("dotenv-safe").config({ path: '../.env' })
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
const fs = require('fs')
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const usersFilePath = __dirname + "/data/users.json";
const propertiesFilePath = __dirname + "/data/properties.json";

function auth(req, res, next) {
    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Internal Server Error" });
        try {
            const { user, password } = req.body;

            const users = JSON.parse(data);
            const foundUser = users.list.find((jsonUser) => jsonUser.name === user && jsonUser.password === password);
            if(foundUser) {
                const { id, name, role } = foundUser;
                req.user = { id, name, role };
                return next();
            }
            else return res.status(500).json({ error: "E-mail ou senha inválidos." });
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    })
}

const blacklist = []

function verifyJWT(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.redirect('/login');
    if(blacklist.includes(token)) return res.status(401).json({ auth: false, message: 'Token expirado' });
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) return res.status(401).json({ auth: false, message: 'Falha na autenticação' });
      const { id, name, role } = decoded;
      req.user = { id, name, role };
      req.token = token;
      return next();
    });
}

app.get('/properties', function(req, res) {
    const propertyId = req.query.id;
    fs.readFile(propertiesFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Internal Server Error" });
        try {
            const properties = JSON.parse(data);
            if(propertyId) {
                const foundProperty = properties.prop.find((propJSON) => propJSON.id === propertyId);
                if(!foundProperty) return res.status(500).json({ error: "Esta propriedade nao foi encontrada." });
                return res.json(foundProperty);
            }
            return res.json(properties);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
//   res.send(require('./data/properties.json'));
});

app.get('/reservations', verifyJWT, function(req, res) {
    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Internal Server Error" });
        try {
            const user = req.user;

            const users = JSON.parse(data);
            const foundUser = users.list.find((userJSON) => userJSON.id === user.id);
            if(!foundUser) return res.status(500).json({ error: "Este usuário nao foi encontrado." });
            return res.json(foundUser.reservations);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    })
})

app.delete('/reservation', verifyJWT, function(req, res) {
    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Internal Server Error" });
        try {
            const user = req.user;
            const id = req.query.id;

            const users = JSON.parse(data);
            const userIndex = users.list.findIndex((userJSON) => userJSON.id === user.id);

            if (userIndex === -1) return res.status(404).json({ error: "User not found" });

            users.list[userIndex].reservations = users.list[userIndex].reservations.filter((reservation) => reservation.id !== id);
            fs.writeFile( usersFilePath, JSON.stringify(users, null, 2), "utf8", (writeErr) => {
                if (writeErr) return res.status(500).json({ error: "Internal Server Error" });
                res.json({ message: "Reservation cancelled", reservations: users.list[userIndex].reservations });
            });
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    })
})

app.post('/login', async (req, res, next) => auth(req, res, next), (req, res) => {
    const { id, role, name } = req.user
    const token = jwt.sign({ id, role, name }, process.env.SECRET, { expiresIn: 500 });
    return res.json({ token: token, user: req.user });
});

app.post('/register', function(req, res) {
    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Internal Server Error" });
        try {
            const { user, password } = req.body;

            const users = JSON.parse(data);
            const foundUser = users.list.find((userJSON) => userJSON.name === user);

            if(foundUser) return res.status(500).json({ error: "Este usuário já existe." });

            users.list.push({ id: uuidv4(), name: user, password: password, role: 'default', properties: [], reservations: [] })

            fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf8", err => {
                if (err) return res.status(500).json({ error: "Internal Server Error" });
                return res.json({ message: "Usuário cadastrado com sucesso" });
            });

        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    })
})

app.patch('/reservation', verifyJWT, function(req, res) {
    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Internal Server Error" });
        try {
            const { userId } = req.body;
            const reservationData = { id: uuidv4(), ...req.body};
            const users = JSON.parse(data);
            const userIndex = users.list.findIndex((userJSON) => userJSON.id === userId);
            if (userIndex === -1) return res.status(404).json({ error: "User not found" });
            users.list[userIndex].reservations.push(reservationData);
            fs.writeFile( usersFilePath, JSON.stringify(users, null, 2), "utf8", (writeErr) => {
                if (writeErr) return res.status(500).json({ error: "Internal Server Error" });
                return res.json({ message: "Reserva feitam com sucesso!" });
            });
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    })
})

app.post('/registerProperty', verifyJWT, function(req, res) {
    const { id, role, name } = req.user;
    const propertyId = uuidv4();
    fs.readFile(propertiesFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Internal Server Error" });
        try {
            const properties = JSON.parse(data);
            properties.prop.push({ id: propertyId, ...req.body })
            fs.writeFile(propertiesFilePath, JSON.stringify(properties, null, 2), "utf8", err => {
                if (err) return res.status(500).json({ error: "Internal Server Error" });
            });
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });



    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Internal Server Error" });
        try {
            const users = JSON.parse(data);
            const userIndex = users.list.findIndex((userJSON) => userJSON.id === id);

            if(role === "default") {
                users.list[userIndex].role = "owner";

            }

            users.list[userIndex].properties.push(propertyId);

            fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf8", err => {
                if (err) return res.status(500).json({ error: "Internal Server Error" });
            });
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
    return res.json({ message: "Propriedade cadastrada com sucesso"});
})

app.get('/myProperties', verifyJWT, async function(req, res) {
    const { id } = req.user;
    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Internal Server Error" });
        try {
            const users = JSON.parse(data);
            const foundUser = users.list.find((userJSON) => userJSON.id === id);
            if(!foundUser) return res.status(500).json({ error: "Este usuário nao foi encontrado." });
            const myPropertiesIds = foundUser.properties;
            fs.readFile(propertiesFilePath, "utf8", (err, data) => {
                if (err) return res.status(500).json({ error: "Internal Server Error" });
                try {
                    const properties = JSON.parse(data);
                    const myProperties = properties.prop.filter((property) => myPropertiesIds.includes(property.id))
                    return res.json(myProperties);
                } catch (err) {
                    return res.status(500).json({ error: "Internal Server Error" });
                }
            });

        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

})

app.get('/auth', verifyJWT, (req, res) => {
    return res.json({ token: req.token, user: req.user });
});

app.post('/logout', verifyJWT, function(req, res) {
    allowedList.push(req.token);
    res.json({ auth: false, token: null });
})

app.listen(8081);
console.log('Server is listening on port 8081');
