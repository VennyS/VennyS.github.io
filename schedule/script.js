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

let tg = window.Telegram.WebApp;
tg.MainButton.show();
tg.expand();

Telegram.WebApp.onEvent('mainButtonClicked', function(){
    tg.sendData(sendDataJSON()); 
});

function uniqueDicts(array1, array2) {
    // Сливаем два массива в один
    var combinedArray = array1.concat(array2);

    // Создаем объект для хранения уникальных значений
    var uniqueDictsObj = {};

    // Фильтруем и оставляем только уникальные словари
    combinedArray.forEach(function(dict) {
        var key = JSON.stringify(dict); // Создаем строковый ключ для словаря
        uniqueDictsObj[key] = dict; // Записываем словарь в объект по ключу
    });

    // Получаем уникальные словари в виде массива
    var uniqueArray = Object.values(uniqueDictsObj);

    return uniqueArray;
}

const setDictionary = () => { return choosedDate; }

const getSchedule = () => {
    if (!(data === null || data === undefined || JSON.stringify(data) === 'null')) {
        let foundDictionaries = findCurrentInData(data, choosedDate);
        foundDictionaries.forEach(function(foundDict) {
            var index = data.indexOf(foundDict);
            if (index !== -1) {
                data.splice(index, 1);
            }
        });
    }     

    if ($('.selected').length > 0) {        
        const result = data != null ? data : [];
        let intervals = $('.interval');
        do {
            let dict = setDictionary();

            let startInterval = $(intervals).eq(0).hasClass('selected') ? $(intervals).eq(0) : intervals.next('.selected').eq(0);
            dict['startTime'] = $(startInterval).find('.interval-text').text();

            let endInterval = $(startInterval).nextUntil(':not(.selected)').last();
            dict['endTime'] = $(endInterval).find('.interval-button').attr('hour');
            
            intervals = endInterval.nextUntil('.selected');
            result.push(JSON.parse(JSON.stringify(dict)));
        } while ($(intervals).next().last().hasClass('selected'))
        // Возвращаем массив после удаления
        return result;
    }
    else return (data === null || data === undefined || JSON.stringify(data) === 'null' || data.length <= 0) ? null : data;
};

// Переменная для хранения контейнера, куда будем добавлять блоки
const container = $('.hours-and-buttons');
const monthText = $('.current-date');

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

const setUpTextAndColors = (start, end, button) => {
    for (let i = start; i <= end; i++) {
        $(`.interval-button[data-id="${i}"]`).text("").addClass('active');
        $(`.interval-button[data-id="${i}"]`).text("").closest('.interval').addClass('selected');
    }
    let firstButtonCheck = $(button).closest('.interval').prevUntil(':not(.selected)').find('.interval-button').text("");
    let lastButtonCheck = $(button).closest('.interval').nextUntil(':not(.selected)').find('.interval-button').text("");

    let changeTextButton = firstButtonCheck.length !== 0 ? firstButtonCheck.first() : button;
    let lastButtonChecked = lastButtonCheck.length !== 0 ? lastButtonCheck.last() : button;
    
    let text = `Доступен с ${$(changeTextButton).closest('.interval').find('.interval-text').text()} до ${$(lastButtonChecked).attr('hour')}`;
    $(changeTextButton).text(text);
}

// Теперь у вас есть все параметры в виде объекта paramsObject
$('.current-date').text(`${choosedDate['day']} ${monthInclined[choosedDate['name']]} ${choosedDate['year']}`);

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

const sendDataJSON = () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);    
    let jsonString = JSON.stringify(getSchedule());
    return jsonString;
}

$('.icon').click(function() {
    // Удаляем обработчик события beforeunload
    let jsonString = sendDataJSON();
    localStorage.setItem('commonIntervals', jsonString);
    window.location.href = `index.html?&year=${choosedDate['year']}&month=${choosedDate['month']}`;
});

const findCurrentInData = (dictArray, dictDate) => {
    var searchPairs = { 'year': dictDate['year'],'month': dictDate['month'], 'day': dictDate['day']};
    // Используем метод filter для поиска всех словарей, у которых пары совпадают
    var foundDictionaries = dictArray.filter(function(dictionary) {
        // Проверяем, совпадают ли все заданные пары ключ-значение
        return Object.keys(searchPairs).every(function(key) {
            return dictionary[key] === searchPairs[key];
        });
    });
    return foundDictionaries;
}

const jsonString = localStorage.getItem('commonIntervals');
console.log(jsonString);
if ((jsonString != null) && (jsonString != 'null')) {
    var data = JSON.parse(jsonString);

    let foundDictionaries = findCurrentInData(data, choosedDate)

    foundDictionaries.forEach(function(foundDictionary) {
        const startString = foundDictionary['startTime'].split(':');
        const start = parseInt(startString[0], 10);
        const endString = foundDictionary['endTime'].split(':');
        const end = parseInt(endString[0], 10);        
        let button = $(`.interval-button[data-id="${start}"]`);

        setUpTextAndColors(start, end-1, button);
    });
}

let firstButtonId = -1;

$('.interval-button').click(function() {
    const id = parseInt($(this).data('id'));
    if ($(this).hasClass('active') && (firstButtonId == -1)) {
        $('.toggle').removeClass('toggle').text("");    
        let interval = $(this).removeClass('active').text("").closest('.interval').removeClass('selected');

        $(interval).nextUntil(':not(.selected)').removeClass('selected').find('.interval-button').removeClass('active').text("");
        $(interval).prevUntil(':not(.selected)').removeClass('selected').find('.interval-button').removeClass('active').text("");
        firstButtonId = -1;
    }
    else if ($(this).hasClass('toggle')) {
        $(this).removeClass('toggle').text("");
        firstButtonId = -1;
    } 
    else if (firstButtonId == -1) {
        firstButtonId = id;
        $(this).addClass('toggle');
        $(this).text(`Доступен с ${$(this).closest('.interval').find('.interval-text').text()}...`);
    } else {
        if (firstButtonId == id) return;
        const start = Math.min(firstButtonId, id);
        const end = Math.max(firstButtonId, id);

        setUpTextAndColors(start, end, this);
        firstButtonId = -1;
    }
});

// Функция-обработчик события beforeunload
function handleBeforeUnload(event) {
    // Очищаем локальное хранилище
    localStorage.clear();
}

// Добавляем обработчик события beforeunload
window.addEventListener('beforeunload', handleBeforeUnload);