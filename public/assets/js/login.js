let login = document.querySelector("#login");
let register = document.querySelector("#register");
let userInput = document.querySelector("#userInput");
let passwordInput = document.querySelector("#passwordInput");
login.addEventListener("click", loginReq);
register.addEventListener("click", registerReq);

async function loginReq () {
    fetch("./login", {
    method: "POST",
    body: JSON.stringify({
        user: userInput.value,
        password: passwordInput.value
    }),
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
})
  .then((response) => response.json())
  .then((json) => console.log(json));
}

async function registerReq () {
    fetch("./register", {
    method: "POST",
    body: JSON.stringify({
        user: userInput.value,
        password: passwordInput.value
    }),
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
})
  .then((response) => response.json())
  .then((json) => console.log(json));
}
