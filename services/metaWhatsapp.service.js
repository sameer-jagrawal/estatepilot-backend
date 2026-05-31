const axios = require("axios");

const sendTextMessage = async ({
  phoneNumberId,
  accessToken,
  to,
  message,
}) => {
  try {
    console.log("META API FUNCTION HIT");

    console.log("META REQUEST DATA:", {
      phoneNumberId,  
      to,
      message,
      hasAccessToken: !!accessToken,
    });

    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("META SUCCESS:", response.data);

    return response.data;
  } catch (error) {
    console.log("META ERROR STATUS:", error.response?.status);
    console.log("META ERROR DATA:", error.response?.data);
    console.log("META ERROR MESSAGE:", error.message);

    throw new Error(
      error.response?.data?.error?.message ||
        "Meta WhatsApp API request failed"
    );
  }
};

module.exports = {
  sendTextMessage,
};