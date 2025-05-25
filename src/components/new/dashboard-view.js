import React, { useState } from "react";
import { DashboardCard } from "./dashboard-cards";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";

const DashboardView = ({ jsonData, dateFilter }) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const cards = [
    generateCalibrationStats(jsonData, dateFilter),
    generateAverageMSIStats(jsonData),
    {
      title: "% of TVSM supplier spend covered by on-site MSI Calibration",
      value: "76%",
      trend: 5.0,
      trendPositive: true,
      data: [1, 2, 3, 4, 3, 2, 1],
    },
    generateRegulatoryNCStats(jsonData),
  ];

  const handleCardClick = (index) => {
    setSelectedCardIndex(index);
    setModalVisible(true);
  };

  const getTableDataForCard = (index) => {
    switch (index) {
      case 0:
        return jsonData.filter((item) => item.auditStartDate);
      case 1:
        return jsonData.filter(
          (item) =>
            item.auditStartDate &&
            typeof item?.auditorAssignmentSubmission?.auditorMSIScore ===
              "number"
        );
      default:
        return [];
    }
  };

  return (
    <>
      <div className="flex flex-wrap lg:flex-nowrap justify-content-center gap-3 mt-4">
        {cards.map((item, index) => {
          const isLineChart = index === 0 || index === 1;

          return (
            <div
              key={index}
              className="w-full sm:w-12 md:w-8 lg:w-3 cursor-pointer"
              onClick={() => handleCardClick(index)}
            >
              <DashboardCard
                title={item.title}
                value={item.value}
                trend={item.trend}
                trendPositive={item.trendPositive}
                chartOptions={{
                  chart: { type: "line", height: 100 },
                  title: { text: undefined },
                  xAxis: { visible: false },
                  yAxis: { visible: false },
                  legend: { enabled: false },
                  credits: { enabled: false },
                  tooltip: {
                    pointFormat: "<b>{point.y}</b>",
                  },
                  series: [
                    {
                      data: item.data,
                      color: item.trendPositive ? "#22C55E" : "#EF4444",
                    },
                  ],
                }}
              />
            </div>
          );
        })}
      </div>

      <Dialog
        header={
          selectedCardIndex !== null
            ? cards[selectedCardIndex].title + " - Details"
            : ""
        }
        visible={modalVisible}
        style={{ width: "60vw" }}
        modal
        closable
        onHide={() => {
          setModalVisible(false);
          setSelectedCardIndex(null);
        }}
      >
        {selectedCardIndex !== null && (
          <DataTable
            value={getTableDataForCard(selectedCardIndex)}
            paginator
            rows={10}
          >
            <Column field="vendor.supplierName" header="Supplier" />
            <Column
              field="auditStartDate"
              header="Audit Start Date"
              body={(row) =>
                row.auditStartDate
                  ? new Date(row.auditStartDate).toLocaleDateString()
                  : "-"
              }
            />
            {selectedCardIndex === 1 && (
              <Column
                field="auditorAssignmentSubmission.auditorMSIScore"
                header="MSI Score"
              />
            )}
          </DataTable>
        )}
      </Dialog>
    </>
  );
};

// Group by month label
function groupByMonth(data, dateFilter) {
  const counts = {};

  data.forEach((item) => {
    const dateStr = item[dateFilter];
    if (dateStr) {
      const date = new Date(dateStr);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      counts[key] = (counts[key] || 0) + 1;
    }
  });

  return counts;
}

// Convert month map to array and categories
function getSortedMonthlyCountsAndCategories(monthMap) {
  const sorted = Object.entries(monthMap).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

  const counts = [];
  const categories = [];

  sorted.forEach(([key, count]) => {
    const [year, month] = key.split("-");
    const label = new Date(year, parseInt(month) - 1).toLocaleString(
      "default",
      { month: "short", year: "2-digit" }
    );
    counts.push(count);
    categories.push(label);
  });

  return { counts, categories };
}

// Calibration stats
function generateCalibrationStats(data, dateFilter) {
  const grouped = groupByMonth(data, dateFilter);
  const { counts: monthlyData, categories } =
    getSortedMonthlyCountsAndCategories(grouped);

  const value = monthlyData.length
    ? Math.round(
        monthlyData.reduce((sum, val) => sum + val, 0) / monthlyData.length
      )
    : 0;

  const first = monthlyData[0] || 0;
  const last = monthlyData[monthlyData.length - 1] || 0;
  const trend = first !== 0 ? ((last - first) / first) * 100 : 0;
  const trendPositive = trend >= 0;

  return {
    title: "Average Number of Calibrations conducted per month",
    value,
    trend: Math.abs(parseFloat(trend.toFixed(1))),
    trendPositive,
    data: monthlyData,
    categories,
  };
}

// MSI stats
function generateAverageMSIStats(data) {
  const scoresByMonth = {};

  data.forEach((item) => {
    const dateStr = item.auditStartDate;
    const score = item?.auditorAssignmentSubmission?.auditorMSIScore;
    if (dateStr && typeof score === "number") {
      const date = new Date(dateStr);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (!scoresByMonth[key]) scoresByMonth[key] = [];
      scoresByMonth[key].push(score);
    }
  });

  const sorted = Object.entries(scoresByMonth).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

  const monthlyCounts = [];
  const categories = [];
  const monthlyAverages = [];

  sorted.forEach(([key, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    monthlyAverages.push(avg);
    monthlyCounts.push(scores.length);

    const [year, month] = key.split("-");
    const label = new Date(year, parseInt(month) - 1).toLocaleString(
      "default",
      { month: "short", year: "2-digit" }
    );
    categories.push(label);
  });

  const overallAvg = monthlyAverages.length
    ? Math.round(
        monthlyAverages.reduce((a, b) => a + b, 0) / monthlyAverages.length
      )
    : 0;

  const first = monthlyAverages[0] || 0;
  const last = monthlyAverages[monthlyAverages.length - 1] || 0;
  const trend = first !== 0 ? ((last - first) / first) * 100 : 0;

  return {
    title: "Average MSI score of calibrated suppliers",
    value: `${overallAvg}%`,
    trend: Math.abs(parseFloat(trend.toFixed(1))),
    trendPositive: trend >= 0,
    data: monthlyCounts,
    categories,
  };
}

function generateRegulatoryNCStats(data) {
  const monthMap = {};

  data.forEach((item) => {
    const key = new Date(item.auditStartDate).toISOString().slice(0, 7);

    const hasRegulatoryNC = item.supplierActions?.some(
      (a) => a.categoryOfFinding === 3
    );

    if (hasRegulatoryNC) {
      monthMap[key] = (monthMap[key] || 0) + 1;
    }
  });

  const sorted = Object.entries(monthMap).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

  const dataPoints = sorted.map(([, val]) => val);
  const categories = sorted.map(([key]) =>
    new Date(key).toLocaleString("default", { month: "short", year: "2-digit" })
  );

  const first = dataPoints[0] || 0;
  const last = dataPoints[dataPoints.length - 1] || 0;
  const trend = first !== 0 ? ((last - first) / first) * 100 : 0;

  return {
    title: "Total No. of open Regulatory Non-compliances",
    value: dataPoints.reduce((a, b) => a + b, 0),
    trend: Math.abs(trend.toFixed(1)),
    trendPositive: trend >= 0,
    data: dataPoints,
    categories,
  };
}

export default DashboardView;
