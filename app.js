// =====================================================================
//  📻 Rádio + Chat da Equipe de Som — ARQUIVO ÚNICO (servidor + HTML + JS)
//  Uso:  node app.js        (Node 16+, sem dependências)
//  Porta: PORT=8080 node app.js
//
//  (Opcional) package.json equivalente — não é necessário para rodar:
//  { "name": "radio-chat-equipe-som", "version": "1.0.0",
//    "main": "app.js", "scripts": { "start": "node app.js" },
//    "engines": { "node": ">=16" }, "license": "MIT" }
// =====================================================================

const http = require("http");
const crypto = require("crypto");

// ---------------- Front-end (HTML + CSS + JS do navegador) ----------------
const HTML = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
<meta name="theme-color" content="#0f1115" />
<link rel="manifest" href="/manifest.webmanifest" />
<link rel="icon" href="/icon-192.png" type="image/png" />
<link rel="apple-touch-icon" href="/icon-192.png" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Rádio Som" />
<title>Rádio + Chat • Equipe de Som</title>
<style>
  :root {
    --bg: #0f1115; --panel: #181b22; --panel2: #20242d; --line: #2b303b;
    --text: #e8eaf0; --muted: #8b93a5; --accent: #ff7a1a; --accent2: #ffb36b;
    --ok: #3ecf8e; --danger: #ff4d4f;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body {
    background: var(--bg); color: var(--text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    display: flex; flex-direction: column;
  }
  header {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 10px 16px; background: var(--panel); border-bottom: 1px solid var(--line);
  }
  header h1 { font-size: 16px; margin: 0; letter-spacing: .3px; }
  header h1 span { color: var(--accent); }
  .status { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 6px; }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--danger); }
  .dot.on { background: var(--ok); }

  main { flex: 1; min-height: 0; display: grid; grid-template-columns: 340px 1fr; }
  @media (max-width: 800px) { main { grid-template-columns: 1fr; grid-template-rows: auto 1fr; } }

  /* Rádio */
  .radio { background: var(--panel); border-right: 1px solid var(--line); padding: 16px; overflow-y: auto; }
  @media (max-width: 800px) { .radio { border-right: 0; border-bottom: 1px solid var(--line); } }
  .radio h2, .chat-top h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin: 0 0 12px; }
  .now {
    background: var(--panel2); border: 1px solid var(--line); border-radius: 14px;
    padding: 16px; text-align: center;
  }
  .eq { height: 36px; display: flex; gap: 4px; align-items: flex-end; justify-content: center; margin-bottom: 10px; }
  .eq i { width: 6px; height: 6px; background: var(--accent); border-radius: 3px; transition: height .2s; }
  .eq.play i { animation: bounce 0.9s infinite ease-in-out; }
  .eq.play i:nth-child(2) { animation-delay: .1s; } .eq.play i:nth-child(3) { animation-delay: .25s; }
  .eq.play i:nth-child(4) { animation-delay: .4s; } .eq.play i:nth-child(5) { animation-delay: .15s; }
  .eq.play i:nth-child(6) { animation-delay: .3s; } .eq.play i:nth-child(7) { animation-delay: .05s; }
  @keyframes bounce { 0%,100% { height: 6px; } 50% { height: 34px; } }
  #stationName { font-weight: 600; font-size: 17px; }
  #radioMsg { color: var(--muted); font-size: 12px; min-height: 16px; margin-top: 4px; }
  .controls { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
  .play-btn {
    width: 52px; height: 52px; border-radius: 50%; border: 0; cursor: pointer;
    background: var(--accent); color: #111; font-size: 22px; font-weight: 700;
  }
  .play-btn:hover { background: var(--accent2); }
  input[type=range] { flex: 1; accent-color: var(--accent); }
  label.small { font-size: 12px; color: var(--muted); display: block; margin: 16px 0 6px; }
  select, input[type=text], textarea {
    width: 100%; background: var(--panel2); color: var(--text); border: 1px solid var(--line);
    border-radius: 10px; padding: 10px 12px; font: inherit; outline: none;
  }
  select:focus, input[type=text]:focus { border-color: var(--accent); }
  .row { display: flex; gap: 8px; }
  button.btn {
    background: var(--panel2); color: var(--text); border: 1px solid var(--line); border-radius: 10px;
    padding: 10px 14px; cursor: pointer; font: inherit; white-space: nowrap;
  }
  button.btn:hover { border-color: var(--accent); }

  /* Chat */
  .chat { display: flex; flex-direction: column; min-height: 0; }
  .chat-top { padding: 12px 16px; border-bottom: 1px solid var(--line); background: var(--panel); }
  .rooms { display: flex; gap: 6px; flex-wrap: wrap; }
  .room {
    background: var(--panel2); border: 1px solid var(--line); color: var(--text);
    border-radius: 999px; padding: 6px 14px; cursor: pointer; font-size: 13px;
  }
  .room.active { background: var(--accent); color: #111; border-color: var(--accent); font-weight: 600; }
  #online { font-size: 12px; color: var(--muted); margin-top: 8px; }
  #messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .msg { max-width: 78%; background: var(--panel2); border: 1px solid var(--line); border-radius: 14px; padding: 8px 12px; }
  .msg.me { align-self: flex-end; background: #3a2412; border-color: #5a3718; }
  .msg.alert { border-color: var(--danger); box-shadow: 0 0 0 1px var(--danger) inset; }
  .msg .meta { font-size: 11px; color: var(--muted); margin-bottom: 3px; display: flex; gap: 8px; }
  .msg .meta b { color: var(--accent2); }
  .msg .txt { white-space: pre-wrap; word-break: break-word; }
  .msg audio { height: 36px; max-width: 100%; }
  .sys { align-self: center; font-size: 12px; color: var(--muted); }

  .quick { display: flex; gap: 6px; padding: 8px 16px 0; overflow-x: auto; }
  .quick button { background: var(--panel); border: 1px solid var(--line); color: var(--text); border-radius: 999px; padding: 6px 12px; cursor: pointer; font-size: 12px; white-space: nowrap; }
  .quick button:hover { border-color: var(--accent); }
  .quick button.urgent { border-color: var(--danger); color: #ff9a9b; }

  .composer { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--line); background: var(--panel); align-items: flex-end; }
  .composer textarea { resize: none; height: 44px; max-height: 120px; }
  .mic {
    width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line); background: var(--panel2);
    color: var(--text); font-size: 18px; cursor: pointer; flex: none; user-select: none; touch-action: none;
  }
  .mic.rec { background: var(--danger); border-color: var(--danger); animation: pulse 1s infinite; }
  @keyframes pulse { 50% { transform: scale(1.1); } }
  .send { height: 44px; background: var(--accent); color: #111; border: 0; border-radius: 10px; padding: 0 18px; font-weight: 700; cursor: pointer; }
  .send:hover { background: var(--accent2); }

  /* Login */
  #login { position: fixed; inset: 0; background: rgba(0,0,0,.75); display: flex; align-items: center; justify-content: center; z-index: 10; padding: 16px; }
  #login .card { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; padding: 24px; width: 100%; max-width: 360px; }
  #login h2 { margin: 0 0 6px; } #login p { color: var(--muted); font-size: 14px; margin: 0 0 16px; }
  #login .send { width: 100%; margin-top: 12px; }
  .hint { font-size: 11px; color: var(--muted); padding: 0 16px 8px; }

  /* ===== Celular / app instalado ===== */
  [hidden] { display: none !important; }
  html, body { overscroll-behavior: none; -webkit-tap-highlight-color: transparent; }
  body { height: 100dvh; }
  .hright { display: flex; align-items: center; gap: 8px; }
  .hbtn {
    background: var(--panel2); color: var(--text); border: 1px solid var(--line); border-radius: 999px;
    padding: 6px 10px; font-size: 13px; cursor: pointer; white-space: nowrap;
  }
  .hbtn.on { border-color: var(--ok); color: var(--ok); }
  .now .info { min-width: 0; }
  #radioToggle { display: none; }
  .mic { -webkit-touch-callout: none; -webkit-user-select: none; }
  @media (max-width: 800px) {
    body { padding-bottom: env(safe-area-inset-bottom); }
    header { padding: 8px 12px; padding-top: calc(8px + env(safe-area-inset-top)); }
    header h1 { font-size: 14px; }
    .status { font-size: 11px; }
    #meName { max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    main { display: flex; flex-direction: column; }
    .radio { flex: none; padding: 8px 12px; overflow: visible; }
    .radio h2 { display: none; }
    .now { display: flex; align-items: center; gap: 10px; padding: 8px 10px; text-align: left; }
    .now .eq { display: none; }
    .now .info { flex: 1; }
    #stationName { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #radioMsg { margin-top: 0; }
    .controls { margin-top: 0; gap: 8px; }
    .controls span { display: none; }
    .controls input[type=range] { width: 90px; flex: none; }
    .play-btn { width: 46px; height: 46px; font-size: 18px; }
    #radioToggle { display: inline-block; padding: 8px 10px; }
    #radioMore { display: none; }
    #radioMore.open { display: block; }
    .chat { flex: 1; min-height: 0; }
    .chat-top { padding: 8px 12px; }
    .chat-top h2 { display: none; }
    .rooms { flex-wrap: nowrap; overflow-x: auto; }
    .room { white-space: nowrap; padding: 8px 14px; }
    #online { margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #messages { padding: 12px; }
    .msg { max-width: 92%; }
    .quick { padding: 8px 12px 0; }
    .quick button { padding: 9px 14px; font-size: 13px; }
    .composer { padding: 8px 10px; gap: 6px; }
    select, input[type=text], textarea { font-size: 16px; }
    .composer textarea { min-height: 48px; }
    .mic { width: 48px; height: 48px; }
    .send { height: 48px; padding: 0 16px; }
    .hbtn { padding: 8px 10px; }
  }

  /* ===== Menu lateral (celular) ===== */
  .hleft { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .hbtns { display: flex; align-items: center; gap: 8px; }
  .menu-btn { display: none; font-size: 18px; line-height: 1; padding: 8px 12px; }
  .curroom { display: none; }
  #scrim, #drawer { display: none; }
  @media (max-width: 800px) {
    .menu-btn { display: inline-block; }
    .hleft { flex: 1; }
    header h1 { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sep, #meName { display: none; }
    #radioToggle { display: none !important; }
    .curroom { display: block; font-weight: 700; font-size: 15px; }
    #scrim {
      display: block; position: fixed; inset: 0; background: rgba(0,0,0,.55);
      opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 20;
    }
    #drawer {
      display: flex; flex-direction: column; position: fixed; top: 0; bottom: 0; left: 0;
      width: min(84vw, 320px); background: var(--panel); border-right: 1px solid var(--line);
      transform: translateX(-102%); visibility: hidden;
      transition: transform .22s ease, visibility 0s linear .22s; z-index: 21;
      padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);
    }
    body.drawer-open #scrim { opacity: 1; pointer-events: auto; }
    body.drawer-open #drawer { transform: none; visibility: visible; transition: transform .22s ease, visibility 0s; }
    .dhead { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid var(--line); }
    .dtitle { font-weight: 700; font-size: 16px; }
    .dsub { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .dbody { flex: 1; overflow-y: auto; padding: 4px 16px 24px; }
    .dsec { margin-top: 18px; }
    .dsec h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin: 0 0 8px; }
    #drawer .rooms { flex-direction: column; flex-wrap: nowrap; overflow: visible; gap: 6px; }
    #drawer .room { width: 100%; text-align: left; border-radius: 10px; padding: 12px 14px; font-size: 15px; }
    #drawer #radioMore { display: block; }
    #drawer .hbtns { flex-direction: column; align-items: stretch; gap: 6px; }
    #drawer .hbtn, .dbtn {
      width: 100%; text-align: left; border-radius: 10px; padding: 12px 14px; font-size: 14px;
      background: var(--panel2); color: var(--text); border: 1px solid var(--line); cursor: pointer;
    }
    #drawer .hbtn.on { border-color: var(--ok); color: var(--ok); }
    #drawerOpts { display: flex; flex-direction: column; gap: 6px; }
    #drawer #drawerClose { width: auto; flex: none; padding: 8px 12px; }
    #statusTxt { display: none; }
    #drawerOpts .hbtns { order: -1; }
  }
</style>
</head>
<body>

<div id="login">
  <form class="card" id="loginForm">
    <h2>📻 Equipe de Som</h2>
    <p>Digite seu nome (e função) para entrar no chat.</p>
    <input type="text" id="nameInput" maxlength="30" placeholder="Ex.: João - PA" autocomplete="nickname" required />
    <button class="send" type="submit">Entrar</button>
  </form>
</div>

<header>
  <div class="hleft"><button class="hbtn menu-btn" id="menuBtn" aria-label="Abrir menu">☰</button><h1>📻 Rádio <span>+</span> Chat • Equipe de Som</h1></div>
  <div class="hright">
    <div class="hbtns" id="hbtns">
    <button class="hbtn" id="installBtn" hidden>⬇ Instalar app</button>
    <button class="hbtn" id="notifBtn" title="Ativar avisos de mensagem" hidden>🔔 Ativar avisos</button>
    <button class="hbtn" id="wakeBtn" title="Manter a tela ligada">📱 Tela ligada</button>
  </div>
    <div class="status"><span class="dot" id="dot"></span><span id="statusTxt">desconectado</span><span class="sep"> • </span><span id="meName"></span></div>
  </div>
</header>

<main>
  <!-- RÁDIO -->
  <section class="radio">
    <h2>Rádio</h2>
    <div class="now">
      <div class="eq" id="eq"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="info"><div id="stationName">Selecione uma estação</div><div id="radioMsg"></div></div>
      <div class="controls">
        <button class="play-btn" id="playBtn" title="Tocar / Parar">▶</button>
        <span>🔈</span>
        <input type="range" id="vol" min="0" max="1" step="0.01" value="0.8" />
        <button class="btn" id="radioToggle" title="Mais opções da rádio">⚙</button>
      </div>
    </div>

    <div id="radioMore">
    <label class="small" for="stationSelect">Estações</label>
    <select id="stationSelect"></select>

    <label class="small" for="customUrl">Ou use sua própria URL de stream (MP3/AAC)</label>
    <div class="row">
      <input type="text" id="customUrl" placeholder="https://seu-servidor/stream" />
      <button class="btn" id="customBtn">Usar</button>
    </div>
  </div>
  </section>

  <!-- CHAT -->
  <section class="chat">
    <div class="chat-top">
      <h2>Chat</h2>
      <div class="curroom" id="curRoom"></div>
      <div class="rooms" id="rooms"></div>
      <div id="online"></div>
    </div>
    <div id="messages"></div>
    <div class="quick" id="quick"></div>
    <div class="hint">Segure 🎤 para gravar uma mensagem de voz. Enter envia, Shift+Enter quebra linha.</div>
    <div class="composer">
      <button class="mic" id="mic" title="Segure para falar">🎤</button>
      <textarea id="text" placeholder="Escreva uma mensagem..." rows="1"></textarea>
      <button class="send" id="sendBtn">Enviar</button>
    </div>
  </section>
</main>

<div id="scrim"></div>
<aside id="drawer" aria-hidden="true">
  <div class="dhead">
    <div><div class="dtitle">📻 Equipe de Som</div><div class="dsub" id="drawerName"></div></div>
    <button class="hbtn" id="drawerClose" aria-label="Fechar menu">✕</button>
  </div>
  <nav class="dbody">
    <div class="dsec"><h3>💬 Salas</h3><div id="drawerRooms"></div></div>
    <div class="dsec"><h3>📻 Rádio</h3><div id="drawerRadio"></div></div>
    <div class="dsec"><h3>⚙ Opções</h3>
      <div id="drawerOpts">
        <button class="dbtn" id="renameBtn">✏ Trocar meu nome</button>
        <button class="dbtn" id="reloadBtn">🔄 Recarregar o app</button>
      </div>
    </div>
  </nav>
</aside>

<audio id="player" preload="none"></audio>

<script>
/* ================== CONFIGURAÇÃO ================== */
// Edite à vontade: coloque aqui os streams da sua rádio.
const STATIONS = [
  { name: "SomaFM • Groove Salad", url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { name: "SomaFM • Secret Agent", url: "https://ice1.somafm.com/secretagent-128-mp3" },
  { name: "Radio Paradise • Main Mix", url: "https://stream.radioparadise.com/mp3-128" },
  // { name: "Minha Rádio", url: "https://meu-servidor.com/stream" },
];

// Botões rápidos de chamado para a equipe de som
const QUICK = [
  { label: "🔊 Mais volume", text: "Preciso de MAIS volume.", urgent: false },
  { label: "🔉 Menos volume", text: "Preciso de MENOS volume.", urgent: false },
  { label: "🎤 Testar mic", text: "Pode testar o microfone, por favor?", urgent: false },
  { label: "🎧 Retorno", text: "Ajuste no retorno (monitor), por favor.", urgent: false },
  { label: "✅ Ok", text: "✅ Ok, entendido.", urgent: false },
  { label: "🚨 URGENTE", text: "🚨 CHAMADO URGENTE! Preciso da equipe de som agora!", urgent: true },
];

/* ================== ESTADO ================== */
const $ = (s) => document.querySelector(s);
let me = localStorage.getItem("nome") || "";
let room = localStorage.getItem("sala") || "geral";
let es = null;
let rooms = ["geral", "palco", "mesa-de-som", "transmissao"];

/* ================== RÁDIO ================== */
const player = $("#player");
let currentStation = null;

function fillStations() {
  const sel = $("#stationSelect");
  sel.innerHTML = "";
  STATIONS.forEach((s, i) => {
    const o = document.createElement("option");
    o.value = i; o.textContent = s.name;
    sel.appendChild(o);
  });
  const saved = localStorage.getItem("estacao");
  if (saved !== null && STATIONS[saved]) sel.value = saved;
  setStation(STATIONS[sel.value]);
}

function setStation(st, autoplay = false) {
  currentStation = st;
  $("#stationName").textContent = st.name;
  player.src = st.url;
  $("#radioMsg").textContent = "";
  if (autoplay) play();
  else updatePlayUI();
}

async function play() {
  if (!currentStation) return;
  try {
    $("#radioMsg").textContent = "Conectando...";
    await player.play();
    $("#radioMsg").textContent = "No ar";
  } catch (e) {
    $("#radioMsg").textContent = "Não foi possível tocar esta estação.";
  }
  updatePlayUI();
}
function stop() {
  player.pause();
  // Libera a conexão do stream
  const src = player.src; player.removeAttribute("src"); player.load(); player.src = src;
  $("#radioMsg").textContent = "Parado";
  updatePlayUI();
}
function updatePlayUI() {
  const playing = !player.paused;
  $("#playBtn").textContent = playing ? "■" : "▶";
  $("#eq").classList.toggle("play", playing);
}

$("#playBtn").onclick = () => (player.paused ? play() : stop());
$("#vol").oninput = (e) => { player.volume = +e.target.value; localStorage.setItem("vol", e.target.value); };
$("#stationSelect").onchange = (e) => {
  localStorage.setItem("estacao", e.target.value);
  setStation(STATIONS[e.target.value], true);
};
$("#customBtn").onclick = () => {
  const url = $("#customUrl").value.trim();
  if (!/^https?:[/][/]/i.test(url)) { $("#radioMsg").textContent = "URL inválida."; return; }
  localStorage.setItem("customUrl", url);
  setStation({ name: "Stream personalizado", url }, true);
};
player.addEventListener("error", () => { $("#radioMsg").textContent = "Erro no stream. Verifique a URL."; updatePlayUI(); });
player.addEventListener("pause", updatePlayUI);
player.addEventListener("playing", () => { $("#radioMsg").textContent = "No ar"; updatePlayUI(); });
player.addEventListener("waiting", () => { $("#radioMsg").textContent = "Carregando..."; });

/* ================== CHAT ================== */
function renderRooms() {
  $("#curRoom").textContent = "# " + room;
  const box = $("#rooms");
  box.innerHTML = "";
  rooms.forEach((r) => {
    const b = document.createElement("button");
    b.className = "room" + (r === room ? " active" : "");
    b.textContent = "# " + r;
    b.onclick = () => { if (r !== room) { room = r; localStorage.setItem("sala", r); renderRooms(); connect(); } closeDrawer(); };
    box.appendChild(b);
  });
}

function setStatus(on) {
  $("#dot").classList.toggle("on", on);
  $("#statusTxt").textContent = on ? "conectado" : "reconectando...";
}

function connect() {
  if (es) es.close();
  $("#messages").innerHTML = "";
  es = new EventSource("/events?room=" + encodeURIComponent(room) + "&name=" + encodeURIComponent(me));
  es.onopen = () => setStatus(true);
  es.onerror = () => { setStatus(false); if (es.readyState === 2) setTimeout(connect, 3000); };
  es.addEventListener("history", (e) => {
    const d = JSON.parse(e.data);
    if (d.room !== room) return;
    $("#messages").innerHTML = "";
    d.messages.forEach((m) => addMessage(m, true));
    scrollDown(true);
  });
  es.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    addMessage(m, false);
    if (m.name !== me) { beep(m.alert); notify(m); }
  });
  es.addEventListener("presence", (e) => {
    const d = JSON.parse(e.data);
    if (d.room !== room) return;
    const uniq = [...new Set(d.users)];
    $("#online").textContent = "🟢 " + uniq.length + " online: " + uniq.join(", ");
  });
}

function fmtTime(t) {
  return new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function addMessage(m, silent) {
  const box = $("#messages");
  const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 120;
  const el = document.createElement("div");
  el.className = "msg" + (m.name === me ? " me" : "") + (m.alert ? " alert" : "");
  const meta = document.createElement("div");
  meta.className = "meta";
  const b = document.createElement("b"); b.textContent = m.name;
  const t = document.createElement("span"); t.textContent = fmtTime(m.time);
  meta.append(b, t);
  el.appendChild(meta);
  if (m.type === "audio") {
    const a = document.createElement("audio");
    a.controls = true; a.src = m.audio; a.preload = "metadata";
    el.appendChild(a);
  } else {
    const d = document.createElement("div");
    d.className = "txt"; d.textContent = m.text;
    el.appendChild(d);
  }
  box.appendChild(el);
  if (nearBottom || m.name === me) scrollDown();
}

function scrollDown(force) {
  const box = $("#messages");
  box.scrollTop = box.scrollHeight;
}

async function send(payload) {
  try {
    const r = await fetch("/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room, name: me, ...payload }),
    });
    if (!r.ok) throw new Error((await r.json()).error || "erro");
  } catch (e) {
    alert("Não foi possível enviar: " + e.message);
  }
}

function sendText() {
  const ta = $("#text");
  const text = ta.value.trim();
  if (!text) return;
  ta.value = "";
  ta.style.height = "44px";
  send({ type: "text", text });
}
$("#sendBtn").onclick = sendText;
$("#text").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); }
});
$("#text").addEventListener("input", (e) => {
  e.target.style.height = "44px";
  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
});

// Botões rápidos
function renderQuick() {
  const q = $("#quick");
  QUICK.forEach((b) => {
    const btn = document.createElement("button");
    btn.textContent = b.label;
    if (b.urgent) btn.className = "urgent";
    btn.onclick = () => send({ type: "text", text: b.text, alert: b.urgent });
    q.appendChild(btn);
  });
}

/* ================== VOZ (segurar para falar) ================== */
let recorder = null, chunks = [], recStream = null, recStart = 0;
const mic = $("#mic");

async function startRec() {
  if (recorder) return;
  try {
    recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    alert("Sem acesso ao microfone. O navegador só libera o mic em HTTPS ou localhost.");
    return;
  }
  const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((m) => MediaRecorder.isTypeSupported(m));
  recorder = new MediaRecorder(recStream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
  chunks = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  recorder.onstop = () => {
    recStream.getTracks().forEach((t) => t.stop());
    const dur = Date.now() - recStart;
    const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
    recorder = null;
    if (dur < 400) return; // clique acidental
    const fr = new FileReader();
    fr.onload = () => send({ type: "audio", audio: fr.result });
    fr.readAsDataURL(blob);
  };
  recStart = Date.now();
  recorder.start();
  mic.classList.add("rec");
  // limite de 60 s
  setTimeout(() => recorder && recorder.state === "recording" && stopRec(), 60000);
}
function stopRec() {
  mic.classList.remove("rec");
  if (recorder && recorder.state === "recording") recorder.stop();
}
mic.addEventListener("pointerdown", (e) => { e.preventDefault(); startRec(); });
["pointerup", "pointerleave", "pointercancel"].forEach((ev) => mic.addEventListener(ev, stopRec));

/* ================== SOM DE NOTIFICAÇÃO ================== */
let actx = null;
function beep(urgent) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const tones = urgent ? [880, 660, 880, 660] : [660];
    tones.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = f; o.type = "sine";
      g.gain.setValueAtTime(0.0001, actx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.15, actx.currentTime + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + i * 0.18 + 0.16);
      o.connect(g).connect(actx.destination);
      o.start(actx.currentTime + i * 0.18);
      o.stop(actx.currentTime + i * 0.18 + 0.17);
    });
    if (urgent && navigator.vibrate) navigator.vibrate([200, 100, 200]);
  } catch {}
}

/* ================== CELULAR / APP INSTALADO ================== */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(function () {});

// Mais opções da rádio (no celular ficam escondidas)
$("#radioToggle").onclick = () => $("#radioMore").classList.toggle("open");

// Controles da rádio na tela de bloqueio / central de mídia
function setupMediaSession() {
  if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: currentStation ? currentStation.name : "Rádio",
    artist: "Equipe de Som",
    artwork: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
  });
  navigator.mediaSession.setActionHandler("play", play);
  navigator.mediaSession.setActionHandler("pause", stop);
  navigator.mediaSession.setActionHandler("stop", stop);
}
player.addEventListener("playing", setupMediaSession);

// Segurar o microfone sem abrir o menu do celular
mic.addEventListener("contextmenu", (e) => e.preventDefault());

// Avisos de mensagem quando o app está em segundo plano
let unread = 0;
const baseTitle = document.title;
function notify(m) {
  if (!document.hidden) return;
  unread++;
  document.title = "(" + unread + ") " + baseTitle;
  if ("Notification" in window && Notification.permission === "granted" && "serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification((m.alert ? "🚨 " : "") + m.name + " • #" + m.room, {
        body: m.type === "audio" ? "🎤 Mensagem de voz" : m.text,
        tag: "chat-" + m.room,
        renotify: true,
        vibrate: m.alert ? [300, 100, 300, 100, 300] : [100],
        icon: "/icon-192.png",
        requireInteraction: !!m.alert,
      });
    });
  }
}
const notifBtn = $("#notifBtn");
if ("Notification" in window && Notification.permission === "default") notifBtn.hidden = false;
notifBtn.onclick = async () => {
  const p = await Notification.requestPermission();
  if (p !== "default") notifBtn.hidden = true;
};

// Manter a tela ligada (útil na mesa de som)
let wake = null, wakeWanted = false;
function updateWakeBtn() { $("#wakeBtn").classList.toggle("on", !!wake); }
async function acquireWake() {
  try {
    wake = await navigator.wakeLock.request("screen");
    wake.addEventListener("release", () => { wake = null; updateWakeBtn(); });
  } catch (e) { wake = null; }
  updateWakeBtn();
}
$("#wakeBtn").onclick = async () => {
  if (!("wakeLock" in navigator)) { alert("Este navegador não permite manter a tela ligada."); return; }
  wakeWanted = !wakeWanted;
  if (wakeWanted) await acquireWake();
  else if (wake) await wake.release();
  updateWakeBtn();
};

// Ao voltar para o app: zera contador, reconecta o chat se caiu e religa a tela
document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  unread = 0;
  document.title = baseTitle;
  if (me && (!es || es.readyState === 2)) connect();
  if (wakeWanted && !wake) acquireWake();
  scrollDown();
});

// Botão "Instalar" (Android/Chrome)
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstall = e;
  $("#installBtn").hidden = false;
});
$("#installBtn").onclick = async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  $("#installBtn").hidden = true;
};
window.addEventListener("appinstalled", () => { $("#installBtn").hidden = true; });

/* ================== MENU LATERAL (CELULAR) ================== */
function openDrawer() {
  document.body.classList.add("drawer-open");
  $("#drawer").setAttribute("aria-hidden", "false");
}
function closeDrawer() {
  document.body.classList.remove("drawer-open");
  $("#drawer").setAttribute("aria-hidden", "true");
}
$("#menuBtn").onclick = openDrawer;
$("#scrim").onclick = closeDrawer;
$("#drawerClose").onclick = closeDrawer;
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

// No celular, salas, opções da rádio e botões vão para dentro do menu lateral
const mq = window.matchMedia("(max-width: 800px)");
const moves = [
  { el: $("#rooms"), to: "#drawerRooms" },
  { el: $("#radioMore"), to: "#drawerRadio" },
  { el: $("#hbtns"), to: "#drawerOpts" },
];
moves.forEach((m) => { m.parent = m.el.parentNode; m.next = m.el.nextSibling; });
function layoutForScreen() {
  moves.forEach((m) => {
    if (mq.matches) $(m.to).prepend(m.el);
    else m.parent.insertBefore(m.el, m.next);
  });
  if (!mq.matches) closeDrawer();
}
if (mq.addEventListener) mq.addEventListener("change", layoutForScreen);
layoutForScreen();

$("#renameBtn").onclick = () => {
  const n = prompt("Seu nome:", me);
  if (!n || !n.trim()) return;
  me = n.trim().slice(0, 30);
  localStorage.setItem("nome", me);
  $("#meName").textContent = me;
  $("#drawerName").textContent = me;
  closeDrawer();
  connect();
};
$("#reloadBtn").onclick = () => location.reload();

// Deslizar da borda esquerda abre o menu; deslizar para a esquerda fecha
let tx = null, ty = null;
document.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  tx = t.clientX; ty = t.clientY;
}, { passive: true });
document.addEventListener("touchend", (e) => {
  if (tx === null || !mq.matches) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - tx, dy = Math.abs(t.clientY - ty);
  const open = document.body.classList.contains("drawer-open");
  if (dy < 60) {
    if (!open && tx < 24 && dx > 70) openDrawer();
    else if (open && dx < -70) closeDrawer();
  }
  tx = null;
}, { passive: true });

/* ================== INÍCIO ================== */
function enter(name) {
  me = name.trim().slice(0, 30);
  localStorage.setItem("nome", me);
  $("#meName").textContent = me;
  $("#drawerName").textContent = me;
  $("#login").style.display = "none";
  renderRooms();
  connect();
}

$("#loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const n = $("#nameInput").value.trim();
  if (n) enter(n);
});

(function init() {
  const v = localStorage.getItem("vol");
  if (v !== null) { $("#vol").value = v; player.volume = +v; } else player.volume = 0.8;
  const cu = localStorage.getItem("customUrl");
  if (cu) $("#customUrl").value = cu;
  fillStations();
  renderQuick();
  fetch("/rooms").then((r) => r.json()).then((d) => { rooms = d.rooms; renderRooms(); }).catch(() => {});
  if (me) { $("#nameInput").value = me; enter(me); }
})();
</script>
</body>
</html>
`;

const PORT = process.env.PORT || 3000;
const ROOMS = ["geral", "palco", "mesa-de-som", "transmissao"];
const MAX_HISTORY = 80;
const MAX_BODY = 4 * 1024 * 1024; // 4 MB (mensagens de voz)

const history = Object.fromEntries(ROOMS.map((r) => [r, []]));
const clients = new Map(); // id -> { res, room, name }

function sse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function broadcast(room, event, data) {
  for (const c of clients.values()) {
    if (c.room === room) sse(c.res, event, data);
  }
}

function usersIn(room) {
  return [...clients.values()].filter((c) => c.room === room).map((c) => c.name);
}

function broadcastPresence(room) {
  broadcast(room, "presence", { room, users: usersIn(room) });
}

function cleanName(n) {
  return String(n || "").replace(/[\r\n<>]/g, "").trim().slice(0, 30);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error("too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function json(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}

// ---------------- PWA: manifest, service worker e ícones ----------------
const MANIFEST = JSON.stringify({
  name: "Rádio + Chat • Equipe de Som",
  short_name: "Rádio Som",
  description: "Rádio online e chat da equipe de som",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#0f1115",
  theme_color: "#0f1115",
  lang: "pt-BR",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ],
});

// Este código roda dentro do navegador (service worker)
function swMain() {
  const CACHE = "radio-v2";
  self.addEventListener("install", (e) => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/"])).catch(() => {}));
  });
  self.addEventListener("activate", (e) => {
    e.waitUntil(self.clients.claim());
  });
  self.addEventListener("fetch", (e) => {
    const u = new URL(e.request.url);
    if (e.request.method !== "GET" || u.origin !== self.location.origin || u.pathname !== "/") return;
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put("/", copy));
          return r;
        })
        .catch(() => caches.match("/"))
    );
  });
  self.addEventListener("notificationclick", (e) => {
    e.notification.close();
    e.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
        for (const c of list) if ("focus" in c) return c.focus();
        return self.clients.openWindow("/");
      })
    );
  });
}
const SW_JS = "(" + swMain.toString() + ")();";

// Gera os ícones PNG (sem bibliotecas)
const CRC_TABLE = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function makeIcon(size) {
  const zlib = require("zlib");
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  const bg = [15, 17, 21], fg = [255, 122, 26];
  const cov = (d, r) => Math.max(0, Math.min(1, (r - d) * size + 0.5));
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - size / 2, y + 0.5 - size / 2) / size;
      const ring = cov(d, 0.34) * (1 - cov(d, 0.26));
      const dot = cov(d, 0.11);
      const a = Math.max(ring, dot);
      const i = y * stride + 1 + x * 4;
      for (let k = 0; k < 3; k++) raw[i + k] = Math.round(bg[k] * (1 - a) + fg[k] * a);
      raw[i + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}
const ICONS = { "/icon-192.png": makeIcon(192), "/icon-512.png": makeIcon(512) };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // ---- Stream de eventos (chat em tempo real) ----
  if (req.method === "GET" && url.pathname === "/events") {
    const room = url.searchParams.get("room");
    const name = cleanName(url.searchParams.get("name"));
    if (!ROOMS.includes(room) || !name) return json(res, 400, { error: "sala ou nome inválido" });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write("retry: 2000\n\n");

    const id = crypto.randomUUID();
    clients.set(id, { res, room, name });
    sse(res, "history", { room, messages: history[room] });
    broadcastPresence(room);

    req.on("close", () => {
      clients.delete(id);
      broadcastPresence(room);
    });
    return;
  }

  // ---- Enviar mensagem ----
  if (req.method === "POST" && url.pathname === "/send") {
    let body;
    try {
      body = JSON.parse(await readBody(req));
    } catch {
      return json(res, 400, { error: "requisição inválida" });
    }
    const room = body.room;
    const name = cleanName(body.name);
    if (!ROOMS.includes(room) || !name) return json(res, 400, { error: "sala ou nome inválido" });

    const msg = {
      id: crypto.randomUUID(),
      room,
      name,
      time: Date.now(),
      type: "text",
    };

    if (body.type === "audio") {
      if (typeof body.audio !== "string" || !body.audio.startsWith("data:audio/"))
        return json(res, 400, { error: "áudio inválido" });
      msg.type = "audio";
      msg.audio = body.audio;
    } else {
      const text = String(body.text || "").trim().slice(0, 1000);
      if (!text) return json(res, 400, { error: "mensagem vazia" });
      msg.text = text;
      if (body.alert === true) msg.alert = true; // chamado urgente
    }

    history[room].push(msg);
    if (history[room].length > MAX_HISTORY) history[room].shift();
    broadcast(room, "message", msg);
    return json(res, 200, { ok: true });
  }

  // ---- Lista de salas ----
  if (req.method === "GET" && url.pathname === "/rooms") {
    return json(res, 200, { rooms: ROOMS });
  }

  // ---- PWA ----
  if (req.method === "GET" && url.pathname === "/manifest.webmanifest") {
    res.writeHead(200, { "Content-Type": "application/manifest+json; charset=utf-8" });
    return res.end(MANIFEST);
  }
  if (req.method === "GET" && url.pathname === "/sw.js") {
    res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-cache" });
    return res.end(SW_JS);
  }
  if (req.method === "GET" && ICONS[url.pathname]) {
    res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" });
    return res.end(ICONS[url.pathname]);
  }

  // ---- Página (HTML embutido) ----
  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(HTML);
  }

  res.writeHead(404);
  res.end();
});

// Mantém conexões SSE vivas
setInterval(() => {
  for (const c of clients.values()) c.res.write(": ping\n\n");
}, 20000);

server.listen(PORT, () => {
  console.log(`📻 Rádio + Chat rodando em http://localhost:${PORT}`);
});
