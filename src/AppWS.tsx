import React, { useEffect, useRef } from 'react';
import * as Plotly from 'plotly.js-dist';

const App = () => {
  const plotRef1 = useRef<HTMLDivElement>(null); // Ref for the first plot
  const plotRef2 = useRef<HTMLDivElement>(null); // Ref for the second plot

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

    const data2 = [
      {
        x: [time],
        y: [0], // Initial value for the second plot
        mode: 'lines',
        line: { color: '#F68080' },
      },
    ];

    if (plotRef1.current) {
      Plotly.newPlot(plotRef1.current, data1, {
        xaxis: { type: 'date', range: [time.setMinutes(time.getMinutes() - 1), time.setMinutes(time.getMinutes() + 1)] },
        yaxis: { range: [0, 100], color: 'white' },
        paper_bgcolor: '#2D2D2D',
        plot_bgcolor: '#2D2D2D',
      });
    }

    if (plotRef2.current) {
      Plotly.newPlot(plotRef2.current, data2, {
        xaxis: { type: 'date', range: [time.setMinutes(time.getMinutes() - 1), time.setMinutes(time.getMinutes() + 1)] },
        yaxis: { range: [0, 100], color: 'white' },
        paper_bgcolor: '#2D2D2D',
        plot_bgcolor: '#2D2D2D',
      });
    }

    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data); // Parse the incoming WebSocket message
        const value = parseFloat(parsedData.value); // Extract the value
        console.log('VALUE: ', value);

        const currentTime = new Date();

        const update = {
          x: [[currentTime]],
          y: [[value]],
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

        if (plotRef2.current) {
          Plotly.relayout(plotRef2.current, minuteView);
          Plotly.extendTraces(plotRef2.current, update, [0]);
        }
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

  return (
    <div style={{ backgroundColor: '#2D2D2D', height: '100vh', color: 'white' }}>
      { /* <h1 style={{ textAlign: 'center', paddingTop: '120px', paddingBottom: '40px' }}>Loop A Flowrate (kg/hr)</h1> */}
      <div id="graph1" ref={plotRef1} style={{ width: '100%', height: '400px', marginBottom: '40px' }}></div>
      <div id="graph2" ref={plotRef2} style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
};

export default App;
