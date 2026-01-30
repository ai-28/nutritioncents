'use client';

import { useState, useEffect } from 'react';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { 
  Heart, AlertTriangle, Plus, X, Trash2, 
  Info, CheckCircle2, XCircle 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const severityOptions = [
  { value: 'mild', label: 'Mild', color: 'text-yellow-600' },
  { value: 'moderate', label: 'Moderate', color: 'text-orange-600' },
  { value: 'severe', label: 'Severe', color: 'text-red-600' },
  { value: 'life_threatening', label: 'Life Threatening', color: 'text-red-800' },
];

export default function HealthPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allergies, setAllergies] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showAllergyDialog, setShowAllergyDialog] = useState(false);
  const [showConditionDialog, setShowConditionDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const [allergyForm, setAllergyForm] = useState({
    allergenName: '',
    allergenCategory: '',
    severity: 'moderate',
    reactionDescription: '',
    diagnosedBy: '',
    diagnosedDate: '',
  });

  const [conditionForm, setConditionForm] = useState({
    conditionName: '',
    conditionCategory: '',
    diagnosisDate: '',
    severity: 'moderate',
    isManaged: true,
    managementNotes: '',
    doctorName: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allergiesRes, conditionsRes, recommendationsRes] = await Promise.all([
        fetch('/api/health/allergies'),
        fetch('/api/health/conditions'),
        fetch('/api/health/conditions?recommendations=true'),
      ]);

      if (allergiesRes.ok) {
        const { allergies: allergiesData } = await allergiesRes.json();
        setAllergies(allergiesData || []);
      }

      if (conditionsRes.ok) {
        const { conditions: conditionsData } = await conditionsRes.json();
        setConditions(conditionsData || []);
      }

      if (recommendationsRes.ok) {
        const { recommendations: recs } = await recommendationsRes.json();
        setRecommendations(recs || []);
      }
    } catch (error) {
      console.error('Error loading health data:', error);
      toast.error('Failed to load health information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllergy = async () => {
    if (!allergyForm.allergenName.trim()) {
      toast.error('Please enter an allergen name');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/health/allergies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allergyForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add allergy');
      }

      toast.success('Allergy added successfully');
      setShowAllergyDialog(false);
      setAllergyForm({
        allergenName: '',
        allergenCategory: '',
        severity: 'moderate',
        reactionDescription: '',
        diagnosedBy: '',
        diagnosedDate: '',
      });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to add allergy');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCondition = async () => {
    if (!conditionForm.conditionName.trim()) {
      toast.error('Please enter a condition name');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/health/conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conditionForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add condition');
      }

      toast.success('Health condition added successfully');
      setShowConditionDialog(false);
      setConditionForm({
        conditionName: '',
        conditionCategory: '',
        diagnosisDate: '',
        severity: 'moderate',
        isManaged: true,
        managementNotes: '',
        doctorName: '',
      });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to add condition');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllergy = async (id) => {
    if (!confirm('Are you sure you want to remove this allergy?')) return;

    try {
      // Note: You may need to create a DELETE endpoint or use a different method
      toast.info('Delete functionality coming soon');
    } catch (error) {
      toast.error('Failed to delete allergy');
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="px-4 py-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground">Loading health information...</div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="px-4 py-6 space-y-6 pb-24">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="w-8 h-8 text-red-500" />
          Health & Safety
        </h1>

        {/* Allergies Section */}
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Allergies
            </h2>
            <Dialog open={showAllergyDialog} onOpenChange={setShowAllergyDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Allergy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Allergy</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Allergen Name *</Label>
                    <Input
                      value={allergyForm.allergenName}
                      onChange={(e) => setAllergyForm(prev => ({ ...prev, allergenName: e.target.value }))}
                      placeholder="e.g., Peanuts, Shellfish, Dairy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={allergyForm.allergenCategory}
                      onChange={(e) => setAllergyForm(prev => ({ ...prev, allergenCategory: e.target.value }))}
                      placeholder="e.g., Nuts, Seafood"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select
                      value={allergyForm.severity}
                      onValueChange={(value) => setAllergyForm(prev => ({ ...prev, severity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {severityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reaction Description</Label>
                    <Textarea
                      value={allergyForm.reactionDescription}
                      onChange={(e) => setAllergyForm(prev => ({ ...prev, reactionDescription: e.target.value }))}
                      placeholder="Describe your reaction..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Diagnosed By</Label>
                    <Input
                      value={allergyForm.diagnosedBy}
                      onChange={(e) => setAllergyForm(prev => ({ ...prev, diagnosedBy: e.target.value }))}
                      placeholder="Doctor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Diagnosis Date</Label>
                    <Input
                      type="date"
                      value={allergyForm.diagnosedDate}
                      onChange={(e) => setAllergyForm(prev => ({ ...prev, diagnosedDate: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleAddAllergy} disabled={saving} className="w-full">
                    {saving ? 'Adding...' : 'Add Allergy'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {allergies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No allergies recorded</p>
              <p className="text-sm">Add your allergies to get safety alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allergies.map((allergy) => {
                const severity = severityOptions.find(s => s.value === allergy.severity);
                return (
                  <div key={allergy.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{allergy.allergen_name}</h3>
                          {severity && (
                            <span className={`text-xs px-2 py-0.5 rounded ${severity.color} bg-opacity-10`}>
                              {severity.label}
                            </span>
                          )}
                        </div>
                        {allergy.allergen_category && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Category: {allergy.allergen_category}
                          </p>
                        )}
                        {allergy.reaction_description && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {allergy.reaction_description}
                          </p>
                        )}
                        {allergy.diagnosed_by && (
                          <p className="text-xs text-muted-foreground">
                            Diagnosed by: {allergy.diagnosed_by}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAllergy(allergy.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Health Conditions Section */}
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Health Conditions
            </h2>
            <Dialog open={showConditionDialog} onOpenChange={setShowConditionDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Condition
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Health Condition</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Condition Name *</Label>
                    <Input
                      value={conditionForm.conditionName}
                      onChange={(e) => setConditionForm(prev => ({ ...prev, conditionName: e.target.value }))}
                      placeholder="e.g., Type 2 Diabetes, Hypertension"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={conditionForm.conditionCategory}
                      onValueChange={(value) => setConditionForm(prev => ({ ...prev, conditionCategory: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metabolic">Metabolic</SelectItem>
                        <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                        <SelectItem value="digestive">Digestive</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select
                      value={conditionForm.severity}
                      onValueChange={(value) => setConditionForm(prev => ({ ...prev, severity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Diagnosis Date</Label>
                    <Input
                      type="date"
                      value={conditionForm.diagnosisDate}
                      onChange={(e) => setConditionForm(prev => ({ ...prev, diagnosisDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Doctor Name</Label>
                    <Input
                      value={conditionForm.doctorName}
                      onChange={(e) => setConditionForm(prev => ({ ...prev, doctorName: e.target.value }))}
                      placeholder="Doctor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Management Notes</Label>
                    <Textarea
                      value={conditionForm.managementNotes}
                      onChange={(e) => setConditionForm(prev => ({ ...prev, managementNotes: e.target.value }))}
                      placeholder="Notes about managing this condition..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isManaged"
                      checked={conditionForm.isManaged}
                      onChange={(e) => setConditionForm(prev => ({ ...prev, isManaged: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isManaged" className="font-normal">
                      Currently managed
                    </Label>
                  </div>
                  <Button onClick={handleAddCondition} disabled={saving} className="w-full">
                    {saving ? 'Adding...' : 'Add Condition'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {conditions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No health conditions recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conditions.map((condition) => (
                <div key={condition.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{condition.condition_name}</h3>
                        {condition.is_managed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      {condition.condition_category && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Category: {condition.condition_category}
                        </p>
                      )}
                      {condition.management_notes && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {condition.management_notes}
                        </p>
                      )}
                      {condition.doctor_name && (
                        <p className="text-xs text-muted-foreground">
                          Doctor: {condition.doctor_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-4 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Recommendations
            </h2>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold mb-2">{rec.condition}</h3>
                  <ul className="space-y-1">
                    {rec.recommendations.map((recommendation, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
