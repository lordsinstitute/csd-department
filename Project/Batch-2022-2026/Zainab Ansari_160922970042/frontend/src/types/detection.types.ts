// frontend/src/types/detection.types.ts

/**
 * TypeScript types for YOLOv8 detection and traffic control
 */

// Vehicle Detection Types
export interface VehicleDetection {
  bbox: [number, number, number, number];
  center: [number, number];
  confidence: number;
  class: 'car' | 'motorcycle' | 'bus' | 'truck';
  class_id: number;
}

export interface LaneCounts {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface DetectionStatistics {
  total: number;
  cars: number;
  motorcycles: number;
  buses: number;
  trucks: number;
  avg_confidence: number;
}

export interface VideoInfo {
  filename: string;
  width: number;
  height: number;
  fps: number;
  total_frames: number;
  duration: number;
  current_frame: number;
  progress: number;
}

export interface FrameResult {
  frame_number: number;
  timestamp: number;
  detections: VehicleDetection[];
  lane_counts: LaneCounts;
  state_vector: number[];
  total_vehicles: number;
  statistics: DetectionStatistics;
  dqn_action: number;
  signal_phase: number;
  time_in_phase: number;
  emergency_detected: boolean;
}

export interface TrafficState {
  lane_counts: LaneCounts;
  current_phase: number;
  time_in_phase: number;
}

export interface SignalAction {
  action: number;
  reason: string;
  q_values: number[];
  confidence: number;
}

export interface TrafficMetrics {
  avg_wait_time: number;
  throughput: number;
  total_queue: number;
  efficiency: number;
  phase_switches: number;
  current_frame: number;
  video_progress: number;
}

export interface EmergencyVehicle {
  type: 'ambulance' | 'fire_truck' | 'police' | 'emergency_vehicle';
  bbox: [number, number, number, number];
  center: [number, number];
  confidence: number;
  has_lights: boolean;
  priority: string;
}

export interface EmergencyOverride {
  action: string;
  emergency_lane: string;
  current_phase: number;
  new_phase: number;
  switch_required: boolean;
  green_corridor: boolean;
  estimated_clearance_time: number;
  priority: string;
}

export interface VideoUploadResponse {
  status: string;
  filename: string;
  size_mb: number;
  video_info: VideoInfo;
}

export interface AgentInfo {
  state_size: number;
  action_size: number;
  epsilon: number;
  total_steps: number;
  episode: number;
  device: string;
  network_architecture: {
    input: number;
    hidden: number[];
    output: number;
  };
}