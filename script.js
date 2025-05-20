// Referensi ke elemen HTML
const gameNarrative = document.getElementById('game-narrative');
const playerInput = document.getElementById('player-input');
const submitButton = document.getElementById('submit-button');

const playerNameDisplay = document.getElementById('player-name');
const playerHpDisplay = document.getElementById('player-hp');
const playerAttackDisplay = document.getElementById('player-attack');
const playerLocationDisplay = document.getElementById('player-location');

console.log("Elemen HTML telah direferensikan.");

// Data Pemain
let player = {
    name: "Pahlawan",
    hp: 100,
    maxHp: 100,
    attack: 10,
    location: "Desa Awal",
    inventory: []
};

console.log("Objek pemain dibuat:", player);

// Fungsi untuk memperbarui tampilan status pemain di HTML
function updatePlayerStatsDisplay() {
    playerNameDisplay.textContent = player.name;
    playerHpDisplay.textContent = player.hp + " / " + player.maxHp;
    playerAttackDisplay.textContent = player.attack;
    playerLocationDisplay.textContent = player.location;
    console.log("Tampilan status pemain diperbarui.");
}

// Fungsi untuk menampilkan teks di area narasi
function displayText(message) {
    const newParagraph = document.createElement('p');
    newParagraph.textContent = message;
    gameNarrative.appendChild(newParagraph);
    gameNarrative.scrollTop = gameNarrative.scrollHeight;
    console.log("Pesan ditampilkan:", message);
}

// Fungsi untuk memproses perintah pemain
function processCommand(command) {
    displayText("> " + command);

    if (command === "bantuan") {
        displayText("Perintah yang tersedia: bantuan, lihat sekitar, pergi [arah]");
    } else if (command === "lihat sekitar") {
        displayText("Kamu melihat sekeliling. Tidak ada yang menarik saat ini selain pemandangan desa.");
    } else if (command.startsWith("pergi ")) {
        const direction = command.substring(6);
        displayText("Kamu mencoba pergi ke " + direction + ", tapi belum ada jalan ke sana.");
    } else {
        displayText("Perintah tidak dikenali: '" + command + "'. Ketik 'bantuan' untuk opsi.");
    }
    // Nantinya kita akan menambahkan lebih banyak logika perintah di sini
}

// Event listener untuk tombol kirim
submitButton.addEventListener('click', function() {
    const command = playerInput.value.trim().toLowerCase();
    if (command) {
        processCommand(command);
        playerInput.value = "";
    }
    playerInput.focus();
});

// Event listener untuk tombol Enter di input field
playerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitButton.click();
    }
});

console.log("Event listener untuk input telah ditambahkan.");

// Inisialisasi Game Saat Halaman Dimuat
function initializeGame() {
    updatePlayerStatsDisplay();
    gameNarrative.innerHTML = ''; // Kosongkan narasi awal dari HTML
    displayText("Selamat datang, " + player.name + ", di Petualangan Teks RPG!");
    displayText("Kamu berada di " + player.location + ".");
    displayText("Ketik 'bantuan' untuk melihat daftar perintah yang tersedia.");
    console.log("Game diinisialisasi.");
}

initializeGame();
