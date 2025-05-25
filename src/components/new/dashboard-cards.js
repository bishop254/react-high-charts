// DashboardCard.tsx
import React from "react";
import { Card } from "primereact/card";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

export const DashboardCard = ({
  title,
  value,
  trend,
  trendPositive = true,
  chartOptions,
}) => {
  return (
    <Card className="w-full h-full shadow-1 flex flex-column justify-content-between p-3">
      <div>
        <div className="mb-2 text-sm text-color-secondary">{title}</div>
        <div className="text-2xl font-bold text-900">{value}</div>
        <div
          className={`text-sm ${
            trendPositive ? "text-green-500" : "text-red-500"
          } flex align-items-center gap-2`}
        >
          <i
            className={`pi ${trendPositive ? "pi-arrow-up" : "pi-arrow-down"}`}
          />
          {Math.abs(trend)}%
        </div>
      </div>
      <div>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>
    </Card>
  );
};
