const fetch = require('node-fetch');
const dotenv = require('dotenv');
const {IncomingWebhook} = require('@slack/webhook');
const renderBellSlackMessage = require('../utils/renderBellSlackMessage');

dotenv.config();

const url = process.env.BELL_WEBHOOK_URL;
const webhook = new IncomingWebhook(url);

const killeenURL = 'https://outlook.office365.com/owa/calendar/BellCountyTechnologyServices1@bellcountytx.onmicrosoft.com/bookings/service.svc/GetStaffBookability';
const beltonURL = 'https://outlook.office365.com/owa/calendar/BellCountyTechnologyServices3@bellcountytx.onmicrosoft.com/bookings/service.svc/GetStaffBookability';
const killeenScheduleURL = 'https://outlook.office365.com/owa/calendar/BellCountyTechnologyServices1@bellcountytx.onmicrosoft.com/bookings/';
const beltonScheduleURL = 'https://outlook.office365.com/owa/calendar/BellCountyTechnologyServices3@bellcountytx.onmicrosoft.com/bookings/';

const killeenOptions = {
  'headers': {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json; charset=UTF-8',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'cookie': 'ClientId=BE2D9ACA38F24040B4F9F9A3A37B3159; OIDC=1; OutlookSession=890eac6c2e6746a0a8b8a8ec32d7f437',
  },
  'referrerPolicy': 'no-referrer',
  'body': '{"StaffList":["0K2vfoBvR0Gxqhjo3CzMog=="],"Start":"2021-03-07T00:00:00","End":"2021-05-02T00:00:00","TimeZone":"America/Chicago","ServiceId":"06oo6bJVYUmbCVQMl9fGmA2"}',
  'method': 'POST',
  'mode': 'cors',
};

const beltonOptions = {
  'headers': {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json; charset=UTF-8',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'cookie': 'ClientId=BE2D9ACA38F24040B4F9F9A3A37B3159; OIDC=1; OutlookSession=62f718dc95d94dfba2817aabd4cdb90f',
  },
  'referrerPolicy': 'no-referrer',
  'body': '{"StaffList":["rZKlNcMJ60u2fhfMvudNCg=="],"Start":"2021-02-28T00:00:00","End":"2021-04-02T00:00:00","TimeZone":"America/Chicago","ServiceId":"W-169pjrAkyQl0ElzvRl0A2"}',
  'method': 'POST',
  'mode': 'cors',
};

// NOTE: Temple has paused vaccinations
let lastBookedKilleen = 0; let lastBookedBelton = 0;
const checkBellCounty = async () => {
  try {
    const now = new Date().getTime();
    console.log('Checking Bell County for vaccines...');
    const killeenRes = await fetch(killeenURL, killeenOptions);
    const beltonRes = await fetch(beltonURL, beltonOptions);

    const killeenData = await killeenRes.json();
    const beltonData = await beltonRes.json();

    let killeenBookableItems = [];
    let beltonBookableItems = [];

    try {
      killeenBookableItems = killeenData.StaffBookabilities[0].BookableItems;
    } catch (e) {
      console.error(e);
    }
    try {
      beltonBookableItems = beltonData.StaffBookabilities[0].BookableItems;
    } catch (e) {
      console.error(e);
    }

    const fiveMins = 1000 * 60 * 5;

    if (killeenBookableItems.length > 0 && now > (lastBookedKilleen + fiveMins) && killeenBookableItems[0].Id !== '_lK5UnnqAEeKZ0MHIHI1kg2') {
      lastBookedKilleen = now;
      const slackMessage = renderBellSlackMessage(killeenScheduleURL, 'Killeen');
      await webhook.send(slackMessage);
    }
    if (beltonBookableItems.length > 0 && now > (lastBookedBelton + fiveMins)) {
      lastBookedBelton = now;
      const slackMessage = renderBellSlackMessage(beltonScheduleURL, 'Belton');
      await webhook.send(slackMessage);
    }
  } catch (e) {
    console.error(e);
  }
};

module.exports = checkBellCounty;
