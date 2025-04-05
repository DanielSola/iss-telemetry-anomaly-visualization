import React, { useEffect, useRef, useState } from 'react';
import * as Plotly from 'plotly.js-dist';
import { WebsocketEvent } from './types';

const App = () => {
  const plotRef1 = useRef<HTMLDivElement>(null); // Ref for the first plot
  const plotRef2 = useRef<HTMLDivElement>(null); // Ref for the second plot
  const [anomalyScore, setAnomalyScore] = useState<number | null>(null); // State for anomalyScore

  useEffect(() => {
    const time = new Date();

    const data1 = [
      {
        x: [time],
        y: [0], // Initial value for the first plot
        mode: 'lines',
        line: { color: '#80CAF6' },
      },
    ];

    /*
    const data2 = [
      {
        x: [time],
        y: [0], // Initial value for the second plot
        mode: 'lines',
        line: { color: '#F68080' },
      },
    ];
    */
   
    if (plotRef1.current) {
      Plotly.newPlot(plotRef1.current, data1, {
        xaxis: { type: 'date', range: [time.setMinutes(time.getMinutes() - 1), time.setMinutes(time.getMinutes() + 1)] },
        yaxis: { range: [1000, 5000], color: 'white' },
        paper_bgcolor: '#2D2D2D',
        plot_bgcolor: '#2D2D2D',
      });
    }

    /*
    if (plotRef2.current) {
      Plotly.newPlot(plotRef2.current, data2, {
        xaxis: { type: 'date', range: [time.setMinutes(time.getMinutes() - 1), time.setMinutes(time.getMinutes() + 1)] },
        yaxis: { range: [1000, 3000], color: 'white' },
        paper_bgcolor: '#2D2D2D',
        plot_bgcolor: '#2D2D2D',
      });
    }
    */

    const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL as string);

    ws.onmessage = (event) => {
      try {
        console.log('event', event);
        const { telemetryData, anomalyScore } = JSON.parse(event.data) as WebsocketEvent; // Parse the incoming WebSocket message

        setAnomalyScore(anomalyScore); // Update anomalyScore state

        const currentTime = new Date();

        const update = {
          x: [[currentTime]],
          y: [[telemetryData.value]],
        };

        const olderTime = currentTime.setMinutes(currentTime.getMinutes() - 1);
        const futureTime = currentTime.setMinutes(currentTime.getMinutes() + 1);

        const minuteView = {
          xaxis: {
            type: 'date',
            range: [olderTime, futureTime],
          },
        };

        if (plotRef1.current) {
          Plotly.relayout(plotRef1.current, minuteView);
          Plotly.extendTraces(plotRef1.current, update, [0]);
        }

        /*
        if (plotRef2.current) {
          Plotly.relayout(plotRef2.current, minuteView);
          Plotly.extendTraces(plotRef2.current, update, [0]);
        }
        */
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
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
    <div style={{ backgroundColor: '#2D2D2D', height: '100vh', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        <div id="graph1" ref={plotRef1} style={{ flex: 1, height: '400px' }}></div>
        <div
          style={{
            marginLeft: '20px',
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
      <div id="graph2" ref={plotRef2} style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
};

export default App;
