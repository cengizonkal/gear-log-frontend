import { Clock, RotateCw, CheckCircle, Settings, User, X } from "lucide-react";

export const statusMap = {
    "Beklemede": { color: "bg-amber-500 text-white", icon: Clock },
    "Devam Ediyor": { color: "bg-blue-500 text-white", icon: RotateCw },
    "Tamamlandı": { color: "bg-green-500 text-white", icon: CheckCircle },
    "Parça Bekleniyor": { color: "bg-orange-500 text-white", icon: Clock },
    "Dış Servis": { color: "bg-gray-500 text-white", icon: Settings },
    "Onay Bekleniyor": { color: "bg-purple-500 text-white", icon: User },
    "İptal Edildi": { color: "bg-red-500 text-white", icon: X },
} as const;
