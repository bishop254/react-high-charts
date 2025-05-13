import React, { useState, useEffect } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import drilldown from "highcharts/modules/drilldown";
import exporting from "highcharts/modules/exporting";
import offlineExporting from "highcharts/modules/offline-exporting";
import exportData from "highcharts/modules/export-data";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import "../App.css";

const AssessmentDashboard = ({
  data,
  categoryOptions,
  title,
  dateField,
  submissionField,
  statuses,
  tableColumns,
  caption,
  sourceText,
}) => {
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [selectedDates, setSelectedDates] = useState(null);

  const [filteredData, setFilteredData] = useState([]);
  const [buckets, setBuckets] = useState({});

  const [chartType, setChartType] = useState("column");
  const [viewMode, setViewMode] = useState("chart");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  const allLocations = Array.from(
    new Set(data.map((i) => i.vendor?.supplierLocation))
  );
  const allSuppliers = Array.from(
    new Set(data.map((i) => i.vendor?.supplierName))
  );

  const chartOptions = {
    chart: {
      type: chartType,
      backgroundColor: "#FFF",
      style: { fontFamily: "Inter, Roboto, sans-serif" },
    },
    title: { text: title, style: { color: "#333" } },
    xAxis: { type: "category", labels: { style: { color: "#333" } } },
    yAxis: { title: { text: "Count" }, labels: { style: { color: "#333" } } },
    legend: { enabled: true, itemStyle: { color: "#333" } },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: { enabled: true, style: { textOutline: "none" } },
        point: {
          events: {
            click() {
              const sel = this.name;
              setModalTitle(sel);
              setModalData(buckets[sel] || []);
              setIsModalVisible(true);
            },
          },
        },
      },
    },
    tooltip: {
      headerFormat: "<b>{series.name}</b><br>",
      pointFormat: "{point.name}: <b>{point.y}</b>",
    },
    colors: ["#2F80ED", "#56CCF2", "#27AE60", "#F2994A", "#EB5757"],
    series: [
      {
        name: title,
        colorByPoint: true,
        data: statuses.map((s) => ({
          name: s.label,
          y: (buckets[s.label] || []).length,
        })),
      },
    ],
    exporting: {
      enabled: true,
      fallbackToExportServer: false,
      sourceWidth: 800,
      sourceHeight: 400,
    },
    accessibility: { enabled: true, keyboardNavigation: { enabled: true } },
  };

  useEffect(() => {
    let tmp = [...data];
    if (selectedCategory.length)
      tmp = tmp.filter((d) =>
        selectedCategory.includes(d.vendor?.supplierCategory)
      );
    if (selectedLocation.length)
      tmp = tmp.filter((d) =>
        selectedLocation.includes(d.vendor?.supplierLocation)
      );
    if (selectedSupplier.length)
      tmp = tmp.filter((d) =>
        selectedSupplier.includes(d.vendor?.supplierName)
      );
    if (selectedDates) {
      const [start, end] = selectedDates;
      tmp = tmp.filter((d) => {
        const dt = new Date(d[dateField]);
        return dt >= new Date(start) && dt <= new Date(end);
      });
    }
    setFilteredData(tmp);

    const b = {};
    statuses.forEach((s) => (b[s.label] = []));
    tmp.forEach((item) => {
      const sub = item[submissionField]?.type;
      const status = statuses.find((s) => s.type === sub);
      if (status) b[status.label].push(item);
    });
    setBuckets(b);
  }, [
    data,
    selectedCategory,
    selectedLocation,
    selectedSupplier,
    selectedDates,
  ]);

  const clearFilters = () => {
    setSelectedCategory([]);
    setSelectedLocation([]);
    setSelectedSupplier([]);
    setSelectedDates(null);
  };

  return (
    <div className="chartDiv">
      <div className="filterTypeHeader">
        <Button
          label="Table View"
          icon="pi pi-table"
          onClick={() => setViewMode("table")}
          className={viewMode === "table" ? "p-button-info" : "m-1"}
        />
        <Button
          label="Chart View"
          icon="pi pi-chart-bar"
          onClick={() => setViewMode("chart")}
          className={viewMode === "chart" ? "p-button-info" : "m-1"}
        />
        <Dropdown
          value={chartType}
          options={[
            { label: "Column", value: "column" },
            { label: "Line", value: "line" },
            { label: "Bar", value: "bar" },
            { label: "Pie", value: "pie" },
          ]}
          onChange={(e) => {
            setChartType(e.value);
            setViewMode("chart");
          }}
          className="m-1"
        />
      </div>
      <div className="filterHeader">
        <MultiSelect
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.value)}
          options={categoryOptions}
          optionLabel="name"
          placeholder="Category"
          className="m-1"
        />
        <MultiSelect
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.value)}
          options={allLocations}
          placeholder="Location"
          className="m-1"
        />
        <MultiSelect
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.value)}
          options={allSuppliers}
          placeholder="Supplier"
          className="m-1"
        />
        <Calendar
          value={selectedDates}
          onChange={(e) => setSelectedDates(e.value)}
          selectionMode="range"
          readOnlyInput
          hideOnRangeSelection
          className="m-1"
        />
        <Button
          label="Clear"
          severity="danger"
          onClick={clearFilters}
          className="m-1"
        />
      </div>
      <hr />
      {viewMode === "chart" ? (
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      ) : (
        <DataTable value={filteredData} paginator rows={10}>
          {tableColumns.map((col) => (
            <Column key={col.field} field={col.field} header={col.header} />
          ))}
        </DataTable>
      )}
      <div>
        <strong>Caption:</strong> {caption}
        <div className="filterHeader">
          <em>{sourceText}</em>
          <em>
            Filtered by:{" "}
            {[
              selectedCategory.length &&
                `Category: ${selectedCategory.join(", ")}`,
              selectedLocation.length &&
                `Location: ${selectedLocation.join(", ")}`,
              selectedSupplier.length &&
                `Supplier: ${selectedSupplier.join(", ")}`,
              selectedDates &&
                `Dates: ${selectedDates
                  .map((d) => d.toLocaleDateString())
                  .join(" - ")}`,
            ]
              .filter(Boolean)
              .join(" | ")}
          </em>
        </div>
      </div>
      <Dialog
        header={modalTitle}
        visible={isModalVisible}
        style={{ width: "80vw" }}
        modal
        onHide={() => setIsModalVisible(false)}
      >
        <DataTable
          value={modalData}
          paginator
          rows={10}
          responsiveLayout="scroll"
        >
          {tableColumns.map((col) => (
            <Column key={col.field} field={col.field} header={col.header} />
          ))}
        </DataTable>
      </Dialog>
    </div>
  );
};

export default AssessmentDashboard;
