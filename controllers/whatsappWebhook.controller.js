const verifyWebhook = async (
    req,
    res
  ) => {
    try {
      const mode =
        req.query["hub.mode"];
  
      const token =
        req.query["hub.verify_token"];
  
      const challenge =
        req.query["hub.challenge"];
  
      if (
        mode === "subscribe" &&
        token ===
          process.env
            .WHATSAPP_VERIFY_TOKEN
      ) {
        console.log(
          "WhatsApp webhook verified"
        );
  
        return res.status(200).send(
          challenge
        );
      }
  
      return res
        .status(403)
        .send("Verification failed");
    } catch (error) {
      console.error(error);
  
      return res
        .status(500)
        .send("Server Error");
    }
  };
  
  module.exports = {
    verifyWebhook,
  };