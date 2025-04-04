
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  description,
  className,
  trend,
  trendValue
}) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trendValue) && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center">
            {trend && (
              <span
                className={cn(
                  "mr-1 rounded-full p-1",
                  trend === "up" && "text-green-500",
                  trend === "down" && "text-red-500"
                )}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
              </span>
            )}
            {trendValue && <span className="mr-2">{trendValue}</span>}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
