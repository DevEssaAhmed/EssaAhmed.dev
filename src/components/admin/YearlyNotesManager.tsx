import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { OptimizedImage } from "@/components/OptimizedImage";

type DiaryEntry = {
  id: string;
  entry_date: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  image_alt: string | null;
  is_published: boolean;
  created_at: string;
};

type FormState = {
  entry_date: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  image_alt: string;
  is_published: boolean;
};

const initialFormState: FormState = {
  entry_date: new Date().toISOString().slice(0, 10),
  title: "",
  content: "",
  excerpt: "",
  image_url: "",
  image_alt: "",
  is_published: true,
};

const YearlyNotesManager = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(initialFormState);

  const sortedEntries = useMemo(
    () =>
      [...entries].sort((a, b) => {
        if (a.entry_date !== b.entry_date) {
          return b.entry_date.localeCompare(a.entry_date);
        }
        return b.created_at.localeCompare(a.created_at);
      }),
    [entries]
  );

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("diary_entries").select("*");
      if (error) throw error;
      setEntries((data as DiaryEntry[]) || []);
    } catch (error) {
      console.error("Failed to fetch diary entries:", error);
      toast.error("Failed to load diary entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormState(initialFormState);
  };

  const onEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setFormState({
      entry_date: entry.entry_date,
      title: entry.title,
      content: entry.content,
      excerpt: entry.excerpt || "",
      image_url: entry.image_url || "",
      image_alt: entry.image_alt || "",
      is_published: entry.is_published,
    });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!formState.entry_date || !formState.title.trim() || !formState.content.trim()) {
      toast.error("Date, title, and content are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        entry_date: formState.entry_date,
        title: formState.title.trim(),
        content: formState.content.trim(),
        excerpt: formState.excerpt.trim() || null,
        image_url: formState.image_url.trim() || null,
        image_alt: formState.image_alt.trim() || null,
        is_published: formState.is_published,
      };

      if (editingId) {
        const { error } = await supabase.from("diary_entries").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Diary entry updated");
      } else {
        const { error } = await supabase.from("diary_entries").insert([payload]);
        if (error) throw error;
        toast.success("Diary entry created");
      }

      resetForm();
      await fetchEntries();
    } catch (error) {
      console.error("Failed to save diary entry:", error);
      toast.error("Failed to save diary entry");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("diary_entries").delete().eq("id", id);
      if (error) throw error;
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      toast.success("Diary entry deleted");
    } catch (error) {
      console.error("Failed to delete diary entry:", error);
      toast.error("Failed to delete diary entry");
    }
  };

  const handleImageUpload = (urls: string[]) => {
    setFormState((prev) => ({ ...prev, image_url: urls[0] || "" }));
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>{editingId ? "Edit Diary Entry" : "Create Diary Entry"}</CardTitle>
          <CardDescription>Manage your public diary timeline entries.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entry-date">Entry Date</Label>
                <Input
                  id="entry-date"
                  type="date"
                  value={formState.entry_date}
                  onChange={(event) => setFormState((prev) => ({ ...prev, entry_date: event.target.value }))}
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="entry-published"
                  checked={formState.is_published}
                  onCheckedChange={(value) => setFormState((prev) => ({ ...prev, is_published: value }))}
                />
                <Label htmlFor="entry-published">Published</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="entry-title">Title</Label>
              <Input
                id="entry-title"
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="What happened today?"
                required
              />
            </div>

            <div>
              <Label htmlFor="entry-excerpt">Excerpt (optional)</Label>
              <Textarea
                id="entry-excerpt"
                value={formState.excerpt}
                onChange={(event) => setFormState((prev) => ({ ...prev, excerpt: event.target.value }))}
                placeholder="Short preview shown before expansion."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="entry-content">Content</Label>
              <Textarea
                id="entry-content"
                value={formState.content}
                onChange={(event) => setFormState((prev) => ({ ...prev, content: event.target.value }))}
                placeholder="Write your full diary note..."
                rows={7}
                required
              />
            </div>

            <FileUpload
              label="Diary image (optional)"
              uploadType="image"
              accept="image/*"
              maxFiles={1}
              existingFiles={formState.image_url ? [formState.image_url] : []}
              onUploadComplete={handleImageUpload}
              allowUrlInput
              simultaneousMode
              showPreview
            />

            <div>
              <Label htmlFor="entry-image-url">Image URL fallback (optional)</Label>
              <Input
                id="entry-image-url"
                value={formState.image_url}
                onChange={(event) => setFormState((prev) => ({ ...prev, image_url: event.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="entry-image-alt">Image alt text (optional)</Label>
              <Input
                id="entry-image-alt"
                value={formState.image_alt}
                onChange={(event) => setFormState((prev) => ({ ...prev, image_alt: event.target.value }))}
                placeholder="Short description for accessibility"
              />
            </div>

            {formState.image_url.trim() && (
              <div className="w-28 h-28 rounded-xl overflow-hidden border border-border">
                <OptimizedImage
                  src={formState.image_url}
                  alt={formState.image_alt || formState.title || "Diary preview image"}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                <Plus className="w-4 h-4 mr-2" />
                {editingId ? "Update Entry" : "Create Entry"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel Editing
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Existing Diary Entries</CardTitle>
          <CardDescription>{entries.length} entries</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading entries...</p>
          ) : sortedEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border border-border/50 rounded-lg flex flex-col gap-3 md:flex-row md:items-start md:justify-between"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <Badge>
                        <CalendarDays className="w-3 h-3 mr-1" />
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </Badge>
                      {!entry.is_published && <Badge variant="secondary">Draft</Badge>}
                    </div>
                    <p className="font-medium">{entry.title}</p>
                    <div className="flex items-start gap-3">
                      <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line flex-1">
                        {entry.excerpt || entry.content}
                      </p>
                      {entry.image_url && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-border shrink-0">
                          <OptimizedImage
                            src={entry.image_url}
                            alt={entry.image_alt || entry.title}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => onEdit(entry)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="hover:text-destructive">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete diary entry</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(entry.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default YearlyNotesManager;
