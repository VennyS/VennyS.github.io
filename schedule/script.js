let tg = window.Telegram.WebApp;
tg.MainButton.show();
tg.expand();

Telegram.WebApp.onEvent('mainButtonClicked', function(){
	tg.sendData("some string that we need to send"); 
});

// Переменная для хранения контейнера, куда будем добавлять блоки
const container = $('.hours-and-buttons');
const monthText = $('.current-date');

// Получаем текущий URL страницы
var url = window.location.href;

// Создаем объект URLSearchParams с параметрами из URL
var urlParams = new URLSearchParams(new URL(url).search);

// Создаем пустой объект для хранения параметров
var paramsObject = {};

const monthInclined = {
    "Январь": "января",
    "Февраль": "февраля",
    "Март": "марта",
    "Апрель": "апреля",
    "Май": "мая",
    "Июнь": "июня",
    "Июль": "июля",
    "Август": "августа",
    "Сентябрь": "сентября",
    "Октябрь": "октября",
    "Ноябрь": "ноября",
    "Декабрь": "декабря"
};

// Проходим по всем параметрам и добавляем их в объект paramsObject
for (var pair of urlParams.entries()) {
    paramsObject[pair[0]] = pair[1];
}

// Теперь у вас есть все параметры в виде объекта paramsObject
$('.current-date').text(`${paramsObject['day']} ${monthInclined[paramsObject['name']]} ${paramsObject['year']}`);

// Цикл для создания 24 интервалов
for (let i = 0; i <= 24; i++) {
    // Создаем элементы
    const intervalDiv = $('<div>').addClass('interval');
    const timeSpan = $('<span>').text(`${i < 10 ? '0' : ''}${i}:00`).addClass('interval-text');

    const buttonContainer = $('<div>').addClass('button-container');
    const button = $('<button>').addClass('interval-button').attr('data-id', i).attr('hour', `${i+1 < 10 ? '0' : ''}${i+1}:00`);

    // Добавляем span внутрь intervalDiv
    intervalDiv.append(timeSpan);

    // Добавляем кнопку внутрь buttonContainer
    buttonContainer.append(button);

    if (i !== 24) intervalDiv.append(buttonContainer);
    // Добавляем buttonContainer внутрь intervalDiv  

    // Добавляем intervalDiv в контейнер
    container.append(intervalDiv);
}

$('.icon').click(function() {
    window.location.href = 'index.html';
});

let firstButtonId = -1;

$('.interval-button').click(function() {
    const id = parseInt($(this).data('id'));
    if ($(this).hasClass('active')) {
        $('.toggle').toggleClass('toggle');    
        let interval = $(this).removeClass('active').text("").closest('.interval').removeClass('selected');

        $(interval).nextUntil(':not(.selected)').removeClass('selected').find('.interval-button').removeClass('active').text("");
        $(interval).prevUntil(':not(.selected)').removeClass('selected').find('.interval-button').removeClass('active').text("");
        firstButtonId = -1;
    }
    else if ($(this).hasClass('toggle')) {
        $(this).toggleClass('toggle').text("");
        firstButtonId = -1;
    } 
    else if (firstButtonId == -1) {
        firstButtonId = id;
        $(this).toggleClass('toggle');
        $(this).text(`Доступен с ${$(this).closest('.interval').find('.interval-text').text()}...`);
    } else {
        if (firstButtonId == id) return;
        const start = Math.min(firstButtonId, id);
        const end = Math.max(firstButtonId, id);

        for (let i = start; i <= end; i++) {
            $(`.interval-button[data-id="${i}"]`).text("").addClass('active');
            $(`.interval-button[data-id="${i}"]`).text("").closest('.interval').addClass('selected');
        }
        let firstButtonCheck = $(this).closest('.interval').prevUntil(':not(.selected)').find('.interval-button').text("");
        let lastButtonCheck = $(this).closest('.interval').nextUntil(':not(.selected)').find('.interval-button').text("");

        let changeTextButton = firstButtonCheck.length !== 0 ? firstButtonCheck.first() : this;
        let lastButtonChecked = lastButtonCheck.length !== 0 ? lastButtonCheck.last() : this;
        
        let text = `Доступен с ${$(changeTextButton).closest('.interval').find('.interval-text').text()} до ${$(lastButtonChecked).attr('hour')}`;
        $(changeTextButton).text(text);
        firstButtonId = -1;
    }
});
