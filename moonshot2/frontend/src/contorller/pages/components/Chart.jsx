import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const Chart = ({ data, selectedFeature, setSelectedFeature }) => {
    const [barChartSeries, setBarChartSeries] = useState([]);
    const [barChartCategories, setBarChartCategories] = useState([]);
    const [lineChartSeries, setLineChartSeries] = useState([]);
    const [lineChartCategories, setLineChartCategories] = useState([]);

    // Prepare Bar Chart Data
    useEffect(() => {
        if (data.length > 0) {
            const categories = ["A", "B", "C", "D", "E", "F"];
            const totals = categories.map((category) =>
                data.reduce((sum, item) => sum + (item[category] || 0), 0)
            );

            setBarChartCategories(categories);
            setBarChartSeries([{ name: "Total", data: totals }]);
        }
    }, [data]);

    // Prepare Line Chart Data for Selected Feature
    useEffect(() => {
        if (data.length > 0 && selectedFeature) {
            const filteredData = data.map((item) => ({
                x: item.Day,
                y: item[selectedFeature] || 0, // Use 0 if the key is missing
            }));

            setLineChartSeries([{ name: selectedFeature, data: filteredData.map((d) => d.y) }]);
            setLineChartCategories(filteredData.map((d) => d.x));
        }
    }, [data, selectedFeature]);

    // Handle Bar Click
    const handleBarClick = (event, chartContext, config) => {
        const feature = barChartCategories[config.dataPointIndex];
        setSelectedFeature(feature); // Update selected feature
    };

    return (
        <div className="container mt-5">
            {/* Bar Chart */}
            <div className="row mb-4">
                <div className="col-12 d-flex justify-content-center">
                    <ReactApexChart
                        type="bar"
                        series={barChartSeries}
                        options={{
                            chart: {
                                type: "bar",
                                events: {
                                    dataPointSelection: handleBarClick,
                                },
                                toolbar: { show: true },
                            },
                            plotOptions: { bar: { horizontal: true } },
                            xaxis: { categories: barChartCategories },
                            dataLabels: { enabled: true },
                        }}
                        height={400}
                        width="200%"
                    />
                </div>
            </div>

            {/* Line Chart */}
            {selectedFeature && lineChartSeries.length > 0 && (
                <div className="row">
                    <div className="col-12 text-center">
                        <h5>Line Chart for {selectedFeature}</h5>
                    </div>
                    <div className="col-12">
                        <ReactApexChart
                            type="line"
                            series={lineChartSeries}
                            options={{
                                chart: { type: "line", toolbar: { show: true } },
                                xaxis: { categories: lineChartCategories },
                                dataLabels: { enabled: true },
                            }}
                            height={500}
                            width="100%"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chart;
