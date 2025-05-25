import { Calendar } from "primereact/calendar";
import React, { useState, useEffect } from "react";
import DashboardView from "./dashboard-view";
import supplierAssessmentData from "../../data/supplierAssignmentWithAuditorandActions.json";
import { Dropdown } from "primereact/dropdown";

export default function NewHeader() {
  const [dateRange, setDateRange] = useState(null);
  const [dateFilter, setDateFilter] = useState("auditStartDate");
  const [selectedData, setSelectedData] = useState(supplierAssessmentData);

  const handleGlobalDateRangeChange = () => {
    const [start, end] = dateRange;
    console.log(selectedData);

    let tmp = supplierAssessmentData.filter((d) => {
      console.log(
        "Filtering Data:",
        d[dateFilter],
        "Start:",
        start,
        "End:",
        end
      );
      console.log(new Date(start), new Date(end));

      const dt = new Date(d[dateFilter]);
      return dt >= new Date(start) && dt <= new Date(end);
    });

    console.log("Filtered Data:", tmp);

    setSelectedData(tmp);
  };

  useEffect(() => {
    setSelectedData(supplierAssessmentData);
  }, []);

  useEffect(() => {
    if(!dateRange || dateRange.length !== 2) {
      setSelectedData(supplierAssessmentData);
      return;
    }
    handleGlobalDateRangeChange();
  }, [dateFilter, dateRange]);

  return (
    <>
      <div className="p-component p-fluid">
        <div className="p-4">
          <header className="mb-4">
            <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-1">
              <div>
                <h1 className="text-2xl font-bold flex justify-content-start mb-1">
                  Supply Chain Analytics
                </h1>
                <p className="text-color-secondary m-0">
                  Key performance indicators and metrics for supply chain
                  management
                </p>
              </div>
              <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-1">
                <Dropdown
                  value={dateFilter}
                  options={[
                    { label: "Audit Start Date", value: "auditStartDate" },
                    {
                      label: "Assesment Start Date",
                      value: "assessmentStartDate",
                    },
                  ]}
                  onChange={(e) => {
                    setDateFilter(e.value);
                  }}
                />
                <Calendar
                  value={dateRange}
                  onChange={(e) => setDateRange(e.value)}
                  selectionMode="range"
                  readOnlyInput
                  placeholder="Select date range"
                  showIcon
                />
              </div>
            </div>
          </header>
        </div>
      </div>

      <DashboardView jsonData={selectedData} dateFilter={dateFilter} />
    </>
  );
}
