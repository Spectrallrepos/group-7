
const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=4&page=1&sparkline=false";

const themeToggle = document.getElementById("themeToggle");
const searchToggle = document.getElementById("searchToggle");
const logo = document.querySelector(".logo");
const form = document.querySelector("form");
const random = document.getElementById("random");
const searchInput = form.querySelector("input");
const header = document.querySelector("header");
let searchFlag = false;
const probability = 0.7; // Example probability value for gradient color



//A simple search toggle for mobile view
if (searchToggle.style.display != "none") {
    searchToggle.addEventListener("click", () => {
        searchFlag = !searchFlag;
        header.classList.toggle("head", searchFlag); //basically toggles the existence of head class
        if (searchFlag) {
            searchInput.focus();
        }
    });
}
//The chart area
//Std chart.js library
const ctx = document.getElementById('priceChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], // Time labels will be added here
        datasets: [{
            label: 'Price',
            data: [100, 150, 200, 180, 250, 220, 280,100, 150, 200, 180, 250, 220, 300], // Price data will be added here
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 5,
            fill: 'start',
            borderColor: probability >= 0.5 ? 'hsl(157, 80%, 55%)' : 'hsl(0, 80%, 55%)',
    // The gradient background
            backgroundColor: (context) => {
                const { ctx, chartArea } = context.chart;
                // If chartArea is not available, return a default color, due to loading time of dim
                if (!chartArea) {
                    return 'hsla(157, 80%, 55%, 0.24)';
                }
                //the gradient
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                if (probability >= 0.5) {
                gradient.addColorStop(0, 'hsla(157, 80%, 55%, 0.45)');
                gradient.addColorStop(1, 'hsla(157, 80%, 55%, 0)');
                } else {
                gradient.addColorStop(0, 'hsla(0, 80%, 55%, 0.45)');
                gradient.addColorStop(1, 'hsla(0, 80%, 55%, 0)');
                }
                return gradient;
            },
            tension: 0.3,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'hsl(0, 0%, 72%)'
                },
                grid: {
                    color: 'hsla(0, 0%, 72%, 0.14)'
                }
            },
            x: {
                ticks: {
                    color: 'hsl(0, 0%, 72%)'
                },
                grid: {
                    color: 'hsla(0, 0%, 72%, 0.08)'
                }
            }
        }
    }
});

//changing the accent color based on probability
const accent = document.querySelector(".chartContainer");
if (probability >= 0.5) {
    accent.style.borderLeft = "24px solid var(--c-color-green)";
} else { 
    accent.style.borderLeft = "24px solid var(--c-color-red)";
}
