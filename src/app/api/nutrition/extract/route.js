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

    if (inputType === 'image' && (imageUrl || imageBase64)) {
      // Image recognition
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
      model: "gpt-4-turbo-preview",
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

async function extractImageWithOpenAI(imageUrlOrBase64) {
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const imageContent = imageUrlOrBase64.startsWith('data:')
      ? { type: "image_url", image_url: { url: imageUrlOrBase64 } }
      : { type: "image_url", image_url: { url: imageUrlOrBase64 } };

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
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
    console.error('OpenAI image extraction error:', error);
    return [];
  }
}


// Barcode lookup (placeholder - integrate with OpenFoodFacts or similar)
async function extractFromBarcode(barcode) {
  try {
    // Example: OpenFoodFacts API
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

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
  } catch (error) {
    console.error('Barcode lookup error:', error);
  }

  return [];
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
