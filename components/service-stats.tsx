export function ServiceStats() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Periyodik Bakım</div>
          <div className="text-sm text-muted-foreground">42%</div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-full w-[42%] rounded-full bg-primary"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Motor Arızası</div>
          <div className="text-sm text-muted-foreground">18%</div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-full w-[18%] rounded-full bg-primary"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Elektrik/Elektronik</div>
          <div className="text-sm text-muted-foreground">15%</div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-full w-[15%] rounded-full bg-primary"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Fren Sistemi</div>
          <div className="text-sm text-muted-foreground">12%</div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-full w-[12%] rounded-full bg-primary"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Diğer</div>
          <div className="text-sm text-muted-foreground">13%</div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-full w-[13%] rounded-full bg-primary"></div>
        </div>
      </div>
    </div>
  )
}
