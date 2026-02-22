import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, BarChart3, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HeroStat {
  label: string;
  value: string;
}

interface HeroStatsData {
  [key: string]: HeroStat;
}

const HeroStatsManager = () => {
  const [stats, setStats] = useState<HeroStatsData>({
    projectsLed: { label: 'Projects Led', value: '15+' },
    hoursAnalyzed: { label: 'Hours Analyzed', value: '500+' },
    clientsServed: { label: 'Clients Served', value: '50+' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatKey, setNewStatKey] = useState('');
  const [newStatLabel, setNewStatLabel] = useState('');
  const [newStatValue, setNewStatValue] = useState('');

  useEffect(() => {
    fetchHeroStats();
  }, []);

  const fetchHeroStats = async () => {
    try {
      // Get the first profile and its stats
      const { data, error } = await supabase
        .from('profile')
        .select('stats')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data && data.stats) {
        const profileStats = typeof data.stats === 'string' ? JSON.parse(data.stats) : data.stats;
        setStats(profileStats);
      }
    } catch (error) {
      console.error('Error fetching hero stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHeroStats = async () => {
    setSaving(true);
    try {
      // Update the first profile with the new stats
      const { data: profiles, error: fetchError } = await supabase
        .from('profile')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (profiles && profiles.length > 0) {
        const { error } = await supabase
          .from('profile')
          .update({ stats: stats as any })
          .eq('id', profiles[0].id);

        if (error) throw error;
      } else {
        // Create a new profile if none exists
        const { error } = await supabase
          .from('profile')
          .insert([{
            name: 'New User',
            username: 'user',
            stats: stats as any
          }])
          .select()
          .single();

        if (error) throw error;
      }

      toast.success('Hero stats saved successfully!');
    } catch (error) {
      console.error('Error saving hero stats:', error);
      toast.error('Failed to save hero stats');
    } finally {
      setSaving(false);
    }
  };

  const updateStat = (key: string, field: 'label' | 'value', value: string) => {
    setStats(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const deleteStat = (key: string) => {
    setStats(prev => {
      const newStats = { ...prev };
      delete newStats[key];
      return newStats;
    });
  };

  const addNewStat = () => {
    if (!newStatKey || !newStatLabel || !newStatValue) {
      toast.error('Please fill in all fields');
      return;
    }

    if (stats[newStatKey]) {
      toast.error('Stat key already exists');
      return;
    }

    setStats(prev => ({
      ...prev,
      [newStatKey]: {
        label: newStatLabel,
        value: newStatValue
      }
    }));

    setNewStatKey('');
    setNewStatLabel('');
    setNewStatValue('');
    toast.success('New stat added!');
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Hero Section Stats
        </CardTitle>
        <CardDescription>
          Manage the statistics displayed in your hero section
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Stats */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Current Stats</Label>
          {Object.entries(stats).map(([key, stat]) => (
            <div key={key} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">
                  {key}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteStat(key)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`${key}-label`} className="text-sm">
                    Label
                  </Label>
                  <Input
                    id={`${key}-label`}
                    value={stat.label}
                    onChange={(e) => updateStat(key, 'label', e.target.value)}
                    placeholder="e.g. Projects Led"
                  />
                </div>
                <div>
                  <Label htmlFor={`${key}-value`} className="text-sm">
                    Value
                  </Label>
                  <Input
                    id={`${key}-value`}
                    value={stat.value}
                    onChange={(e) => updateStat(key, 'value', e.target.value)}
                    placeholder="e.g. 15+"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Stat */}
        <div className="space-y-4 border-t border-border pt-6">
          <Label className="text-base font-semibold">Add New Stat</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="new-key" className="text-sm">
                Key (unique identifier)
              </Label>
              <Input
                id="new-key"
                value={newStatKey}
                onChange={(e) => setNewStatKey(e.target.value)}
                placeholder="e.g. yearsExperience"
              />
            </div>
            <div>
              <Label htmlFor="new-label" className="text-sm">
                Label
              </Label>
              <Input
                id="new-label"
                value={newStatLabel}
                onChange={(e) => setNewStatLabel(e.target.value)}
                placeholder="e.g. Years Experience"
              />
            </div>
            <div>
              <Label htmlFor="new-value" className="text-sm">
                Value
              </Label>
              <Input
                id="new-value"
                value={newStatValue}
                onChange={(e) => setNewStatValue(e.target.value)}
                placeholder="e.g. 5+"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addNewStat}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Stat
          </Button>
        </div>

        {/* Save Button */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            onClick={saveHeroStats}
            disabled={saving}
            className="flex-1 bg-gradient-primary hover:shadow-soft"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Preview */}
        <div className="space-y-4 border-t border-border pt-6">
          <Label className="text-base font-semibold">Preview</Label>
          <div className="flex flex-wrap gap-8 p-4 bg-muted/30 rounded-lg">
            {Object.entries(stats).map(([key, stat]) => (
              <div key={key} className="text-center">
                <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroStatsManager;
