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

    const interval = setInterval(() => {
      const randomValue1 = Math.random() * 100; // Generate a random value for the first plot
      const randomValue2 = Math.random() * 100; // Generate a random value for the second plot
      const currentTime = new Date();

      const update1 = {
        x: [[currentTime]],
        y: [[randomValue1]],
      };

      const update2 = {
        x: [[currentTime]],
        y: [[randomValue2]],
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
        Plotly.extendTraces(plotRef1.current, update1, [0]);
      }

      if (plotRef2.current) {
        Plotly.relayout(plotRef2.current, minuteView);
        Plotly.extendTraces(plotRef2.current, update2, [0]);
      }
    }, 1000); // Update every second

    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#2D2D2D', height: '100vh', color: 'white' }}>
      <div id="graph1" ref={plotRef1} style={{ width: '100%', height: '400px', marginBottom: '40px' }}></div>
      <div id="graph2" ref={plotRef2} style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
};

export default App;