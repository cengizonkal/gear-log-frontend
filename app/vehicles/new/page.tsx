"use client";
import { VehicleRegistrationForm } from "@/components/vehicle-registration-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function NewVehiclePage() {
  return (
    <Suspense>
      <NewVehiclePageContent />
    </Suspense>
  );
}

function NewVehiclePageContent() {
  const searchParams = useSearchParams();
  const licensePlate = searchParams.get("license_plate");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <VehicleRegistrationForm initialLicensePlate={licensePlate || ""} />
    </div>
  );
}