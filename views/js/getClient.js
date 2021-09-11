const socket = io("/");
// const socket = io("http://localhost:3000");
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

all.addEventListener("change", (e) => {
  if (e.target.checked) {
    checkBtn = true;
    nazione.disabled = true;
    lavoro.disabled = true;
    comune.disabled = true;
    nazione.value = "ALL";
    comune.value = "ALL";
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
    nazione: nazione.value,
    comune: comune.value,
    lavoro: lavoro.value,
  });
});

socket.on("filteredObj", (data) => {
  let final = "";
  clientTable.innerHTML = "";
  for (let i = 0; i < data.length; i++) {
    let f = `<tr>
      <th>${data[i].cognome}</th>
      <th>${data[i].nome}</th>
      <th>${data[i].telefono}</th>
      <th>${data[i].nazione}</th>
      <th>${data[i].comune}</th>
      <th>${data[i].lavoro}</th>
    </tr>`;
    final += f;
  }
  clientTable.innerHTML = final;
});

generateQr.addEventListener("click", () => {
  socket.emit("generate_qr");
  document.getElementById("l1").style.display = "block";
});

socket.on("qr_ready", (src) => {
  document.getElementById("l1").style.display = "none";
  document.getElementById("l2").style.display = "block";
  qrImg.innerHTML = `<img src=${src} alt="QR Code Image">`;
});

socket.on("connected", () => {
  document.getElementById("l2").style.display = "none";
  msgConnect.innerText = "Connected to Whatsapp";
});

sendBtn.addEventListener("click", () => {
  socket.emit("sendMsg", wtsMsg.value);
});

socket.on("msgSent", () => {
  msgSend.innerText = "msg successFully sent";
});
