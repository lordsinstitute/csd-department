"""
AI Decision Explainer
Generates human-readable explanations for DQN decisions
"""

from typing import Dict, List
import numpy as np

class AIExplainer:
    def __init__(self, dqn_agent):
        """
        Initialize AI explainer
        
        Args:
            dqn_agent: DQN agent instance
        """
        self.agent = dqn_agent
        
    def explain_decision(self, state: np.ndarray, action: int, q_values: List[float]) -> Dict:
        """
        Generate explanation for agent's decision
        
        Args:
            state: Current traffic state
            action: Selected action (0=NS_GREEN, 1=EW_GREEN)
            q_values: Q-values for all actions
            
        Returns:
            Explanation dictionary
        """
        # Parse state vector (assuming 10-element state)
        # [north_count, south_count, east_count, west_count, 
        #  current_phase, time_in_phase, emergency, congestion, flow, density]
        
        north_count = int(state[0]) if len(state) > 0 else 0
        south_count = int(state[1]) if len(state) > 1 else 0
        east_count = int(state[2]) if len(state) > 2 else 0
        west_count = int(state[3]) if len(state) > 3 else 0
        current_phase = int(state[4]) if len(state) > 4 else 0
        time_in_phase = int(state[5]) if len(state) > 5 else 0
        emergency = int(state[6]) if len(state) > 6 else 0
        
        # Calculate total vehicles per direction
        ns_total = north_count + south_count
        ew_total = east_count + west_count
        
        # Determine congestion level
        max_queue = max(north_count, south_count, east_count, west_count)
        congestion_level = "Low" if max_queue < 3 else "Medium" if max_queue < 7 else "High"
        
        # Generate decision explanation
        action_name = "North/South GREEN" if action == 0 else "East/West GREEN"
        confidence = float(max(q_values)) / (sum(q_values) + 1e-6) * 100
        
        # Determine primary reason
        reasons = []
        
        if emergency:
            reasons.append("Emergency vehicle detected")
        
        if action == 0:  # NS Green
            if ns_total > ew_total:
                reasons.append(f"Higher congestion on N/S ({ns_total} vs {ew_total} vehicles)")
            if north_count >= 5 or south_count >= 5:
                reasons.append(f"Long queue detected")
        else:  # EW Green
            if ew_total > ns_total:
                reasons.append(f"Higher congestion on E/W ({ew_total} vs {ns_total} vehicles)")
            if east_count >= 5 or west_count >= 5:
                reasons.append(f"Long queue detected")
        
        if time_in_phase > 30:
            reasons.append("Current phase exceeded maximum time")
        
        if not reasons:
            reasons.append("Balanced traffic optimization")
        
        # Generate explanation
        explanation = {
            'decision': action_name,
            'confidence': round(confidence, 1),
            'policy': 'DQN Reinforcement Learning',
            'state': {
                'north_queue': north_count,
                'south_queue': south_count,
                'east_queue': east_count,
                'west_queue': west_count,
                'current_phase': 'NS_GREEN' if current_phase == 0 else 'EW_GREEN',
                'time_in_phase': time_in_phase,
                'emergency_active': bool(emergency)
            },
            'reasons': reasons,
            'congestion_level': congestion_level,
            'q_values': {
                'NS_GREEN': round(float(q_values[0]), 3),
                'EW_GREEN': round(float(q_values[1]), 3)
            },
            'priority_direction': 'North/South' if ns_total > ew_total else 'East/West',
            'estimated_wait_reduction': f"{abs(ns_total - ew_total) * 2}s"
        }
        
        return explanation
    
    def generate_summary(self, recent_decisions: List[Dict]) -> Dict:
        """
        Generate summary of recent decisions
        
        Args:
            recent_decisions: List of recent decision explanations
            
        Returns:
            Summary statistics
        """
        if not recent_decisions:
            return {
                'total_decisions': 0,
                'avg_confidence': 0,
                'most_common_action': 'None',
                'emergency_overrides': 0
            }
        
        ns_count = sum(1 for d in recent_decisions if 'North/South' in d['decision'])
        ew_count = len(recent_decisions) - ns_count
        
        avg_confidence = np.mean([d['confidence'] for d in recent_decisions])
        emergency_count = sum(1 for d in recent_decisions if d['state']['emergency_active'])
        
        return {
            'total_decisions': len(recent_decisions),
            'avg_confidence': round(float(avg_confidence), 1),
            'most_common_action': 'North/South GREEN' if ns_count > ew_count else 'East/West GREEN',
            'ns_count': ns_count,
            'ew_count': ew_count,
            'emergency_overrides': emergency_count,
            'efficiency_score': round(avg_confidence, 1)
        }