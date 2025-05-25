// ChartWithDrilldown.tsx
import React, { useState, useMemo, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

export const ChartWithDrilldown = ({
  title,
  subtitle,
  chartType = "line",
  data,
  statuses,
  submissionField,
  tableColumns,
  seriesData,
  caption,
  sourceText,
  borderColor = "#d1d5db",
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const dt = useRef(null);

  const buckets = useMemo(() => {
    const grouped = statuses.reduce(
      (acc, s) => ({ ...acc, [s.label]: [] }),
      {}
    );
    data.forEach((item) => {
      const field = item[submissionField];
      if (Array.isArray(field)) {
        field.forEach((action) => {
          statuses.forEach((s) => {
            if (
              action.categoryOfFinding === s.type &&
              (s.subtype == null || action.nonComplianceType === s.subtype)
            ) {
              grouped[s.label].push(item);
            }
          });
        });
      } else if (field?.type != null) {
        const match = statuses.find((s) => s.type === field.type);
        if (match) grouped[match.label].push(item);
      }
    });
    return grouped;
  }, [data, statuses, submissionField]);

  const chartOptions = useMemo(
    () => ({
      chart: { type: chartType },
      title: { text: null },
      xAxis: { categories: seriesData.map((d) => d.name) },
      yAxis: { title: { text: "Value" } },
      legend: { enabled: false },
      plotOptions: {
        series: {
          point: {
            events: {
              click: function () {
                const clickedLabel = this.name;
                const match = statuses.find((s) => s.label === clickedLabel);
                if (!match) return;

                const filtered = (buckets[clickedLabel] || []).filter(Boolean);
                setModalTitle(clickedLabel);
                setModalData(filtered);
                setModalVisible(true);
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
          data: seriesData,
        },
      ],
      credits: { enabled: false },
    }),
    [seriesData, statuses, chartType, buckets]
  );

  return (
    <>
      <div className="card" style={{ borderTop: `4px solid ${borderColor}` }}>
        <div className="text-sm mb-2 font-medium text-900 flex align-items-center gap-2">
          <span style={{ color: borderColor }}>●</span> {title}
        </div>
        <div className="text-xs text-color-secondary mb-2">{subtitle}</div>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        <Button
          label={`Test Click (${seriesData.at(-1)?.name})`}
          className="mt-2 p-button-sm"
        />
      </div>

      <Dialog
        header={modalTitle}
        visible={modalVisible}
        style={{ width: "80vw" }}
        modal
        onHide={() => setModalVisible(false)}
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
          <Button
            label="Export to CSV"
            icon="pi pi-download"
            onClick={() => dt.current.exportCSV()}
            className="p-button-success m-2"
          />
        </div>

        <DataTable
          value={modalData}
          paginator
          rows={10}
          ref={dt}
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
    </>
  );
};
