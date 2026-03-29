// frontend/src/types/video.types.ts

/**
 * TypeScript type definitions for video processing features
 * Provides type safety for all video-related data structures
 */

// ==================== VIDEO INFO ====================

export interface VideoInfo {
  filename: string;
  width: number;
  height: number;
  fps: number;
  total_frames: number;
  duration: number;
  current_frame: number;
  progress_percent?: number;
}

// ==================== VEHICLE DETECTION ====================

export interface VehicleDetection {
  class: 'car' | 'motorcycle' | 'bus' | 'truck';
  class_id: number;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  center: [number, number]; // [cx, cy]
}

export interface LaneCounts {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface DetectionStatistics {
  total_vehicles: number;
  cars: number;
  motorcycles: number;
  buses: number;
  trucks: number;
  avg_confidence: number;
}

// ==================== FRAME PROCESSING ====================

export interface FrameResult {
  frame_number: number;
  timestamp: number;
  lane_counts: LaneCounts;
  state_vector: number[];
  detections: VehicleDetection[];
  total_vehicles: number;
  statistics: DetectionStatistics;
}

// ==================== API RESPONSES ====================

export interface VideoUploadResponse {
  success: boolean;
  filename: string;
  size_mb: number;
  uploaded_at?: string;
  video_info: VideoInfo;
}

export interface VideoProcessingResponse {
  success: boolean;
  frame_number: number;
  timestamp: number;
  lane_counts: LaneCounts;
  state_vector: number[];
  total_vehicles: number;
  statistics: DetectionStatistics;
  end_of_video?: boolean;
  message?: string;
}

// ==================== TRAFFIC STATE ====================

export interface TrafficState {
  north_queue: number;
  south_queue: number;
  east_queue: number;
  west_queue: number;
  north_waiting: number;
  south_waiting: number;
  east_waiting: number;
  west_waiting: number;
  current_phase: number; // 0 = NS green, 1 = EW green
  time_in_phase: number;
  source: 'simulation' | 'video';
  frame_number?: number;
  video_timestamp?: number;
}

// ==================== DQN INFERENCE ====================

export interface DQNInferenceRequest {
  lane_counts: LaneCounts;
  timestamp: number;
  current_phase?: number;
  time_in_phase?: number;
}

export interface DQNInferenceResponse {
  success: boolean;
  action: number; // 0 = keep, 1 = switch
  current_phase: number;
  time_in_phase: number;
  q_values?: [number, number];
  confidence?: number;
  explanation?: string;
}

// ==================== PERFORMANCE METRICS ====================

export interface PerformanceMetrics {
  mode: 'fixed' | 'ai';
  avg_queue_length: number;
  avg_waiting_time: number;
  throughput: number;
  efficiency_score: number;
  timestamp: string;
}

export interface ComparisonResult {
  fixed_metrics: PerformanceMetrics;
  ai_metrics: PerformanceMetrics;
  improvements: {
    queue_reduction: number;
    wait_reduction: number;
    throughput_increase: number;
    efficiency_increase: number;
  };
  improvement_percentage: number;
  winner: 'fixed' | 'ai';
}

// ==================== VIDEO PROGRESS ====================

export interface VideoProgress {
  current_frame: number;
  total_frames: number;
  progress_percent: number;
  time_elapsed: number;
  time_remaining: number;
}

// ==================== MODE TYPES ====================

export type OperationMode = 'simulation' | 'video';

export interface ModeStatus {
  mode: OperationMode;
  simulation_active: boolean;
  video_active: boolean;
  video_filename?: string;
}

// ==================== ERROR TYPES ====================

export interface APIError {
  detail: string;
  status?: number;
}

// ==================== COMPONENT PROPS ====================

export interface VideoUploadPanelProps {
  onVideoUploaded: (videoInfo: VideoUploadResponse | null) => void;
}

export interface VehicleCounterProps {
  laneCounts: LaneCounts;
  statistics?: DetectionStatistics;
  mode?: OperationMode;
}

export interface VideoMetricsProps {
  state: TrafficState;
  dqnDecision?: DQNInferenceResponse;
}

// ==================== UTILITY TYPES ====================

export interface VideoListItem {
  filename: string;
  size_mb: number;
  uploaded_at: string;
  duration?: number;
}

export interface VideoListResponse {
  videos: VideoListItem[];
  count: number;
}