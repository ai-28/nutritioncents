'use client';

import { useState, useEffect } from 'react';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeightTrackingPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      const endDate = new Date();

      const res = await fetch(
        `/api/weight?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
      );
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error loading weight entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!weight || !date) {
      toast.error('Weight and date are required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg: parseFloat(weight),
          date,
          notes,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add weight entry');
      }

      toast.success('Weight entry added');
      setShowAddForm(false);
      setWeight('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      loadEntries();
    } catch (error) {
      console.error('Error adding weight:', error);
      toast.error('Failed to add weight entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this weight entry?')) return;

    try {
      const res = await fetch(`/api/weight/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Weight entry deleted');
        loadEntries();
      }
    } catch (error) {
      console.error('Error deleting weight:', error);
      toast.error('Failed to delete weight entry');
    }
  };

  const chartData = entries
    .sort((a, b) => new Date(a.measurement_date) - new Date(b.measurement_date))
    .map(entry => ({
      date: format(new Date(entry.measurement_date), 'MMM d'),
      weight: parseFloat(entry.weight_kg),
    }));

  return (
    <UserLayout>
      <div className="px-4 py-6 space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Weight Tracking</h1>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>

        {showAddForm && (
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Add Weight Entry</h2>
            <div>
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70.5"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., After workout"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">Weight Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={32} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#weightFill)"
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Recent Entries</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : entries.length > 0 ? (
            entries
              .sort((a, b) => new Date(b.measurement_date) - new Date(a.measurement_date))
              .slice(0, 10)
              .map((entry) => (
                <div
                  key={entry.id}
                  className="bg-card rounded-lg border border-border p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">{parseFloat(entry.weight_kg).toFixed(1)} kg</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(entry.measurement_date), 'MMM d, yyyy')}
                    </div>
                    {entry.notes && (
                      <div className="text-sm text-muted-foreground mt-1">{entry.notes}</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">No weight entries yet</div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
