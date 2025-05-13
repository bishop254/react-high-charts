import "./App.css";

import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-cyan/theme.css";

import supplierAssessmentData from "./data/supplierAssignmentWithAuditorandActions.json";
import categoryData from "./data/categories.json";
import AssessmentDashboard from "./components/AssessmentDashboard";

function App() {
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
            { field: "vendor.supplierCategory", header: "Category" },
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
            { field: "vendor.supplierCategory", header: "Category" },
            { field: "auditStartDate", header: "Audit Start Date" },
          ]}
          caption="Audit summary"
          sourceText="Data source: Internal ESG Reports"
        />{" "}
      </div>
    </PrimeReactProvider>
  );
}

export default App;
