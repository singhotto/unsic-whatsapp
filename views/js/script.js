const cognome = document.getElementById("cognome");
const msgbox = document.getElementById("success_message");
const nome = document.getElementById("nome");
const telefono = document.getElementById("telefono");
const nazione = document.getElementById("nazione");
const comune = document.getElementById("comune");
const lavoro = document.getElementById("lavoro");
const submit = document.getElementById("submitHandler");
const rgxlet = /[a-zA-Z]/gi;
const socket = io("/");

socket.on("connection", () => {
  console.log("im connected to addClient");
});

submit.addEventListener("click", (e) => {
  e.preventDefault();
  submitHandler(e);
});

telefono.addEventListener("keyup", (e) => {
  if (rgxlet.test(e.target.value)) {
    alertMsg("Numero di telefono non può contenere le lettere", "red");
  }
  if (e.target.value.length > 10) {
    alertMsg("Numero telefono non può essere maggiore o minore di 10", "red");
  }
});

comune.addEventListener("keyup", (e) => {
  if (!rgxlet.test(e.target.value)) {
    alertMsg("Non ci possono essere dei numeri", "red");
  }
});

function submitHandler(e) {
  e.preventDefault();
  if (
    rgxlet.test(telefono.value) ||
    telefono.value.length < 10 ||
    telefono.value.length > 10 ||
    /[0-9]/.test(comune.value) ||
    cognome.value == "" ||
    nome.value == "" ||
    telefono.value == "" ||
    comune.value == ""
  ) {
    alertMsg("Errori nei campi", "red");
    return;
  } else {
    socket.emit("ClientData", {
      cognome: cognome.value,
      nome: nome.value,
      telefono: "+39" + telefono.value,
      nazione: nazione.value,
      comune: cognome.value,
      lavoro: lavoro.value,
    });
  }
}

function alertMsg(msg, color = "green") {
  msgbox.style.display = "block";
  if (color == "red") {
    msgbox.classList.remove("alert-success");
    msgbox.classList.add("alert-danger");
  }

  msgbox.innerText = msg;
  let timeout = setTimeout(() => {
    msgbox.style.display = "none";
    msgbox.classList.remove("alert-danger");
    msgbox.classList.add("alert-success");
    msgbox.innerText = msg;
  }, 3000);
}

socket.on("postMessage", (msg) => {
  cognome.value = "";
  nome.value = "";
  telefono.value = "";
  comune.value = "";
  alertMsg(msg);
});
