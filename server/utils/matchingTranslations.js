/**
 * Translations utility for matching attributes
 * This file contains translations for all matching attributes used in the matching service
 */

// Map of English attributes to their translations
// Format: { "English attribute": { "en": "English attribute", "zh": "Chinese attribute" } }
const attributeTranslations = {
  // Item 1 (Illustration Item) matches
  "Like oil paintings": {
    en: "Like oil paintings",
    zh: "喜欢油画"
  },
  "Similar color palette": {
    en: "Similar color palette",
    zh: "相似的色彩搭配"
  },
  "Both feature female subjects": {
    en: "Both feature female subjects",
    zh: "都展示女性主题"
  },
  "Both demonstrate similar composition": {
    en: "Both demonstrate similar composition",
    zh: "都展示相似的构图"
  },
  "Created in the same period": {
    en: "Created in the same period",
    zh: "创作于同一时期"
  },

  // Item 2 (Illustration Item) matches
  "Similar artistic movement": {
    en: "Similar artistic movement",
    zh: "相似的艺术流派"
  },
  "Both depict natural scenery": {
    en: "Both depict natural scenery",
    zh: "都描绘自然风景"
  },
  "Both symbolize freedom": {
    en: "Both symbolize freedom",
    zh: "都象征自由"
  },
  "Both highly valued in market": {
    en: "Both highly valued in market",
    zh: "市场价值都很高"
  },

  // Item 3 (Illustration Item) matches
  "Both demonstrate impressionist style": {
    en: "Both demonstrate impressionist style",
    zh: "都展示印象派风格"
  },
  "Similar emotional tone": {
    en: "Similar emotional tone",
    zh: "相似的情感基调"
  },
  "Same cultural origin": {
    en: "Same cultural origin",
    zh: "相同的文化起源"
  },

  // Item 25 (Sculpture Item) matches
  "Both feature marble material": {
    en: "Both feature marble material",
    zh: "都使用大理石材质"
  },
  "Classical style elements": {
    en: "Classical style elements",
    zh: "古典风格元素"
  },
  "Similar historical significance": {
    en: "Similar historical significance",
    zh: "相似的历史意义"
  },

  // Item 49 (Product Item) matches
  "Similar functional design": {
    en: "Similar functional design",
    zh: "相似的功能设计"
  },
  "Both utilize modern materials": {
    en: "Both utilize modern materials",
    zh: "都使用现代材料"
  },
  "Contemporary aesthetic": {
    en: "Contemporary aesthetic",
    zh: "当代美学"
  }

  // Add more translations as needed
};

/**
 * Translate a single attribute to the specified language
 * @param {string} attribute - The attribute in English
 * @param {string} language - The target language code ('en' or 'zh')
 * @returns {string} Translated attribute
 */
const translateAttribute = (attribute, language) => {
  if (!attribute) return '';
  
  // Default to English
  const lang = language === 'zh' ? 'zh' : 'en';
  
  // Return translation if available, otherwise return original attribute
  return attributeTranslations[attribute]?.[lang] || attribute;
};

/**
 * Translate an array of attributes to the specified language
 * @param {Array<string>} attributes - Array of attributes in English
 * @param {string} language - The target language code ('en' or 'zh')
 * @returns {Array<string>} Array of translated attributes
 */
const translateAttributes = (attributes, language) => {
  if (!Array.isArray(attributes)) return [];
  return attributes.map(attr => translateAttribute(attr, language));
};

module.exports = {
  translateAttribute,
  translateAttributes
};