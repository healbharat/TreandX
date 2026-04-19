const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const genAI = new GoogleGenerativeAI("AIzaSyBoFM3B1Rx_vRO8stUhuceIumy22n2h2lY");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent("Hello, can you hear me?");
    console.log("SUCCESS:", result.response.text());
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

test();
