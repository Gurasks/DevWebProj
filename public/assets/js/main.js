
window.addEventListener("load", (event) => {
    let body = document.querySelector('body');
    let fontSize = localStorage.getItem("fontSize");
    body.classList.add('fs-' + fontSize);
    initialTheme();
});

document.querySelector("#theme").addEventListener("click", changeTheme);
document.querySelector("#fontMinus").addEventListener("click", decreaseFont);
document.querySelector("#fontPlus").addEventListener("click", increaseFont);
function initialTheme () {
    let initialTheme = localStorage.getItem("theme");
    let themeBtn = document.querySelector("#theme");
    if (!initialTheme) localStorage.setItem("theme", 'light');
    else if (initialTheme === 'dark') darkMode(themeBtn);
}
function changeTheme () {
    let themeBtn = document.querySelector("#theme");
    if (themeBtn.innerHTML === 'Claro') darkMode(themeBtn);
    else lightMode(themeBtn);
}

function darkMode (themeBtn) {
    themeBtn.innerHTML = 'Escuro';
    let navbar = document.querySelector('.navbar-dark');
    navbar.classList.add('navbar-light');
    navbar.classList.remove('navbar-dark');
    let bgDark = document.querySelectorAll('.bg-dark');
    let bgLight = document.querySelectorAll('.bg-light');
    [].forEach.call(bgDark, function (el) {
        el.classList.add('bg-light');
        el.classList.remove('bg-dark');
    });
    [].forEach.call(bgLight, function (el) {
        el.classList.add('bg-dark');
        el.classList.remove('bg-light');
    });
    let brandWhite = document.querySelectorAll('.brand-white');
    let brandBlack = document.querySelectorAll('.brand-black');
    [].forEach.call(brandWhite, function (el) {
        el.classList.add('brand-black');
        el.classList.remove('brand-white');
    });
    [].forEach.call(brandBlack, function (el) {
        el.classList.add('brand-white');
        el.classList.remove('brand-black');
    });
    let lightBtns = document.querySelectorAll('.btn-outline-light');
    [].forEach.call(lightBtns, function (el) {
        el.classList.add('btn-outline-dark');
        el.classList.remove('btn-outline-light');
    });
    localStorage.setItem("theme", 'dark');
}

function lightMode (themeBtn) {
    themeBtn.innerHTML = 'Claro';
    let navbar = document.querySelector('.navbar-light');
    navbar.classList.add('navbar-dark');
    navbar.classList.remove('navbar-light');
    let bgLight = document.querySelectorAll('.bg-light');
    let bgDark = document.querySelectorAll('.bg-dark');
    [].forEach.call(bgLight, function (el) {
        el.classList.add('bg-dark');
        el.classList.remove('bg-light');
    });
    [].forEach.call(bgDark, function (el) {
        el.classList.add('bg-light');
        el.classList.remove('bg-dark');
    });
    let brandWhite = document.querySelectorAll('.brand-white');
    let brandBlack = document.querySelectorAll('.brand-black');
    [].forEach.call(brandWhite, function (el) {
        el.classList.add('brand-black');
        el.classList.remove('brand-white');
    });
    [].forEach.call(brandBlack, function (el) {
        el.classList.add('brand-white');
        el.classList.remove('brand-black');
    });
    let darkBtns = document.querySelectorAll('.btn-outline-dark');
    [].forEach.call(darkBtns, function (el) {
        el.classList.add('btn-outline-light');
        el.classList.remove('btn-outline-dark');
    });
    localStorage.setItem("theme", 'light');
}

function decreaseFont () {
    let fontSize = parseInt(localStorage.getItem("fontSize"));
    if (fontSize && fontSize < 6) localStorage.setItem("fontSize", fontSize+1);
    else localStorage.setItem("fontSize", 6);
    changeFontSize();
}

function increaseFont () {
    let fontSize = parseInt(localStorage.getItem("fontSize"));
    if (!fontSize) localStorage.setItem("fontSize", 5)
    else if (fontSize && fontSize > 1) localStorage.setItem("fontSize", fontSize-1);
    changeFontSize();
}

function changeFontSize () {
    let body = document.querySelector('body');
    let fontSize = localStorage.getItem("fontSize");
    body.classList.remove('fs-1');
    body.classList.remove('fs-2');
    body.classList.remove('fs-3');
    body.classList.remove('fs-4');
    body.classList.remove('fs-5');
    body.classList.remove('fs-6');
    body.classList.add('fs-' + fontSize);
}
