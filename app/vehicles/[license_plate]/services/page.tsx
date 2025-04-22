import { apiService } from "@/lib/api";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface ServiceProps {
  id: number;
  started_at: string | null;
  finished_at: string | null;
}

interface Props {
  params: { license_plate: string }
}

const PAGE_SIZE = 10; // Define the number of services per page

export default async function VehicleServicesPage({ params }: Props) {
  const { license_plate } = params;

  const fetchServices = async (page: number = 1) => {
    try {
      const response = await apiService.vehicles.getServices(
        license_plate,
        page,
        PAGE_SIZE
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching services:", error);
      return null;
    }
  };

  const initialData = await fetchServices(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [servicesData, setServicesData] = React.useState(initialData);

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    const newData = await fetchServices(newPage);
    if (newData) setServicesData(newData);
  };

  if (!servicesData || servicesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Servis Geçmişi</CardTitle>
          <CardDescription>Araç ({license_plate}) için servis geçmişi bulunamadı.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Servis Geçmişi</CardTitle>
          <CardDescription>Araç ({license_plate}) için servis geçmişi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servis No</TableHead>
                  <TableHead>Başlangıç</TableHead>
                  <TableHead className="hidden md:table-cell">Bitiş</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicesData.map((service: ServiceProps) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">#{service.id}</TableCell>
                    <TableCell>{formatDate(service.started_at)}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(service.finished_at)}</TableCell>
                    <TableCell>
                      <Badge variant={service.finished_at ? "success" : "default"}>
                        {service.finished_at ? "Tamamlandı" : "Devam Ediyor"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/services/${service.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Görüntüle</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination className="mt-4">
            <PaginationContent>
              {servicesData.links && (
                <>                
                  <PaginationItem>
                    <PaginationPrevious
                      href={servicesData.links.prev ?? "#"}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!servicesData.links.prev}
                    />
                  </PaginationItem>
                  {Array.from({ length: servicesData.meta.last_page }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={`?page=${page}`}
                        onClick={() => handlePageChange(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href={servicesData.links.next ?? "#"}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!servicesData.links.next}
                    />
                  </PaginationItem>
                </>
              )}
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </div>
  );
}