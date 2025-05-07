import supplierAssessmentData from "../data/supplierAssignmentWithAuditorandActions.json";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

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

  console.log(supplierAssessmentData);

  return (
    <div className="App">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

export default SelfAssessments;
