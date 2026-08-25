import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const EXAMS = ["School/Board", "IIT-JEE", "NEET", "UPSC", "Others"];
export const CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Dropper"];

export function PreferencesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { session } = useSession();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [exam, setExam] = useState("IIT-JEE");
  const [klass, setKlass] = useState("Class 11");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.exam_category) setExam(profile.exam_category);
    if (profile?.class_level) setKlass(profile.class_level);
  }, [profile?.exam_category, profile?.class_level]);

  async function save() {
    if (!session) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ exam_category: exam, class_level: klass })
      .eq("id", session.user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Preferences saved");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change your preferences</DialogTitle>
          <DialogDescription>
            We use these to personalise your home feed and recommendations.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Exam
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMS.map((e) => (
                <Chip key={e} active={exam === e} onClick={() => setExam(e)} label={e} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Class
            </p>
            <div className="flex flex-wrap gap-2">
              {CLASSES.map((c) => (
                <Chip key={c} active={klass === c} onClick={() => setKlass(c)} label={c} />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? "Saving…" : "Save details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
        (active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-accent")
      }
    >
      {label}
    </button>
  );
}
