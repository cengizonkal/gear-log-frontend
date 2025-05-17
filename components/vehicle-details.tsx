import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { apiService } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface VehicleDetailsProps {
  vehicle: any;
  onVehicleUpdate: (vehicle: any) => void;
}

export function VehicleDetails({
  vehicle,
  onVehicleUpdate,
}: VehicleDetailsProps) {
  const [mileage, setMileage] = useState(vehicle.mileage || "");
  const [vin, setVin] = useState(vehicle.vin || "");
  const [year, setYear] = useState(vehicle.year || "");
  const [engineCapacity, setEngineCapacity] = useState(
    vehicle.engine_capacity || ""
  );
  const [weight, setWeight] = useState(vehicle.weight || "");
  const [brands, setBrands] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFuelType, setSelectedFuelType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMileage(vehicle.mileage || "");
    setVin(vehicle.vin || "");
    setYear(vehicle.year || "");
    setEngineCapacity(vehicle.engine_capacity || "");
    setWeight(vehicle.weight || "");
  }, [
    vehicle.mileage,
    vehicle.vin,
    vehicle.year,
    vehicle.engine_capacity,
    vehicle.weight,
  ]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apiService.brands.getAll();
        setBrands(response.data.data);
        const brand = response.data.data.find((b) => b.name === vehicle.brand);
        if (brand) {
          setSelectedBrand(brand.id.toString());
          setModels(brand.models);
          const model = brand.models.find(
            (m) => m.name === vehicle.vehicle_model
          );
          if (model) setSelectedModel(model.id.toString());
        }
      } catch (err) {
        // handle error
      }
    };
    fetchBrands();
  }, [vehicle.brand, vehicle.vehicle_model]);

  useEffect(() => {
    const fetchFuelTypes = async () => {
      try {
        const response = await apiService.fuelTypes.getAll();
        setFuelTypes(response.data.data);
        const fuel = response.data.data.find(
          (f) => f.name === vehicle.fuel_type
        );
        if (fuel) setSelectedFuelType(fuel.name);
      } catch (err) {
        // handle error
      }
    };
    fetchFuelTypes();
  }, [vehicle.fuel_type]);

  useEffect(() => {
    if (selectedBrand) {
      const brand = brands.find((b) => b.id.toString() === selectedBrand);
      setModels(brand?.models || []);
      if (
        brand &&
        brand.models.length > 0 &&
        !brand.models.find((m) => m.id.toString() === selectedModel)
      ) {
        setSelectedModel("");
      }
    } else {
      setModels([]);
      setSelectedModel("");
    }
  }, [selectedBrand, brands]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await apiService.vehicles.update(vehicle.license_plate, {
        mileage,
        vin,
        fuel_type: selectedFuelType,
        vehicle_model: selectedModel,
        year,
        engine_capacity: engineCapacity,
        weight,
      });
      onVehicleUpdate({
        ...vehicle,
        ...response.data.data,
        fuel_type: selectedFuelType,
        vehicle_model:
          models.find((m) => m.id.toString() === selectedModel)?.name ||
          vehicle.vehicle_model,
        brand:
          brands.find((b) => b.id.toString() === selectedBrand)?.name ||
          vehicle.brand,
      });
      toast({
        title: "Kaydedildi",
        description: response.data.message,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Aracı kaydederken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h3 className="text-lg font-semibold mb-4">Araç Detayları</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Marka:</span>
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-2/3">
              <SelectValue placeholder="Marka seçin" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand: any) => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Model:</span>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-2/3">
              <SelectValue placeholder="Model seçin" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model: any) => (
                <SelectItem key={model.id} value={model.id.toString()}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Yakıt Türü:</span>
          <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
            <SelectTrigger className="w-2/3">
              <SelectValue placeholder="Yakıt türü seçin" />
            </SelectTrigger>
            <SelectContent>
              {fuelTypes.map((fuel: any) => (
                <SelectItem key={fuel.id} value={fuel.name}>
                  {fuel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Kilometre:</span>
          <Input
            type="text"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className="w-2/3"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">VIN:</span>
          <Input
            type="text"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            className="w-2/3"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Yıl:</span>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-2/3"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Motor Hacmi (cc):
          </span>
          <Input
            type="number"
            value={engineCapacity}
            onChange={(e) => setEngineCapacity(e.target.value)}
            className="w-2/3"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Ağırlık (kg):
          </span>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-2/3"
          />
        </div>
      </div>
      <Button onClick={handleSave} className="mt-6 w-full" disabled={loading}>
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </div>
  );
}
