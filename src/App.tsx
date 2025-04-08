import React, { useEffect, useRef, useState } from 'react';
import * as Plotly from 'plotly.js-dist';
import { WebsocketEvent } from './types';
import { getPlotLayout } from './config/getPlotLayout';

const App = () => {
  const flowratePlot = useRef<HTMLDivElement>(null);
  const temperaturePlot = useRef<HTMLDivElement>(null);
  const pressurePlot = useRef<HTMLDivElement>(null);

  const [anomalyScore, setAnomalyScore] = useState<number | null>(null); // State for anomalyScore
  const isFirstFlowrateValueRef = useRef<boolean>(true);
  const isFirstTemperatureValueRef = useRef<boolean>(true);
  const isFirstPressureValueRef = useRef<boolean>(true);

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL as string);

    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);

        if (!parsedData.telemetryData || parsedData.anomalyScore === undefined) {
          throw new Error('Invalid WebSocket data format');
        }

        const { telemetryData, anomalyScore } = parsedData as WebsocketEvent;

        setAnomalyScore(anomalyScore);

        const currentTime = new Date();
        const update = { x: [[currentTime]], y: [[telemetryData.value]] };
        const olderTime = new Date(currentTime.getTime() - 1 * 60 * 1000); // 1 minute earlier
        const futureTime = new Date(currentTime.getTime() + 1 * 15 * 1000); // 15 seconds later
        const minuteView = { xaxis: { type: 'date', range: [olderTime, futureTime] } };

        if (telemetryData.name === 'FLOWRATE') {
          if (isFirstFlowrateValueRef.current) {
            const data = [{ x: [currentTime], y: [telemetryData.value], mode: 'lines', line: { color: '#80CAF6' } }];
            Plotly.newPlot(flowratePlot.current, data, getPlotLayout('kg/hr', 'Flowrate'), { responsive: true });
            isFirstFlowrateValueRef.current = false;
          } else {
            Plotly.relayout(flowratePlot.current, minuteView);
            Plotly.extendTraces(flowratePlot.current, update, [0]);
          }
        }

        if (telemetryData.name === 'PRESSURE') {
          if (isFirstPressureValueRef.current) {
            const data = [{ x: [currentTime], y: [telemetryData.value], mode: 'lines', line: { color: '#80CAF6' } }];
            Plotly.newPlot(pressurePlot.current, data, getPlotLayout('mmHg', 'Pressure'), { responsive: true });
            isFirstPressureValueRef.current = false;
          } else {
            Plotly.relayout(pressurePlot.current, minuteView);
            Plotly.extendTraces(pressurePlot.current, update, [0]);
          }
        }

        // Temperature
        if (telemetryData.name === 'TEMPERATURE') {
          if (isFirstTemperatureValueRef.current) {
            const data = [{ x: [currentTime], y: [telemetryData.value], mode: 'lines', line: { color: '#80CAF6' } }];
            Plotly.newPlot(temperaturePlot.current, data, getPlotLayout('ºC', 'Temperature'), { responsive: true });
            isFirstTemperatureValueRef.current = false;
          } else {
            Plotly.relayout(temperaturePlot.current, minuteView);
            Plotly.extendTraces(temperaturePlot.current, update, [0]);
          }
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const getAnomalyIndicatorStyle = () => {
    if (anomalyScore === null) return { backgroundColor: '#ccc', color: 'black' }; // Default style
    if (anomalyScore < 0.5) return { backgroundColor: 'green', color: 'white' }; // Low anomaly
    if (anomalyScore < 0.8) return { backgroundColor: 'orange', color: 'white' }; // Medium anomaly
    return { backgroundColor: 'red', color: 'white' }; // High anomaly
  };

  return (
    <div
      style={{
        backgroundColor: '#2D2D2D',
        height: '100vh',
        color: 'white',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr 1fr',
        gap: '10px',
        padding: '10px',
      }}
    >
      <div style={{ gridColumn: '1/4', gridRow: '1' }}>
        <h1>ISS Cooling Systems Anomaly Detection</h1>
        <p>This application visualizes telemetry data from the ISS cooling systems and highlights potential anomalies in real-time.</p>
      </div>

      <div id="flowratePlot" ref={flowratePlot} style={{ gridColumn: '1 / 3', gridRow: '2', width: '100%', height: '100%' }}></div>
      <div id="pressurePlot" ref={pressurePlot} style={{ gridColumn: '1 / 3', gridRow: '3', width: '100%', height: '100%' }}></div>
      <div id="temperaturePlot" ref={temperaturePlot} style={{ gridColumn: '1 / 3', gridRow: '4', width: '100%', height: '100%' }}></div>
      <div
        style={{
          gridColumn: '3 / 3',
          gridRow: '3',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px 20px',
          borderRadius: '5px',
          fontSize: '18px',
          textAlign: 'center',
          ...getAnomalyIndicatorStyle(),
        }}
      >
        {anomalyScore !== null ? `Anomaly Score: ${anomalyScore.toFixed(2)}` : 'No Data'}
      </div>
    </div>
  );
};

export default App;
