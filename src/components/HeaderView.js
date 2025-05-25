import React, { useState } from "react";
import { HeaderCard } from "./HeaderCard";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const HeaderView = ({ jsonData, dateFilter }) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  console.log(dateFilter);

  const cards = [
    generateCalibrationStats(jsonData),
    generateAverageMSIStats(jsonData),
    {
      title: "% of TVSM supplier spend covered by on-site MSI Calibration",
      value: "76%",
      trend: 5.0,
      trendPositive: true,
      data: [1, 2, 3, 4, 3, 2, 1],
    },
    {
      title: "Total No. of open Regulatory Non-compliances",
      value: 23,
      trend: 12.0,
      trendPositive: true,
      data: [2, 3, 4, 3, 4, 3, 5],
    },
  ];

  const getTableDataForCard = (index) => {
    switch (index) {
      case 0: // Calibration
        let returnData = jsonData.filter(
          (item) =>
            item.auditStartDate !== null &&
            (item.auditorAssignmentSubmission?.type === 2 ||
              item.auditorAssignmentSubmission?.type === 3)
        );
        console.log(returnData);
        console.log(jsonData);

        return returnData;
      case 1: // MSI
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

  const sampleChartOptions = {
    chart: { type: "line", height: 60 },
    title: { text: undefined },
    xAxis: { visible: false },
    yAxis: { visible: false },
    legend: { enabled: false },
    credits: { enabled: false },
  };

  return (
    <>
      <div className="flex flex-wrap lg:flex-nowrap justify-content-center gap-3 mt-4">
        {cards.map((item, index) => (
          <div
            key={index}
            className="w-full sm:w-12 md:w-8 lg:w-3 cursor-pointer"
          >
            <HeaderCard
              title={item.title}
              value={item.value}
              trend={item.trend}
              trendPositive={item.trendPositive}
              chartOptions={{
                ...sampleChartOptions,
                series: [
                  {
                    data: item.data,
                    color: item.trendPositive ? "#22C55E" : "#EF4444",
                  },
                ],
              }}
              jsonData={getTableDataForCard(index)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

// Helper: Group audit start dates by year-month
function groupByMonth(data, dateFilter) {
  const counts = {};

  data.forEach((item) => {
    const dateStr = item[dateFilter];
    // console.log(dateFilter, dateStr, item);

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

// Helper: Sort the months and return counts in array
function getSortedMonthlyCounts(monthMap) {
  return Object.entries(monthMap)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([, count]) => count);
}

// Main: Generate calibration stats object
function generateCalibrationStats(data, dateFilter) {
  const grouped = groupByMonth(data, dateFilter);
  const monthlyData = getSortedMonthlyCounts(grouped);

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
  };
}

// 1. Group auditor MSI scores by year-month
function groupAuditorMSIScores(data) {
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

  return scoresByMonth;
}

// 2. Get average scores per month and monthly supplier count
function extractAveragesAndCounts(scoreMap) {
  const sortedEntries = Object.entries(scoreMap).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

  const monthlyAverages = [];
  const monthlyCounts = [];

  sortedEntries.forEach(([, scores]) => {
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    monthlyAverages.push(avg);
    monthlyCounts.push(scores.length);
  });

  return { monthlyAverages, monthlyCounts };
}

// 3. Main function to generate stats
function generateAverageMSIStats(data) {
  const scoresGrouped = groupAuditorMSIScores(data);
  const { monthlyAverages, monthlyCounts } =
    extractAveragesAndCounts(scoresGrouped);

  const overallAvg = monthlyAverages.length
    ? Math.round(
        monthlyAverages.reduce((sum, val) => sum + val, 0) /
          monthlyAverages.length
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
  };
}

export default HeaderView;
