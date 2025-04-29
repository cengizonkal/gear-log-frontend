import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { apiService } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface OwnerProps {
  id: number;
  name: string;
  email: string | null;
  phone: string;
}

interface OwnerDetailsProps {
  owner: OwnerProps;
  onOwnerUpdate: (owner: OwnerProps) => void;
}

export function OwnerDetails({ owner, onOwnerUpdate }: OwnerDetailsProps) {
  const [name, setName] = useState(owner.name);
  const [phone, setPhone] = useState(owner.phone);
  const [email, setEmail] = useState(owner.email || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(owner.name);
    setPhone(owner.phone);
    setEmail(owner.email || "");
  }, [owner]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await apiService.owners.update(owner.id, { name, phone, email });
      onOwnerUpdate(response.data.data); // Use updated owner from API response
      toast({ title: "Kaydedildi", description: "Sahip bilgileri başarıyla kaydedildi." });
    } catch (error) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h3 className="text-lg font-semibold mb-4">Araç Sahibi</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="name" className="text-sm font-medium text-gray-600">İsim:</Label>
          <Input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-2/3" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-600">Telefon:</Label>
          <Input type="text" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-2/3" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="email" className="text-sm font-medium text-gray-600">E-posta:</Label>
          <Input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-2/3" />
        </div>
      </div>
      <Button onClick={handleSave} className="mt-4 w-full" disabled={loading}>
        {loading ? 'Kaydediliyor...' : 'Kaydet'}
      </Button>
    </div>
  );
}
