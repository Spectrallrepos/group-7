// handles the API processing and DOM manip
// Toggling styles as well

const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=4&page=1&sparkline=false";

//Theme toggle and search bar toggle in mobile view
const themeToggle = document.getElementById("themeToggle");
const searchToggle = document.getElementById("searchToggle");
const logo = document.querySelector(".logo");
const form = document.querySelector("form");
const random = document.getElementById("random");
const searchInput = form.querySelector("input");
let searchFlag = false;

if (searchToggle) {
    searchToggle.addEventListener("click", () => {
        if (searchFlag == false) {
            form.style.display = "flex";
            form.style.width = "100%";
            searchInput.focus();
            logo.style.display = "none";
            themeToggle.style.display = "none";
            random.style.display = "none";
            searchToggle.style.display = "none";
            searchFlag = true;
            return;
        }

        form.style.display = "none";
        logo.style.display = "flex";
        themeToggle.style.display = "flex";
        random.style.display = "flex";
        searchFlag = false;
    });
    if (window.innerWidth > 640) {
        form.style.display = "flex";
    }
}