function search() {
  const myDiv = document.createElement("div");
  myDiv.id = "div_id";
  myDiv.innerHTML =
    '<div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">' +
    ' <div class="modal-dialog modal-dialog-centered" role="document">' +
    '<div class="modal-content">' +
    '<div class="modal-header"> ' +
    ' <h5 class="modal-title" id="exampleModalLongTitle">Modal title</h5>' +
    ' <button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
    ' <span aria-hidden="true">&times;</span></button> </div>' +
    '  <div class="modal-body">' +
    '<div class="col-md-6">' +
    ' <div class="form">' +
    ' <i class="fa fa-search"></i>' +
    ' <input type="text" onkeyup="sendData(this)" class="form-control form-input" placeholder="Search anything...">' +
    '<span class="left-pan"><i class="fa fa-microphone"></i></span>' +
    "</div>" +
    " </div>" +
    ' <section id="searching">';

  (" </section>");
  "</div>" + '<div class="modal-footer">' + "</div></div></div></div>";

  document.body.appendChild(myDiv);
}

function sendData(e) {
  console.log("searchil kero");
  console.log(e.value);
  const searchResults = document.getElementById("searching");
  const exp = e.value.toString();
  const match = exp.match(/^[a-zA-z ]*/);
  const match2 = exp.match(/\s*/);
  if (match2[0] === e.value) {
    searchResults.innerHTML = "";
  }
  if (match[0] === e.value && e.value != "") {
    fetch("/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: e.value }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        const suggestion = data.payload;
        searchResults.innerHTML = "";
        if (suggestion.length < 1) {
          searchResults.innerHTML = "<p>Sorry. Nothing Found.</p>";
          return;
        }
        suggestion.forEach((element, i) => {
          if (element.type == "product") {
            searchResults.innerHTML +=
              `<a href='/shopview?q=${element.id}'>${element.title}</a>` +
              `<p class="text-muted m-0">${element.type}</p>`;
          } else if (element.type == "category") {
            searchResults.innerHTML +=
              `<a href='/shopview?cat=${element.id}'>${element.title}</a>` +
              `<p class="text-muted m-0">${element.type}</p>`;
          }
          if (suggestion[i + 1]) {
            searchResults.innerHTML += '<hr class="p-0 m-0">';
          }
        });
      });
    return;
  }
  searchResults.innerHTML = "";
}
