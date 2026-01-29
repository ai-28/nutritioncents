import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Enhanced extraction with image support
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { input, inputType, imageUrl, imageBase64 } = body;

    if (!input && !imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Input, imageUrl, or imageBase64 is required' },
        { status: 400 }
      );
    }

    let extractedItems = [];

    // Check if we're extracting barcode from image
    const isBarcodeExtraction = inputType === 'image' &&
      (imageUrl || imageBase64) &&
      input &&
      input.toLowerCase().includes('barcode');

    let extractedBarcode = null;
    if (isBarcodeExtraction) {
      // Extract barcode number from image
      extractedBarcode = await extractBarcodeFromImage(imageUrl || imageBase64);
      if (extractedBarcode) {
        // Lookup nutrition info using the extracted barcode
        extractedItems = await extractFromBarcode(extractedBarcode);
      } else {
        return NextResponse.json({
          items: [],
          allergenAlerts: [],
          error: 'Could not detect barcode in image. Please try again or enter manually.',
        });
      }
    } else if (inputType === 'image' && (imageUrl || imageBase64)) {
      // Image recognition for nutrition
      extractedItems = await extractFromImage(imageUrl || imageBase64);
    } else if (inputType === 'barcode' && input) {
      // Barcode lookup (placeholder - integrate with food database API)
      extractedItems = await extractFromBarcode(input);
    } else if (input) {
      // Text/Voice extraction
      extractedItems = await extractFromText(input, session.user.id);
    }

    // Check for allergens
    const healthModule = await import('@/lib/db/health');
    const allergenAlerts = await healthModule.checkMealForAllergens(session.user.id, extractedItems);

    return NextResponse.json({
      items: extractedItems,
      allergenAlerts,
      ...(extractedBarcode && { extractedBarcode }),
    });
  } catch (error) {
    console.error('Extract nutrition error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract nutrition' },
      { status: 500 }
    );
  }
}

// Extract from text using LLM
async function extractFromText(text, userId) {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (openaiApiKey) {
    return await extractWithOpenAI(text);
  } else {
    // Fallback: Simple pattern matching (basic implementation)
    return extractWithPatternMatching(text);
  }
}

async function extractWithOpenAI(text) {
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `Extract nutrition information from this meal description: "${text}". 
        Return a JSON object with an "items" array. Each item in the array should have: food_name, quantity, unit, calories, protein (grams), carbs (grams), fats (grams).
        Be generous with estimates. Return only valid JSON object with this structure: {"items": [{"food_name": "...", "quantity": 1, "unit": "cup", "calories": 200, "protein": 10, "carbs": 30, "fats": 5}]}`
      }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = JSON.parse(response.choices[0].message.content);
    console.log('OpenAI extraction content:', content);
    // Handle both {items: [...]} and direct array responses
    if (Array.isArray(content)) {
      return content;
    } else if (Array.isArray(content.items)) {
      return content.items;
    } else if (content.food_name) {
      // Single item wrapped in object
      return [content];
    } else {
      console.warn('Unexpected response format:', content);
      return [];
    }
  } catch (error) {
    console.error('OpenAI extraction error:', error);
    return extractWithPatternMatching(text);
  }
}


// Extract from image using LLM vision
async function extractFromImage(imageUrlOrBase64) {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (openaiApiKey) {
    return await extractImageWithOpenAI(imageUrlOrBase64);
  } else {
    return [];
  }
}

// Extract barcode number from image
async function extractBarcodeFromImage(imageUrlOrBase64) {
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const imageContent = imageUrlOrBase64.startsWith('data:')
      ? { type: "image_url", image_url: { url: imageUrlOrBase64 } }
      : { type: "image_url", image_url: { url: imageUrlOrBase64 } };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Look at this image and extract the barcode number. A barcode is typically a series of vertical lines with numbers below them. Return ONLY the barcode number as a string (digits only, no spaces or dashes). If no barcode is visible, return an empty string. Example response: \"1234567890123\""
          },
          imageContent
        ]
      }],
      max_tokens: 50,
    });

    const barcodeText = response.choices[0].message.content.trim();
    // Extract only digits
    const barcode = barcodeText.match(/\d+/)?.[0] || '';

    if (barcode && barcode.length >= 8) {
      return barcode;
    }

    return null;
  } catch (error) {
    console.error('Barcode extraction error:', error);
    return null;
  }
}

async function extractImageWithOpenAI(imageUrlOrBase64) {
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const imageContent = imageUrlOrBase64.startsWith('data:')
      ? { type: "image_url", image_url: { url: imageUrlOrBase64 } }
      : { type: "image_url", image_url: { url: imageUrlOrBase64 } };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this food image and extract all food items with estimated quantities and nutrition information. Return a JSON object with an 'items' array. Each item should have: food_name, quantity, unit, calories, protein (grams), carbs (grams), fats (grams). Be specific about portions. Return only valid JSON object with this structure: {\"items\": [{\"food_name\": \"...\", \"quantity\": 1, \"unit\": \"cup\", \"calories\": 200, \"protein\": 10, \"carbs\": 30, \"fats\": 5}]}"
          },
          imageContent
        ]
      }],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const content = JSON.parse(response.choices[0].message.content);
    // Handle both {items: [...]} and direct array responses
    if (Array.isArray(content)) {
      return content;
    } else if (content && Array.isArray(content.items)) {
      return content.items;
    } else if (content && content.food_name) {
      // Single item wrapped in object
      return [content];
    } else {
      console.warn('Unexpected response format:', content);
      return [];
    }
  } catch (error) {
    console.error('OpenAI image extraction error:', error);
    return [];
  }
}


// Barcode lookup with multiple fallbacks
async function extractFromBarcode(barcode) {
  // Normalize barcode (remove leading zeros for some APIs, but keep original for OpenFoodFacts)
  const normalizedBarcode = barcode.trim();
  const barcodeWithoutLeadingZeros = normalizedBarcode.replace(/^0+/, '') || normalizedBarcode;

  try {
    // Try OpenFoodFacts API first with original barcode
    let response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${normalizedBarcode}.json`);
    let data = await response.json();

    // If not found and barcode has leading zeros, try without them
    if (data.status === 0 && normalizedBarcode !== barcodeWithoutLeadingZeros) {
      console.log(`Trying barcode without leading zeros: ${barcodeWithoutLeadingZeros}`);
      response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeWithoutLeadingZeros}.json`);
      data = await response.json();
    }

    if (data.status === 1 && data.product) {
      const product = data.product;
      return [{
        food_name: product.product_name || 'Unknown Product',
        quantity: 100,
        unit: 'g',
        calories: product.nutriments?.['energy-kcal_100g'] || 0,
        protein: product.nutriments?.proteins_100g || 0,
        carbs: product.nutriments?.carbohydrates_100g || 0,
        fats: product.nutriments?.fat_100g || 0,
        barcode: barcode,
        confidence_score: 1.0,
      }];
    }

    // Fallback: Use OpenAI to look up product information
    console.log(`Barcode ${barcode} not found in OpenFoodFacts, trying OpenAI lookup...`);
    return await extractFromBarcodeWithOpenAI(barcode);
  } catch (error) {
    console.error('Barcode lookup error:', error);
    // Try OpenAI as fallback even on error
    try {
      return await extractFromBarcodeWithOpenAI(barcode);
    } catch (openaiError) {
      console.error('OpenAI barcode lookup error:', openaiError);
      return [];
    }
  }
}

// Fallback: Use OpenAI to look up product by barcode
async function extractFromBarcodeWithOpenAI(barcode) {
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `Look up product information for barcode/UPC code: ${barcode}. Return a JSON object with the following structure:
{
  "items": [{
    "food_name": "Product name",
    "quantity": 100,
    "unit": "g",
    "calories": estimated calories per 100g,
    "protein": estimated protein in grams per 100g,
    "carbs": estimated carbs in grams per 100g,
    "fats": estimated fats in grams per 100g,
    "barcode": "${barcode}",
    "confidence_score": 0.8
  }]
}

If you cannot find the product, return an empty items array. Be as accurate as possible with nutrition estimates.`
      }],
      tools: [
        { type: "web_search" }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const content = JSON.parse(response.choices[0].message.content);

    if (content && Array.isArray(content.items) && content.items.length > 0) {
      return content.items;
    }

    return [];
  } catch (error) {
    console.error('OpenAI barcode lookup error:', error);
    return [];
  }
}

// Fallback: Simple pattern matching
function extractWithPatternMatching(text) {
  const items = [];
  const commonFoods = {
    'egg': { calories: 70, protein: 6, carbs: 0.6, fats: 5 },
    'eggs': { calories: 70, protein: 6, carbs: 0.6, fats: 5 },
    'rice': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
    'chicken': { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    'coffee': { calories: 2, protein: 0.3, carbs: 0, fats: 0 },
    'bread': { calories: 265, protein: 9, carbs: 49, fats: 3.2 },
    'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
    'apple': { calories: 52, protein: 0.3, carbs: 14, fats: 0.2 },
  };

  const words = text.toLowerCase().split(/[,\s]+/);
  let currentQuantity = 1;
  let currentUnit = 'piece';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const numMatch = word.match(/(\d+\.?\d*)/);

    if (numMatch) {
      currentQuantity = parseFloat(numMatch[1]);
      if (words[i + 1]?.includes('cup')) {
        currentUnit = 'cup';
        i++;
      } else if (words[i + 1]?.includes('gram') || words[i + 1] === 'g') {
        currentUnit = 'g';
        i++;
      }
    } else {
      for (const [food, nutrition] of Object.entries(commonFoods)) {
        if (word.includes(food)) {
          items.push({
            food_name: word,
            quantity: currentQuantity,
            unit: currentUnit,
            calories: Math.round(nutrition.calories * (currentUnit === 'cup' ? 1.5 : currentQuantity)),
            protein: Math.round(nutrition.protein * (currentUnit === 'cup' ? 1.5 : currentQuantity) * 10) / 10,
            carbs: Math.round(nutrition.carbs * (currentUnit === 'cup' ? 1.5 : currentQuantity) * 10) / 10,
            fats: Math.round(nutrition.fats * (currentUnit === 'cup' ? 1.5 : currentQuantity) * 10) / 10,
            confidence_score: 0.6,
          });
          currentQuantity = 1;
          currentUnit = 'piece';
          break;
        }
      }
    }
  }

  return items.length > 0 ? items : [{
    food_name: text,
    quantity: 1,
    unit: 'serving',
    calories: 200,
    protein: 10,
    carbs: 30,
    fats: 5,
    confidence_score: 0.3,
  }];
}
