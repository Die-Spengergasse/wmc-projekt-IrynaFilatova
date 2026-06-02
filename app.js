// 1. APPLICATION STATE

const state = {
boats: [
    {
        id: 1,
        name: "SUP",
        price: 15,
        color: "pink"
    },
    {
        id: 2,
        name: "Katamaran",
        price: 25,
        color: "blue"
    },
    {
        id: 3,
        name: "E-Boot",
        price: 40,
        color: "orange"
    },
    {
        id: 4,
        name: "Schwimmende Insel",
        price: 50,
        color: "green"
    },
    {
        id: 5,
        name: "Katamaran mit Rutsche",
        price: 30,
        color: "purple"
    }
],

bookings: [],
weather: null

};

// 2. STATE ACCESSORS / MUTATORS


function addBooking(customerName, boatName, hours, totalPrice) {
state.bookings.push({
    customer: customerName,
    boat: boatName,
    hours: hours,
    totalPrice: totalPrice, 
    date: new Date().toLocaleString()
});
saveState();
}

function deleteBooking(index) {
state.bookings.splice(index, 1);
saveState();
}

function saveState() {
localStorage.setItem("donauBookings", JSON.stringify(state.bookings)
);
}

function loadState() {
const savedData = localStorage.getItem("donauBookings");

if (savedData) { state.bookings = JSON.parse(savedData);
}
}
function showToast(message){
   toast.textContent = message;
   toast.classList.add("show");
setTimeout(() => {
   toast.classList.remove("show");
}, 3000);
}

// 3. DOM NODE REFS

const boatList = document.getElementById("boat-list");
const bookingList = document.getElementById("booking-list");
const weatherText = document.getElementById("weather-text");
const homeSection = document.getElementById("home-section");
const bookingSection = document.getElementById("booking-section");
const weatherSection = document.getElementById("weather-section");
const homeBtn = document.getElementById("home-btn");
const bookingBtn = document.getElementById("booking-btn");
const weatherBtn = document.getElementById("weather-btn");
const bookingMessage = document.getElementById("booking-message");
const toast = document.getElementById("toast");

// 4. DOM NODE CREATION FN'S


function createBoatCard(boat) {
const card = document.createElement("div"); 
card.className = `boat-card ${boat.color}`;
card.innerHTML = `
<h3>${boat.name}</h3>
<p>Preis: ${boat.price} € / Stunde</p>

<label>Kundenname:</label>
<input type="text" class="customer-input" placeholder="Name">

<label>Stunden:</label>
<input type="number" min="1" max="12" class="hours-input">

<p class="price-preview">Gesamtpreis: ${boat.price} €</p>

<button>Buchung speichern</button>
`;


const hoursInput = card.querySelector(".hours-input");
const customerInput = card.querySelector(".customer-input");
const pricePreview = card.querySelector(".price-preview");

hoursInput.addEventListener("input", () => {
    const hours = Number(hoursInput.value);
    const total = hours * boat.price;
    pricePreview.textContent = `Gesamtpreis: ${total} €`;
});

const saveBtn = card.querySelector("button");

saveBtn.addEventListener("click", () => {

    const success = onBookBoat(
        boat,
        customerInput.value.trim(),
        Number(hoursInput.value)
    );

    if(!success){
        return;
    }

    saveBtn.classList.add("saved");
    saveBtn.textContent = "✓ Gespeichert";
 
    customerInput.value = "";
    hoursInput.value = "";

    setTimeout(() => {
        saveBtn.classList.remove("saved");
        saveBtn.textContent = "Buchung speichern";
    }, 1500);
});

return card;
}

function createBookingElement(booking, index) {
const item = document.createElement("li");
item.className = "booking-item";
item.innerHTML = `
<strong>${booking.customer} - ${booking.boat}</strong>
<p>Stunden: ${booking.hours}</p>
<p>Preis: ${booking.totalPrice} €</p>
<p>${booking.date}</p>
<button class="delete-btn">Löschen</button>`;
item.querySelector(".delete-btn").addEventListener("click", () => onDeleteBooking(index)
);

return item;

}

// 5. RENDER FN

function render() { 
boatList.innerHTML = "";
bookingList.innerHTML = "";

state.boats.forEach(boat => {
boatList.append(createBoatCard(boat));
});
state.bookings.forEach((booking, index) => {
bookingList.append(createBookingElement(booking, index));
}
);
}

// 6. EVENT HANDLERS

function onBookBoat(boat, customerName, hours) {
    if(customerName === "") {
       showToast("Bitte Kundennamen eingeben.");
       return false;
    }

    if(!hours || hours <= 0) {
    showToast("Bitte Mietdauer eingeben.");
    return false;
}
    const totalPrice = boat.price * hours;
    
    addBooking(
        customerName,
        boat.name,
        hours,
        totalPrice
    );

    render();

    bookingMessage.textContent = `Reservierung für ${customerName} erfolgreich gespeichert.`;
    bookingMessage.style.background = "#dff5df";
    bookingMessage.style.color = "#1f7a1f";

    setTimeout(() => {
        // bookingMessage.textContent = "";
    }, 4000);

    return true;
}

function onDeleteBooking(index) {
const answer = confirm("Wirklich löschen?");  
if (!answer) {
    return;
} deleteBooking(index);
render();
}

function showHome() {
homeSection.classList.remove("hidden");
bookingSection.classList.add("hidden");
weatherSection.classList.add("hidden");
}

function showBookings() {
homeSection.classList.add("hidden");
bookingSection.classList.remove("hidden");
weatherSection.classList.add("hidden");
}

function showWeather() {
homeSection.classList.add("hidden");
bookingSection.classList.add("hidden");
weatherSection.classList.remove("hidden");
}

async function loadWeather() {
try {
const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=48.21&longitude=16.37&current=temperature_2m");
const data = await response.json();
state.weather = data.current.temperature_2m;
weatherText.textContent = `Aktuelle Temperatur: ${state.weather} °C`;
} catch (error) {
weatherText.textContent = "Wetterdaten konnten nicht geladen werden.";
}
}


// 7. INIT BINDINGS


homeBtn.addEventListener("click", showHome);
bookingBtn.addEventListener("click", showBookings);
weatherBtn.addEventListener("click", showWeather);


// 8. INITIAL RENDER

loadState();

render();

loadWeather();
