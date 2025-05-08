import supplierAssessmentData from "../data/supplierAssignmentWithAuditorandActions.json";
import categoryData from "../data/categories.json";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "../App.css";
import { Dropdown } from "primereact/dropdown";
import { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import drilldown from "highcharts/modules/drilldown";
import exporting from "highcharts/modules/exporting";
import offlineExporting from "highcharts/modules/offline-exporting";
import exportData from "highcharts/modules/export-data";

function SelfAssessments() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedDates, setSelectedDates] = useState("");
  const [selectedData, setSelectedData] = useState([]);
  const [saScheduled, setSaScheduled] = useState([]);
  const [saCompleted, setSaCompleted] = useState([]);
  const [saNotStarted, setSaNotStarted] = useState([]);

  const allLocations = Array.from(
    new Set(
      supplierAssessmentData.map((item) => item["vendor"]["supplierLocation"])
    )
  );
  const allSuppliers = Array.from(
    new Set(
      supplierAssessmentData.map((item) => item["vendor"]["supplierName"])
    )
  );

  useEffect(() => {
    setSelectedData(supplierAssessmentData);
  }, [supplierAssessmentData]);

  useEffect(() => {
    let filtered = [...supplierAssessmentData];

    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => item.vendor?.supplierCategory == selectedCategory
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(
        (item) =>
          item.vendor?.supplierLocation.toLowerCase() ===
          selectedLocation.toLowerCase()
      );
    }

    if (selectedSupplier) {
      filtered = filtered.filter(
        (item) =>
          item.vendor?.supplierName.toLowerCase() ===
          selectedSupplier.toLowerCase()
      );
    }

    if (selectedDates) {
      const [start, end] = selectedDates;
      filtered = filtered.filter((item) => {
        const date = new Date(item.assessmentStartDate);
        return date >= new Date(start) && date <= new Date(end);
      });
    }

    setSaScheduled(
      filtered.filter(
        (item) =>
          item.assessmentStartDate !== null &&
          item.supplierAssignmentSubmission?.type === 0
      )
    );
    setSaCompleted(
      filtered.filter(
        (item) =>
          item.assessmentStartDate !== null &&
          item.supplierAssignmentSubmission?.type === 1
      )
    );
    setSaNotStarted(
      filtered.filter((item) => item.assessmentStartDate == null)
    );

    setSelectedData(filtered);
  }, [
    selectedCategory,
    selectedLocation,
    selectedSupplier,
    selectedDates,
    supplierAssessmentData,
  ]);

  const options = {
    chart: { type: "column" },
    title: { text: "SA Drilldown" },
    xAxis: { type: "category" },
    legend: { enabled: true },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: { enabled: true },
      },
    },
    tooltip: {
      headerFormat: "<span style='font-size:11px'>{series.name}</span><br>",
      pointFormat:
        "<span style='color:{point.color}'>{point.name}</span>: <b>{point.y}</b> assessments<br/>",
    },
    series: [
      {
        name: "Self Assessments",
        colorByPoint: true,
        data: [
          {
            name: "SA Scheduled",
            y: saScheduled.length,
            drilldown: "saScheduled",
          },
          {
            name: "SA Completed",
            y: saCompleted.length,
            drilldown: "saCompleted",
          },
          {
            name: "SA Not Started",
            y: saNotStarted.length,
            drilldown: "saNotStarted",
          },
        ],
      },
    ],
    drilldown: {
      series: [
        {
          id: "saScheduled",
          data: saScheduled.map((item) => [
            item.vendor?.supplierName || "Unknown",
            1,
          ]),
        },
        {
          id: "saCompleted",
          data: saCompleted.map((item) => [
            item.vendor?.supplierName || "Unknown",
            1,
          ]),
        },
        {
          id: "saNotStarted",
          data: saNotStarted.map((item) => [
            item.vendor?.supplierName || "Unknown",
            1,
          ]),
        },
      ],
    },
    exporting: {
      enabled: true,
      fallbackToExportServer: false,
      sourceWidth: 800,
      sourceHeight: 400,
    },
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedLocation("");
    setSelectedSupplier("");
    setSelectedDates("");
    setSelectedData(supplierAssessmentData);
  };

  return (
    <div>
      <div className="filterHeader">
        <div>
          <Button label="Category" className="m-1" />
          <Dropdown
            className="m-1"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.value)}
            options={categoryData}
            optionLabel="name"
            placeholder="Select a Category"
            checkmark={true}
            highlightOnSelect={false}
          />
        </div>
        <div>
          <Button label="Location" className="m-1" />
          <Dropdown
            className="m-1"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.value)}
            options={allLocations}
            placeholder="Select a Location"
            checkmark={true}
            highlightOnSelect={false}
          />
        </div>
        <div>
          <Button label="Supplier" className="m-1" />
          <Dropdown
            className="m-1"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.value)}
            options={allSuppliers}
            placeholder="Select a Supplier"
            checkmark={true}
            highlightOnSelect={false}
          />
        </div>
        <div>
          <Button label="Date Range" className="m-1" />
          <Calendar
            className="m-1"
            value={selectedDates}
            onChange={(e) => setSelectedDates(e.value)}
            selectionMode="range"
            readOnlyInput
            hideOnRangeSelection
          />
        </div>
        <div>
          <Button
            onClick={() => clearFilters()}
            severity="danger"
            label="Clear"
            className="m-1"
          />
        </div>
      </div>
      <hr />
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

export default SelfAssessments;
