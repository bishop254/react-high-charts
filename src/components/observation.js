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

function Observation() {
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [selectedDates, setSelectedDates] = useState("");
  const [selectedData, setSelectedData] = useState([]);
  const [saGP, setSaGP] = useState([]);
  const [saOI, setSaOI] = useState([]);
  const [saRMaNC, setSaRMaNC] = useState([]);
  const [saRMiNC, setSaRMiNC] = useState([]);
  const [saMiNC, setSaMiNC] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  const [chartType, setChartType] = useState("column");
  const [viewMode, setViewMode] = useState("chart");

  const allSuppliers = Array.from(
    new Set(
      supplierAssessmentData.map((item) => item["vendor"]["supplierName"])
    )
  );

  const auditSubmitted = supplierAssessmentData.filter(
    (item) => item.auditorAssignmentSubmission?.type == 2
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
      text: "Observation Drilldown",
      style: { color: navigosPalette.neutral[0] },
    },
    xAxis: {
      type: "category",
      labels: {
        style: { color: navigosPalette.neutral[0] },
      },
    },
    yAxis: {
      title: { text: "Values" },
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

              if (pointName === "SA Scheduled") dataToShow = saGP;
              else if (pointName === "SA Completed") dataToShow = saOI;

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
        name: "Observations",
        colorByPoint: true,
        data: [
          {
            name: "Good Practices",
            y: saGP.length,
          },
          {
            name: "Opportunity for Improvement",
            y: saOI.length,
          },
          {
            name: "Regulatory Major Non-Compliance",
            y: saRMaNC.length,
          },
          {
            name: "Regulatory Minor Non-Compliance",
            y: saRMiNC.length,
          },
          {
            name: "Minor Non-Compliance",
            y: saMiNC.length,
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
    let filtered = [...auditSubmitted];

    console.log(selectedSupplier);

    if (selectedSupplier.length > 0) {
      filtered = filtered.filter((item) =>
        selectedSupplier.includes(item.vendor?.supplierName)
      );
    }

    console.log(filtered);

    if (selectedDates) {
      const [start, end] = selectedDates;
      filtered = filtered.filter((item) => {
        const date = new Date(item.auditEndDate);
        return date >= new Date(start) && date <= new Date(end);
      });
    }

    const trimmed = filtered
      .filter((item) =>
        item.supplierActions?.some((a) => a.categoryOfFinding === 1)
      )
      .map((item) => ({
        ...item,
        supplierActions: item.supplierActions.filter(
          (a) => a.categoryOfFinding === 1
        ),
      }));
    setSaGP(trimmed);

    const trimmed2 = filtered
      .filter((item) =>
        item.supplierActions?.some((a) => a.categoryOfFinding === 2)
      )
      .map((item) => ({
        ...item,
        supplierActions: item.supplierActions.filter(
          (a) => a.categoryOfFinding === 2
        ),
      }));
    setSaOI(trimmed2);

    const trimmed3 = filtered
      .filter((item) =>
        item.supplierActions?.some((a) => a.categoryOfFinding === 3)
      )
      .map((item) => ({
        ...item,
        supplierActions: item.supplierActions.filter(
          (a) => a.categoryOfFinding === 3 && a.nonComplianceType === 1
        ),
      }));
    setSaRMaNC(trimmed3);

    const trimmed4 = filtered
      .filter((item) =>
        item.supplierActions?.some((a) => a.categoryOfFinding === 3)
      )
      .map((item) => ({
        ...item,
        supplierActions: item.supplierActions.filter(
          (a) => a.categoryOfFinding === 3 && a.nonComplianceType === 2
        ),
      }));
    setSaRMiNC(trimmed4);

    const trimmed5 = filtered
      .filter((item) =>
        item.supplierActions?.some((a) => a.categoryOfFinding === 3)
      )
      .map((item) => ({
        ...item,
        supplierActions: item.supplierActions.filter(
          (a) => a.categoryOfFinding === 3 && a.nonComplianceType === 3
        ),
      }));
    setSaMiNC(trimmed5);

    setSelectedData(filtered);
  }, [selectedSupplier, selectedDates]);

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
        {/* <div>
          <Button label="Category" className="p-button-primary m-1" />
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
        </div> */}
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
          <Column field="assessmentStartDate" header="Assessment Start Date" />
          <Column
            header="Status"
            body={(rowData) =>
              rowData.assessmentStartDate == null
                ? "Not Started"
                : rowData.supplierAssignmentSubmission?.type === 0
                ? "Scheduled"
                : "Completed"
            }
          />
        </DataTable>
      )}

      <div>
        <div>
          <strong>Caption:</strong> Self Assessment summary
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
          <Column field="assessmentStartDate" header="Assessment Start Date" />
          <Column
            header="Status"
            body={(rowData) =>
              rowData.assessmentStartDate == null
                ? "Not Started"
                : rowData.supplierAssignmentSubmission?.type === 0
                ? "Scheduled"
                : "Completed"
            }
          />
        </DataTable>
      </Dialog>
    </div>
  );
}

export default Observation;
