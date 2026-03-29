/**
 * Video Processing Utilities
 * Helper functions for video analysis and visualization
 */

import {
  VehicleDetection,
  LaneCounts,
  DetectionStatistics
} from '@/types/detection.types'

export class VideoProcessingUtils {

  /* ------------------------------
     Vehicle Calculations
  -------------------------------- */

  static getTotalVehicles(laneCounts: LaneCounts): number {

    if (!laneCounts) return 0

    return (
      (laneCounts.north || 0) +
      (laneCounts.south || 0) +
      (laneCounts.east || 0) +
      (laneCounts.west || 0)
    )
  }

  static getDominantLane(laneCounts: LaneCounts): string {

    if (!laneCounts) return "north"

    const lanes = Object.entries(laneCounts)

    const dominant = lanes.reduce((max, current) =>
      current[1] > max[1] ? current : max
    )

    return dominant[0]
  }


  /* ------------------------------
     Traffic Congestion
  -------------------------------- */

  static getCongestionLevel(laneCounts: LaneCounts): number {

    const total = this.getTotalVehicles(laneCounts)

    const maxCapacity = 80

    const level = (total / maxCapacity) * 100

    return Math.min(Math.round(level), 100)
  }

  static getCongestionStatus(level: number) {

    if (level < 30) {

      return {
        status: "Low",
        color: "green",
        description: "Traffic flowing smoothly"
      }

    }

    if (level < 60) {

      return {
        status: "Moderate",
        color: "yellow",
        description: "Some congestion present"
      }

    }

    if (level < 85) {

      return {
        status: "High",
        color: "orange",
        description: "Heavy congestion"
      }

    }

    return {
      status: "Critical",
      color: "red",
      description: "Severe congestion"
    }

  }


  /* ------------------------------
     Signal Phase Utilities
  -------------------------------- */

  static getSignalPhaseName(phase: number): string {

    return phase === 0
      ? "North-South Green"
      : "East-West Green"

  }

  static getSignalPhaseColor(phase: number): string {

    return phase === 0
      ? "blue"
      : "red"

  }


  static formatTimeInPhase(seconds: number): string {

    if (!seconds) return "0s"

    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)

    return mins > 0
      ? `${mins}m ${secs}s`
      : `${secs}s`
  }


  /* ------------------------------
     Wait Time Estimation
  -------------------------------- */

  static estimateWaitTime(
    queueLength: number,
    phase: number,
    timeInPhase: number
  ): number {

    const avgProcessingTime = 4
    const phaseDuration = 45

    let waitTime = queueLength * avgProcessingTime

    if (phase !== 0) {

      waitTime += phaseDuration - timeInPhase

    }

    return Math.max(Math.round(waitTime), 0)
  }


  /* ------------------------------
     Vehicle Visual Helpers
  -------------------------------- */

  static getVehicleIcon(vehicleClass: string): string {

    const icons: Record<string, string> = {

      car: "🚗",
      motorcycle: "🏍️",
      bus: "🚌",
      truck: "🚚",
      bicycle: "🚲",
      person: "🚶"

    }

    return icons[vehicleClass?.toLowerCase()] || "🚗"
  }


  static getVehicleColor(vehicleClass: string): string {

    const colors: Record<string, string> = {

      car: "#10B981",
      motorcycle: "#EC4899",
      bus: "#EF4444",
      truck: "#F59E0B",
      bicycle: "#6366F1",
      person: "#3B82F6"

    }

    return colors[vehicleClass?.toLowerCase()] || "#10B981"
  }


  /* ------------------------------
     Formatting Utilities
  -------------------------------- */

  static formatPercentage(value: number): string {

    if (!value) return "0%"

    return `${Math.round(value)}%`
  }

  static formatNumber(value: number): string {

    if (!value) return "0"

    return value.toLocaleString()
  }

  static calculateImprovement(
    baseline: number,
    current: number
  ): number {

    if (!baseline) return 0

    return Math.round(((baseline - current) / baseline) * 100)
  }


  /* ------------------------------
     RL Action Description
  -------------------------------- */

  static getActionDescription(
    action: number,
    currentPhase: number
  ): string {

    if (action === 0) {

      return `Maintain ${this.getSignalPhaseName(currentPhase)}`

    }

    const newPhase = 1 - currentPhase

    return `Switch to ${this.getSignalPhaseName(newPhase)}`
  }


  /* ------------------------------
     Video Upload Helpers
  -------------------------------- */

  static validateVideoFile(file: File) {

    const allowedTypes = [

      "video/mp4",
      "video/avi",
      "video/mov",
      "video/x-matroska"

    ]

    const maxSize = 500 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {

      return {
        valid: false,
        error:
          "Invalid file type. Please upload MP4, AVI, MOV, or MKV"
      }

    }

    if (file.size > maxSize) {

      return {
        valid: false,
        error: `File too large. Maximum size is 500MB (current ${(file.size / (1024 * 1024)).toFixed(1)}MB)`
      }

    }

    return { valid: true }

  }


  static formatFileSize(bytes: number): string {

    if (!bytes) return "0 Bytes"

    const k = 1024

    const sizes = ["Bytes", "KB", "MB", "GB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return (
      Math.round(bytes / Math.pow(k, i) * 100) / 100 +
      " " +
      sizes[i]
    )
  }

}