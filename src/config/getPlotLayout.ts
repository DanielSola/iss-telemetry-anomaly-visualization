export const getPlotLayout = (yAxisLabel: string, title: string) => {
  return {
    xaxis: { type: 'date', autorange: true },
    yaxis: {
      autorange: true,
      color: 'white',
      title: { text: yAxisLabel, font: { color: 'white' }, standoff: 15 }, // Add standoff to prevent overlap
    },
    paper_bgcolor: '#2D2D2D',
    plot_bgcolor: '#2D2D2D',
    title: { text: title, font: { color: 'white' } },
    width: '50%',
    margin: { t: 50, b: 30, l: 100, r: 30 }, // Reduce bottom margin (b)
  };
};
