const monthYear = document.getElementById("month-year");
const calendarBody = document.getElementById("calendar-body");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");

let currentDate = new Date();

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const prevLastDate = new Date(year, month, 0).getDate();
    const prevDays = firstDay; // cât din luna precedentă apare
    const totalCells = Math.ceil((prevDays + lastDate) / 7) * 7;

    const today = new Date();
    monthYear.textContent = `${date.toLocaleString("en-US", { month: "short" })} ${year}`;

    calendarBody.innerHTML = "";

    let cells = [];
    for (let i = 0; i < totalCells; i++) {
        const dayNum = i - prevDays + 1;
        const cell = document.createElement("td");

        if (i < prevDays) {
            cell.textContent = prevLastDate - prevDays + i + 1;
            cell.style.opacity = "0.3";
        } else if (dayNum > lastDate) {
            cell.textContent = dayNum - lastDate;
            cell.style.opacity = "0.3";
        } else {
            cell.textContent = dayNum;
            if (
                dayNum === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                cell.classList.add("today");
            }
        }
        cells.push(cell);
    }

    for (let i = 0; i < cells.length; i += 7) {
        const row = document.createElement("tr");
        cells.slice(i, i + 7).forEach((c) => row.appendChild(c));
        calendarBody.appendChild(row);
    }
}

prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

document.addEventListener("DOMContentLoaded", () => renderCalendar(currentDate));
