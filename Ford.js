// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.

/**************
 * Copyright (C) 2020 by Damian Schablowsky  <dschablowsky.dev@gmail.com>
 * Permission to use, copy, modify, and/or distribute this software for any purpose without fee is hereby granted.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER
 * IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
 * OF THIS SOFTWARE.
 * 
 * 
 * This is a widget for the iOS app Scriptable https://scriptable.app/ and is made by Damian Schablowsky (https://twitter.com/D_Schablowsky)
 * 
 * Fuel pump Icon made by Kiranshastry from www.flaticon.com
 * 
 * The widget is based on ffpass from https://github.com/d4v3y0rk - thanks a lot for the work!
 * Also thanks to marco79cgn (https://github.com/marco79cgn) and Tobias Battenberg (https://github.com/mountbatt) for your widgets, 
 * they helped me to build this one.
 * 
 * IMPORTANT: This widget is only working if your Ford car shows up in the FordPass app!
 */
 


/**************
Version 1.0
Changelog:
    v1.0:
        - Created first version of widget

    v1.0.1
        - Fixed small bug where the fuelLevel bar is not cut over 100%
        - Fixed bug where positions without sub locality would show null
        - Position value resizes now to 70% if address is too long. Testing this value, may need to decrease it further in future

    v1.0.2
        - Addes debug mode with increased output. Use this only if you have problems!!
    v1.1
        - Added more elements (windows big, doors small and big, odometer with distance p.a., tire pressure)
        - You can now choose the elements of your widget
        - Changes size of font (smaller), so that 6 elements can be displayed      

**************/


/************************
 * 
 * Change values to customize the widget
 * 
 ************************/


/**
 * 
 * Login data for account. It is only working with FordPass credentials and when your car has a FordPass modem!
 * Check your car configuration. It is not sufficient if your FordPass app shows some data (odometer or oil).
 * 
 */
const userData = {
    'fpUsername': '',
    'fpPassword': '',
    'fpVin': ''
}

/**
 * 
 * Change values for your language
 * 
 */
const errorMessages = {
    'invalidGrant': 'Fehlerhafte Login-Daten',
    'connectionErrorOrVin': 'Falsche VIN oder Verbindungsproblem',
    'unknownError': 'Unbekannter Fehler',
    'noData': 'Keine Daten',
    'noCredentials': 'Keine oder fehlerhafte Login-Daten',
    'noVin': 'VIN fehlt'
}

const UIValue = {
    closed: 'Geschlossen',
    open: 'Geöffnet',
    unknown: 'Unbekannt',
    greaterOneDay: 'Vor > 1 Tag',
    smallerOneMinute: 'Vor < 1 Minute',
    minute: 'Minute',
    hour: 'Stunde',
    perYear: 'p.a.',
    plural: 'n', // 's' in english
    precedingAdverb: 'Vor', // used in german language, for english let it empty
    subsequentAdverb: '' // used in english language ('ago'), for german let it empty
}


/**
 * 
 * Customize behavior of widget
 * 
 */
const refreshInterval = 5 // in minutes

const mapProvider = 'apple' // or 'google'

const useIndicators = true // indicators for fuel bar

const uniteOfLength = 'km' // or 'mi'

const dateLeasingStart = new Date('10/19/2020') // MM/DD/YYYY start of leasing contract

/**
 * Only use these if you have problems. Set them back to false once everything is working.
 * Otherwise the token and the pictures are newly fetched everytime the script is executed. 
 */
const clearKeychainOnNextRun = false // false or true

const clearFileManagerOnNextRun = false // false or true

const storeCredentialsInKeychain = false // or true

/**
 * 
 * Customize appearance of widget
 * 
 */
let textColor1 //header
let textColor2 //data
let backColor //background
let gasStation //image for gas station

if (Device.isUsingDarkAppearance()) {
    textColor1 = 'EDEDED' 
    textColor2 = 'EDEDED'
    backColor = '111111'
    gasStation = 'gas-station_dark.png'
}
else {
    textColor1 = '000000'
    textColor2 = '000000'
    backColor = 'FFFFFF'
    gasStation = 'gas-station_light.png'
}

const closedSymbol = '✓'
const openSymbol = '✗'

/*
 * Change titleFontSize to 9 and detailFontSizeMedium to 10 for smaller displays, e.g. iPhone SE 2
 */
const titleFontSize = 10
const detailFontSizeSmall = 11
const detailFontSizeMedium = 12
const detailFontSizeBig = 19

const barWidth = 80
const barHeight = 5

/**
 * -------------------------------
 *| Logo  [Element 1] [Element 4] |
 *|                               |
 *|[Fuel] [Element 2] [Element 5] |
 *|                               |
 *|       [Element 3] [Element 6] |
 * -------------------------------
 *
 * Height per element: 1 (H)eight (U)nit = 1 line
 *
 * Available elements:
 + - odometer: 'odometer' 1 HU
 * - odometer with expected distance per year: 'odometerLease' 2 HU
 * - oil status: 'oil' 1HU
 * - window status small (only text): 'windowsSmall' 1 HU
 * - window status big (shows every window): 'windowsBig' 2 HU
 * - door status small (only text): 'doorsSmall' 1 HU 
 * - door status big (shows every door): 'doorsBig' 1 HU 
 * - position: 'position' 2 HU
 * - tire pressure: 'tirePressure' 2 HU
 * - no element: 'none' 0 HU
 */

/*
 *
 * 1HU has 17 as offset, 2HU 2. Only tirePressure has a higher one since another font is used (monospaced)
 *
 */
const elementHeightOffset = {
    'odometer': 17,
    'odometerLease': 2,
    'oil': 17,
    'windowsSmall': 17,
    'windowsBig': 2,
    'doorsSmall': 17,
    'doorsBig': 2,
    'position': 2,
    'tirePressure': 4,
    'none': 17 
}

const elementHeader = {
    'fuelTank': 'Tank',
    'odometer': 'Kilometerstand',
    'odometerLease': 'Kilometerstand',
    'oil': 'Ölzustand',
    'windowsSmall': 'Fenster',
    'windowsBig': 'Fenster',
    'doorsSmall': 'Türen',
    'doorsBig': 'Türen',
    'position': 'Standort',
    'tirePressure': 'Luftdruck'
}


/*
* Set your elements here.
* 
* Warning: Use position only on element 3 or 6 since the height changes between 1 and 2 HU!!
*/
const arrangementElements = {
    'element1': 'odometerLease',
    'element2': 'doorsSmall',
    'element3': 'position',
    'element4': 'windowsSmall',
    'element5': 'oil',
    'element6': 'tirePressure',
}

/**
 *
 * Debug mode
 * Use it only if you have problems with the widget!
 *
 */
const debugMode = false

/************************
 * 
 * Main code of widget - make only changes if you know what you are doing!!
 * 
 ************************/

let lengthMultiplicator = uniteOfLength == 'km' ? 1 : 0.621371

let widget = await createWidget()
widget.setPadding(5, 5, 5, 5)

if (!config.runsInWidget) {
    await widget.presentMedium();
}

Script.setWidget(widget)
Script.complete()

function clearKeychain() {
    console.log('FP: Clear Keychain')
    if(Keychain.contains('fpToken')) { Keychain.remove('fpToken') }
    if(Keychain.contains('fpUsername')) { Keychain.remove('fpUsername') }
    if(Keychain.contains('fpPassword')) { Keychain.remove('fpPassword') }
    if(Keychain.contains('fpVin')) { Keychain.remove('fpVin') }   
}

function clearFileManager() {
    removeLocalData('fp_carData.json')
    removeLocalData('gas-station_light.png')
    removeLocalData('gas-station_dark.png')
    removeLocalData('ford-logo.png')
}

async function createWidget() {
    if (debugMode) {
        console.log('Debug:')
        console.log(`storeCredentialsInKeychain: ${storeCredentialsInKeychain.toString()}`)
        console.log(`clearKeychainOnNextRun: ${clearKeychainOnNextRun.toString()}`)
        console.log(`clearFileManagerOnNextRun: ${clearFileManagerOnNextRun.toString()}`)
    }
    if (clearKeychainOnNextRun) { clearKeychain() }
    if (clearFileManagerOnNextRun) { clearFileManager() }

    const list = new ListWidget()
    list.backgroundColor = new Color(backColor)

    let carData = await fetchCarData()

    let mainStack = list.addStack()
    mainStack.layoutVertically()
    mainStack.setPadding(0,5,0,5)

    let dataStack = mainStack.addStack()
    dataStack.layoutHorizontally()

    /*
    * First column
    */
    let column1 = dataStack.addStack()
    column1.layoutVertically()

    // Ford logo
    let row11 = column1.addStack()
    row11.centerAlignContent()
    let fordLogo = await getImage('ford-logo.png')
    let imageRow11 = row11.addImage(fordLogo)
    imageRow11.imageSize = new Size(75,27)

    column1.addSpacer(23)

    // Fuel tank header
    let row12 = column1.addStack()
    let textRow12 = row12.addText(elementHeader['fuelTank'])
    textRow12.font = Font.mediumSystemFont(titleFontSize)
    textRow12.textColor = new Color(textColor1)

    column1.addSpacer(3)

    // Fuel level bar
    let row13 = column1.addStack()
    row13.centerAlignContent()
    let barRow13 = row13.addImage(createProgressBar(carData.fuelLevel ? carData.fuelLevel : 50))
    barRow13.imageSize = new Size(barWidth,barHeight+3)

    column1.addSpacer(6)

    let row14 = column1.addStack()
    row14.layoutHorizontally()
    row14.setPadding(0,0,0,0)
    
    // Gas station image
    let row141 = row14.addStack()
    row141.setPadding(0,0,0,0)
    let fuelImage = await getImage(gasStation)
    let imageRow14 = row141.addImage(fuelImage)
    imageRow14.imageSize = new Size(11,11)

    row14.addSpacer(5)

    // Distance to empty
    let info = carData.distanceToEmpty ? `${Math.floor(carData.distanceToEmpty*lengthMultiplicator)}${uniteOfLength}` : errorMessages.noData
    let row142 = row14.addStack()
    let textRow14 = row142.addText(info)
    textRow14.font = Font.mediumSystemFont(detailFontSizeSmall)
    textRow14.textColor = new Color(textColor2)
    textRow14.lineLimit = 1


    dataStack.addSpacer()

    /*
    * Second column
    */
    let column2 = dataStack.addStack()
    column2.layoutVertically()

    // Element 1
    let row21 = column2.addStack()
    let row22 = column2.addStack()
    createElement(arrangementElements.element1, carData, row21, row22)

    column2.addSpacer(elementHeightOffset[arrangementElements.element1])

    // Element 2
    let row23 = column2.addStack()
    let row24 = column2.addStack()
    createElement(arrangementElements.element2, carData, row23, row24)

    column2.addSpacer(elementHeightOffset[arrangementElements.element2])

    // Element 3
    let row25 = column2.addStack()
    let row26 = column2.addStack()
    createElement(arrangementElements.element3, carData, row25, row26)
    
    column2.addSpacer()
    
    dataStack.addSpacer()

    /*
    * Third column
    */
    let column3 = dataStack.addStack()
    column3.layoutVertically()

    // Element 4
    let row31 = column3.addStack()
    let row32 = column3.addStack()
    createElement(arrangementElements.element4, carData, row31, row32)

    column3.addSpacer(elementHeightOffset[arrangementElements.element4])

    // Element 5
    let row33 = column3.addStack()
    let row34 = column3.addStack()
    createElement(arrangementElements.element5, carData, row33, row34)
    
    column3.addSpacer(elementHeightOffset[arrangementElements.element5])
    
    // Element 6
    let row35 = column3.addStack()
    let row36 = column3.addStack()
    createElement(arrangementElements.element6, carData, row35, row36)
    
    column3.addSpacer()
    
    dataStack.addSpacer()

    /*
    * Refresh and error
    */
    let infoStack = mainStack.addStack()
    infoStack.layoutHorizontally()

    let refreshTime = UIValue.unknown
    if (carData.fetchTime) { refreshTime = calculateTimeDifference(carData.fetchTime) }
    let lastRefresh = infoStack.addText(refreshTime)
    lastRefresh.font = Font.mediumSystemFont(10)
    lastRefresh.textColor = Color.lightGray()

    infoStack.addSpacer(10)
    info = carData.error ? carData.error : ''
    let errorText = infoStack.addText(info)
    errorText.font = Font.mediumSystemFont(10)
    errorText.textColor = Color.red()

    return list
}

//from local store if last fetch is < x minutes, otherwise fetch from server
async function fetchCarData() {
    //fetch local data
    if (isLocalDataFreshEnough()) {
        return readLocalData()
    }

    //fetch data from server
    console.log('FP: Fetch data from server')    
    let rawData = await fetchRawData()
    let carData = new Object()
    if (
        rawData == errorMessages.invalidGrant || 
        rawData == errorMessages.connectionErrorOrVin || 
        rawData == errorMessages.unknownError ||
        rawData == errorMessages.noVin ||
        rawData == errorMessages.noCredentials
        ) {
        console.log('Fehler: ' + rawData)
        let localData = readLocalData()
        if (debugMode) {
            console.log('Debug: Try to read local data after error')
            console.log(localData)
        }
        if (localData) { carData = localData }
        carData.error = rawData
        return carData
    }

    let vehicleStatus = rawData.vehiclestatus

    carData.fetchTime = Date.now()

    //odometer
    carData.odometer = vehicleStatus.odometer.value

    //oil life
    carData.oilLife = vehicleStatus.oil.oilLifeActual

    //distance to empty
    carData.distanceToEmpty = vehicleStatus.fuel.distanceToEmpty

    //fuel level
    carData.fuelLevel = Math.floor(vehicleStatus.fuel.fuelLevel)

    //position of car
    carData.position = await getPosition(vehicleStatus)
    carData.latitude = parseFloat(vehicleStatus.gps.latitude)
    carData.longitude = parseFloat(vehicleStatus.gps.longitude)

    // true means, that window is open
    let windows = vehicleStatus.windowPosition
    carData.statusWindows = {
        'leftFront': windows.driverWindowPosition.value == 'Fully_Closed' ? false : true,
        'rightFront': windows.passWindowPosition.value == 'Fully_Closed' ? false : true,
        'leftRear': windows.rearDriverWindowPos.value == 'Fully_Closed' ? false : true,
        'rightRear': windows.rearPassWindowPos.value == 'Fully_Closed' ? false : true
    }
    
    //true means, that door is open
    let doors = vehicleStatus.doorStatus
    carData.statusDoors = {
        'leftFront': doors.driverDoor.value == 'Closed' ? false : true,
        'rightFront': doors.passengerDoor.value == 'Closed' ? false : true,
        'leftRear': doors.leftRearDoor.value == 'Closed' ? false : true,
        'rightRear': doors.rightRearDoor.value == 'Closed' ? false : true,
    }
    
    //tire pressure
    let tpms = vehicleStatus.TPMS
    carData.tirePressure = {
        'leftFront': pressureToFixed(tpms.leftFrontTirePressure.value, 1),
        'rightFront': pressureToFixed(tpms.rightFrontTirePressure.value, 1),
        'leftRear': pressureToFixed(tpms.outerLeftRearTirePressure.value, 1),
        'rightRear': pressureToFixed(tpms.outerRightRearTirePressure.value, 1)
    }

    //save data to local store
    saveDataToLocal(carData)

    return carData
}

async function fetchToken() {
    let username = checkUserData('fpUsername')
    if (!username) { return errorMessages.noCredentials }
    let password = checkUserData('fpPassword')
    if (!password) { return errorMessages.noCredentials }

    let req = new Request("https://fcis.ice.ibmcloud.com/v1.0/endpoint/default/token")
    req.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
        'Accept-Language': 'en-us',
        'User-Agent': 'fordpass-na/353 CFNetwork/1121.2.2 Darwin/19.3.0',
        'Accept-Encoding': 'gzip, deflate, br',
    }
    req.method = "POST"
    req.body = `client_id=9fb503e0-715b-47e8-adfd-ad4b7770f73b&grant_type=password&username=${username}&password=${password}`

    try {
        let token = await req.loadJSON()
        if (token.error && token.error == 'invalid_grant') { 
            if (debugMode) {
                console.log('Debug: Error while receiving auth data')
                console.log(token)
            }
            return errorMessages.invalidGrant
        }
        if (debugMode) {
            console.log('Debug: Received auth data from ford server')
            console.log(token)
        }
        Keychain.set('fpToken', token.access_token)
      
    } catch (e) {
        console.log(`Error: ${e}`)
        if (e.error && e.error == 'invalid_grant') {
            return errorMessages.invalidGrant
        }
        throw e
    }
}

async function fetchRawData() {
    if (!Keychain.contains('fpToken')) {
        //Code is executed on first run
        let result = await fetchToken()
        if (result && result == errorMessages.invalidGrant) { return result }
        if (result && result == errorMessages.noCredentials) { return result }
    }
    let token = Keychain.get('fpToken')
    let vin = checkUserData('fpVin')
    if (!vin) { return errorMessages.noVin }
    let req = new Request(`https://usapi.cv.ford.com/api/vehicles/v4/${vin}/status`)
    req.headers = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Language': 'en-us',
        'User-Agent': 'fordpass-na/353 CFNetwork/1121.2.2 Darwin/19.3.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Application-Id': '71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592',
        'auth-token': `${token}`
    }
    req.method = "GET"
    try {
        let data = await req.loadString()
        if (debugMode) {
            console.log('Debug: Received vehicle data from ford server')
            console.log(data)
        }
        if (data == 'Access Denied') {
            console.log('FP: Token expired. Fetching new token and fetch raw data again')
            let result = await fetchToken()
            if (result && result == errorMessages.invalidGrant) { return result }
            data = await fetchRawData()
        }
        else {
            data = JSON.parse(data)
        }
        if (data.status && data.status != 200) {
            if (debugMode) {
                console.log('Debug: Error while receiving vehicle data')
                console.log(data)
            }
            return errorMessages.connectionErrorOrVin
        }
        return data
    } catch (e) {
        console.log(`Error: ${e}`)
        return errorMessages.unknownError
    }
}

async function getImage(image) {
    let fm = FileManager.local()
    let dir = fm.documentsDirectory()
    let path = fm.joinPath(dir, image)
    if (fm.fileExists(path)) {
        return fm.readImage(path)
    } else {
        // download once
        let imageUrl
        switch (image) {
            case 'ford-logo.png':
                imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/500px-Ford_logo_flat.svg.png"
                break
            case 'gas-station_light.png':
                imageUrl = "https://i.imgur.com/gfGcVmg.png"
                break
            case 'gas-station_dark.png':
                imageUrl = "https://i.imgur.com/hgYWYC0.png"
                break
            default:
                console.log(`FP: Sorry, couldn't find ${image}.`);
        }
        let iconImage = await loadImage(imageUrl)
        fm.writeImage(path, iconImage)
        return iconImage
    }
}

async function loadImage(imgUrl) {
    const req = new Request(imgUrl)
    return await req.loadImage()
}

async function getPosition(data) {
    let loc = await Location.reverseGeocode(parseFloat(data.gps.latitude), parseFloat(data.gps.longitude))
    return `${loc[0].postalAddress.street}, ${loc[0].postalAddress.city}`
}

function saveDataToLocal(data) {
    console.log('FM: save newly fetched data to local storage')
    let fm = FileManager.local()
    let dir = fm.documentsDirectory()
    let path = fm.joinPath(dir, 'fp_carData.json')
    if (fm.fileExists(path)) { fm.remove(path) } //clean old data
    fm.writeString(path, JSON.stringify(data))
}

function readLocalData() {
    console.log('FM: read local data')
    let fm = FileManager.local()
    let dir = fm.documentsDirectory()
    let path = fm.joinPath(dir, 'fp_carData.json')
    if (fm.fileExists(path)) {
        let localData = fm.readString(path)
        return JSON.parse(localData)
    }
    return null
}

function removeLocalData(data) {
    let fm = FileManager.local()
    let dir = fm.documentsDirectory()
    let path = fm.joinPath(dir, data)
    if (fm.fileExists(path)) { fm.remove(path) }
}

function isLocalDataFreshEnough() {
    let localData = readLocalData()
    if (localData && Date.now() - localData.fetchTime < 60000*refreshInterval) { return true }
    else { return false }
}

function calculateTimeDifference(oldTime) {
    let newTime = Date.now()
    let diffMs = newTime - oldTime
    if (Math.floor(diffMs / 86400000) >= 1) {
        return UIValue.greaterOneDay
    }
    if (Math.floor((diffMs % 86400000) / 3600000) >= 1) {
        let diff = Math.floor((diffMs % 86400000) / 3600000)
        return `${UIValue.precedingAdverb} ${diff} ${UIValue.hour}${diff == 1 ? '' : UIValue.plural} ${UIValue.subsequentAdverb}`
    }
    if (Math.round(((diffMs % 86400000) % 3600000) / 60000) >= 1) {
        let diff = Math.round(((diffMs % 86400000) % 3600000) / 60000)
        return `${UIValue.precedingAdverb} ${diff} ${UIValue.minute}${diff == 1 ? '' : UIValue.plural} ${UIValue.subsequentAdverb}`
    }
    return UIValue.smallerOneMinute
}

function calculateDurationLeasing() {
    let duration = dateLeasingStart ? ((Date.now() - dateLeasingStart.getTime()) / (1000 * 60 * 60 * 24)) : null
    console.log((Date.now() - dateLeasingStart.getTime()) / (1000 * 60 * 60 * 24))
    return duration  
}

function pressureToFixed(pressure, digits) {
    let fixedPressure = pressure ? (pressure / 100).toFixed(digits) : -1
    return fixedPressure
}

function createProgressBar(percent){
    let fuelLevel = percent > 100 ? 100 : percent
    const bar = new DrawContext()
    bar.size = new Size(barWidth, barHeight+3)
    bar.opaque = false
    bar.respectScreenScale = true
    // Background
    const path = new Path()
    path.addRoundedRect(new Rect(0, 0, barWidth, barHeight), 3, 2)
    bar.addPath(path)
    bar.setFillColor(Color.lightGray())
    bar.fillPath()
    // Fuel
    const fuel = new Path()
    fuel.addRoundedRect(new Rect(0, 0, barWidth*fuelLevel/100, barHeight), 3, 2)
    bar.addPath(fuel)
    bar.setFillColor(new Color("2f78dd"))
    bar.fillPath()
    if (useIndicators) {
        const fuel25Indicator = new Path()
        fuel25Indicator.addRoundedRect(new Rect(barWidth*0.25,1,2,barHeight-2), 3, 2)
        bar.addPath(fuel25Indicator)
        bar.setFillColor(Color.black())
        bar.fillPath()
        const fuel50Indicator = new Path()
        fuel50Indicator.addRoundedRect(new Rect(barWidth*0.5,1,2,barHeight-2), 3, 2)
        bar.addPath(fuel50Indicator)
        bar.setFillColor(Color.black())
        bar.fillPath()
        const fuel75Indicator = new Path()
        fuel75Indicator.addRoundedRect(new Rect(barWidth*0.75,1,2,barHeight-2), 3, 2)
        bar.addPath(fuel75Indicator)
        bar.setFillColor(Color.black())
        bar.fillPath()
    }
    return bar.getImage()
}

function checkUserData(cred) {
    if (storeCredentialsInKeychain) {
        if(userData[cred] != '') { Keychain.set(cred, userData[cred]) }
        if(Keychain.contains(cred)) { return Keychain.get(cred) }
    }
    else if (!storeCredentialsInKeychain && userData[cred] != '') {
        return userData[cred]
    }
    return null //no stored credentials
}

function createElement(element, carData, headerField, dataField) {
    switch (element) {
        case 'odometer':
            elementOdometer(carData, headerField, dataField, element)
            break
        case 'odometerLease':
            elementOdometerLease(carData, headerField, dataField, element)
            break
        case 'windowsSmall':
            elementWindowsSmall(carData, headerField, dataField, element)
            break
        case 'windowsBig':
            elementWindowsBig(carData, headerField, dataField, element)      
            break
        case 'doorsSmall':
            elementDoorsSmall(carData, headerField, dataField, element)
            break
        case 'doorsBig':
            elementDoorsBig(carData, headerField, dataField, element)
            break 
        case 'oil':
            elementOil(carData, headerField, dataField, element)
            break
        case 'position':
            elementPosition(carData, headerField, dataField, element)
            break
        case 'tirePressure':
            elementTirePressure(carData, headerField, dataField, element)
            break
        case 'none':
            console.log('No Element')
            break
        default:
        console.log('No Element')
    }
}

function createTitleHF(headerField, element) {
    let textHF = headerField.addText(elementHeader[element])
    textHF.font = Font.mediumSystemFont(titleFontSize)
    textHF.textColor = new Color(textColor1)
}

function elementOdometer(carData, headerField, dataField, element) {
    createTitleHF(headerField, element)
    
    let value = carData.odometer ? `${Math.floor(carData.odometer*lengthMultiplicator)}${uniteOfLength}` : errorMessages.noData
    let textDF = dataField.addText(value)
    textDF.font = Font.mediumSystemFont(detailFontSizeMedium)
    textDF.textColor = new Color(textColor2)
}

function elementOdometerLease(carData, headerField, dataField, element) {
    createTitleHF(headerField, element)
    
    let distance = carData.odometer ? Math.floor(carData.odometer*lengthMultiplicator) : null
    console.log(distance)
    let leaseDuration = calculateDurationLeasing()
    console.log(leaseDuration)
    let distancePerYear = (distance && leaseDuration) ? Math.floor(distance / leaseDuration * 365) : null
    console.log(distancePerYear)
        
    let value = distancePerYear ? `${distance}${uniteOfLength}\n${distancePerYear}${uniteOfLength} ${UIValue.perYear}` : errorMessages.noData
    let textDF = dataField.addText(value)
    textDF.font = Font.mediumSystemFont(detailFontSizeMedium)
    textDF.textColor = new Color(textColor2)
    
    let kmPerYear = carData
}

function elementOil(carData, headerField, dataField, element) {
    createTitleHF(headerField, element)
    
    let value = carData.oilLife ? `${carData.oilLife}%` : errorMessages.noData
    let textDF = dataField.addText(value)
    textDF.font = Font.mediumSystemFont(detailFontSizeMedium)
    textDF.textColor = new Color(textColor2)
}

function elementPosition(carData, headerField, dataField, element) {
    createTitleHF(headerField, element)
    
    let value = carData.position ? `${carData.position}` : errorMessages.noData
    let textDF = dataField.addText(value)
    textDF.font = Font.mediumSystemFont(detailFontSizeMedium)
    textDF.textColor = new Color(textColor2)
    textDF.lineLimit = 2
    textDF.minimumScaleFactor = 0.7
    if (mapProvider == 'google') {
        textDF.url = `https://www.google.com/maps/search/?api=1&query=${carData.latitude},${carData.longitude}`
    }
    else {
        textDF.url = `http://maps.apple.com/?q=Mein+Auto&ll=${carData.latitude},${carData.longitude}`
    }
}

function elementWindowsSmall(carData, headerField, dataField, element) {
    createTitleHF(headerField, element)
    
    let value = errorMessages.noData
    let countOpenWindows
    if (carData.statusWindows) {
        countOpenWindows = Object.values(carData.statusWindows).filter(window => window === true).length
        value = countOpenWindows == 0 ? UIValue.closed : `${countOpenWindows} ${UIValue.open}`
    }
    let textDF = dataField.addText(value)
    textDF.font = Font.mediumSystemFont(detailFontSizeMedium)
    textDF.textColor = new Color(textColor2)
    textDF.lineLimit = 1
}

function elementWindowsBig(carData, headerField, dataField, element) {
    createTitleHF(headerField, element)
    
    let value = `${carData.statusWindows['leftFront'] ? openSymbol : closedSymbol}|${carData.statusWindows['rightFront'] ? openSymbol : closedSymbol}\n${carData.statusWindows['leftRear'] ? openSymbol : closedSymbol}|${carData.statusWindows['rightRear'] ? openSymbol : closedSymbol}`
    let textDF = dataField.addText(value)
    textDF.font = Font.mediumSystemFont(detailFontSizeMedium)
    textDF.textColor = new Color(textColor2)
    textDF.lineLimit = 2
}

function elementDoorsSmall(carData, headerField, dataField, element) {
    createTitleHF(headerField, element)
        
    let value = errorMessages.noData
    let countOpenDoors
    if (carData.statusDoors) {
        countOpenDoors = Object.values(carData.statusDoors).filter(door => door === true).length
        value = countOpenDoors == 0 ? UIValue.closed : `${countOpenDoors} ${UIValue.open}`
    }
    let textDF = dataField.addText(value)
    textDF.font = Font.mediumSystemFont(detailFontSizeMedium)
    textDF.textColor = new Color(textColor2)
    textDF.lineLimit = 1
}

function elementDoorsBig(carData, headerField, dataField, element) {
    createTitleHF(headerField, element)
    
    let value = `${carData.statusDoors['leftFront'] ? openSymbol : closedSymbol}|${carData.statusDoors['rightFront'] ? openSymbol : closedSymbol}\n${carData.statusDoors['leftRear'] ? openSymbol : closedSymbol}|${carData.statusDoors['rightRear'] ? openSymbol : closedSymbol}`
    let textDF = dataField.addText(value)
    textDF.font = Font.mediumSystemFont(detailFontSizeMedium)
    textDF.textColor = new Color(textColor2)
    textDF.lineLimit = 2
}

function elementTirePressure(carData, headerField, dataField, element) {
    createTitleHF(headerField, element)
    
    let value = `${carData.tirePressure['leftFront']}|${carData.tirePressure['rightFront']}\n${carData.tirePressure['leftRear']}|${carData.tirePressure['rightRear']}`
    let textDF = dataField.addText(value)
    textDF.font = new Font('Menlo-Regular', detailFontSizeMedium)
    textDF.textColor = new Color(textColor2)
    textDF.lineLimit = 2
}