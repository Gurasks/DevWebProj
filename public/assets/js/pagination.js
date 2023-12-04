let currentPage = 1;
let prevButton = document.querySelector("#prev");
let nextButton = document.querySelector("#next");
let rent0 = document.querySelector("#rent-0");
let rent1 = document.querySelector("#rent-1");
let rent2 = document.querySelector("#rent-2");
prevButton.addEventListener("click", previousPage);
nextButton.addEventListener("click", nextPage);
async function previousPage() {
    currentPage--;
    fetch("./props?id="+currentPage).then(res =>
        res.json()).then(data => {
            changePropInfo(rent0, data.prop[0]);
            if (data.prop[1]) changePropInfo(rent1, data.prop[1]);
            if (data.prop[2]) changePropInfo(rent2, data.prop[2]);
        })
    changeButtonVisibilities(currentPage);
}

async function nextPage() {
    currentPage++;
    fetch("./props?id="+currentPage).then(res =>
        res.json()).then(data => {
            changePropInfo(rent0, data.prop[0]);
            if (data.prop[1]) changePropInfo(rent1, data.prop[1]);
            if (data.prop[2]) changePropInfo(rent2, data.prop[2]);
        })
    changeButtonVisibilities(currentPage);
}

function changePropInfo (el, prop) {
    el.href = "./rent?id=" + prop.id;
    el.children[0].children[0].src = prop.mainPhoto;
    el.children[1].children[0].children[0].innerHTML = prop.location;
    el.children[1].children[0].children[1].innerHTML = prop.ratingAvg + " <i class='fa-solid fa-star'></i>"
    el.children[1].children[1].innerHTML = prop.reference
    el.children[1].children[2].innerHTML = "Diária R$" + prop.rentPrice + ",00"
}

function changeButtonVisibilities(currentPage) {
    if(currentPage === 1) {
        prevButton.classList.add('d-none');
    } else if(currentPage !== 1) {
        prevButton.classList.remove('d-none');
    }
    if(currentPage === maxPage) {
        nextButton.classList.add('d-none');
    } else if(currentPage !== maxPage) {
        nextButton.classList.remove('d-none');
    }
}
