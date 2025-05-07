import supplierAssessmentData from "../data/supplierAssignmentWithAuditorandActions.json";
import categoryData from "../data/categories.json";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "../App.css";
import { Dropdown } from "primereact/dropdown";
import { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

function SelfAssessments() {
  const options = {
    chart: {
      type: "column",
    },
    title: {
      text: "SA Completed vs Scheduled vs Not started",
    },
    subtitle: {
      text: "JSON Data",
    },
    navigation: {
      buttonOptions: {
        enabled: true,
        align: "right",
      },
    },
    xAxis: {
      categories: ["Self Assessments"],
      crosshair: true,
      accessibility: {
        description: "Self Assessments",
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "No. of Assessments",
      },
    },
    tooltip: {
      valueSuffix: " (Assessments)",
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    series: [
      {
        name: "SA Scheduled",
        data: [
          supplierAssessmentData
            .filter((item) => item["assessmentStartDate"] !== null)
            .filter((item) => item.supplierAssignmentSubmission?.type == 0)
            .length,
        ],
      },
      {
        name: "SA Completed",
        data: [
          supplierAssessmentData
            .filter((item) => item["assessmentStartDate"] !== null)
            .filter((item) => item.supplierAssignmentSubmission?.type == 1)
            .length,
        ],
      },
      {
        name: "SA Not Started",
        data: [
          supplierAssessmentData.filter(
            (item) => item["assessmentStartDate"] == null
          ).length,
        ],
      },
    ],
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedDates, setSelectedDates] = useState("");

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
      </div>
      <hr />
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

export default SelfAssessments;
