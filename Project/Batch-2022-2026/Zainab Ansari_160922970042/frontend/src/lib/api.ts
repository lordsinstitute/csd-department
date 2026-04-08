// frontend/src/lib/api.ts

/**
 * API Client for NexusFlow Traffic Control System
 * FIXED: Removed all double /api/api/ issues
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class API {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  // ==================== VIDEO ENDPOINTS ====================

  async uploadVideo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/api/video/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Upload failed');
    }
    
    return response.json();
  }

  async getNextFrame() {
    const response = await fetch(`${this.baseUrl}/api/video/next-frame`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to get next frame');
    }
    
    return response.json();
  }

  async resetVideo() {
    const response = await fetch(`${this.baseUrl}/api/video/reset`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Reset failed');
    }
    
    return response.json();
  }

  async getVideoInfo() {
    const response = await fetch(`${this.baseUrl}/api/video/info`);
    
    if (!response.ok) {
      throw new Error('Failed to get video info');
    }
    
    return response.json();
  }

  // ==================== TRAFFIC ENDPOINTS ====================

  async getTrafficMetrics() {
    const response = await fetch(`${this.baseUrl}/api/traffic/metrics`);
    
    if (!response.ok) {
      throw new Error('Failed to get traffic metrics');
    }
    
    return response.json();
  }

  async getAgentInfo() {
    const response = await fetch(`${this.baseUrl}/api/traffic/agent-info`);
    
    if (!response.ok) {
      throw new Error('Failed to get agent info');
    }
    
    return response.json();
  }

  // ==================== SIMULATION ENDPOINTS (FIXED) ====================

  async startSimulation(params: any) {
    const res = await fetch(`${this.baseUrl}/api/start_simulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  }

  async pauseSimulation() {
    const res = await fetch(`${this.baseUrl}/api/pause_simulation`, { 
      method: 'POST' 
    });
    return res.json();
  }

  async resumeSimulation() {
    const res = await fetch(`${this.baseUrl}/api/resume_simulation`, { 
      method: 'POST' 
    });
    return res.json();
  }

  async stopSimulation() {
    const res = await fetch(`${this.baseUrl}/api/stop_simulation`, { 
      method: 'POST' 
    });
    return res.json();
  }

  async getSimulationStatus() {
    const res = await fetch(`${this.baseUrl}/api/simulation_status`);
    return res.json();
  }

  async getMetrics() {
    const res = await fetch(`${this.baseUrl}/api/get_metrics`);
    return res.json();
  }

  async updateParameters(params: any) {
    const res = await fetch(`${this.baseUrl}/api/update_parameters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  }

  // ==================== TRAINING ENDPOINTS ====================

  async startTraining(numEpisodes: number = 100, gui: boolean = false) {
    const res = await fetch(`${this.baseUrl}/api/start_training`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ num_episodes: numEpisodes, gui })
    });
    return res.json();
  }

  async stopTraining() {
    const res = await fetch(`${this.baseUrl}/api/stop_training`, { 
      method: 'POST' 
    });
    return res.json();
  }

  async getTrainingStats() {
    const res = await fetch(`${this.baseUrl}/api/training_stats`);
    return res.json();
  }

  // ==================== ANALYTICS ENDPOINTS ====================

  async getScenarioComparison() {
    const res = await fetch(`${this.baseUrl}/api/scenario_comparison`);
    return res.json();
  }

  // ==================== EMERGENCY ENDPOINTS ====================

  async handleEmergencyVehicle(vehicleId: string, approachLane: string) {
    const res = await fetch(
      `${this.baseUrl}/api/emergency_vehicle?vehicle_id=${vehicleId}&approach_lane=${approachLane}`, 
      { method: 'POST' }
    );
    return res.json();
  }

  async getEmergencyEvents() {
    const res = await fetch(`${this.baseUrl}/api/emergency_events`);
    return res.json();
  }

  // ==================== SMART CITY ENDPOINTS ====================

  async getSmartCityMetrics() {
    const res = await fetch(`${this.baseUrl}/api/smart_city_metrics`);
    return res.json();
  }

  async getSystemInfo() {
    const res = await fetch(`${this.baseUrl}/api/system_info`);
    return res.json();
  }
}

// Export singleton instance
export const api = new API();

// Also export the class
export default API;