import supplierAssessmentData from "../data/supplierAssignmentWithAuditorandActions.json";
import categoryData from "../data/categories.json";
import Highcharts, { chart } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "../App.css";
import { Dropdown } from "primereact/dropdown";
import { useEffect, useState, useRef } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import drilldown from "highcharts/modules/drilldown";
import exporting from "highcharts/modules/exporting";
import offlineExporting from "highcharts/modules/offline-exporting";
import exportData from "highcharts/modules/export-data";

function Audits() {
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [selectedDates, setSelectedDates] = useState("");
  const [selectedData, setSelectedData] = useState([]);
  const [auditScheduled, setAuditScheduled] = useState([]);
  const [auditCompleted, setAuditCompleted] = useState([]);
  const [auditReleased, setAuditReleased] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  const [chartType, setChartType] = useState("column");
  const [viewMode, setViewMode] = useState("chart");

  const chartRef = useRef(null);

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

  const navigosPalette = {
    primary: "#2F80ED",
    secondary: ["#56CCF2", "#27AE60", "#F2994A", "#EB5757"],
    neutral: ["#333333", "#828282", "#BDBDBD", "#E0E0E0", "#F2F2F2"],
  };

  const options = {
    chart: {
      type: chartType,
      backgroundColor: "#FFFFFF",
      style: { fontFamily: "Inter, Roboto, sans-serif" },
    },
    title: {
      text: "Audits Drilldown",
      style: { color: navigosPalette.neutral[0] },
    },
    xAxis: {
      type: "category",
      labels: {
        style: { color: navigosPalette.neutral[0] },
      },
    },
    yAxis: {
      title: { text: "Audits" },
      labels: { style: { color: navigosPalette.neutral[0] } },
      gridLineColor: navigosPalette.neutral[3],
    },
    legend: {
      enabled: true,
      itemStyle: { color: navigosPalette.neutral[0] },
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        animation: false,
        dataLabels: {
          enabled: true,
          style: {
            color: "#333333",
            textOutline: "none",
          },
        },
        point: {
          events: {
            click: function () {
              const pointName = this.name;
              let dataToShow = [];

              if (pointName === "Audits Scheduled") dataToShow = auditScheduled;
              else if (pointName === "Audits Completed")
                dataToShow = auditCompleted;
              else if (pointName === "Audits Released")
                dataToShow = auditReleased;

              setModalTitle(pointName);
              setModalData(dataToShow);
              setIsModalVisible(true);
            },
          },
        },
      },
    },
    tooltip: {
      backgroundColor: "#FFFFFF",
      borderColor: navigosPalette.primary,
      style: {
        color: navigosPalette.neutral[0],
      },
      headerFormat: "<span style='font-size:11px'>{series.name}</span><br>",
      pointFormat:
        "<span style='color:{point.color}'>{point.name}</span>: <b>{point.y}</b> assessments<br/>",
    },
    colors: [navigosPalette.primary, ...navigosPalette.secondary],
    series: [
      {
        name: "Suppliers Audits",
        colorByPoint: true,
        data: [
          {
            name: "Audits Scheduled",
            y: auditScheduled.length,
          },
          {
            name: "Audits Completed",
            y: auditCompleted.length,
          },
          {
            name: "Audits Released",
            y: auditReleased.length,
          },
        ],
      },
    ],
    exporting: {
      enabled: true,
      fallbackToExportServer: false,
      sourceWidth: 800,
      sourceHeight: 400,
    },
    accessibility: {
      enabled: true,
      keyboardNavigation: {
        enabled: true,
      },
      point: {
        valueDescriptionFormat: "{index}. {point.name}, {point.y} assessments.",
      },
    },
  };

  useEffect(() => {
    setSelectedData(supplierAssessmentData);
  }, [supplierAssessmentData]);

  useEffect(() => {
    let filtered = [...supplierAssessmentData];

    if (selectedCategory.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategory.includes(item.vendor?.supplierCategory)
      );
    }

    if (selectedLocation.length > 0) {
      filtered = filtered.filter((item) =>
        selectedLocation.includes(item.vendor?.supplierLocation)
      );
    }

    if (selectedSupplier.length > 0) {
      filtered = filtered.filter((item) =>
        selectedSupplier.includes(item.vendor?.supplierName)
      );
    }

    if (selectedDates) {
      const [start, end] = selectedDates;
      filtered = filtered.filter((item) => {
        const date = new Date(item.auditStartDate);
        return date >= new Date(start) && date <= new Date(end);
      });
    }

    setAuditScheduled(
      filtered.filter(
        (item) =>
          item.auditStartDate !== null &&
          item.auditorAssignmentSubmission?.type === 0
      )
    );

    setAuditCompleted(
      filtered.filter(
        (item) =>
          item.auditStartDate !== null &&
          item.auditorAssignmentSubmission?.type === 1
      )
    );

    setAuditReleased(
      filtered.filter(
        (item) =>
          item.auditStartDate !== null &&
          item.auditorAssignmentSubmission?.type === 2
      )
    );

    setSelectedData(filtered);
  }, [selectedCategory, selectedLocation, selectedSupplier, selectedDates]);

  const clearFilters = () => {
    setSelectedCategory([]);
    setSelectedLocation([]);
    setSelectedSupplier([]);
    setSelectedDates("");
    setSelectedData(supplierAssessmentData);
  };

  return (
    <div className="chartDiv">
      <div className="filterTypeHeader">
        <Button
          label="Table View"
          icon="pi pi-table"
          onClick={() => setViewMode("table")}
          className={viewMode === "table" ? "p-button-info" : " m-1"}
        />
        <Button
          label="Chart View"
          icon="pi pi-chart-bar"
          onClick={() => setViewMode("chart")}
          className={viewMode === "chart" ? "p-button-info" : " m-1"}
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
          placeholder="Select Chart Type"
          className="m-1"
        />
      </div>

      <div className="filterHeader">
        <div>
          <Button label="Category" className="m-1" />

          <MultiSelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.value)}
            options={categoryData}
            optionLabel="name"
            display="chip"
            placeholder="Select a Category"
            maxSelectedLabels={8}
            className="m-1"
          />
        </div>
        <div>
          <Button label="Location" className="m-1" />

          <MultiSelect
            className="m-1"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.value)}
            options={allLocations}
            placeholder="Select a Location"
            optionLabel=""
            display="chip"
            maxSelectedLabels={8}
          />
        </div>
        <div>
          <Button label="Supplier" className="m-1" />

          <MultiSelect
            className="m-1"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.value)}
            options={allSuppliers}
            placeholder="Select a Supplier"
            optionLabel=""
            display="chip"
            maxSelectedLabels={8}
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

      {viewMode === "chart" ? (
        <HighchartsReact highcharts={Highcharts} options={options} />
      ) : (
        <DataTable value={selectedData} paginator rows={10}>
          <Column field="vendor.supplierName" header="Supplier" />
          <Column field="vendor.supplierLocation" header="Location" />
          <Column field="vendor.supplierCategory" header="Category" />
          <Column field="auditStartDate" header="Audit Start Date" />
          <Column
            header="Status"
            body={(rowData) =>
              rowData.auditStartDate == null
                ? "Not Started"
                : rowData.auditorAssignmentSubmission?.type === 0
                ? "Scheduled"
                : rowData.auditorAssignmentSubmission?.type === 1
                ? "Completed"
                : "Released"
            }
          />
        </DataTable>
      )}

      <div>
        <div>
          <strong>Caption:</strong> Audit summary
        </div>
        <div className="filterHeader">
          <div>
            <em>Data source: Internal ESG Reports</em>
          </div>
          <div>
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
                    .map((d) => d?.toLocaleDateString())
                    .join(" - ")}`,
              ]
                .filter(Boolean)
                .join(" | ")}
            </em>
          </div>
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
          stripedRows
          responsiveLayout="scroll"
        >
          <Column field="vendor.supplierName" header="Supplier" />
          <Column field="vendor.supplierLocation" header="Location" />
          <Column field="vendor.supplierCategory" header="Category" />
          <Column field="auditStartDate" header="Audit Start Date" />
          <Column
            header="Status"
            body={(rowData) =>
              rowData.auditStartDate == null
                ? "Not Started"
                : rowData.auditorAssignmentSubmission?.type === 0
                ? "Scheduled"
                : rowData.auditorAssignmentSubmission?.type === 1
                ? "Completed"
                : "Released"
            }
          />
        </DataTable>
      </Dialog>
    </div>
  );
}

export default Audits;
