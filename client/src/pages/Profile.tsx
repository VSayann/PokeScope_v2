import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [username, setUsername] = useState(user?.username ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user?.profileImageUrl ?? null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/(png|jpg|jpeg)$/i.test(file.name)) {
      toast({ title: "Format invalide", description: "Seuls les PNG ou JPG sont acceptés", variant: "destructive" });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body: any = { username };
      if (imageFile && preview) body.profileImageUrl = preview;
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Erreur");
      toast({ title: "Profil mis à jour" });
      await refresh?.();
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Mon profil</h1>
        <label className="block">
          <span className="text-gray-700">Pseudo</span>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label className="block">
          <span className="text-gray-700">Photo de profil (png/jpg)</span>
          <Input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} />
        </label>
        {preview && <img src={preview} alt="preview" className="w-24 h-24 rounded-full object-cover mx-auto" />}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}
