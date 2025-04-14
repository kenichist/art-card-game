/**
 * Translations utility for item and collector descriptions
 * This file contains hardcoded translations for item and collector information
 */

// Item type translations
export const itemTypeTranslations = {
  en: {
    illustration: 'Illustration Item',
    sculpture: 'Sculpture Item',
    product: 'Product Item',
    unknown: 'Unknown Item Type'
  },
  zh: {
    illustration: '插画物品',
    sculpture: '雕塑物品',
    product: '产品物品',
    unknown: '未知物品类型'
  }
};

// Item description translations
export const itemDescriptionTranslations = {
  en: {
    illustration: 'An illustration item depicting artistic elements with detailed craftsmanship. These items are highly valued by illustration collectors.',
    sculpture: 'A sculptural piece showcasing three-dimensional artistry. These items are particularly sought after by sculpture enthusiasts.',
    product: 'A manufactured product with practical applications. These items are especially valuable to product collectors.',
    unknown: 'A mysterious item with unknown origins.'
  },
  zh: {
    illustration: '一件展示艺术元素和精细工艺的插画物品。这些物品受到插画收藏家的高度重视。',
    sculpture: '一件展示三维艺术的雕塑作品。这些物品特别受到雕塑爱好者的追捧。',
    product: '一件具有实用功能的制造产品。这些物品对产品收藏家特别有价值。',
    unknown: '一件起源不明的神秘物品。'
  }
};

// Collector type translations
export const collectorTypeTranslations = {
  en: {
    illustration: 'Illustration Collector',
    sculpture: 'Sculpture Collector',
    product: 'Product Collector',
    unknown: 'Collector'
  },
  zh: {
    illustration: '插画收藏家',
    sculpture: '雕塑收藏家',
    product: '产品收藏家',
    unknown: '收藏家'
  }
};

// Collector description translations
export const collectorDescriptionTranslations = {
  en: {
    illustration: 'An enthusiast of illustrated works, particularly valuing artistic masterpieces. This collector specializes in acquiring and preserving illustrations of significant cultural or historical importance.',
    sculpture: 'A connoisseur of sculptural art forms, focusing on three-dimensional works. This collector values the physical presence and spatial relationships created by sculptural pieces.',
    product: 'A product collector with an eye for manufactured items of practical use. This collector appreciates innovative design and functionality in everyday objects.',
    unknown: 'A collector with varied interests across multiple domains.'
  },
  zh: {
    illustration: '插画作品爱好者，特别重视艺术杰作。这位收藏家专门收集和保存具有重要文化或历史价值的插画作品。',
    sculpture: '雕塑艺术形式的鉴赏家，专注于三维作品。这位收藏家重视雕塑作品所创造的物理存在感和空间关系。',
    product: '一位对实用制造品有敏锐眼光的产品收藏家。这位收藏家欣赏日常物品中的创新设计和功能性。',
    unknown: '一位对多个领域有广泛兴趣的收藏家。'
  }
};

/**
 * Get specific item or collector translations based on ID range and language
 * @param {number} id - Item or collector ID
 * @param {string} language - Language code ('en' or 'zh')
 * @param {string} type - Translation type ('itemType', 'itemDescription', 'collectorType', 'collectorDescription')
 * @returns {string} Translated text
 */
export const getTranslation = (id, language, type) => {
  // Default to English if language is not supported
  const lang = ['en', 'zh'].includes(language) ? language : 'en';
  
  // Get translation map based on type
  let translationMap;
  switch (type) {
    case 'itemType':
      translationMap = itemTypeTranslations;
      break;
    case 'itemDescription':
      translationMap = itemDescriptionTranslations;
      break;
    case 'collectorType':
      translationMap = collectorTypeTranslations;
      break;
    case 'collectorDescription':
      translationMap = collectorDescriptionTranslations;
      break;
    default:
      return '';
  }
  
  // Return appropriate translation based on ID range or filename
  if (type.startsWith('item')) {
    if (id >= 1 && id <= 24) {
      return translationMap[lang].illustration;
    } else if (id >= 25 && id <= 48) {
      return translationMap[lang].sculpture;
    } else if (id >= 49 && id <= 72) {
      return translationMap[lang].product;
    } else {
      return translationMap[lang].unknown;
    }
  }
  
  return '';
};