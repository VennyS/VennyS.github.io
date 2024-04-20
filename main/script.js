// Получаем текущий URL страницы
var url = window.location.href;
// Создаем объект URLSearchParams с параметрами из URL
var urlParams = new URLSearchParams(new URL(url).search);
// Создаем пустой объект для хранения параметров
var choosedDate = {};
// Проходим по всем параметрам и добавляем их в объект paramsObject
for (var pair of urlParams.entries()) {
    choosedDate[pair[0]] = pair[1];
}

function getIntervals() {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        var telegramid = localStorage.getItem("telegramid"); // Получаем telegramid из локального хранилища
        var url = "http://127.0.0.1:5000/?telegramid=" + encodeURIComponent(telegramid); // Добавляем telegramid к URL-адресу запроса
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var response = JSON.parse(xhr.responseText);
                    resolve(response);
                } else {
                    reject(xhr.statusText);
                }
            }
        };
        xhr.send();
    });
}

if (choosedDate.hasOwnProperty("telegramid")) {
    // Если ключ присутствует, записываем его значение в localStorage
    localStorage.setItem("telegramid", choosedDate["telegramid"]);
}
let data = localStorage.getItem("commonIntervals");
// Проверяем, пуст ли элемент
if (data === null || data === undefined || data === "") {
    getIntervals()
        .then(function (data) {
            localStorage.setItem("commonIntervals", data);
            console.log(data);
        })
        .catch(function (error) {
            console.error("Ошибка:", error);
        });
}

Telegram.WebApp.onEvent("mainButtonClicked", function () {
    sendIntervals(data);
    tg.close();
});

const daysTag = document.querySelector(".days"),
    currentDate = document.querySelector(".current-date"),
    prevNextIcon = document.querySelectorAll(".icons span");

// getting new date, current year and month
let date = new Date(),
    currYear = "year" in choosedDate ? parseInt(choosedDate["year"]) : date.getFullYear();
currMonth = "month" in choosedDate ? parseInt(choosedDate["month"]) : date.getMonth();

// storing full name of all months in array
const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
];

const asignClick = () => {
    $("a").click(function () {
        // Удаляем обработчик события beforeunload
        window.removeEventListener("beforeunload", handleBeforeUnload);
    });
};

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), // getting first day of month
        lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // getting last date of month
        lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
        lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
    let spanTag = "";

    for (let i = firstDayofMonth; i > 0; i--) {
        // creating li of previous month last days
        spanTag += `<span class="inactive">${lastDateofLastMonth - i + 1}</span>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) {
        // creating li of all days of current month
        // adding active class to li if the current day, month, and year matched
        let isToday =
            i === date.getDate() &&
            currMonth === new Date().getMonth() &&
            currYear === new Date().getFullYear()
                ? "active"
                : "";
        spanTag += `<a class="${isToday}" href="schedule.html?&year=${currYear}&month=${currMonth}&day=${i}&name=${months[currMonth]}"> ${i} </a>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) {
        // creating span of next month first days
        spanTag += `<span class="inactive">${i - lastDayofMonth + 1}</span>`;
    }
    currentDate.innerText = `${months[currMonth]} ${currYear}`; // passing current mon and yr as currentDate text
    daysTag.innerHTML = spanTag;
    asignClick();
};
renderCalendar();

prevNextIcon.forEach((icon) => {
    // getting prev and next icons
    icon.addEventListener("click", () => {
        // adding click event on both icons
        // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
        let today = new Date();
        if (new Date(currYear, icon.id === "prev" ? currMonth : currMonth + 2, 0) < today)
            return;
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
        if (currMonth < 0 || currMonth > 11) {
            // if current month is less than 0 or greater than 11
            // creating a new date of current year & month and pass it as date value
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear(); // updating current year with new date year
            currMonth = date.getMonth(); // updating current month with new date month
        } else {
            date = new Date(); // pass the current date as date value
        }
        renderCalendar();
    });
});

function handleBeforeUnload() {
    if (navigator.sendBeacon) {
        data = [
            localStorage.getItem("telegramid"),
            ...JSON.parse(localStorage.getItem("commonIntervals")),
        ];

        for (let i = 1; i < data.length; i++) {
            // Преобразовываем строку в число, увеличиваем на 1, затем снова преобразовываем в строку
            data[i].month = String(Number(data[i].month) + 1);
        }

        navigator.sendBeacon("http://127.0.0.1:5000/", JSON.stringify(data));
        console.log("Данные успешно отправлены с помощью sendBeacon");
        localStorage.clear(); // Очищаем localStorage после успешной отправки
    } else {
        // Если sendBeacon не поддерживается, используем sendIntervals()
        sendIntervals(data)
            .then(function (response) {
                console.log("Данные успешно отправлены:", response);
                localStorage.clear(); // Очищаем localStorage после успешной отправки
            })
            .catch(function (error) {
                console.error("Ошибка при отправке данных:", error);
            });
    }
}

// Добавляем обработчик события beforeunload
window.addEventListener("beforeunload", handleBeforeUnload);
