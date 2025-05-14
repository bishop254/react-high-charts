import "./App.css";

import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-cyan/theme.css";

import supplierAssessmentData from "./data/supplierAssignmentWithAuditorandActions.json";
import categoryData from "./data/categories.json";
import AssessmentDashboard from "./components/AssessmentDashboard";
// import Observation from "./components/observation";

function App() {
  const getCategoryName = (value) => {
    const cat = categoryData.find((c) => c.value === value);
    return cat ? cat.name : String(value);
  };
  return (
    <PrimeReactProvider>
      <div className="App">
        <AssessmentDashboard
          data={supplierAssessmentData}
          categoryOptions={categoryData}
          title="Self Assessment Drilldown"
          dateField="assessmentStartDate"
          submissionField="supplierAssignmentSubmission"
          statuses={[
            { label: "SA Scheduled", type: 0 },
            { label: "SA Completed", type: 1 },
          ]}
          tableColumns={[
            { field: "vendor.supplierName", header: "Supplier" },
            { field: "vendor.supplierLocation", header: "Location" },
            {
              field: "vendor.supplierCategory",
              header: "Category",
              body: (row) => getCategoryName(row.vendor.supplierCategory),
            },
            { field: "assessmentStartDate", header: "Assessment Start Date" },
          ]}
          caption="Self Assessment summary"
          sourceText="Data source: Internal ESG Reports"
        />

        <AssessmentDashboard
          data={supplierAssessmentData}
          categoryOptions={categoryData}
          title="Audits Drilldown"
          dateField="auditStartDate"
          submissionField="auditorAssignmentSubmission"
          statuses={[
            { label: "Audits Scheduled", type: 0 },
            { label: "Audits Completed", type: 1 },
            { label: "Audits Released", type: 2 },
          ]}
          tableColumns={[
            { field: "vendor.supplierName", header: "Supplier" },
            { field: "vendor.supplierLocation", header: "Location" },
            {
              field: "vendor.supplierCategory",
              header: "Category",
              body: (row) => getCategoryName(row.vendor.supplierCategory),
            },
            { field: "auditStartDate", header: "Audit Start Date" },
          ]}
          caption="Audit summary"
          sourceText="Data source: Internal ESG Reports"
        />

        {/* <Observation/> */}
        <AssessmentDashboard
          data={supplierAssessmentData}
          categoryOptions={categoryData}
          title="Observation Drilldown"
          dateField="auditEndDate" // or auditStartDate, whatever you want to filter on
          submissionField="supplierActions"
          statuses={[
            { label: "Good Practices", type: 1 },
            { label: "Opportunity for Improvement", type: 2 },
            { label: "Regulatory Major NC", type: 3, subtype: 1 },
            { label: "Regulatory Minor NC", type: 3, subtype: 2 },
            { label: "Minor NC", type: 3, subtype: 3 },
          ]}
          tableColumns={[
            { field: "vendor.supplierName", header: "Supplier" },
            { field: "vendor.supplierLocation", header: "Location" },
            {
              field: "vendor.supplierCategory",
              header: "Category",
              body: (row) => getCategoryName(row.vendor.supplierCategory),
            },
            { field: "assessmentStartDate", header: "Assessment Start Date" },
            // …etc
          ]}
          caption="Observation summary"
          sourceText="Data source: Internal ESG Reports"
        />
      </div>
    </PrimeReactProvider>
  );
}

export default App;
