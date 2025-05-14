import React, { useState, useEffect, useRef } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import "../App.css";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";

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

  const [globalFilter, setGlobalFilter] = useState("");
  const dt = useRef(null);

  const allLocations = React.useMemo(
    () => [...new Set(data.map((i) => i.vendor?.supplierLocation))],
    [data]
  );
  const allSuppliers = React.useMemo(
    () => [...new Set(data.map((i) => i.vendor?.supplierName))],
    [data]
  );

  const filterRelevantActions = (item, type, subtype = null) => {
    if (!Array.isArray(item[submissionField])) return item;

    const filteredActions = item[submissionField].filter(
      (action) =>
        action.categoryOfFinding === type &&
        (subtype == null || action.nonComplianceType === subtype)
    );

    if (filteredActions.length === 0) return null;

    return {
      ...item,
      [submissionField]: filteredActions,
    };
  };

  const chartOptions = React.useMemo(
    () => ({
      chart: { type: chartType, backgroundColor: "#FFF" },
      title: { text: title, style: { color: "#333" } },
      xAxis: { type: "category", labels: { style: { color: "#333" } } },
      yAxis: { title: { text: "Count" }, labels: { style: { color: "#333" } } },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: { enabled: true, style: { textOutline: "none" } },
          point: {
            events: {
              click() {
                const match = statuses.find((s) => s.label === this.name);
                if (!match) return;

                const filtered = (buckets[this.name] || [])
                  .map((item) =>
                    filterRelevantActions(item, match.type, match.subtype)
                  )
                  .filter(Boolean);

                setModalTitle(this.name);
                setModalData(filtered);
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
    }),
    [chartType, title, statuses, buckets]
  );

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

    const b = statuses.reduce((acc, s) => ({ ...acc, [s.label]: [] }), {});
    tmp.forEach((item) => {
      const field = item[submissionField];
      if (Array.isArray(field)) {
        field.forEach((action) => {
          statuses.forEach((s) => {
            if (
              action.categoryOfFinding === s.type &&
              (s.subtype == null || action.nonComplianceType === s.subtype)
            ) {
              b[s.label].push(item);
            }
          });
        });
      } else if (field?.type != null) {
        const match = statuses.find((s) => s.type === field.type);
        if (match) b[match.label].push(item);
      }
    });
    setBuckets(b);
  }, [
    data,
    dateField,
    submissionField,
    statuses,
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
        <>
          <div className="filterHeader">
            <span className="p-input-icon-left m-2">
              <i className="pi pi-search" />
              <input
                type="search"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Global Search"
                className="p-inputtext p-component"
              />
            </span>

            <div className="m-2">
              <Button
                label="Export to CSV"
                icon="pi pi-download"
                onClick={() => dt.current.exportCSV()}
                className="p-button-success m-1"
              />
            </div>
          </div>
          <DataTable
            value={filteredData}
            paginator
            rows={10}
            ref={dt}
            globalFilter={globalFilter}
            header={null}
          >
            {tableColumns.map((col) => (
              <Column
                key={col.field}
                field={col.field}
                header={col.header}
                body={col.body}
                filter
                filterPlaceholder={`Search ${col.header}`}
                sortable
              />
            ))}
          </DataTable>
        </>
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
        <div className="filterHeader">
          <span className="p-input-icon-left m-2">
            <i className="pi pi-search" />
            <input
              type="search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Global Search"
              className="p-inputtext p-component"
            />
          </span>

          <div className="m-2">
            <Button
              label="Export to CSV"
              icon="pi pi-download"
              onClick={() => dt.current.exportCSV()}
              className="p-button-success m-1"
            />
          </div>
        </div>

        <DataTable
          value={modalData}
          paginator
          rows={10}
          responsiveLayout="scroll"
          globalFilter={globalFilter}
        >
          {tableColumns.map((col) => (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              body={col.body}
              filter
              filterPlaceholder={`Search ${col.header}`}
              sortable
            />
          ))}
        </DataTable>
      </Dialog>
    </div>
  );
};

export default AssessmentDashboard;
