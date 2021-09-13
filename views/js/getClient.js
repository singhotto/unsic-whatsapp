// const socket = io("/");
const socket = io("http://localhost:3000");
const submitBtn = document.getElementById("submit");
const all = document.getElementById("tutti");
const nazione = document.getElementById("nazione");
const lavoro = document.getElementById("lavoro");
const comune = document.getElementById("comune");
const clientTable = document.querySelector("table");
const generateQr = document.getElementById("generate_qr");
const qrImg = document.getElementById("qr_img");
const sendBtn = document.getElementById("send");
const msgConnect = document.getElementById("wts_connected");
const msgSend = document.getElementById("msg_send");
const wtsMsg = document.getElementById("wts_msg");

let checkBtn = false;
generateQr.disabled = true;
sendBtn.disabled = true;

all.addEventListener("change", (e) => {
  if (e.target.checked) {
    checkBtn = true;
    nazione.disabled = true;
    lavoro.disabled = true;
    comune.disabled = true;
    nazione.value = "ALL";
    comune.value = "Tutte";
    lavoro.value = "ALL";
  } else {
    checkBtn = false;
    nazione.disabled = false;
    lavoro.disabled = false;
    comune.disabled = false;
  }
});

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log(all);
  socket.emit("filter", {
    all: checkBtn,
    nazione: nazione.value.toUpperCase(),
    comune: comune.value.toUpperCase(),
    lavoro: lavoro.value.toUpperCase(),
  });
  generateQr.disabled = false;
});

socket.on("filteredObj", (data) => {
  clientTable.innerHTML = "";
  let final = `<tr class="responsive-table__row">
  <th class="responsive-table__head__title responsive-table__head__title--name">N°</th>
  <th class="responsive-table__head__title responsive-table__head__title--name">Cognome</th>
  <th class="responsive-table__head__title responsive-table__head__title--name">Nome</th>
  <th class="responsive-table__head__title responsive-table__head__title--name">Telefono</th>
  <th class="responsive-table__head__title responsive-table__head__title--name">Nazione</th>
  <th class="responsive-table__head__title responsive-table__head__title--name">Comune</th>
  <th class="responsive-table__head__title responsive-table__head__title--name">Professione</th>
</tr>`;
  for (let i = 0; i < data.length; i++) {
    let f = `<tr class="responsive-table__row">
      <td>${i}</td>
      <td>${data[i].cognome}</td>
      <td>${data[i].nome}</td>
      <td>${data[i].telefono}</td>
      <td>${data[i].nazione}</td>
      <td>${data[i].comune}</td>
      <td>${data[i].lavoro}</td>
    </tr>`;
    final += f;
  }
  clientTable.innerHTML = final;
});

generateQr.addEventListener("click", () => {
  socket.emit("generate_qr");
  document.getElementById("l1").style.display = "block";
  submitBtn.disabled = true;
  generateQr.disabled = true;
  generateQr.style.display = "none";
});

socket.on("qr_ready", (src) => {
  document.getElementById("l1").style.display = "none";
  document.getElementById("l2").style.display = "block";
  qrImg.innerHTML = `<img src=${src} alt="QR Code Image">`;
});

socket.on("connected", () => {
  document.getElementById("l2").style.display = "none";
  document.querySelector("#wts_msg_container textarea").style.display = "block";
  sendBtn.style.display = "block";
  qrImg.style.display = "none";
  msgConnect.innerText = "Connected to Whatsapp";
  sendBtn.disabled = false;
});

sendBtn.addEventListener("click", () => {
  socket.emit("sendMsg", wtsMsg.value);
  submitBtn.disabled = true;
  sendBtn.disabled = true;
  generateQr.disabled = true;
});

socket.on("msgSent", () => {
  msgSend.innerText = "msg successFully sent";
});
