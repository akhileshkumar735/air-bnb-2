const axios = require("axios");

/**
 * Translates text into the target language.
 * Uses official Google Translation API, LibreTranslate API, or a free Google Translate client fallback.
 * 
 * @param {string} text - The input text to translate.
 * @param {string} targetLang - The target ISO language code (e.g., 'hi', 'fr', 'es').
 * @returns {Promise<string>} The translated text.
 */
async function translateText(text, targetLang) {
  if (!text || text.trim() === "") return "";
  
  const cleanLang = targetLang.toLowerCase().trim();
  if (cleanLang === "en") return text;
  
  // 1. Official Google Translation API
  if (process.env.GOOGLE_TRANSLATION_API_KEY) {
    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATION_API_KEY}`;
      const response = await axios.post(url, {
        q: text,
        target: cleanLang,
        format: "text"
      });
      if (response.data?.data?.translations?.[0]?.translatedText) {
        return response.data.data.translations[0].translatedText;
      }
    } catch (err) {
      console.warn("Google Cloud Translate API failed, attempting other options:", err.message);
    }
  }

  // 2. LibreTranslate API
  if (process.env.LIBRETRANSLATE_API_URL) {
    try {
      const url = `${process.env.LIBRETRANSLATE_API_URL.replace(/\/$/, "")}/translate`;
      const response = await axios.post(url, {
        q: text,
        source: "en",
        target: cleanLang,
        format: "text",
        api_key: process.env.LIBRETRANSLATE_API_KEY || ""
      });
      if (response.data?.translatedText) {
        return response.data.translatedText;
      }
    } catch (err) {
      console.warn("LibreTranslate API failed, attempting fallback:", err.message);
    }
  }

  // 3. Fallback: Free Google Translate API (gtx client)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${cleanLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await axios.get(url);
    if (response.data && response.data[0]) {
      // The response structure: [[[translated_segment, source_segment, ...], ...]]
      const translatedText = response.data[0].map(item => item[0]).join("");
      return translatedText;
    }
  } catch (err) {
    console.error("Free Google Translate API fallback failed:", err.message);
  }

  // Default fallback if all translation methods fail
  return text;
}

module.exports = { translateText };
