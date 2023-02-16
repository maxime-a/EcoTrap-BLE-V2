/**
 * @ Author: Maxime Aymonin
 * @ Create Time: 2022-05-20 15:13:04
 * @ Modified by: Maxime Aymonin
 * @ Modified time: 2022-08-15 13:34:23
 * @ Description: A web interface to an EcoTrap
 */

/** Called on page load. Initialize the web page graphical components */
function onPageLoad()
{
    console.log(">> Initializing html components")
}
window.onPageLoad = onPageLoad();

/**
 * Read and return the actuators caracteristic
 */
async function readActuators(){
    var value = await characteristicActuators.readValue();
    let actuatorsWord = new Uint8Array(value.buffer);
    return actuatorsWord;
}

/**
 * Read and return the status caracteristic
 */
 async function readStatus(){
    var value = await characteristicStatus.readValue();
    let statusWord = new Uint8Array(value.buffer);
    return statusWord;
}

/**
 * Read and return the general caracteristic
 */
 async function readGeneral(){
    var value = await characteristicGeneral.readValue();
    let generalWord = new Uint8Array(value.buffer);
    return generalWord;
}

/**
 * Read and return the calendar caracteristic
 */
 async function readCalendar(){
    var value = await characteristicCalendar.readValue();
    let calendarWord = new Uint8Array(value.buffer);
    return calendarWord;
}

/**
 * Read and return the sensors caracteristic
 */
 async function readSensors(){
    var value = await characteristicSensors.readValue();
    let sensorsWord = new Uint8Array(value.buffer);
    return sensorsWord;
}

/**
 * Read and return the AI caracteristic
 */
async function readAI(){
    var value = await characteristicAI.readValue();
    let AIWord = new Uint8Array(value.buffer);
    return AIWord;
}

/** 
 * Convert an bcd interger to two digit string
 */
function BCD2str(number){
    if(number<10)
    {
        return '0'+number.toString(16)
    }
    else
    {
        return number.toString(16)
    }
}

/**
 * Initialise the text , color, etc... with the values readed just after connection
 */
async function globalInit()
{
    console.log(">> Initializing dashboard values and states")

    let generalWord = new Uint8Array(6);
    generalWord = await readGeneral();
  
    document.getElementById("networkID").innerHTML = "Network n°" + generalWord[2];
    document.getElementById("dashboard-title").innerHTML = "Dashboard of network n°" + generalWord[2] + ", machine n°" + generalWord[3];
    document.getElementById("machineID").innerHTML = "Machine n°" + generalWord[3];

    let actuatorsWord = new Uint8Array(6);
    actuatorsWord = await readActuators();
    //check bits
    if(actuatorsWord[1]&0b00000001)
    {
        document.getElementById('fan-img').style.color = 'green';
        fanState=1;
    }
    else
    {
        document.getElementById('fan-img').style.color = 'var(--text-color)';
        fanState=0;
    }
    if(actuatorsWord[1]&0b00000010)
    {
        document.getElementById('co2-img').style.color = 'green';
        co2State=1;
    }
    else
    {
        document.getElementById('co2-img').style.color = 'var(--text-color)';
        co2State=0;
    }
    if(actuatorsWord[1]&0b00000100)
    {
        document.getElementById('light-img').style.color = 'green';
        lightState=1;
    }
    else
    {
        document.getElementById('light-img').style.color = 'var(--text-color)';
        lightState=0;
    }

    /* Status */
    let statusWord = new Uint8Array(2);
    statusWord = await readStatus();
    
    console.log("---------- READ STATUS -------------");
    console.log(statusWord[1]&0b00000011);

    if((statusWord[1]&0b00000011) == 3) // Mode AI
    {
        //funcModeAI();
        modeAuto=0;
        modeManual=0,
        modeAI=1;
        document.getElementById('ai-img').style.color = 'green';
        document.getElementById('manual-img').style.color = 'var(--text-color)';
        document.getElementById('auto-img').style.color = 'var(--text-color)';
        lockers = document.getElementsByClassName("locker");
        for(let i=0;i<lockers.length;i++){lockers[i].style.visibility='hidden';}
    }
    else if((statusWord[1]&0b00000011) == 2) // Mode AUTO
    {
        //funcModeAuto();
    
        modeAuto=1;
        modeAI=0;
        modeManual=0;
        document.getElementById('auto-img').style.color = 'green';
        document.getElementById('ai-img').style.color = 'var(--text-color)';
        document.getElementById('manual-img').style.color = 'var(--text-color)';
        lockers = document.getElementsByClassName("locker");
        for(let i=0;i<lockers.length;i++){lockers[i].style.visibility='visible';}
    }

    else if((statusWord[1]&0b00000011) == 1) // Mode Manual
    {
        //funcModeManual();
        
        modeAuto=0;
        modeManual=1,
        modeAI=0;
        document.getElementById('manual-img').style.color = 'green';
        document.getElementById('ai-img').style.color = 'var(--text-color)';
        document.getElementById('auto-img').style.color = 'var(--text-color)';
        lockers = document.getElementsByClassName("locker");
        for(let i=0;i<lockers.length;i++){lockers[i].style.visibility='hidden';}
    }
    
    /* Init calendar */
    let calendarWord = new Uint8Array(6);
    calendarWord = await readCalendar();

    //Alarm1 state
    alarm1_state = calendarWord[14]
    if(alarm1_state)
    {
        document.getElementById('alarm1Switch').checked = true
    }

    //Alarm2 state
    alarm2_state = calendarWord[28]
    if(alarm2_state)
    {
        document.getElementById('alarm2Switch').checked = true
    }

    //Times of alarm1
    alarm1_start_week_day = calendarWord[17];
    alarm1_start_hour =   calendarWord[18];
    alarm1_start_minute = calendarWord[19];
    alarm1_start_second = calendarWord[20];

    document.getElementById('start1').value = BCD2str(alarm1_start_hour) + ':' + BCD2str(alarm1_start_minute) + ':' + BCD2str(alarm1_start_second);

    alarm1_end_week_day = calendarWord[24];
    alarm1_end_hour =   calendarWord[25];
    alarm1_end_minute = calendarWord[26];
    alarm1_end_second = calendarWord[27];

    document.getElementById('end1').value = BCD2str(alarm1_end_hour) + ':' + BCD2str(alarm1_end_minute) + ':' + BCD2str(alarm1_end_second);

    //Days of alarm1
    if(alarm1_start_week_day & 0b0000001)
    {
        document.getElementById('mon1').checked=true;
    }
    if(alarm1_start_week_day & 0b0000010)
    {
        document.getElementById('tue1').checked=true;
    }
    if(alarm1_start_week_day & 0b0000100)
    {
        document.getElementById('wed1').checked=true;
    }
    if(alarm1_start_week_day & 0b0001000)
    {
        document.getElementById('thu1').checked=true;
    }
    if(alarm1_start_week_day & 0b0010000)
    {
        document.getElementById('fri1').checked=true;
    }
    if(alarm1_start_week_day & 0b0100000)
    {
        document.getElementById('sat1').checked=true;
    }
    if(alarm1_start_week_day & 0b1000000)
    {
        document.getElementById('sun1').checked=true;
    }

    //Times of alarm2
    alarm2_start_week_day = calendarWord[31];
    alarm2_start_hour =   calendarWord[32];
    alarm2_start_minute = calendarWord[33];
    alarm2_start_second = calendarWord[34];

    document.getElementById('start2').value = BCD2str(alarm2_start_hour) + ':' + BCD2str(alarm2_start_minute) + ':' + BCD2str(alarm2_start_second);

    alarm2_end_week_day = calendarWord[38];
    alarm2_end_hour =   calendarWord[39];
    alarm2_end_minute = calendarWord[40];
    alarm2_end_second = calendarWord[41];

    document.getElementById('end2').value = BCD2str(alarm2_end_hour) + ':' + BCD2str(alarm2_end_minute) + ':' + BCD2str(alarm2_end_second);
    
    //Days of alarm2
    if(alarm2_start_week_day & 0b0000001)
    {
        document.getElementById('mon2').checked=true;
    }
    if(alarm2_start_week_day & 0b0000010)
    {
        document.getElementById('tue2').checked=true;
    }
    if(alarm2_start_week_day & 0b0000100)
    {
        document.getElementById('wed2').checked=true;
    }
    if(alarm2_start_week_day & 0b0001000)
    {
        document.getElementById('thu2').checked=true;
    }
    if(alarm2_start_week_day & 0b0010000)
    {
        document.getElementById('fri2').checked=true;
    }
    if(alarm2_start_week_day & 0b0100000)
    {
        document.getElementById('sat2').checked=true;
    }
    if(alarm2_start_week_day & 0b1000000)
    {
        document.getElementById('sun2').checked=true;
    }

    /* Configs */
    console.log(">> Initializing config values")

    let sensorsWord = new Uint8Array(20);
    sensorsWord = await readSensors();

    maxTemp = ((sensorsWord[16]*255 + sensorsWord[15])/10).toFixed(1);
    document.getElementById("temp-max-input").value = maxTemp;
    minTemp = ((sensorsWord[18]*255 + sensorsWord[17])/10).toFixed(1);
    document.getElementById("temp-min-input").value = minTemp;

    maxHum = sensorsWord[13];
    document.getElementById("hum-max-input").value = maxHum;
    minHum = sensorsWord[14];
    document.getElementById("hum-min-input").value = minHum;

    machineId = generalWord[3];
    document.getElementById("machine-input").value = machineId;
    networkId = generalWord[2];
    document.getElementById("network-input").value = networkId;
    childsCounter=generalWord[4]
    document.getElementById("childs-input").value = childsCounter;

    measurementsPeriod = sensorsWord[19];
    document.getElementById("measurements-input").value = measurementsPeriod;

    AIWord = readAI();

    prevTreshold1 = AIWord[0];
    prevTreshold2 = AIWord[1];
    prevTresholdON = AIWord[2];
    prevImpactCoeff = AIWord[3];
    prevRandomCoeff = AIWord[4];
    quizzDemand = AIWord[5];


    /* AI */
    if( quizzDemand ){
        showModal('open-modal','modal-container');
    }


    /* Position */
    console.log(">> Updating map")
    readPosition();

    
}

