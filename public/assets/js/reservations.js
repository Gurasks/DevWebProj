const undoReservations = document.querySelectorAll("span");
function undoReservation (id) {
    fetch("./reservation?id=" + id, {
        method: "DELETE",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
      .then((response) => response.json())
      .then((json) => console.log(json));
}

[].forEach.call(undoReservations, function (el) {
    el.addEventListener("click", function () {undoReservation(el.id)});
});
