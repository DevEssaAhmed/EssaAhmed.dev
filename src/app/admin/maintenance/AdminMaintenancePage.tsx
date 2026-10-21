"use client";

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Tags, Folder, RefreshCw, CheckCircle2, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface OrphanTag { name: string; count: number; }
interface Category { id: string; name: string; slug: string; description?: string | null; color?: string | null; }

const AdminMaintenancePage: React.FC = () => {
  const { toast } = useToast();

  // Tags
  const [loadingTags, setLoadingTags] = useState(true);
  const [tags, setTags] = useState<OrphanTag[]>([]);
  const [searchTag, setSearchTag] = useState('');

  // Categories
  const [loadingCats, setLoadingCats] = useState(true);
  const [categories, setCategories] = useState<(Category & { totalRefs: number })[]>([]);
  const [searchCat, setSearchCat] = useState('');

  useEffect(() => {
    loadTags();
    loadCategories();
  }, []);

  const loadTags = async () => {
    try {
      setLoadingTags(true);
      // Prefer RPC if available
      const { data, error } = await supabase.rpc('get_all_tags_with_counts');
      if (error) throw error;
      const simplified = (data || []).map((t: any) => ({ name: t.name as string, count: Number(t.total_count || 0) }));
      setTags(simplified);
    } catch (error) {
      console.error('Failed to fetch tags with counts via RPC, falling back to tags table:', error);
      // Fallback: fetch tags table only (no counts)
      const { data: tagRows } = await supabase.from('tags').select('name');
      setTags((tagRows || []).map((t: any) => ({ name: t.name, count: 0 })));
    } finally {
      setLoadingTags(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCats(true);
      const { data: catRows, error } = await supabase.from('categories').select('id, name, slug, description, color');
      if (error) throw error;
      const withCounts: (Category & { totalRefs: number })[] = [];
      for (const cat of (catRows || [])) {
        const [{ count: projCount }, { count: artCount }] = await Promise.all([
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('category_id', cat.id),
          supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('category_id', cat.id),
        ]);
        withCounts.push({ ...cat, totalRefs: (projCount || 0) + (artCount || 0) });
      }
      setCategories(withCounts);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoadingCats(false);
    }
  };

  const orphanTags = useMemo(() => tags.filter(t => t.count === 0 && t.name.toLowerCase().includes(searchTag.toLowerCase())), [tags, searchTag]);
  const orphanCategories = useMemo(() => categories.filter(c => c.totalRefs === 0 && c.name.toLowerCase().includes(searchCat.toLowerCase())), [categories, searchCat]);

  const deleteOrphanTags = async () => {
    if (orphanTags.length === 0) return;
    try {
      const names = orphanTags.map(t => t.name);
      const { error } = await supabase.from('tags').delete().in('name', names);
      if (error) throw error;
      toast({ title: 'Orphan tags deleted', description: `${names.length} tag(s) removed.` });
      await loadTags();
    } catch (error: any) {
      toast({ title: 'Failed to delete tags', description: error.message || 'Unknown error', variant: 'destructive' });
    }
  };

  const deleteOrphanCategories = async () => {
    if (orphanCategories.length === 0) return;
    try {
      const ids = orphanCategories.map(c => c.id);
      const { error } = await supabase.from('categories').delete().in('id', ids);
      if (error) throw error;
      toast({ title: 'Orphan categories deleted', description: `${ids.length} categor${ids.length === 1 ? 'y' : 'ies'} removed.` });
      await loadCategories();
    } catch (error: any) {
      toast({ title: 'Failed to delete categories', description: error.message || 'Unknown error', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout
      title="Maintenance"
      subtitle="Clean up unused tags and categories"
      actions={
        <Button variant="outline" className="bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 shadow-2xs" onClick={() => { loadTags(); loadCategories(); }}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      }
    >
      <Tabs defaultValue="tags" className="space-y-6">
        <TabsList className="w-full max-w-md grid grid-cols-2 bg-zinc-200/80 border border-zinc-300/80 p-1 rounded-lg">
          <TabsTrigger value="tags" className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-xs text-zinc-600 hover:text-zinc-900">Tags</TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-xs text-zinc-600 hover:text-zinc-900">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="tags" className="space-y-4">
          <Card className="bg-white border-zinc-200/90 text-zinc-900 shadow-2xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-900"><Tags className="w-5 h-5 text-zinc-600" /> Orphan Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-zinc-400" />
                <Input placeholder="Search tags..." value={searchTag} onChange={(e) => setSearchTag(e.target.value)} className="max-w-xs bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400" />
                <div className="ml-auto flex gap-2">
                  <Button variant="destructive" disabled={loadingTags || orphanTags.length === 0} onClick={deleteOrphanTags}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete All Orphan Tags
                  </Button>
                </div>
              </div>

              {loadingTags ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 border border-zinc-200 rounded-lg bg-zinc-50/60">
                      <Skeleton className="h-6 w-1/2 mb-2 bg-zinc-200" />
                      <Skeleton className="h-4 w-1/3 bg-zinc-200" />
                    </div>
                  ))}
                </div>
              ) : orphanTags.length === 0 ? (
                <div className="text-sm text-zinc-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No orphan tags. You&apos;re all set!
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orphanTags.map((t) => (
                    <div key={t.name} className="p-4 border border-zinc-200 rounded-lg bg-zinc-50/70">
                      <div className="font-medium text-zinc-900">{t.name}</div>
                      <div className="text-xs text-zinc-500">Used in {t.count} items</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 text-xs text-zinc-500 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Deleting a tag only removes it from your taxonomy list. It does not modify existing articles&apos; string tags.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="bg-white border-zinc-200/90 text-zinc-900 shadow-2xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-900"><Folder className="w-5 h-5 text-zinc-600" /> Orphan Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-zinc-400" />
                <Input placeholder="Search categories..." value={searchCat} onChange={(e) => setSearchCat(e.target.value)} className="max-w-xs bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400" />
                <div className="ml-auto flex gap-2">
                  <Button variant="destructive" disabled={loadingCats || orphanCategories.length === 0} onClick={deleteOrphanCategories}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete All Orphan Categories
                  </Button>
                </div>
              </div>

              {loadingCats ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 border border-zinc-200 rounded-lg bg-zinc-50/60">
                      <Skeleton className="h-6 w-1/2 mb-2 bg-zinc-200" />
                      <Skeleton className="h-4 w-1/3 bg-zinc-200" />
                    </div>
                  ))}
                </div>
              ) : orphanCategories.length === 0 ? (
                <div className="text-sm text-zinc-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No orphan categories. You&apos;re all set!
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orphanCategories.map((c) => (
                    <div key={c.id} className="p-4 border border-zinc-200 rounded-lg bg-zinc-50/70">
                      <div className="font-medium text-zinc-900">{c.name}</div>
                      <div className="text-xs text-zinc-500">No associated articles or projects</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 text-xs text-zinc-500 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Deleting a category cannot be undone. Make sure it&apos;s truly unused.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminMaintenancePage;

