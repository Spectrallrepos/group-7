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

if (searchToggle.style.display != "none") {
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
// Handle window resize to toggle search bar and other elements
    window.addEventListener("resize", () => {
            //Window resized from mobile to desktop, loads the previous state
            //A guard code kinda, so desktop view doesnt load the mobile state
        if (window.innerWidth > 640) {
            // Desktop view: Always show the form
            form.style.display = "flex";
            logo.style.display = "flex";
            themeToggle.style.display = "flex";
            random.style.display = "flex";
            searchToggle.style.display = "none";
            searchFlag = false; 
        }
        else {
            // Mobile view: Hide the form by default unless search is active
            if (searchFlag==false) {
                form.style.display = "none";
                logo.style.display = "flex";
                themeToggle.style.display = "flex";
                random.style.display = "flex";
                searchToggle.style.display = "flex";
            }
        }
    });
}

const placeholderSeries = [62, 68, 66, 74, 79, 76, 84, 88, 85, 92, 96, 94];

function drawPlaceholderChart() {
    const canvas = document.getElementById("price-chart");
    if (!canvas) {
        return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
        return;
    }

    const cssWidth = Math.max(canvas.clientWidth, 300);
    const cssHeight = Math.max(canvas.clientHeight, 220);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padding = { top: 18, right: 20, bottom: 28, left: 36 };
    const chartWidth = cssWidth - padding.left - padding.right;
    const chartHeight = cssHeight - padding.top - padding.bottom;

    context.clearRect(0, 0, cssWidth, cssHeight);

    context.strokeStyle = "rgba(255, 255, 255, 0.12)";
    context.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        context.beginPath();
        context.moveTo(padding.left, y);
        context.lineTo(cssWidth - padding.right, y);
        context.stroke();
    }

    const min = Math.min(...placeholderSeries);
    const max = Math.max(...placeholderSeries);
    const range = max - min || 1;

    const points = placeholderSeries.map((value, index) => {
        const x = padding.left + (chartWidth / (placeholderSeries.length - 1)) * index;
        const normalized = (value - min) / range;
        const y = padding.top + chartHeight - normalized * chartHeight;
        return { x, y };
    });

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));

    context.strokeStyle = "#35cfa0";
    context.lineWidth = 2.5;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.stroke();

    context.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    context.lineTo(points[0].x, padding.top + chartHeight);
    context.closePath();

    const gradient = context.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, "rgba(53, 207, 160, 0.35)");
    gradient.addColorStop(1, "rgba(53, 207, 160, 0.02)");
    context.fillStyle = gradient;
    context.fill();

    context.fillStyle = "rgba(255, 255, 255, 0.72)";
    context.font = "12px Arial";
    context.fillText("12h", padding.left, cssHeight - 8);
    context.fillText("Now", cssWidth - padding.right - 24, cssHeight - 8);
}

drawPlaceholderChart();
window.addEventListener("resize", drawPlaceholderChart);