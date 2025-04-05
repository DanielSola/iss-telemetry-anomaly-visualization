export type TelemetryData = {
  name: string;
  value: string;
  timestamp: string;
};

export type WebsocketEvent = {
  telemetryData: TelemetryData;
  anomalyScore: number;
};
