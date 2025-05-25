// DashboardChartCard.tsx
import React from "react";
import { Card } from "primereact/card";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

export const DashboardChartCard = ({
  title,
  subtitle,
  chartOptions,
  onButtonClick,
  buttonLabel,
  borderColor = "#d1d5db",
}) => {
  return (
    <Card
      title={
        <div className="flex align-items-center gap-2">
          <span
            className="text-sm"
            style={{ color: borderColor, fontWeight: "bold" }}
          >
            ●
          </span>
          {title}
        </div>
      }
      subTitle={subtitle}
      className="h-full"
      style={{ borderTop: `4px solid ${borderColor}` }}
    >
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      <div className="mt-2">
        <button onClick={onButtonClick} className="p-button p-button-sm">
          {buttonLabel}
        </button>
      </div>
    </Card>
  );
};
