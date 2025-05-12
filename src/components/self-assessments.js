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

function SelfAssessments() {
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [selectedDates, setSelectedDates] = useState("");
  const [selectedData, setSelectedData] = useState([]);
  const [saScheduled, setSaScheduled] = useState([]);
  const [saCompleted, setSaCompleted] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

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
    chart: { type: "column", backgroundColor: "#FFFFFF" },
    title: {
      text: "SA Drilldown",
      style: { color: navigosPalette.neutral[0] }, // #333333
    },
    xAxis: {
      type: "category",
      labels: {
        style: { color: navigosPalette.neutral[0] }, // #333333
      },
    },
    yAxis: {
      title: { text: "Assessments" },
      labels: { style: { color: navigosPalette.neutral[0] } }, // #333333
      gridLineColor: navigosPalette.neutral[3], // #E0E0E0
    },
    legend: {
      enabled: true,
      itemStyle: { color: navigosPalette.neutral[0] }, // #333333
    },
    plotOptions: {
      series: {
        borderWidth: 0,
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

              if (pointName === "SA Scheduled") dataToShow = saScheduled;
              else if (pointName === "SA Completed") dataToShow = saCompleted;

              setModalTitle(pointName);
              setModalData(dataToShow);
              setIsModalVisible(true);
            },
          },
        },
      },
    },

    colors: ["#2F80ED", "#56CCF2", "#27AE60"],
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
      description: "Bar chart showing SA statuses with drilldown by vendor.",
      point: {
        valueDescriptionFormat: "{index}. {point.name}, {point.y} assessments.",
      },
    },
  };

  // const options = {
  //   chart: {
  //     type: "column",
  //     backgroundColor: "#FFFFFF",
  //     style: {
  //       fontFamily: "Inter, Roboto, sans-serif",
  //     },
  //   },
  //   title: {
  //     text: "SA Drilldown",
  //     style: {
  //       color: navigosPalette.neutral[0],
  //       fontSize: "20px",
  //       fontWeight: "bold",
  //     },
  //   },
  //   xAxis: {
  //     type: "category",
  //     labels: {
  //       style: {
  //         color: navigosPalette.neutral[0],
  //         fontSize: "14px",
  //         fontFamily: "Inter, Roboto, sans-serif",
  //       },
  //     },
  //   },
  //   yAxis: {
  //     title: {
  //       text: "Assessments",
  //       style: {
  //         fontSize: "14px",
  //         fontFamily: "Inter, Roboto, sans-serif",
  //       },
  //     },
  //     labels: {
  //       style: {
  //         color: navigosPalette.neutral[0],
  //         fontSize: "14px",
  //         fontFamily: "Inter, Roboto, sans-serif",
  //       },
  //     },
  //     gridLineColor: navigosPalette.neutral[3],
  //   },
  //   tooltip: {
  //     backgroundColor: "#FFFFFF",
  //     borderColor: navigosPalette.primary,
  //     style: {
  //       color: navigosPalette.neutral[0],
  //       fontSize: "12px",
  //       fontFamily: "Inter, Roboto, sans-serif",
  //     },
  //   },
  //   legend: {
  //     itemStyle: {
  //       color: navigosPalette.neutral[0],
  //       fontFamily: "Inter, Roboto, sans-serif",
  //       fontSize: "12px",
  //       fontStyle: "italic",
  //     },
  //   },
  //   plotOptions: {
  //     series: {
  //       borderWidth: 0,
  //       dataLabels: {
  //         enabled: true,
  //         style: {
  //           color: "#333333",
  //           textOutline: "none",
  //           fontSize: "12px",
  //           fontFamily: "Inter, Roboto, sans-serif",
  //         },
  //       },
  //     },
  //   },
  // };

  useEffect(() => {
    setSelectedData(supplierAssessmentData);
  }, [supplierAssessmentData]);

  useEffect(() => {
    const chart = chartRef.current;
    chart.drillUp();

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
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        callback={(chart) => {
          chartRef.current = chart;
        }}
      />

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
          <Column field="assessmentStartDate" header="Start Date" />
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

export default SelfAssessments;
