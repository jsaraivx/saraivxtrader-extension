"use strict";

const version = '1.0.1.6';

/**
 * TODO
 * - Ajustar quando o valor do trader for 0 (se não fica um loop eterno no set time out)
 * - Adicionar mensagem quando o valor do trader for 0 ou se a porcentagem for ali em torno de 0 no dropdown
 * 
 */

/* ===== METHODS ===== */

const logoUrl = chrome.runtime.getURL('images/title-white.png');
const logoStrokeUrl = chrome.runtime.getURL('images/title-black.png');
const minutesToWait = 3;

class dateHelpers {
  // TYPESCRIPT
  constructor() {
    this.milliseconds = 1000;
    this.seconds = 1 * 1000;
    this.minutes = 60 * 1000;
    this.hours = 60 * 60 * 1000;
  }
  getCurrentDate() {
    // TYPESCRIPT
    return new Date().toJSON();
  }
  getTimeDifferenceInSeconds(time1, time2) {
    // TYPESCRIPT
    // Split the time strings into hours and minutes
    var time1Parts = time1.split(':');
    var time2Parts = time2.split(':');
  
    // Convert the hours and minutes to total number of seconds
    var time1TotalSeconds = parseInt(time1Parts[0]) * 3600 + parseInt(time1Parts[1]) * 60;
    var time2TotalSeconds = parseInt(time2Parts[0]) * 3600 + parseInt(time2Parts[1]) * 60;
  
    // Calculate the difference between the two totals
    var difference = Math.abs(time1TotalSeconds - time2TotalSeconds);
  
    // Return the result
    return difference;
  }
  getHourMinuteSecondJson(string) {
    // TYPESCRIPT
    const newArray = string.split(":");
    if(newArray.length === 3) {
      return {
        hour: Number(newArray[0]),
        minute: Number(newArray[1]),
        second: Number(newArray[2]),
      };
    } else {
      // WORRIED
      // Get the current date and time
      var now = new Date();
      // Get the current hour (in 24-hour format)
      var hour = now.getHours();
      // Get the current minutes
      var minutes = now.getMinutes();
      // Format the time as "HH:MM"
      var currentTimeString = hour.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');

      const seconds = this.getTimeDifferenceInSeconds(string,currentTimeString);
      return {
        hour: 0,
        minute: 0,
        second: seconds,
      };
    }
  }
  getSecondDurationFromJson(json) {
    // TYPESCRIPT
    return (
      (json.second * this.seconds +
        json.minute * this.minutes +
        json.hour * this.hours) /
      this.milliseconds
    );
  }
  addSecondsToDate(dateString, secondDelay) {
    // TYPESCRIPT
    const date = new Date(dateString);
    date.setSeconds(date.getSeconds() + secondDelay);
    return date.toJSON();
  }
  getDateDiffInSeconds(date1, date2) {
    // TYPESCRIPT
    // Calculate the difference in milliseconds
    var diffInMilliseconds = new Date(date1).getTime() - new Date(date2).getTime();

    // Convert the difference to seconds
    var diffInSeconds = diffInMilliseconds / this.milliseconds;

    // Return the result
    return diffInSeconds;
  }
  getDateWithSpecificTime(timeString) {
    // TYPESCRIPT
    // Split the time string into hours and minutes
    var timeParts = timeString.split(':');
  
    // Get the current date
    var date = new Date();
  
    // Set the hour and minute of the date using the parsed values
    date.setHours(parseInt(timeParts[0]));
    date.setMinutes(parseInt(timeParts[1]));
    date.setSeconds(0);
    date.setMilliseconds(0);
  
    // Format the date as a string in the desired format
    var dateString = date.toJSON();
  
    // Return the result
    return dateString;
  }
  isDateToday(dateString) {
    // TYPESCRIPT
    const today = new Date();
    const date = new Date(dateString);
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  }
}

class numberHelpers extends dateHelpers {
  constructor() {
    super();
  }
  removeCurrency(string) {
    // TYPESCRIPT
    return string.replace(/[^0-9.-]+/g, "");
  }
  getNumberFromCurrencyString(string) {
    // TYPESCRIPT
    return Number(this.removeCurrency(string));
  }
}

class domHelpers extends numberHelpers {
  constructor() {
    super();
  }
  getElement(query) {
    const thisClass = this;
    return new Promise(function (resolve) {
      const element = document.querySelector(query);
      if (!element) {
        setTimeout(() => {
          thisClass.getElement(query).then(function (value) {
            resolve(value);
          });
        }, 1000);
      } else {
        resolve(element);
      }
    });
  }
  getElements(query) {
    const thisClass = this;
    return new Promise(function (resolve) {
      const element = document.querySelectorAll(query);
      if (element.length<=0) {
        setTimeout(() => {
          thisClass.getElements(query).then(function (value) {
            resolve(value);
          });
        }, 1000);
      } else {
        resolve(element);
      }
    });
  }
  getProperty(query, property = "textContent") {
    const thisClass = this;
    return new Promise(function (resolve) {
      thisClass.getElement(query).then(function (element) {
        const propertyValue = element[property];
        if (!propertyValue) {
          setTimeout(() => {
            thisClass.getProperty(query).then(function (propertyValue2) {
              resolve(propertyValue2);
            });
          }, 1000);
        } else {
          resolve(propertyValue);
        }
      });
    });
  }
  getPrice(query, type = "textContent") {
    const thisClass = this;
    return new Promise(function (resolve) {
      thisClass.getProperty(query, type).then(function (property) {
        const stringNumber = property;
        const rawNumber = thisClass.getNumberFromCurrencyString(stringNumber);
        if (rawNumber === 0) {
          setTimeout(() => {
            thisClass.getPrice(query, type).then(function (rawNumber2) {
              resolve(rawNumber2);
            });
          }, 1000);
        } else {
          resolve(rawNumber);
        }
      });
    });
  }
  getHourMinuteSecondTime(query, type = "textContent") {
    const thisClass = this;
    return new Promise(function (resolve) {
      thisClass.getProperty(query, type).then(function (property) {
        const string = property;
        if (!string) {
          setTimeout(() => {
            thisClass
              .getHourMinuteSecondTime(query, type)
              .then(function (hourMinuteSecondJson2) {
                resolve(hourMinuteSecondJson2);
              });
          }, 1000);
        } else {
          const hourMinuteSecondJson =
            thisClass.getHourMinuteSecondJson(string);
          resolve(hourMinuteSecondJson);
        }
      });
    });
  }
  openTradesTab() {
    const thisClass = this;
    return new Promise(function (resolve) {
      const dealListTabFirstItemPromise = thisClass.getElement('.page__sidebar .deal-list .deal-list__tabs .deal-list__tab');
      const dealListToogleButtonPromise = thisClass.getElement('.deal-list__toggle');
      Promise.all([
        dealListTabFirstItemPromise,
        dealListToogleButtonPromise
      ]).then(([
        dealListTabFirstItem,
        dealListToogleButton,
      ]) => {
        // Open the dealList if it is closed
        if(!dealListToogleButton.classList.contains('active')){
          dealListToogleButton.click();
        }
        // Open the Trades tab if it is closed
        if(!dealListTabFirstItem.classList.contains('active')){
          dealListToogleButton.click();
        }
        resolve();
      });
    });
  }
  getTradeDetails(element) {
    const thisClass = this;
    const itemTitle = element.querySelector('.trades-list-item__title');
    const itemAmount = thisClass.getNumberFromCurrencyString(itemTitle.querySelector('.trades-list-item__delta-right').textContent);
    // if(!element.classList.contains('active')){
    //   itemTitle.click();
    // }
    const detailList = element.querySelectorAll('ul.trades-list-item__details li.trades-list-item__details-content');
    const tradeDetails = {
      itemAmount,
    };
    for (let index = 0; index < detailList.length; index++) {
      const detail = detailList[index];
      const detailTitle = detail.querySelector('.trades-list-item__details-content__title').textContent;
      const detailContent = detail.querySelector('.trades-list-item__details-content__text').textContent;
      tradeDetails[detailTitle] = detailContent;
    }
    return tradeDetails;
  }
  getStartedTradeDetails() {
    const thisClass = this;
    return new Promise(function (resolve) {
      thisClass.openTradesTab().then(()=>{
        thisClass.getElements('.page__sidebar .deal-list__items .trades-list__item:not(.trades-list-item__close)').then((elements)=>{
          let tradeDetails;
          const isTradeIdUnique = tradeId => {
            const doesTradeIdExist = !!tradeId;
            const isTradeIdBeingUsed = thisClass.Control.operations.every(operation => operation.tradeDetails['ID:'] !== tradeId);
            return doesTradeIdExist && isTradeIdBeingUsed;
          };
          for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            const elementTradeDetails = thisClass.getTradeDetails(element);
            if(isTradeIdUnique(elementTradeDetails['ID:'])){
              tradeDetails = elementTradeDetails;
              resolve(tradeDetails);
              break;
            }
          }
          if(!tradeDetails) {
            setTimeout(() => {
              thisClass.getStartedTradeDetails().then(function (tradeDetails2) {
                resolve(tradeDetails2);
              });
            }, 1000);
          }
        });
      });
    });
  }
  getFinishedTradeDetails(ID) {
    const thisClass = this;
    return new Promise(function (resolve) {
      thisClass.openTradesTab().then(()=>{
        thisClass.getElements('.page__sidebar .deal-list__items .trades-list__item.trades-list-item__close').then((elements)=> {
          let tradeDetails;
          for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            const elementTradeDetails = thisClass.getTradeDetails(element);
            if(elementTradeDetails['ID:'] === ID){
              tradeDetails = elementTradeDetails;
              resolve(tradeDetails);
              break;
            }
          }
          if(!tradeDetails) {
            setTimeout(() => {
              thisClass.getFinishedTradeDetails(ID).then(function (tradeDetails2) {
                resolve(tradeDetails2);
              });
            }, 1000);
          }
        });
      });
    });
  }
  getServerDate() {
    const thisClass = this;
    return new Promise(function (resolve) {
      thisClass.getProperty('.server-time').then(textContent => {
        const [time] = textContent.split(' ');
        const [hours,minutes,seconds] = time.split(':');
  
        // Get the current date
        var date = new Date();
      
        // Set the hour and minute of the date using the parsed values
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        date.setSeconds(parseInt(seconds));
        date.setMilliseconds(0);
      
        // Format the date as a string in the desired format
        var dateString = date.toJSON();
      
        // Return the result
        resolve(dateString);
      });
    });
  }
  getUserId() {
    const thisClass = this;
    return new Promise(function (resolve) {
      thisClass.getElement('div.usermenu__info').then((useMenuInfo)=>{
        useMenuInfo.click();
        thisClass.getProperty('span.usermenu__number').then((text)=>{
          thisClass.userId = text.split('ID: ').join('');
          useMenuInfo.click();
          resolve();
        });
      });
    });
  }
}

class eventHelpers extends domHelpers {
  constructor() {
    super();
    this.updateInterface = new CustomEvent('updateInterface');
  }
  triggerEvent(){
    const thisClass = this;
    try {
      document.dispatchEvent(thisClass.updateInterface);
    } catch (e) {
      if (e instanceof DOMException && e.name === "InvalidStateError") {
        // console.warn("Event already being dispatched");
        setTimeout(() => {
          thisClass.triggerEvent();
        }, 600);
      } else {
        throw e;
      }
    }
  }
}

class localStorageHelpers extends eventHelpers {
  constructor() {
    super();
    this.Control = {
      operations: [], // Operations done
    };
    const parsedUrl = this.parseURL(window.location.href);
    this.domain = parsedUrl.domain.includes('quotex') ? 'quotex' : 'ebinex';
    const isDemo = parsedUrl.paths.some(path => path.includes('demo'));
    this.isDemo = isDemo;
    this.localStorageSuffix = isDemo ? '_demo' : '';
  }
  parseURL(url) {
    const parser = document.createElement('a');
    parser.href = url;
  
    const domain = parser.hostname;
    const paths = parser.pathname.split('/').filter(route => route !== '') || [];
  
    return {
      domain,
      paths
    };
  }
  saveData() {
    const data = this.Control;
    const userId = this.userId || 'default';
    localStorage.setItem(`controlTraderData${this.localStorageSuffix}@${userId}`, JSON.stringify(data));
    this.triggerEvent();
  }
  getData() {
    const userId = this.userId || 'default';
    const data = localStorage.getItem(`controlTraderData${this.localStorageSuffix}@${userId}`);
    if(data){
      const parsedData = JSON.parse(data);
      this.Control = parsedData;
    }
    this.triggerEvent();
  }
}

class operationHelpers extends localStorageHelpers {
  constructor() {
    super();
    this.operationTimers = [];
  }
  openHiddenTotalAmount(thisClass) {
    return new Promise(function (resolve) {
      thisClass.getProperty("div.usermenu__info-balance").then((totalAmount)=>{
        if(totalAmount.includes('*')){
          thisClass.getElement('div.usermenu__info').then((useMenuInfo)=>{
            useMenuInfo.click();
            thisClass.getElement('div.usermenu__eye').then((useMenuEye)=>{
              useMenuEye.click();
              useMenuInfo.click();
              resolve();
            });
          });
        } else {
          resolve();
        }
      });
    });
  }
  storeOperation(type){
    const thisClass = this;
    thisClass.openHiddenTotalAmount(thisClass).then(()=>{
      const operationTimeStringPromise = thisClass.getProperty(
        ".section-deal__time .input-control__input",
        "value"
      );
      const operationAmountPromise = thisClass.getPrice(
        ".section-deal__investment .input-control__input",
        "value"
      );
      const totalAmountPromise = thisClass.getPrice("div.usermenu__info-balance");
      Promise.all([operationTimeStringPromise, operationAmountPromise, totalAmountPromise]).then(
        async (resolves) => {
          const operationTimeString = resolves[0];
          const operationAmount = resolves[1];
          const currentAmount = resolves[2];

          // handle risk delay ============
          if(!thisClass.Control.cachedOperations){
            thisClass.Control.cachedOperations = [];
          }
          const cachedOperationIndex = thisClass.Control.cachedOperations.length;
          thisClass.Control.cachedOperations[cachedOperationIndex] = {
            cachedOperationIndex,
            operationAmount,
          };
          thisClass.managePercentageSelector(thisClass);
          thisClass.isPriceValid(thisClass);
          // handle risk delay ============
  
          const operationTime = thisClass.getHourMinuteSecondJson(operationTimeString);
          // GET THE SYSTEM DATE
          const serverDate = await thisClass.getServerDate();
          const operationStartDate = serverDate || thisClass.getCurrentDate();
          const operationSecondDuration =
            thisClass.getSecondDurationFromJson(operationTime);
          
          
          const operationTimeSplit = operationTimeString.split(':');
          const isOperationTimeStringTheEndDate = operationTimeSplit.length === 2;
  
          const operationEndDate = isOperationTimeStringTheEndDate 
            ? thisClass.getDateWithSpecificTime(operationTimeString)
            : thisClass.addSecondsToDate(
              operationStartDate,
              operationSecondDuration
            );

          const operationData = {
            operationType: type,
            operationTime,
            operationSecondDuration,
            operationAmount,
            operationStartDate,
            operationEndDate,
            operationResult: null,
            currentAmount,
            finalAmount: null,
            status: 'processing',
            cachedOperationIndex,
          };
          
          helper.getStartedTradeDetails().then((tradeDetails)=>{
            const openTime = tradeDetails['Open time:'] || tradeDetails['Hora de abertura:'];
            const closeTime = tradeDetails['Close Time:'] || tradeDetails['Hora de fechamento:'];
            const duration = tradeDetails['Duration:'] || tradeDetails['Duração:'];
  
            const operationDataFromTradeDetails = {
              tradeDetails,
              operationStartDate: openTime ? new Date(openTime).toJSON() : operationStartDate,
              operationEndDate: closeTime ? new Date(closeTime).toJSON() : operationEndDate,
              operationTime: duration ? thisClass.getHourMinuteSecondJson(duration) : operationTime,
              operationSecondDuration: duration ? thisClass.getSecondDurationFromJson(thisClass.getHourMinuteSecondJson(duration)) : operationSecondDuration,
            };
  
            thisClass.Control.operations.push({
              ...operationData,
              ...operationDataFromTradeDetails,
            });

            thisClass.Control.cachedOperations = thisClass.Control.cachedOperations.filter(cachedOperation => 
              cachedOperation.cachedOperationIndex !== cachedOperationIndex);

            thisClass.saveData();
          });
        }
      );
    });
  }
  finishOperation(thisClass,operation,index){
    if(operation.tradeDetails) {
      thisClass.getFinishedTradeDetails(operation.tradeDetails['ID:']).then((tradeDetails)=>{
        thisClass.openHiddenTotalAmount(thisClass).then(()=>{
          thisClass.getPrice("div.usermenu__info-balance").then(amount=>{
           const finalAmountPromise = amount;
           thisClass.Control.operations[index].status = 'finished';
           thisClass.Control.operations[index].finalAmount = finalAmountPromise;
           thisClass.Control.operations[index].finalTradeDetails = tradeDetails;
           if(tradeDetails.itemAmount < operation.operationAmount) {
            thisClass.Control.operations[index].operationResult = 'loss';
            console.log('Loss');
           } else if(tradeDetails.itemAmount > operation.operationAmount) {
             thisClass.Control.operations[index].operationResult = 'gain';
             console.log('Gain');
           } else {
            thisClass.Control.operations[index].operationResult = 'draw';
            console.log('Draw');
           }
           thisClass.Control.operations[index]
           thisClass.saveData();
          });
        });
      });
    } else {
      // Teardown this after one week
      thisClass.openHiddenTotalAmount(thisClass).then(()=>{
        thisClass.getPrice("div.usermenu__info-balance").then(amount=>{
         const finalAmountPromise = amount;
         thisClass.Control.operations[index].status = 'finished';
         thisClass.Control.operations[index].finalAmount = finalAmountPromise;
         if(finalAmountPromise === operation.currentAmount) {
          thisClass.Control.operations[index].operationResult = 'draw';
          console.log('Draw');
         } else if(finalAmountPromise > operation.currentAmount) {
           thisClass.Control.operations[index].operationResult = 'gain';
           console.log('Gain');
         } else {
           thisClass.Control.operations[index].operationResult = 'loss';
           console.log('Loss');
         }
         thisClass.saveData();
        });
      });
    }

  }
  endOperation(thisClass,operation,index){
    thisClass.showButtons(thisClass);
    thisClass.Control.operations[index].status = 'done';

    const stopResult = thisClass.verifyStopPerDailyLimit(thisClass);
    const disableStopGain = thisClass.Control.dailyLimit.disableStopGain;
    if(stopResult.stopGain && disableStopGain) {
      thisClass.openModal(thisClass,
        'Você atingiu a sua meta, E AGORA?',
        `Seu STOP GAIN está desativado. Se for continuar operando, CUIDADO para não devolver o lucro e entrar no prejuízo`,
      );
    }

    thisClass.saveData();
  }
  filterTodayOperations(thisClass){
    const filteredTodaysOperations = thisClass.Control.operations.filter(function(operation) {
      return thisClass.isDateToday(operation.operationStartDate);
    });
    return filteredTodaysOperations;
  }
  resetDailyOperationLimit(thisClass){
    thisClass.Control.dailyLimit = {
      date: thisClass.getCurrentDate(),
      value: 0,
      gainValue: 0,
      lossPercentage: 0,
      gainPercentage: 0,
    };

    thisClass.saveData();
  }
  getDailyOperationLimit(thisClass){
    const doesControlHaveDailyLimit = thisClass.Control.dailyLimit;
    if(!doesControlHaveDailyLimit) {
      thisClass.resetDailyOperationLimit(thisClass);
    }

    const isDailyLimitForToday = thisClass.isDateToday(thisClass.Control.dailyLimit.date);
    if(!isDailyLimitForToday) {
      thisClass.resetDailyOperationLimit(thisClass);
    }
  }
}

class userHelpers extends operationHelpers {
  constructor() {
    super();
    this.user = undefined;
    this.logged = undefined;
  }
  createUserLoginMessage() {
    const thisClass = this;
    if(!thisClass.logged){
      const controlTraderMenu = document.querySelector('#control-trader-menu ul');
      const newOption = document.createElement('li');
      newOption.innerHTML = `
        <!-- span id="control-trader-loggout">
          SAIR
        </span -->
      `;
      controlTraderMenu.appendChild(newOption);
  
      thisClass.getElement('#control-trader-loggout').then((element)=>{
        element.addEventListener('click', () => {
          localStorage.removeItem('controlTraderEmail');
          location.reload();
        });
      });
    }
    thisClass.logged = true;
  }
  setLogin(email){
    localStorage.setItem('controlTraderEmail', email);
  }
  getLogin(){
    return localStorage.getItem('controlTraderEmail');
  }
  onLogin({email, onInvalidEmail, onValidEmail, onError}){
    const thisClass = this;
    fetch(`https://e2mnpygunyao3zpgkzkfwrhqgu0cnisu.lambda-url.eu-north-1.on.aws/?email=${email}`)
      .then(response => {
        if(response.status === 200) {
          onValidEmail();
          thisClass.user = email;
          thisClass.setLogin(email);
          thisClass.createUserLoginMessage();
        } else {
          onInvalidEmail();
        }
      })
      .catch(error => {
        console.error('An error occurred:', error);
        onError();
      });
  }
  addUserLoginModal() {
    const thisClass = this;

    const userMessage = document.createElement('div');
    userMessage.innerHTML = `
      <div id="control-trader-user-login-modal" class="control-trader-login-modal">
        <div class="control-trader-login-modal-content">
          <span class="control-trader-login-close">&times;</span>
          <div id="control-trader-stroke-logo">
            <img src="${logoStrokeUrl}" />
          </div>
          <div>
            <h3>FAÇA SEU LOGIN</h3>
            <p>Para acessar, digite o email utilizado na <b>compra</b></p>
            <input type="email" id="control-trader-email-login" placeholder="Email" />
            <p class="control-trader-login-error" id="control-trader-login-error-text"></p>
            <button id="control-trader-login-button">Login</button>
          </div>
          <div>
            <p class="control-trader-buy-paragraph">
              Não possui um login? <a href="https://sun.eduzz.com/1906594" target="_blank"><b>ASSINE AQUI!</b></a><br />
              <span class="control-trader-author">by <a href="https://www.instagram.com/doreatrader/" target="_blank">doreatrader</a></span>
            </p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(userMessage);

    const closeModalButton = document.getElementsByClassName('control-trader-login-close')[0];
    const modal = document.getElementById('control-trader-user-login-modal');
    const loginButton = document.getElementById('control-trader-login-button');
    const emailInput = document.getElementById('control-trader-email-login');
    const errorText = document.getElementById('control-trader-login-error-text');
  
    closeModalButton.addEventListener('click', function () {
      modal.style.display = 'none';
    });
  
    loginButton.addEventListener('click', function () {
      const email = emailInput.value;
  
      if (email === '') {
        errorText.textContent = 'Por favor, digite seu e-mail.';
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errorText.textContent = 'Por favor, digite um e-mail válido.';
        return;
      }

      loginButton.textContent = 'Enviando...';

      thisClass.onLogin({
        email,
        onInvalidEmail: ()=>{
          errorText.textContent = 'Email inválido, tente novamente ou reporte um erro pelo menu.';
          loginButton.textContent = 'Enviar';
        },
        onValidEmail: ()=>{
          modal.style.display = 'none';
          const userMessage = document.getElementById('control-trader-user-message');
          userMessage.style.display = 'none';
          app();
        },
        onError: ()=>{
          errorText.textContent = 'Um erro ocorreu, tente novamente ou reporte um erro pelo menu.';
          loginButton.textContent = 'Enviar';
        },
      });
    });
  }
  createUserMessage() {
    const userMessage = document.createElement('div');
    userMessage.innerHTML = `
      <div id="control-trader-user-message">
        <b>PARE DE QUEBRAR A SUA CONTA!<br />
        <button id="control-trader-user-message-btn">
          ACESSE AQUI
        </button>
        O CONTROL TRADER PRO.</b>
      </div>
    `;
    document.body.appendChild(userMessage);

    document.getElementById('control-trader-user-message').addEventListener('click', () => {
      const modal = document.getElementById('control-trader-user-login-modal');
      modal.style.display = 'flex';
    });
  }
  createUserErrorMessage() {
    const userMessage = document.createElement('div');
    userMessage.innerHTML = `
      <div id="control-trader-user-message">
        Um erro ocorreu, tente novamente<br /> ou entre em contato pelo menu
      </div>
    `;
    document.body.appendChild(userMessage);
  }
}

class interfaceHelpers extends userHelpers {
  constructor() {
    super();
    this.style = {
      blocked: 'control-trader-blocked',
      priceHigherThanDailyLimit: 'control-trader-price-higher-than-daily-limit',
    };
  }
  hideButtons(thisClass, customClass = undefined){
    document.body.classList.add(customClass || thisClass.style.blocked);
  }
  showButtons(thisClass, customClass = undefined){
    document.body.classList.remove(customClass || thisClass.style.blocked);
  }
  openModal(thisClass, title, text) {
    const modalPromise = thisClass.getElement('#control-trader-modal');
    const modalTitlePromise = thisClass.getElement('#control-trader-modal-title');
    const modalBodyPromise = thisClass.getElement('#control-trader-modal-body');

    Promise.all([modalPromise, modalTitlePromise, modalBodyPromise]).then((resolves) => {
      const modal = resolves[0];
      const modalTitle = resolves[1];
      const modalBody = resolves[2];

      modal.style.display = 'block';
      modalTitle.innerHTML = title;
      modalBody.innerHTML = text;
    });
  }
  closeModal(thisClass) {
    thisClass.getElement('#control-trader-modal').then((modal) => {
      modal.style.display = 'none';
    });
  }
  addLogo() {
    const logoContainer = document.createElement('div');
    logoContainer.innerHTML = `<div id="control-trader-header">
      <div id="control-trader-icons">
        <div id="control-trader-logo">
          <img src="${logoUrl}" />
        </div>
        <div id="control-trader-menu-icon">
          <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M88 152h336M88 256h336M88 360h336" fill="none" stroke="#1d1f2d" stroke-linecap="round" stroke-miterlimit="10" stroke-width="48px" class="stroke-000000"></path></svg>
        </div>
      </div>
      <div id="control-trader-menu" class="control-trader-hidden">
        <ul>
          <li id="control-trader-open-contact">contato</li>
          <li id="control-trader-open-support">reportar erro</li>
          ${this.isDemo ? '<li id="control-trader-refresh">reiniciar</li>' : ''}
          <!-- li id="control-trader-payment">assinatura</li -->
        </ul>
      </div>
    </div>`;
    document.body.appendChild(logoContainer);

    // Handle form close button
    document.querySelector("#control-trader-icons").addEventListener("click", function() {
      const menu = document.getElementById("control-trader-menu");
      if(menu.classList.contains("control-trader-hidden")){
        menu.classList.remove("control-trader-hidden");
      }else{
        menu.classList.add("control-trader-hidden");
      }
    });

    // Handle payment button
    // document.querySelector("#control-trader-payment").addEventListener("click", function() {
    //   console.log('Please pay now')
    // });
  }
  createModal() {
    const thisClass = this;
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div id="control-trader-modal">
        <div id="control-trader-modal-content">
          <div id="control-trader-modal-header">
            <h2 id="control-trader-modal-title">Title</h2>
            <button id="control-trader-modal-close-btn" class="control-trader-close-btn">
              &#10006;
            </button>
          </div>
          <div id="control-trader-modal-body">
            <p>Text</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('control-trader-modal-close-btn').addEventListener('click', () => thisClass.closeModal(thisClass));

    const firstModal = localStorage.getItem("controlTraderData@firstModal");
    if(!firstModal){
      thisClass.openModal(thisClass, 
        'Fala traders 👊', 
        'Seu Control Trader já está funcionando.\n\nBoas operações!');
      localStorage.setItem("controlTraderData@firstModal", 'opened');
    }
  }
  getTotalProfit(thisClass) {
    const filteredTodaysOperations = thisClass.filterTodayOperations(thisClass);

    const filteredGainedTodaysOperations = filteredTodaysOperations.filter(operation=>
      operation.operationResult === 'gain');

    const totalGain = filteredGainedTodaysOperations.reduce((accumulator,operation)=>{
      const profit = Math.round(operation.finalTradeDetails.itemAmount) - operation.operationAmount
      return accumulator + profit;
    },0);

    return totalGain;
  }
  getTotalLoss(thisClass) {
    const filteredTodaysOperations = thisClass.filterTodayOperations(thisClass);

    const filteredLostTodaysOperations = filteredTodaysOperations.filter(operation=>
      operation.operationResult === 'loss');
    
    const totalLoss = filteredLostTodaysOperations.reduce((accumulator,operation)=>{
      const wasOperationSoldBeforeEnding = operation.finalTradeDetails.itemAmount > 0;
      if(wasOperationSoldBeforeEnding) {
        return accumulator + (operation.operationAmount - operation.finalTradeDetails.itemAmount);
      }
      return accumulator + operation.operationAmount;
    },0);

    return totalLoss;
  }
  getTotalRisk(thisClass) {
    const filteredTodaysOperations = thisClass.filterTodayOperations(thisClass);

    const filteredPendingTodaysOperations = filteredTodaysOperations.filter(operation=>
      operation.status === 'processing');
    
    thisClass.Control.cachedOperations = thisClass.Control.cachedOperations 
    ? thisClass.Control.cachedOperations.filter(cachedOperation => {
      const isCachedOperationStored = thisClass.Control.operations.find(operation => 
        cachedOperation.cachedOperationIndex ===  operation.cachedOperationIndex);
      return !isCachedOperationStored;
    }) : [];

    const cachedOperations = thisClass.Control.cachedOperations;
    
    const totalPending = [
      ...filteredPendingTodaysOperations,
      ...cachedOperations,
    ].reduce((accumulator,operation)=>{
      return accumulator + operation.operationAmount;
    }, 0);

    return totalPending;
  }
  getRemainingDailyLimit(thisClass) {
    if(thisClass.Control.dailyLimit && thisClass.Control.dailyLimit.value !== 0) {
      const totalLoss = thisClass.getTotalLoss(thisClass);

      const totalGain = thisClass.getTotalProfit(thisClass);

      const updatedLimit = thisClass.Control.dailyLimit.value - totalLoss + totalGain;

      return updatedLimit;
    }
    return 0;
  }
  isPriceValid(thisClass) {
    thisClass.getPrice(
      ".section-deal__investment .input-control__input",
      "value"
    ).then((operationInvestiment)=>{
      if(thisClass.Control.dailyLimit && thisClass.Control.dailyLimit.value !== 0) {
        const totalRisk = thisClass.getTotalRisk(thisClass);
        const updatedLimit = thisClass.getRemainingDailyLimit(thisClass) - totalRisk;
        thisClass.getElement('#control-trader-extra-message').then((extraMessage) => {
          const isOperationInvestimentBiggerThanUpdatedLimit = updatedLimit > 0 && updatedLimit < operationInvestiment;
          const isUpdatedLimitZeroAndRiskExists = updatedLimit <= 0 && totalRisk > 0;
          if(isOperationInvestimentBiggerThanUpdatedLimit || isUpdatedLimitZeroAndRiskExists) {
            thisClass.hideButtons(thisClass, thisClass.style.priceHigherThanDailyLimit);
            extraMessage.innerHTML = `<p>Valor de investimento ${operationInvestiment} está ultrapassando o limite diário restante de ${updatedLimit}. Diminua para poder operar.</p>`;
          } else {
            thisClass.showButtons(thisClass, thisClass.style.priceHigherThanDailyLimit);
            extraMessage.innerHTML = ``;
          }
        });
      }
    });
  };
  createPercentageSelector() {
    const thisClass = this;
    thisClass.getElement('.sidebar-section').then((sidebarSection) => {
      const loadingBlock = document.createElement('div');
      loadingBlock.innerHTML = `<p id="control-trader-loading-block">Buscando balanço total...<br />Caso seja 0,00 por favor insira algum valor.</p>`;
      sidebarSection.appendChild(loadingBlock);
      thisClass.openHiddenTotalAmount(thisClass).then(()=>{
        thisClass.getPrice("div.usermenu__info-balance").then((totalPrice)=>{
          loadingBlock.innerHTML = ``;
          const percentageBlock = document.createElement('div');
          const percentageValues = {
            '3': Math.round(totalPrice*(3*0.01)),
            '6': Math.round(totalPrice*(6*0.01)),
            '10': Math.round(totalPrice*(10*0.01)),
            '13': Math.round(totalPrice*(13*0.01)),
            '16': Math.round(totalPrice*(16*0.01)),
            '19': Math.round(totalPrice*(19*0.01)),
            '23': Math.round(totalPrice*(23*0.01)),
            '27': Math.round(totalPrice*(27*0.01)),
            '32': Math.round(totalPrice*(32*0.01)),
          };
          const lossToGainPercentage = {
            '3': 5,
            '6': 10,
            '10': 15,
            '13': 20,
            '16': 25,
            '19': 30,
            '23': 35,
            '27': 42,
            '32': 50,
          };
          const getGainValue = (lossPercentage) => {
            return Math.round(totalPrice*(lossToGainPercentage[lossPercentage]*0.01));
          };
          percentageBlock.innerHTML = `
            <div id="control-trader-percentage-block">
              <div class="control-trader-field">
                <div class="control-trader-toggle-pill-color">
                  <input type="checkbox" id="control-trader-stop-gain" name="check" checked="true">
                  <label for="control-trader-stop-gain"></label>
                </div>
                <p>Stop Gain</p>
              </div>
              <div class="control-trader-field">
                <div class="control-trader-toggle-pill-color">
                  <input type="checkbox" id="control-trader-behavior" name="check" checked="true">
                  <label for="control-trader-behavior"></label>
                </div>
                <p>Comportamento Padrão (3min)</p>
              </div>
              <label for="control-trader-percentage">Gerenciamento Diário:</label>
              <select id="control-trader-percentage" name="percentage">
                <option value="0">Selecione uma porcentagem</option>
                <option value="3">Loss 3% - ${percentageValues['3']} | Gain ${lossToGainPercentage['3']}% - ${getGainValue('3')}</option>
                <option value="6">Loss 6% - ${percentageValues['6']} | Gain ${lossToGainPercentage['6']}% - ${getGainValue('6')}</option>
                <option value="10">Loss 10% - ${percentageValues['10']} | Gain ${lossToGainPercentage['10']}% - ${getGainValue('10')}</option>
                <option value="13">Loss 13% - ${percentageValues['13']} | Gain ${lossToGainPercentage['13']}% - ${getGainValue('13')}</option>
                <option value="16">Loss 16% - ${percentageValues['16']} | Gain ${lossToGainPercentage['16']}% - ${getGainValue('16')}</option>
                <option value="19">Loss 19% - ${percentageValues['19']} | Gain ${lossToGainPercentage['19']}% - ${getGainValue('19')}</option>
                <option value="23">Loss 23% - ${percentageValues['23']} | Gain ${lossToGainPercentage['23']}% - ${getGainValue('23')}</option>
                <option value="27">Loss 27% - ${percentageValues['27']} | Gain ${lossToGainPercentage['27']}% - ${getGainValue('27')}</option>
                <option value="32">Loss 32% - ${percentageValues['32']} | Gain ${lossToGainPercentage['32']}% - ${getGainValue('32')}</option>
              </select>
              <button id="control-trader-accept-percentage">Definir Stops</button>
              <p id="control-trader-percentage-error" class="control-trader-error"></p>
            </div>
          `;
          sidebarSection.appendChild(percentageBlock);
    
          const percentageLimit = {
            value: 0,
          };
    
          document.getElementById('control-trader-percentage').addEventListener('change', (event) => {
            const selectedValue = event.target.value;
            percentageLimit.value = Number(selectedValue);
            document.getElementById('control-trader-percentage-error').innerHTML = '';
          });
    
          document.getElementById('control-trader-accept-percentage').addEventListener('click', (event) => {
            const checkboxBehavior = document.getElementById("control-trader-behavior");
            const checkboxStopGain = document.getElementById("control-trader-stop-gain");
            if(percentageLimit.value===0){
              document.getElementById('control-trader-percentage-error').innerHTML = 'Você deve selecionar um limite válido.';
            } else {
              const dailyLimitValue = percentageValues[percentageLimit.value.toString()];
  
              thisClass.Control.dailyLimit.value = dailyLimitValue;
              thisClass.Control.dailyLimit.gainValue = getGainValue(percentageLimit.value.toString());
              thisClass.Control.dailyLimit.lossPercentage = percentageLimit.value;
              thisClass.Control.dailyLimit.gainPercentage = lossToGainPercentage[percentageLimit.value.toString()];
              thisClass.Control.dailyLimit.disableBehavior = !checkboxBehavior.checked;
              thisClass.Control.dailyLimit.disableStopGain = !checkboxStopGain.checked;
              
              if(!thisClass.Control.dailyLimitHistory){
                thisClass.Control.dailyLimitHistory = [];
              }
  
              thisClass.Control.dailyLimitHistory.push({
                ...thisClass.Control.dailyLimit,
                percentage: percentageLimit.value,
                totalValue: totalPrice,
                disableBehavior: !checkboxBehavior.checked,
                disableStopGain: !checkboxStopGain.checked,
              });
              thisClass.isPriceValid(thisClass);
  
              thisClass.saveData();
            }
          });
        });
      });
    });
  }
  managePercentageSelector(thisClass) {
    thisClass.getElement('.sidebar-section').then((sidebarSection) => {
      if(thisClass.Control.dailyLimit && thisClass.Control.dailyLimit.value !== 0) {
        sidebarSection.classList.remove(thisClass.style.blocked);

        const updatedLimit = thisClass.getRemainingDailyLimit(thisClass);

        thisClass.getElement('#control-trader-daily-limit').then((dailyLimitElement) => {
          const dailyLimitData = {
            stopLoss: updatedLimit,
            prejudice: thisClass.getTotalLoss(thisClass),
            stopGain: thisClass.Control.dailyLimit.gainValue,
            profit: thisClass.getTotalProfit(thisClass),
            risk: Math.round(thisClass.getTotalRisk(thisClass)),
          };
          if(dailyLimitData.profit !== 0 && dailyLimitData.prejudice !== 0) {
            const profitDifference = dailyLimitData.profit - dailyLimitData.prejudice;
            if(profitDifference>=0) {
              dailyLimitData.profit = profitDifference;
              dailyLimitData.prejudice = 0;
            } else {
              dailyLimitData.profit = 0;
              dailyLimitData.prejudice = -profitDifference;
            }
          }
          if(dailyLimitData.stopLoss < thisClass.Control.dailyLimit.value) {
            dailyLimitData.stopLoss = thisClass.Control.dailyLimit.value;
          }
          dailyLimitElement.innerHTML = `
            <div id="control-trader-daily-loss-limit">
              Perda <span class="control-trader-operated-number">${Math.round(dailyLimitData.prejudice)}</span><span class="control-trader-limit-number">/${Math.round(dailyLimitData.stopLoss)}</span>
            </div>
            <div id="control-trader-daily-gain-limit">
              Ganho <span class="control-trader-operated-number">${Math.round(dailyLimitData.profit)}</span><span class="control-trader-limit-number">/${Math.round(thisClass.Control.dailyLimit.gainValue)}</span>
            </div>
            ${dailyLimitData.risk ? (`
              <!--div id="control-trader-daily-risk-limit">
                Risco <span class="control-trader-operated-number">${dailyLimitData.risk}</span>
              </div-->
            `) : ''}
          `;
        });
        thisClass.getElement('#control-trader-disabled-messages').then((disabledMessagesElement) => {
          const disableBehavior = thisClass.Control.dailyLimit.disableBehavior;
          const disableBehaviorElement = disableBehavior ? '' : `<span>CP</span>`;
          const disableStopGain = thisClass.Control.dailyLimit.disableStopGain;
          const disableStopGainElement = disableStopGain ? '' : ` <span>SG</span>`;
          disabledMessagesElement.innerHTML = `
            ${disableBehaviorElement}
            ${disableStopGainElement}
          `;
        });    
      } else {
        sidebarSection.classList.add(thisClass.style.blocked);
      }
    });
  }
  updateOperationLimitPerRemainingDailyLimit(thisClass) {
    const inputPromise = thisClass.getElement(".section-deal__investment .input-control__input");
    const buttonsPromise = thisClass.getElements(".section-deal__investment .input-control__button");
    const containerPromise = thisClass.getElement('.section-deal__put');
    Promise.all([
      inputPromise,
      buttonsPromise,
      containerPromise,
    ]).then(([
      input,
      buttons,
      container,
    ]) => {
      input.addEventListener('keyup', () => {
        thisClass.isPriceValid(thisClass);
      });
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          setTimeout(() => {
            thisClass.isPriceValid(thisClass);
          }, 100);
        });
      });

      const extraMessage = document.createElement('div');
      extraMessage.innerHTML = `
        <div id="control-trader-extra-message"></div>
      `;
      container.appendChild(extraMessage);
      
      thisClass.isPriceValid(thisClass);
    });
  }
  updateControlStatus(thisClass, filteredTodaysOperations) {
    thisClass.getElement('#control-trader-status').then((ul) => {
      const operationStatus = filteredTodaysOperations.reduce((accumulator,operation)=>{
        const className = operation.operationResult
          ? `control-trader-${operation.operationResult}-operation`
          : 'control-trader-processing-operation';
        return `${accumulator}<li class="${className}"></li>`;
      },'');
      ul.innerHTML = operationStatus;
    });
  }
  createControlStatus() {
    const status = document.createElement('div');
    status.innerHTML = `<div id="control-trader-status-container">
      <ul id="control-trader-status"></ul>
      <span id="control-trader-daily-limit"></span>
      <span id="control-trader-disabled-messages"></span>
    </div>`;
    document.body.appendChild(status);
  }
  async startInterface() {
    // Get user
    await this.getUserId();

    // Add logo
    this.addLogo();

    // Create form
    this.createForm();

    // Create contact
    this.createContact();
  }
  setupInterface() {
    // Get the data from the local storage
    this.getData();

    // Create modal
    this.createModal();

    // Create status
    this.createControlStatus();

    // Create percentage selector
    this.createPercentageSelector();

    // Create update operation limit per remaining daily limit
    this.updateOperationLimitPerRemainingDailyLimit(this);
  }
  verifyStopPerMaxResults(thisClass, maxLoss = 2, maxGain = 4) {
    // GET THE NUMBER OF OPERATIONS TODAY

    const filteredTodaysOperations = thisClass.filterTodayOperations(thisClass);

    const filteredLostTodaysOperations = filteredTodaysOperations.filter(operation=>
      operation.operationResult === 'loss');

    const filteredGainedTodaysOperations = filteredTodaysOperations.filter(operation=>
      operation.operationResult === 'gain');

    const stopLoss = filteredLostTodaysOperations.length >= maxLoss;
    const stopGain = filteredGainedTodaysOperations.length >= maxGain;

    return { stopLoss, stopGain };
  }
  verifyStopPerDailyLimit(thisClass) {
    const resut = { stopLoss: false, stopGain: false };
    if(thisClass.Control.dailyLimit && thisClass.Control.dailyLimit.value !== 0) {
      const updatedLimit = thisClass.getRemainingDailyLimit(thisClass);

      const totalGain = thisClass.getTotalProfit(thisClass);
      const totalLoss = thisClass.getTotalLoss(thisClass);

      const mainProfit = totalGain - totalLoss;

      if(updatedLimit<=0) {
        resut.stopLoss = true;
      } else if(mainProfit >= thisClass.Control.dailyLimit.gainValue) {
        resut.stopGain = true;
      }
    }

    return resut;
  }
  stopOperation(thisClass, stopResult) {
    if(stopResult.stopGain) {
      const disableStopGain = thisClass.Control.dailyLimit.disableStopGain;
      if(!disableStopGain) {
        thisClass.hideButtons(thisClass);
        thisClass.openModal(thisClass,
          'Parabéns por bater a meta! 🤩',
          `Para respeitar o gerenciamento, você só voltará amanhã.`,
        );
      }
    } else {
      thisClass.hideButtons(thisClass);
      thisClass.openModal(thisClass,
        'Ser consistente não é ganhar sempre.',
        `Para respeitar o gerenciamento, você só voltará amanhã.`,
      );
    }
  }
  updateInterfaceMethod(thisClass){
    // Create the timers
    thisClass.Control.operations.forEach(async (operation,index) => {
      if(operation.status === 'processing'){
        // GET THE SYSTEM DATE
        const serverDate = await thisClass.getServerDate();
        const now = serverDate || thisClass.getCurrentDate();
        const operationSecondDuration = thisClass.getDateDiffInSeconds(operation.operationEndDate, now);
        if(operationSecondDuration>0){
          const getPriceTimerKey = `${index}-getPrice`;
          if(thisClass.operationTimers[getPriceTimerKey]){
            clearTimeout(thisClass.operationTimers[getPriceTimerKey])
          }

          // thisClass.hideButtons(thisClass);
          thisClass.operationTimers[getPriceTimerKey] = {
            getPrice: setTimeout(function() {
              thisClass.finishOperation(thisClass,operation,index);
             }, (operationSecondDuration * thisClass.milliseconds) + 5000), // seconds to wait for delay
          };
        } else {
          thisClass.finishOperation(thisClass,operation,index);
        }
      }

      if(
        operation.status === 'processing' ||
        operation.status === 'finished'
      ){
        // Show button in 5 minutes after the operation ends
        // GET THE SYSTEM DATE
        const serverDate = await thisClass.getServerDate();
        const now = serverDate || thisClass.getCurrentDate();
        const operationSecondDuration = thisClass.getDateDiffInSeconds(operation.operationEndDate, now);
        const disableBehavior = thisClass.Control.dailyLimit.disableBehavior;
        const showButtonSecondDuration = operationSecondDuration + (disableBehavior ? 5 : ((thisClass.minutes * minutesToWait)/thisClass.milliseconds));
        if(showButtonSecondDuration>0){
          if(operation.status === 'finished'){
            const currentStopResult = thisClass.verifyStopPerDailyLimit(thisClass);
            if(!disableBehavior && !currentStopResult.stopLoss && !currentStopResult.stopGain) {
              thisClass.openModal(thisClass,
                'Sumi com seus botões por 3 minutos! 😎',
                `PRA VOCÊ RESPEITAR O GERENCIAMENTO!!!! 🤬`,
              );
              thisClass.hideButtons(thisClass);
            }
          }
          const showButtonTimerKey = `${index}-showButton`;
          if(thisClass.operationTimers[showButtonTimerKey]){
            clearTimeout(thisClass.operationTimers[showButtonTimerKey])
          }

          thisClass.operationTimers[showButtonTimerKey] = {
            showButton: setTimeout(function() {
              thisClass.endOperation(thisClass,operation,index)
            }, showButtonSecondDuration * thisClass.milliseconds)
          };
        } else {
          thisClass.endOperation(thisClass,operation,index)
        }
      }
    });
    
    thisClass.getDailyOperationLimit(thisClass);

    const filteredTodaysOperations = thisClass.filterTodayOperations(thisClass);
    thisClass.updateControlStatus(thisClass, filteredTodaysOperations);

    // const stopResult = thisClass.verifyStopPerMaxResults(thisClass, 2, 4);
    const stopResult = thisClass.verifyStopPerDailyLimit(thisClass);

    if(stopResult.stopLoss || stopResult.stopGain) {
      thisClass.stopOperation(thisClass, stopResult);
    }

    thisClass.managePercentageSelector(thisClass);

    thisClass.isPriceValid(thisClass);
  }
}

class sentryHelpers extends interfaceHelpers {
  constructor() {
    super();
  }
  loadSentry() {
    const thisClass = this;
    return new Promise(function (resolve) {
      Sentry.init({
        dsn: "https://29564dc549d44412b5c5b611b58bb88d@o4504832670367744.ingest.sentry.io/4504832676659200",
      });
      resolve(true);
    });
  }
  sendUserError(userName, email, message) {
    const thisClass = this;
    Sentry.withScope(scope => {
      scope.setExtra('version', version);
      scope.setExtra('userName', userName);
      scope.setExtra('email', email);
      scope.setExtra('message', message);
      const filteredTodaysOperations = thisClass.filterTodayOperations(thisClass);
      scope.setExtra('control', JSON.stringify(filteredTodaysOperations));
      try {
        throw new Error(`${userName} - Sent error - ${new Date().toJSON()}`)
      } catch (error) {
        Sentry.captureException(error.toString(), (scope) => {
            scope.setTransactionName(`${userName} - Sent error - ${new Date().toJSON()}`);
            return scope;
        });
      }
    });
  }
  createForm() {
    const thisClass = this;
    const form = document.createElement('div');
    form.innerHTML = `
      <div id="control-trader-form" class="control-trader-closed">
      <span class="control-trader-close">&times;</span>
      <form id="control-trader-form-data">
        <h2>Reportar erro</h2>
        <p>Preencha o formulário abaixo para reportar o erro.</p>
        <label for="control-trader-username">Nome:</label>
        <input type="text" id="control-trader-username" name="username">
        <div id="control-trader-username-error" class="control-trader-error"></div>
        <label for="control-trader-email">Email:</label>
        <input type="text" id="control-trader-email" name="email">
        <div id="control-trader-email-error" class="control-trader-error"></div>
        <label for="control-trader-message">Descreva o erro:</label>
        <textarea id="control-trader-message" name="message"></textarea>
        <div id="control-trader-message-error" class="control-trader-error"></div>
        <input type="submit" value="Enviar">
        <div id="control-trader-message-success"></div>
      </form>
    </div>
    `;
    document.body.appendChild(form);

    // Handle form submission
    document.getElementById("control-trader-form-data").addEventListener("submit", function(e) {
      e.preventDefault();

      document.getElementById("control-trader-message-success").textContent = "";
      
      // Validate fields
      var username = document.getElementById("control-trader-username").value;
      if (username.trim() === "") {
        document.getElementById("control-trader-username-error").textContent = "Por favor insira o seu nome";
        return;
      } else {
        document.getElementById("control-trader-username-error").textContent = "";
      }
      var email = document.getElementById("control-trader-email").value;
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        document.getElementById("control-trader-email-error").textContent = "Por favor insira um email válido";
        return;
      } else {
        document.getElementById("control-trader-email-error").textContent = "";
      }
      var message = document.getElementById("control-trader-message").value;
      if (message.trim() === "") {
        document.getElementById("control-trader-message-error").textContent = "Por favor descreva o problema";
        return;
      } else {
        document.getElementById("control-trader-message-error").textContent = "";
      }
      
      // Send data to server
      thisClass.sendUserError(username, email, message);

      document.getElementById("control-trader-message-success").textContent = "Mensagem enviada!.\n\nEntraremos em contato por email.";
      
      // Reset form
      document.getElementById("control-trader-form-data").reset();
      document.getElementById("control-trader-username-error").textContent = "";
      document.getElementById("control-trader-email-error").textContent = "";
      document.getElementById("control-trader-message-error").textContent = "";
    });
    
    // Handle form close button
    document.querySelector(".control-trader-close").addEventListener("click", function() {
      document.getElementById("control-trader-form").classList.remove("control-trader-active");
      document.getElementById("control-trader-form").classList.add("control-trader-closed");
    });

    // Handle form close button
    document.querySelector("#control-trader-open-support").addEventListener("click", function() {
      document.getElementById("control-trader-form").classList.remove("control-trader-closed");
      document.getElementById("control-trader-form").classList.add("control-trader-active");
    });

    if(thisClass.isDemo) {
      document.querySelector("#control-trader-refresh").addEventListener("click", function() {
        const userId = thisClass.userId || 'default';
        localStorage.removeItem(`controlTraderData${thisClass.localStorageSuffix}@${userId}`);
        location.reload();
      });
    }
  }
  createContact() {
    const contact = document.createElement('div');
    contact.innerHTML = `
      <div id="control-trader-contact" class="control-trader-closed">
      <span class="control-trader-close-contact">&times;</span>
      <form id="control-trader-form-data">
        <h2>Contato</h2>
        <p>Para falar com o time do Control Trader, envie um email para:</p>
        <a class="control-trader-submit-button" href="mailto:suportecontroltrader@gmail.com">suportecontroltrader@gmail.com</a>
      </form>
    </div>
    `;
    document.body.appendChild(contact);
    
    // Handle contact close button
    document.querySelector(".control-trader-close-contact").addEventListener("click", function() {
      document.getElementById("control-trader-contact").classList.remove("control-trader-active");
      document.getElementById("control-trader-contact").classList.add("control-trader-closed");
    });

    // Handle contact close button
    document.querySelector("#control-trader-open-contact").addEventListener("click", function() {
      document.getElementById("control-trader-contact").classList.remove("control-trader-closed");
      document.getElementById("control-trader-contact").classList.add("control-trader-active");
    });
  }
}

class helpers extends sentryHelpers {
  constructor() {
    super();
  }
}

const helper = new helpers();

/* ===== APP ===== */

if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", config);
else config();

function config() {
  helper.loadSentry().then(async function () {
    await helper.startInterface();

    const email = helper.getLogin();
    if(email){
      helper.onLogin({
        email,
        onInvalidEmail: ()=>{
          helper.createUserMessage();
          helper.addUserLoginModal();
        },
        onValidEmail: ()=>{
          app();
        },
        onError: ()=>{
          helper.createUserMessage();
          helper.addUserLoginModal();
        },
      });
    } else {
      helper.createUserMessage();
      helper.addUserLoginModal();
    }


    // app(); // load the app only if it is payed
  });
}

function app() {
  console.log("--- Fala traders 👊 ---");

  // Add an event listener for the 'myEvent' event
  document.addEventListener('updateInterface', function (){
    helper.updateInterfaceMethod(helper);
  });

  // Setup Interface
  helper.setupInterface();

  // Listen the clicks
  helper
    .getElement(
      "button.button.button--success.button--spaced.call-btn.section-deal__button"
    )
    .then(function (buyButton) {
      buyButton.addEventListener("click", function () {
        helper.storeOperation('up');
      });
    });

  helper
    .getElement(
      "button.button.button--danger.button--spaced.put-btn.section-deal__button"
    )
    .then(function (sellButton) {
      sellButton.addEventListener("click", function () {
        helper.storeOperation('down');
      });
    });

  helper
    .getElement(
      "a.header__logo"
    )
    .then(function (quotexLogo) {
      quotexLogo.addEventListener("click", function (e) {
        e.preventDefault();
        location.reload();
      });
    });
}
