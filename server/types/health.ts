export type HealthStatus = 'pass' | 'fail' | 'warn';

export interface HealthCheckComponent {
  componentType: string;
  status: HealthStatus;
  time: string;
  output?: string;
}

export interface HealthCheckResponse {
  status: HealthStatus;
  version?: string;
  releaseId?: string;
  serviceId: string;
  description: string;
  checks?: {
    [key: string]: HealthCheckComponent[];
  };
}
