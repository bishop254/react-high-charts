// DashboardCard.tsx
import React from "react";
import { Card } from "primereact/card";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import categoryData from "../data/categories.json";
import AssessmentDashboard from "./AssessmentDashboard";
export const HeaderCard = ({
  title,
  value,
  trend,
  trendPositive = true,
  chartOptions,
  jsonData,
}) => {
  const getCategoryName = (value) => {
    const cat = categoryData.find((c) => c.value === value);
    return cat ? cat.name : String(value);
  };

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
        <AssessmentDashboard
          data={jsonData}
          categoryOptions={categoryData}
          title=""
          dateField="auditStartDate"
          submissionField="auditorAssignmentSubmission"
          statuses={[
            { label: "Audits Completed", type: 1 },
            { label: "Audits Released", type: 2 },
          ]}
          tableColumns={[
            { field: "vendor.supplierName", header: "Supplier" },
            { field: "vendor.supplierLocation", header: "Location" },
            {
              field: "vendor.supplierCategory",
              header: "Category",
              body: (row) => getCategoryName(row.vendor.supplierCategory),
            },
            {
              field: "auditStartDate",
              header: "Audit Start Date",
              body: (row) =>
                row.auditStartDate
                  ? new Date(row.auditStartDate).toDateString()
                  : "-",
            },
          ]}
          caption=""
          sourceText=""
          hasHeader={false}
          hasFooter={false}
          hasCss={false}
          chartOverrideType={"line"}
        />
      </div>
    </Card>
  );
};
