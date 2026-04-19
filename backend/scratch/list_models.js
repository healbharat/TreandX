const { GoogleGenerativeAI } = require("@google/generative-ai");

async function list() {
  const apiKey = "AIzaSyBoFM3B1Rx_vRO8stUhuceIumy22n2h2lY";
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2).substring(0, 1000));
  } catch (err) {
    console.error(err);
  }
}

list();
