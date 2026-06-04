const { translateText } = require("../utils/translator");

/**
 * Translates input text into the target language.
 * Route: POST /api/translate
 */
module.exports.translate = async (req, res) => {
  const { text, target } = req.body;
  
  if (!text) {
    return res.status(400).json({ success: false, message: "Missing required parameter: 'text'" });
  }
  if (!target) {
    return res.status(400).json({ success: false, message: "Missing required parameter: 'target'" });
  }

  try {
    const translatedText = await translateText(text, target);
    res.status(200).json({ success: true, translatedText });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
