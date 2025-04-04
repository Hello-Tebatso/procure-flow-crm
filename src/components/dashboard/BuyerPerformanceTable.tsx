
import { BuyerPerformance } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface BuyerPerformanceTableProps {
  data: BuyerPerformance[];
}

const BuyerPerformanceTable: React.FC<BuyerPerformanceTableProps> = ({ data }) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-procurement-primary text-white">
            <TableHead className="text-white">Buyer</TableHead>
            <TableHead className="text-white text-right">Total Lines</TableHead>
            <TableHead className="text-white text-right">Pending</TableHead>
            <TableHead className="text-white text-right">On Time</TableHead>
            <TableHead className="text-white text-right">Late</TableHead>
            <TableHead className="text-white text-right">Delivery Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((buyer) => (
            <TableRow key={buyer.buyerId}>
              <TableCell className="font-medium">{buyer.buyerName}</TableCell>
              <TableCell className="text-right">{buyer.totalLines}</TableCell>
              <TableCell className="text-right">{buyer.pendingLines}</TableCell>
              <TableCell className="text-right">{buyer.deliveredOnTime}</TableCell>
              <TableCell className="text-right">{buyer.deliveredLate}</TableCell>
              <TableCell className="text-right">
                <Badge className={
                  buyer.deliveredOnTimePercentage >= 90 
                    ? "bg-green-100 text-green-800 hover:bg-green-100" 
                    : buyer.deliveredOnTimePercentage >= 70
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }>
                  {buyer.deliveredOnTimePercentage}%
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                No performance data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BuyerPerformanceTable;
