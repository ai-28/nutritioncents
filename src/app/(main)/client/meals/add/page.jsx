'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserLayout } from '@/components/layout/UserLayout';
import { MealTypeTabs } from '@/components/ui/meal-type-tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Mic, Image, Barcode, Loader2, X, Edit2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { VoiceInput } from '@/components/input/VoiceInput';
import { ImageUpload } from '@/components/input/ImageUpload';
import { BarcodeScanner } from '@/components/input/BarcodeScanner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatePickerStrip } from '@/components/ui/date-picker-strip';

function AddMealPageInner() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const mealType = searchParams.get('type') || 'breakfast';
  const dateParam = searchParams.get('date');
  
  const [selectedDate, setSelectedDate] = useState(
    dateParam || new Date().toISOString().split('T')[0]
  );
  const [currentMealType, setCurrentMealType] = useState(mealType);
  const [inputText, setInputText] = useState('');
  const [inputMethod, setInputMethod] = useState('text');
  const [extractedItems, setExtractedItems] = useState([]);
  const [allergenAlerts, setAllergenAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);

  useEffect(() => {
    setCurrentMealType(mealType);
  }, [mealType]);

  const handleExtract = async (text = null, image = null, barcode = null) => {
    const input = text || inputText;
    const hasInput = input?.trim() || image || barcode;

    if (!hasInput) {
      toast.error('Please enter meal description, upload image, or scan barcode');
      return;
    }

    setExtracting(true);
    try {
      const body = {
        input: barcode || input,
        inputType: barcode ? 'barcode' : (image ? 'image' : inputMethod),
      };

      if (image) {
        body.imageBase64 = image;
      }

      const response = await fetch('/api/nutrition/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to extract nutrition');
      }

      const data = await response.json();
      setExtractedItems(data.items || []);
      setAllergenAlerts(data.allergenAlerts || []);
      
      if (data.items && data.items.length > 0) {
        toast.success(`Extracted ${data.items.length} food item(s)`);
        
        if (data.allergenAlerts && data.allergenAlerts.length > 0) {
          const critical = data.allergenAlerts.filter(a => a.alert_level === 'critical');
          if (critical.length > 0) {
            toast.error(`⚠️ Critical: ${critical.length} allergen(s) detected!`);
          } else {
            toast.warning(`⚠️ ${data.allergenAlerts.length} allergen warning(s)`);
          }
        }
      } else {
        toast.warning('No food items found. Please try a different description.');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      toast.error('Failed to extract nutrition. Please try again.');
    } finally {
      setExtracting(false);
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setInputText(transcript);
    setInputMethod('voice');
  };

  const handleImageUpload = async (imageBase64Data) => {
    setImageBase64(imageBase64Data);
    setInputMethod('image');
    await handleExtract(null, imageBase64Data, null);
  };

  const handleBarcodeScanned = async (barcode) => {
    setInputMethod('barcode');
    await handleExtract(null, null, barcode);
  };

  const handleSave = async () => {
    if (extractedItems.length === 0) {
      toast.error('Please extract food items first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: currentMealType,
          mealDate: selectedDate,
          inputMethod: inputMethod,
          items: extractedItems,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save meal');
      }

      toast.success('Meal saved successfully!');
      router.push('/client/dashboard');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save meal');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (index) => {
    const item = extractedItems[index];
    const newName = prompt('Food name:', item.food_name);
    const newQuantity = prompt('Quantity:', item.quantity);
    const newUnit = prompt('Unit:', item.unit);

    if (newName && newQuantity) {
      const updated = [...extractedItems];
      updated[index] = {
        ...item,
        food_name: newName,
        quantity: parseFloat(newQuantity) || item.quantity,
        unit: newUnit || item.unit,
        is_edited: true,
      };
      setExtractedItems(updated);
    }
  };

  const handleRemoveItem = (index) => {
    setExtractedItems(extractedItems.filter((_, i) => i !== index));
  };

  const handleAddMore = () => {
    setInputText('');
    setExtractedItems([]);
  };

  return (
    <UserLayout>
      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Add Meal</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Date Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Date</label>
          <DatePickerStrip
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            className="bg-white rounded-lg p-2 border border-border"
          />
        </div>

        {/* Meal Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Meal Type</label>
          <MealTypeTabs
            selected={currentMealType}
            onSelect={setCurrentMealType}
          />
        </div>

          {/* Input Methods */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Input Method</label>
            <div className="flex gap-2">
              <Button
                variant={inputMethod === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMethod('text')}
                className="flex-1"
              >
                ✍️ Text
              </Button>
              <Button
                variant={inputMethod === 'voice' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMethod('voice')}
                className="flex-1"
              >
                <Mic className="w-4 h-4 mr-2" />
                Voice
              </Button>
              <Button
                variant={inputMethod === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMethod('image')}
                className="flex-1"
              >
                <Image className="w-4 h-4 mr-2" />
                Photo
              </Button>
              <Button
                variant={inputMethod === 'barcode' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMethod('barcode')}
                className="flex-1"
              >
                <Barcode className="w-4 h-4 mr-2" />
                Scan
              </Button>
            </div>
          </div>

          {/* Input Fields Based on Method */}
          {inputMethod === 'text' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Describe your meal</label>
              <Textarea
                placeholder="e.g., 2 eggs, 1 cup rice, 2 cups coffee"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[120px]"
              />
              <Button
                onClick={() => handleExtract()}
                disabled={!inputText.trim() || extracting}
                className="w-full mt-2"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  'Extract Nutrition'
                )}
              </Button>
            </div>
          )}

          {inputMethod === 'voice' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Voice Input</label>
              <VoiceInput onTranscript={handleVoiceTranscript} disabled={extracting} />
              <div className="mt-2">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Click 'Start Voice Input' to record your meal description. The transcript will appear here..."
                />
                {inputText && (
                  <Button
                    onClick={() => handleExtract()}
                    disabled={!inputText.trim() || extracting}
                    className="w-full mt-2"
                  >
                    {extracting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      'Extract Nutrition'
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {inputMethod === 'image' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Upload Food Photo</label>
              <ImageUpload 
                onImageUpload={handleImageUpload} 
                disabled={extracting} 
                analyzing={extracting}
              />
              {extracting && (
                <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-primary font-medium">
                      AI is analyzing your food image...
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    Identifying food items and calculating nutrition values
                  </p>
                </div>
              )}
            </div>
          )}

          {inputMethod === 'barcode' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Scan Barcode</label>
              <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} disabled={extracting} />
            </div>
          )}
        </div>

        {/* Allergy Alerts */}
        {allergenAlerts.length > 0 && (
          <div className="space-y-2">
            {allergenAlerts.map((alert, index) => (
              <Alert
                key={index}
                variant={alert.alert_level === 'critical' ? 'destructive' : 'default'}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{alert.allergen_name}</strong> detected in <strong>{alert.detected_in}</strong>
                  {alert.alert_level === 'critical' && ' - CRITICAL WARNING!'}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Extracted Items */}
        {extractedItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Extracted Items</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddMore}
              >
                Add More
              </Button>
            </div>

            <div className="space-y-3">
              {extractedItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.food_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditItem(index)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cal:</span>{' '}
                      {Math.round(item.calories || 0)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">P:</span>{' '}
                      {Math.round(item.protein || 0)}g
                    </div>
                    <div>
                      <span className="text-muted-foreground">C:</span>{' '}
                      {Math.round(item.carbs || 0)}g
                    </div>
                    <div>
                      <span className="text-muted-foreground">F:</span>{' '}
                      {Math.round(item.fats || 0)}g
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  {Math.round(
                    extractedItems.reduce((sum, item) => sum + (item.calories || 0), 0)
                  )}{' '}
                  cal
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  Protein: {Math.round(
                    extractedItems.reduce((sum, item) => sum + (item.protein || 0), 0)
                  )}g
                </div>
                <div>
                  Carbs: {Math.round(
                    extractedItems.reduce((sum, item) => sum + (item.carbs || 0), 0)
                  )}g
                </div>
                <div>
                  Fats: {Math.round(
                    extractedItems.reduce((sum, item) => sum + (item.fats || 0), 0)
                  )}g
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Meal'
              )}
            </Button>

            {/* Save as Template Option */}
            {extractedItems.length > 0 && (
              <Button
                variant="outline"
                onClick={async () => {
                  const templateName = prompt('Template name:', `${currentMealType} template`);
                  if (templateName) {
                    try {
                      const res = await fetch('/api/templates', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          templateName,
                          mealType: currentMealType,
                          items: extractedItems,
                          totalCalories: extractedItems.reduce((sum, item) => sum + (item.calories || 0), 0),
                        }),
                      });
                      if (res.ok) {
                        toast.success('Template saved!');
                      }
                    } catch (error) {
                      toast.error('Failed to save template');
                    }
                  }
                }}
                className="w-full"
              >
                Save as Template
              </Button>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default function AddMealPage() {
  return (
    <Suspense
      fallback={
        <UserLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </UserLayout>
      }
    >
      <AddMealPageInner />
    </Suspense>
  );
}
