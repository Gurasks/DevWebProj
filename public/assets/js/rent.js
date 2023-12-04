const urlString = window.location.href; // www.test.com?filename=test
const url = new URL(urlString);
const propertyId = url.searchParams.get("id");
document.querySelector("#propertyId").value = propertyId;
document.querySelector("#propertyName").value = document.querySelector("#propertyTitle").innerHTML;
