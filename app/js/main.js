'use strict';
//объявляем переменные DOM-элементов игры
var gameName;
var startBtn;
var container;
var SVG;
var canvas;
var ctx;
var progress;
var countField;
var sound;
var soundPlaying = true;
var count;
var quit;
var answer;
var prompt;
//присваеваем значения переменным DOM-элементов
gameName = document.getElementById('name-holder');
startBtn = document.getElementById('start');
container = document.getElementById('game-holder');
canvas = document.getElementById('canvas');
progress = document.getElementById('progress');
countField = document.getElementById('count');
quit = document.getElementById('quit');
sound = document.getElementById('sound');
count = 0;
//объявляем переменные, отвечающие за размеры и расположение элементов
var width;
var height;
var SVGCoord;
var SVGLeft;
var SVGTop;
var widthSVG;
var heightSVG;
//присваеваем значения переменным, отвечающим за размеры окна браузера
width = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;
height = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;
//объявляем переменные для мультимедиа
var audioBG;
var audioBtnUp;
var audioBtnDown;
var audioWord;
var audioFailure;
//присваеваем значения переменным для для мультимедиа
audioBG = document.getElementById('audioBG');
audioBtnUp = document.getElementById('audioBtnUp');
audioBtnDown = document.getElementById('audioBtnDown');
audioWord = document.getElementById('audioWord');
audioFailure = document.getElementById('audioFailure');
//объявляем переменные для построения, центрирования, проверки рандомного слова
var mixWord;
var startTopCoord;
var startLeftCoord;
var letterWidth;
var letterHeight;
if (width >= 1024){
    letterWidth = 0.05*width;
    letterHeight = 0.05*width;
} else if (width < 1024){
    letterWidth = 0.1*width;
    letterHeight = 0.1*width;
}
var titleLength;
var titleX;
var titleY;
var startX;
var startY;
var dropX;
var dropY;
var answerFieldArr = [];
var fieldXArr = [];
var fieldYArr = [];
var checkArr = [];
var checkStr;
var wordsArrMix = [];
var wordsDescr = [];
var wordsArrCheck = [];
var n = 0;
var srcHash = {'а':'img/1.png','б':'img/2.png', 'в':'img/3.png', 'г':'img/4.png', 'д':'img/5.png', 'е':'img/6.png', 'ё':'img/7.png', 'ж':'img/8.png', 'з':'img/9.png', 'и':'img/10.png', 'й':'img/11.png', 'к':'img/12.png', 'л':'img/13.png', 'м':'img/14.png', 'н':'img/15.png', 'о':'img/16.png', 'п':'img/17.png', 'р':'img/18.png', 'с':'img/19.png', 'т':'img/20.png', 'у':'img/21.png', 'ф':'img/22.png', 'х':'img/23.png', 'ц':'img/24.png', 'ч':'img/25.png', 'ш':'img/26.png', 'щ':'img/27.png', 'ъ':'img/28.png', 'ы':'img/29.png', 'ь':'img/30.png', 'э':'img/31.png', 'ю':'img/32.png', 'я':'img/33.png'};

//загружаем данные для игры
function loadData() {
    $.ajax("http://fe.it-academy.by/Sites/0026579/data.json",
        { type:'GET', dataType:'json', success:dataLoaded, error:errorHandler }
    );
}
loadData();
function dataLoaded(data) {
    wordsArrMix = data.wordsArrMix;
    wordsDescr = data.wordsDescr;
    wordsArrCheck = data.wordsArrCheck;
}
function errorHandler(jqXHR,statusStr,errorStr) {
    alert(statusStr+' '+errorStr);
}
//описываем анимацию движения букв
function backgroundAnimation(){
    ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    var maxElems = Object.keys(srcHash).length*2;
    var letters = [];
    for (var i=0; i<maxElems; i++){
        letters.push({
           x: Math.random()*width,
           y: Math.random()*height,
           e: function(i){
               return Object.keys(srcHash).concat(Object.keys(srcHash))[i];
           },
           d: Math.random()*maxElems
        })
    }
    function drawBG(){
        count++;
        ctx.clearRect(0,0,width,height);
        ctx.beginPath();
        for (var i=0; i<maxElems; i++){
            var l = letters[i];
            ctx.moveTo(l.x,l.y);
            ctx.fillText(l.e(i),l.x,l.y);
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.shadowBlur = 3;
            ctx.font="italic bold 22px Molle";
        }
        update();
    }
    var angle = 0;
    var count = 0;
    function update() {
        angle+=0.01;
        for (var i=0; i<maxElems; i++){
            var l = letters[i];
            l.y+=Math.cos(angle+l.d);
            l.x+=Math.sin(angle)*2;
            if(l.x > width+5 || l.x < -5 || l.y > height)
            {
                if(i%3 > 0) //66.67% букв
                {
                    letters[i] = {x: Math.random()*width, y: -10, e: l.e, d: l.d};
                }
                else {

                    if(Math.sin(angle) > 0)
                    {
                        //буквы появляются слева
                        letters[i] = {x: -5, y: Math.random()*height, e: l.e, d: l.d};
                    }
                    else
                    {
                        //буквы появляются справа
                        letters[i] = {x: width+5, y: Math.random()*height, e: l.e, d: l.d};
                    }
                }
            }
        }
        setTimeout(drawBG, 33);
    }
    drawBG();
}
backgroundAnimation();
//описываем функцию удаления и добавления класса, отвечающего за анимацию названия игры
function nameAnimation() {
    var titleElems = document.getElementsByClassName('animateImg');
    function remove(){
        for (var i=0; i< titleElems.length; i++){
            var titleElem = titleElems[i];
            removeClass(titleElem,'animation');
        }
    }
    remove();
    function add(){
        for (var i=0; i< titleElems.length; i++){
            var titleElem = titleElems[i];
            addClass(titleElem,'animation');
        }
    }
    setTimeout(add,500);
}
setInterval(nameAnimation,16500);
//описываем функцию удаления класса
function removeClass(elem, className){
    elem.classList.remove(className)
}
//описываем функцию добавления класса
function addClass(elem, className){
    elem.classList.add(className)
}
//описываем функцию, которая строит игровое поле
function createSVG (){
    SVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    SVG.setAttribute('width',width);
    SVG.setAttribute('height',height);
    SVG.setAttribute('style','display: none; opacity:0;position: absolute;');
    container.appendChild(SVG);
    SVGCoord = SVG.getBoundingClientRect();
    SVGLeft = SVGCoord.left;
    SVGTop = SVGCoord.top;
    widthSVG = SVG.getAttribute('width');
    heightSVG = SVG.getAttribute('height');
}
//описываем функцию, которая строит элементы прогресс-поля
function createProgressField(){
    countField.innerHTML = "Отгадано слов: "+ count;
    addClass(progress,'active');
    quit.src = 'img/cross.png';
    sound.src = 'img/audio_play.png';
}
//описываем функцию переключения музыкального фона
function toggleAudio(){
    if (soundPlaying){
        soundPlaying=false;
    } else if (!soundPlaying){
        soundPlaying=true;
    }
    audio();
}
//описываем функцию музыкального фона
function audio(){
    if(soundPlaying) {
        sound.src = 'img/audio_play.png';
        audioBG.play();
    } else if (!soundPlaying){
        sound.src = 'img/audio_pause.png';
        audioBG.pause();
    }
}
//устанавливаем обработчик события для включения/выключения музыкального фона
sound.onclick = toggleAudio;
//описываем функцию, которая создает букву
function createImg (x,y,w,h,link,id,letter) {
    var img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    img.setAttribute('x',x);
    img.setAttribute('y',y);
    img.setAttribute('width',w);
    img.setAttribute('height',h);
    img.setAttribute('href',link);
    img.setAttribute('id',id);
    img.setAttribute('title',letter);
    img.setAttribute('class','drag-elem');
    img.setAttribute('style','cursor:pointer');
    SVG.appendChild(img);
}
//описываем функцию, которая создает текстовое поле
function createText (x,y,length,id,str,opacity,cursor){
    var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x',x);
    text.setAttribute('y',y);
    text.setAttribute('textLength',length);
    text.setAttribute('fill','#2f3840');
    text.setAttribute('stroke','black');
    text.setAttribute('id',id);
    text.setAttribute('style','opacity:'+opacity+';'+'cursor:'+cursor);
    text.innerHTML = str;
    SVG.appendChild(text);
}
//описываем функцию, которая строит поле для ответа
function createAnswerField(x,y,width,height){
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x',x);
    rect.setAttribute('y',y);
    rect.setAttribute('rx','5');
    rect.setAttribute('ry','5');
    rect.setAttribute('width',width);
    rect.setAttribute('height',height);
    rect.setAttribute('stroke','black');
    rect.setAttribute('fill','none');
    rect.setAttribute('class','answer-field');
    SVG.appendChild(rect);
}
//описываем функцию, которая строит поле с описанием слова
function createPrompt () {
    prompt = document.createElement('div');
    document.getElementById('main-holder').appendChild(prompt);
    prompt.setAttribute('style','position: absolute; bottom: 22%; left:0; right:0;  text-align: center; padding:' +
        ' 20px; z-index:10;');
    prompt.innerHTML = wordsDescr[n];
}
//описываем обработчик события, который запускает игру
startBtn.onclick = init;
//описываем функцию начала игры
function init(){
    audio();
    addClass(gameName,'hidden');
    function hidden(){gameName.setAttribute('style','display: none')}
    setTimeout(hidden,500);
    clearInterval(nameAnimation);
    setTimeout(createProgressField, 500);
    function game(){
        setTimeout(createPrompt,500);
        createSVG();
        function visible(){SVG.setAttribute('style','opacity:1; position: absolute; top: 0; right: 0; left: 0;' +
            ' bottom: 0; z-index: 3;');}
        setTimeout(visible,500);
        //описываем функцию, которая создает игровое поле
        function createPlayYard() {
            mixWord = wordsArrMix[n].split('');
            startTopCoord = parseInt(heightSVG)*0.3;
            startLeftCoord = parseInt(widthSVG)/2-mixWord.length*letterWidth/2;
            for (var i=0; i<mixWord.length; i++){
                var letter = mixWord[i];
                createImg(startLeftCoord+i*letterWidth,startTopCoord,letterWidth,letterHeight,srcHash[letter],'letter'+i,letter);
            }
            for (var k=0; k<mixWord.length;k++){
                createAnswerField(startLeftCoord+k*letterWidth,startTopCoord*1.7,letterWidth,letterHeight);
            }
            titleLength = 100;
            titleX = parseInt(widthSVG)/2 - titleLength/2;
            titleY = parseInt(heightSVG)*0.5;
            createText(titleX,titleY,titleLength,'answerTitle','ОТВЕТ');
        }
        createPlayYard();
        function getInfo (){
            fieldXArr = [];
            fieldYArr = [];
            checkArr = [];
            answerFieldArr = SVG.getElementsByClassName('answer-field');
            for (var i=0; i<answerFieldArr.length; i++){
                var cell = answerFieldArr[i];
                var cellX = Math.round(cell.getAttribute('x'));
                var cellY = Math.round(cell.getAttribute('y'));
                fieldXArr.push(cellX);
                fieldYArr.push(cellY);
                checkArr.push(i);
            }
        }
        getInfo();
        //описываем фукцию - обработчик события (нажатие на мыш)
        SVG.onmousedown = function myDown(e){
            e = e||window.event;
            e.preventDefault();
            e.stopPropagation();
            var dragElem = e.target;
            var classEl = dragElem.getAttribute('class');
            startX = dragElem.getAttribute('x');
            startY = dragElem.getAttribute('y');
            var shiftX = e.clientX - SVGLeft - startX;
            var shiftY = e.clientY - SVGTop - startY;
            if (classEl === 'drag-elem'){
                SVG.appendChild(dragElem);
                audioBtnDown.play();
                dragElem.setAttribute('opacity','0.8');
            }
            //описываем фукцию - обработчик события (движение мышью)
            SVG.onmousemove = function myMove(e){
                e = e || window.event;
                e.preventDefault();
                e.stopPropagation();
                if (classEl === 'drag-elem'){
                    dragElem.setAttribute('x',e.clientX - SVGLeft - shiftX);
                    dragElem.setAttribute('y',e.clientY - SVGTop - shiftY);
                }
            }
        };
        //описываем фукцию - обработчик события (отпускание клавиши мыши)
        SVG.onmouseup = function myUp(e){
            e = e||window.event;
            e.preventDefault();
            e.stopPropagation();
            SVG.onmousemove = null;
            var dragElem = e.target;
            var classEl = dragElem.getAttribute('class');
            var currX = dragElem.getAttribute('x');
            var currY = dragElem.getAttribute('y');
            if (classEl === 'drag-elem'){
                audioBtnUp.play();
                if(currY>=startTopCoord*1.7-letterHeight*0.9 && currY<=startTopCoord*1.7+letterHeight*0.9 && currX>=startLeftCoord && currX<= startLeftCoord + mixWord.length*letterWidth){
                    dragElem.setAttribute('y', startTopCoord*1.7);
                    if ( mixWord.length % 2 == 0){
                        dragElem.setAttribute('x', currX - currX%letterWidth);
                    } else if (mixWord.length % 2 !== 0) {
                        dragElem.setAttribute('x', currX - currX%letterWidth + letterWidth/2);
                    }
                    /*dragElem.setAttribute('x', currX - currX%letterWidth);*/
                    dropX = Math.round(dragElem.getAttribute('x'));
                    dropY = Math.round(dragElem.getAttribute('y'));

                } else if (currY>=startTopCoord*1.7-letterHeight*0.9 && currY<=startTopCoord*1.7+letterHeight*0.9 && currX>=startLeftCoord-letterWidth*0.9 && currX<= startLeftCoord + letterWidth){
                    dragElem.setAttribute('y', startTopCoord*1.7);
                    dragElem.setAttribute('x', startLeftCoord);
                    dropX = Math.round(dragElem.getAttribute('x'));
                    dropY = Math.round(dragElem.getAttribute('y'));
                } else {
                    dragElem.setAttribute('y', startY);
                    dragElem.setAttribute('x', startX);
                }
                dragElem.setAttribute('opacity','1');
            }
            checkWord(currentCheckArr(dropX,dropY,dragElem));
        };
        //touch события
        //описываем функцию - обработчик (начало touch событий)
        var touchShiftX=0;
        var touchShiftY=0;
        SVG.ontouchstart = function (e){
            e.preventDefault();
            var dragElem = e.target;
            var touchInfo = e.targetTouches[0];
            touchShiftX=touchInfo.pageX-e.offsetLeft;
            touchShiftY=touchInfo.pageY-e.offsetTop;
            var classEl = dragElem.getAttribute('class');
            startX = dragElem.getAttribute('x');
            var touchStartX = e.targetTouches[0].pageX;
            startY = dragElem.getAttribute('y');
            var touchStartY = e.targetTouches[0].pageY;
            var shiftTouchX = touchStartX-startX;
            var shiftTouchY = touchStartY-startY;
            if (classEl === 'drag-elem'){
                SVG.appendChild(dragElem);
                audioBtnDown.play();
                dragElem.setAttribute('opacity','0.8');
            }
            //описываем фукцию - обработчик события (движение по touchscreen)
            SVG.ontouchmove = function (e){
                e.preventDefault();
                if (classEl === 'drag-elem'){
                    var touchInfo = e.targetTouches[0];
                    var touchX = touchInfo.pageX-shiftTouchX;
                    var touchY = touchInfo.pageY-shiftTouchY;
                    dragElem.setAttribute('x',touchX);
                    dragElem.setAttribute('y',touchY);

                }
            }
        };
        //описываем фукцию - обработчик события (оканчание touch событий)
        SVG.ontouchend = function (e){
        e = e||window.event;
        e.preventDefault();
        var dragElem = e.target;
        var classEl = dragElem.getAttribute('class');
        var currX = dragElem.getAttribute('x');
        var currY = dragElem.getAttribute('y');
        if (classEl === 'drag-elem'){
            audioBtnUp.play();
            if(currY>=startTopCoord*1.7-letterHeight*0.9 && currY<=startTopCoord*1.7+letterHeight*0.9 && currX>=startLeftCoord && currX<= startLeftCoord + mixWord.length*letterWidth){
                dragElem.setAttribute('y', startTopCoord*1.7);
                if ( mixWord.length % 2 == 0){
                    dragElem.setAttribute('x', currX - currX%letterWidth);
                } else if (mixWord.length % 2 !== 0) {
                    dragElem.setAttribute('x', currX - currX%letterWidth + letterWidth/2);
                }
                dropX = Math.round(dragElem.getAttribute('x'));
                dropY = Math.round(dragElem.getAttribute('y'));

            } else if (currY>=startTopCoord*1.7-letterHeight*0.9 && currY<=startTopCoord*1.7+letterHeight*0.9 && currX>=startLeftCoord-letterWidth*0.9 && currX<= startLeftCoord + letterWidth){
                dragElem.setAttribute('y', startTopCoord*1.7);
                dragElem.setAttribute('x', startLeftCoord);
                dropX = Math.round(dragElem.getAttribute('x'));
                dropY = Math.round(dragElem.getAttribute('y'));
            } else {
                dragElem.setAttribute('y', startY);
                dragElem.setAttribute('x', startX);
            }
            dragElem.setAttribute('opacity','1');
        }
        checkWord(currentCheckArr(dropX,dropY,dragElem));

    };
        //описываем функцию, которая создает массив для проверки слова
        function currentCheckArr(dropX,dropY,dragElem){
            for(var i=0; i<fieldXArr.length; i++){
                if(dropX === fieldXArr[i] && dropY ===fieldYArr[i]&& typeof(checkArr[i]) === 'number'){
                    checkArr[i]= dragElem.getAttribute('title');
                }
            }
            return checkArr;
        }
         function solveAudio(){
             audioWord.play()
         }
        function revealAudio(){
            audioFailure.play();
        }
        //описываем функцию, которая проверяет отгадано ли слово
        function checkWord(array){
            checkStr = array.join('');
            var titleLength = 250;
            var titleX = parseInt(widthSVG)/2 - titleLength/2 /*- xShift*/;
            var titleY = parseInt(heightSVG)*0.92;
            if (wordsArrCheck.indexOf(checkStr)!==-1){
                if (n<wordsArrMix.length-1) {
                    count++;
                    countField.innerHTML = "Отгадано слов: "+ count;
                    setTimeout(solveAudio,500);
                    removeAnswer();
                    setTimeout(createText(titleX,titleY,titleLength,'answerTitle','Слово&nbsp;отгадано...'), 500);
                    setTimeout(remove, 1000);
                    setTimeout(function(){container.removeChild(SVG)},2000);
                    setTimeout(function(){document.getElementById('main-holder').removeChild(prompt);},2000);
                    setTimeout(game,2500);
                    n++;
                    window.navigator.vibrate([600,200,600]);
                } else if (n == wordsArrMix.length-1){
                    n=0;
                    addClass(popup,'active');
                    popupContent.innerHTML = 'Игра окончена<br><br>Вами отгадано слов: ' + count;
                    container.removeChild(SVG);
                    document.getElementById('main-holder').removeChild(prompt);
                    removeClass(progress,'active');
                    gameName.setAttribute('style','display: block; opacity: 1;');
                }
            }
        }
        //описываем функцию, которая создает текстовое поле "показать ответ"
        function answerHolder(){
            var titleLength = 250;
            var titleX = parseInt(widthSVG)/2 - titleLength/2 /*- xShift*/;
            var titleY = parseInt(heightSVG)*0.92;
            createText(titleX,titleY,titleLength,'give-answer','Показать&nbsp;ответ...',1,'pointer');
        }
        answerHolder();
        answer = document.getElementById('give-answer');
        //описываем обработчики событий при начатии на текстовое поле "показать ответ"
        answer.onclick = revealAnswer;
        answer.ontouchstart = revealAnswer;
        //описываем функцию, которая показвает ответ и инициирует следующий цикл игры
        function revealAnswer(){
            if(n < wordsArrMix.length-1){
                giveAnswer();
                setTimeout(function(){container.removeChild(SVG)},2000);
                setTimeout(function(){document.getElementById('main-holder').removeChild(prompt);},2000);
                setTimeout(game,2500);
                n++;
                window.navigator.vibrate(1000);
            } else if (n == wordsArrMix.length-1){
                n=0;
                addClass(popup,'active');
                popupContent.innerHTML = 'Игра окончена<br><br>Вами отгадано слов: ' + count;
                container.removeChild(SVG);
                document.getElementById('main-holder').removeChild(prompt);
                removeClass(progress,'active');
                gameName.setAttribute('style','display: block; opacity: 1;');
            }

        };
        //описываем функцию, которая удаляет текстовое поле "покаазать ответ"
        function removeAnswer(){
            var answerStr = document.getElementById('give-answer');
            SVG.removeChild(answerStr);
        }
        //описываем функцию, которая отображает загаданное слово в поле для ответа и скрывает слово из букв в
        // рандомном порядке
        function giveAnswer(){
            remove();
            add();
            setTimeout(revealAudio,800);
        }
        //описываем функцию, которая скрывает буквы слова, расположенные в рандомном порядке
        function remove(){
            var removeElems = document.getElementsByClassName('drag-elem');
            for (var i=0; i<removeElems.length; i++){
                var removeLetter = removeElems[i];
                removeLetter.setAttribute('style', 'opacity:0; display: none')
            }
        }
        //описываем функцию, которая строит загаданное слово в случае, если надо показать ответ
        function add(){
            var createElems = wordsArrCheck[n].split('');
            var topCoord = parseInt(fieldYArr[0]);
            startLeftCoord = parseInt(widthSVG)/2-mixWord.length*letterWidth/2;
            for (var i=0; i<createElems.length; i++){
                var createLetter = createElems[i];
                createImg(startLeftCoord+i*letterWidth,topCoord,letterWidth,letterHeight,srcHash[createLetter]);
            }
        }
    }
    game();
}
//модальное окно
var popup = document.getElementById('popup');
var popupBtn = document.getElementById('close');
var popupContent = document.getElementById('popupContent');
popupContent.innerHTML = 'Правила игры<br><br>Необходимо составить загаданное слово из предлагаемого набора букв.' +
    ' Буквы в ячейки поля "ответ" можно помещать единожды. Подсказка поможет вам быстрее отгадать слово.'
popupBtn.onclick = function (){
    removeClass(popup,'active');
};
quit.onclick = function(){
    addClass(popup,'active');
    popupContent.innerHTML = 'Вами отгадано слов: ' + count;
    container.removeChild(SVG);
    document.getElementById('main-holder').removeChild(prompt);
    document.getElementById('main-holder').removeChild(progress);
    gameName.setAttribute('style','display: block; opacity: 1;');
    n=0;
};









