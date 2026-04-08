"""Metrics calculation utilities"""
import numpy as np

class MetricsCalculator:
    """Calculate traffic metrics"""
    
    @staticmethod
    def waiting_time_reduction(ai_wait: float, manual_wait: float) -> float:
        """Calculate waiting time reduction percentage"""
        if manual_wait == 0:
            return 0
        return ((manual_wait - ai_wait) / manual_wait) * 100
    
    @staticmethod
    def throughput_improvement(ai_thru: int, manual_thru: int) -> float:
        """Calculate throughput improvement percentage"""
        if manual_thru == 0:
            return 0
        return ((ai_thru - manual_thru) / manual_thru) * 100
    
    @staticmethod
    def efficiency_score(wait_reduction: float, thru_improvement: float) -> float:
        """Calculate overall efficiency score"""
        # Weighted average
        return (wait_reduction * 0.6 + thru_improvement * 0.4)
    
    @staticmethod
    def moving_average(data: list, window: int = 10) -> np.ndarray:
        """Calculate moving average"""
        if len(data) < window:
            return np.array(data)
        return np.convolve(data, np.ones(window)/window, mode='valid')