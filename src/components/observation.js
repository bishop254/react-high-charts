import React, { useEffect, useState } from "react";
import supplierAssessmentData from "../data/supplierAssignmentWithAuditorandActions.json";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "../App.css";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import categoryData from "../data/categories.json";

import drilldown from "highcharts/modules/drilldown";
import exporting from "highcharts/modules/exporting";
import offlineExporting from "highcharts/modules/offline-exporting";
import exportData from "highcharts/modules/export-data";
function Observation() {
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [selectedDates, setSelectedDates] = useState(null);
  const [filteredData, setFilteredData] = useState(supplierAssessmentData);

  const [saGP, setSaGP] = useState([]);
  const [saOI, setSaOI] = useState([]);
  const [saRMaNC, setSaRMaNC] = useState([]);
  const [saRMiNC, setSaRMiNC] = useState([]);
  const [saMiNC, setSaMiNC] = useState([]);

  const [viewMode, setViewMode] = useState("chart");
  const [chartType, setChartType] = useState("column");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  const getCategoryName = (value) => {
    const cat = categoryData.find((c) => c.value === value);
    return cat ? cat.name : String(value);
  };

  const allSuppliers = React.useMemo(
    () => [
      ...new Set(
        supplierAssessmentData.map((item) => item.vendor.supplierName)
      ),
    ],
    []
  );

  const auditSubmitted = React.useMemo(
    () =>
      supplierAssessmentData.filter(
        (item) => item.auditorAssignmentSubmission?.type === 2
      ),
    []
  );

  const palette = {
    primary: "#2F80ED",
    secondary: ["#56CCF2", "#27AE60", "#F2994A", "#EB5757"],
    neutral: ["#333333", "#828282", "#BDBDBD", "#E0E0E0", "#F2F2F2"],
  };

  const options = React.useMemo(
    () => ({
      chart: {
        type: chartType,
        backgroundColor: "#FFFFFF",
        style: { fontFamily: "Inter, Roboto, sans-serif" },
      },
      title: {
        text: "Observation Drilldown",
        style: { color: palette.neutral[0] },
      },
      xAxis: {
        type: "category",
        labels: { style: { color: palette.neutral[0] } },
      },
      yAxis: {
        title: { text: "Values" },
        labels: { style: { color: palette.neutral[0] } },
        gridLineColor: palette.neutral[3],
      },
      legend: { enabled: true, itemStyle: { color: palette.neutral[0] } },
      plotOptions: {
        series: {
          borderWidth: 0,
          animation: false,
          dataLabels: {
            enabled: true,
            style: { color: palette.neutral[0], textOutline: "none" },
          },
          point: {
            events: {
              click() {
                const { name } = this;
                let dataMap = {
                  "Good Practices": saGP,
                  "Opportunity for Improvement": saOI,
                  "Regulatory Major Non-Compliance": saRMaNC,
                  "Regulatory Minor Non-Compliance": saRMiNC,
                  "Minor Non-Compliance": saMiNC,
                };
                setModalTitle(name);
                setModalData(dataMap[name] || []);
                setIsModalVisible(true);
              },
            },
          },
        },
      },
      tooltip: {
        backgroundColor: "#FFFFFF",
        borderColor: palette.primary,
        style: { color: palette.neutral[0] },
        headerFormat: "<span style='font-size:11px'>{series.name}</span><br>",
        pointFormat:
          "<span style='color:{point.color}'>{point.name}</span>: <b>{point.y}</b> assessments<br/>",
      },
      colors: [palette.primary, ...palette.secondary],
      series: [
        {
          name: "Observations",
          colorByPoint: true,
          data: [
            { name: "Good Practices", y: saGP.length },
            { name: "Opportunity for Improvement", y: saOI.length },
            { name: "Regulatory Major Non-Compliance", y: saRMaNC.length },
            { name: "Regulatory Minor Non-Compliance", y: saRMiNC.length },
            { name: "Minor Non-Compliance", y: saMiNC.length },
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
        keyboardNavigation: { enabled: true },
        point: {
          valueDescriptionFormat:
            "{index}. {point.name}, {point.y} assessments.",
        },
      },
    }),
    [chartType, saGP, saOI, saRMaNC, saRMiNC, saMiNC]
  );

  useEffect(() => {
    let data = [...auditSubmitted];
    if (selectedSupplier.length) {
      data = data.filter((item) =>
        selectedSupplier.includes(item.vendor.supplierName)
      );
    }
    if (selectedDates) {
      const [start, end] = selectedDates;
      data = data.filter((item) => {
        const d = new Date(item.auditEndDate);
        return d >= new Date(start) && d <= new Date(end);
      });
    }
    setFilteredData(data);

    const categorize = (cat, typeFilter) =>
      data
        .filter((item) =>
          item.supplierActions?.some((a) => a.categoryOfFinding === cat)
        )
        .map((item) => ({
          ...item,
          supplierActions: item.supplierActions.filter(
            (a) =>
              a.categoryOfFinding === cat &&
              (!typeFilter || a.nonComplianceType === typeFilter)
          ),
        }));

    setSaGP(categorize(1));
    setSaOI(categorize(2));
    setSaRMaNC(categorize(3, 1));
    setSaRMiNC(categorize(3, 2));
    setSaMiNC(categorize(3, 3));
  }, [selectedSupplier, selectedDates, auditSubmitted]);

  const clearFilters = () => {
    setSelectedSupplier([]);
    setSelectedDates(null);
    setFilteredData(supplierAssessmentData);
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
        <div>
          <Button label="Supplier" className="m-1" />
          <MultiSelect
            value={selectedSupplier}
            options={allSuppliers}
            onChange={(e) => setSelectedSupplier(e.value)}
            placeholder="Select Suppliers"
            display="chip"
            className="m-1"
          />
        </div>
        <div>
          <Button label="Date Range" className="m-1" />
          <Calendar
            value={selectedDates}
            onChange={(e) => setSelectedDates(e.value)}
            selectionMode="range"
            readOnlyInput
            hideOnRangeSelection
            className="m-1"
          />
        </div>
        <div>
          <Button
            label="Clear"
            severity="danger"
            onClick={clearFilters}
            className="m-1"
          />
        </div>
      </div>
      <hr />

      {viewMode === "chart" ? (
        <HighchartsReact highcharts={Highcharts} options={options} />
      ) : (
        <DataTable value={filteredData} paginator rows={10}>
          <Column field="id" header="ID" />
          <Column field="vendor.supplierName" header="Supplier" />
          <Column field="vendor.supplierLocation" header="Location" />
          <Column
            field="vendor.supplierCategory"
            header="Category"
            body={(row) => getCategoryName(row.vendor.supplierCategory)}
          />
          <Column
            field="assessmentStartDate"
            header="Assessment Start Date"
            body={(row) =>
              row.assessmentStartDate
                ? new Date(row.assessmentStartDate).toLocaleDateString()
                : "-"
            }
          />
          <Column
            field="auditStartDate"
            header="Audit Start Date"
            body={(row) =>
              row.auditStartDate
                ? new Date(row.auditStartDate).toLocaleDateString()
                : "-"
            }
          />
          <Column
            field="auditEndDate"
            header="Audit End Date"
            body={(row) =>
              row.auditEndDate
                ? new Date(row.auditEndDate).toLocaleDateString()
                : "-"
            }
          />
          <Column
            header="Submission Status"
            body={(row) =>
              row.supplierAssignmentSubmission?.type === 0
                ? "Scheduled"
                : row.supplierAssignmentSubmission?.type === 1
                ? "Completed"
                : "-"
            }
          />
          <Column
            field="supplierAssignmentSubmission.supplierMSIScore"
            header="Supplier Score"
          />
          <Column
            field="auditorAssignmentSubmission.auditorMSIScore"
            header="Auditor Score"
          />
        </DataTable>
      )}

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
          <Column field="id" header="ID" />
          <Column field="vendor.supplierName" header="Supplier" />
          <Column field="vendor.supplierLocation" header="Location" />
          <Column
            field="vendor.supplierCategory"
            header="Category"
            body={(row) => getCategoryName(row.vendor.supplierCategory)}
          />
          <Column
            field="assessmentStartDate"
            header="Assessment Start Date"
            body={(row) =>
              row.assessmentStartDate
                ? new Date(row.assessmentStartDate).toLocaleDateString()
                : "-"
            }
          />
          <Column
            field="auditStartDate"
            header="Audit Start Date"
            body={(row) =>
              row.auditStartDate
                ? new Date(row.auditStartDate).toLocaleDateString()
                : "-"
            }
          />
          <Column
            field="auditEndDate"
            header="Audit End Date"
            body={(row) =>
              row.auditEndDate
                ? new Date(row.auditEndDate).toLocaleDateString()
                : "-"
            }
          />
          <Column
            header="Submission Status"
            body={(row) =>
              row.supplierAssignmentSubmission?.type === 0
                ? "Scheduled"
                : row.supplierAssignmentSubmission?.type === 1
                ? "Completed"
                : "-"
            }
          />
          <Column
            field="supplierAssignmentSubmission.supplierMSIScore"
            header="Supplier Score"
          />
          <Column
            field="auditorAssignmentSubmission.auditorMSIScore"
            header="Auditor Score"
          />
        </DataTable>
      </Dialog>
    </div>
  );
}

export default Observation;
