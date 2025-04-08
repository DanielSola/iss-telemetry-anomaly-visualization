export type TelemetryData = {
  name: 'FLOWRATE' | 'PRESSURE' | 'TEMPERATURE';
  value: string;
  timestamp: string;
};

export type WebsocketEvent = {
  telemetryData: TelemetryData;
  anomalyScore: number;
};
