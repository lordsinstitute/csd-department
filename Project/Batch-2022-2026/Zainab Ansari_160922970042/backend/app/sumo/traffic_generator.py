import xml.etree.ElementTree as ET
import random

class TrafficGenerator:
    """Generate SUMO traffic routes"""
    
    def __init__(self, route_file: str):
        self.route_file = route_file
    
    def generate_traffic(self, n_vehicles: int = 1000, traffic_density: str = 'medium'):
        """Generate traffic routes"""
        
        densities = {
            'low': (8, 15),
            'medium': (4, 8),
            'normal': (4, 8),
            'high': (2, 5),
            'rush': (1, 3),
            'accident': (5, 10)
        }
        
        min_gap, max_gap = densities.get(traffic_density, densities['medium'])
        
        routes = ET.Element('routes')
        
        # Vehicle types
        ET.SubElement(routes, 'vType', {
            'id': 'car',
            'accel': '2.6',
            'decel': '4.5',
            'sigma': '0.5',
            'length': '5.0',
            'maxSpeed': '15.0',
            'guiShape': 'passenger',
            'color': '1,1,0'
        })
        
        ET.SubElement(routes, 'vType', {
            'id': 'emergency',
            'accel': '3.0',
            'decel': '5.0',
            'sigma': '0.3',
            'length': '6.0',
            'maxSpeed': '20.0',
            'guiShape': 'emergency',
            'color': '1,0,0'
        })
        
        # Define routes
        route_defs = [
            ('route_ns', 'north south'),
            ('route_sn', 'south north'),
            ('route_ew', 'east west'),
            ('route_we', 'west east'),
        ]
        
        for route_id, edges in route_defs:
            ET.SubElement(routes, 'route', {'id': route_id, 'edges': edges})
        
        # Generate vehicles
        time = 0
        emergency_count = 0
        
        for i in range(n_vehicles):
            route = random.choice(route_defs)[0]
            
            # 2% chance of emergency vehicle
            if random.random() < 0.02 and emergency_count < 5:
                vtype = 'emergency'
                emergency_count += 1
            else:
                vtype = 'car'
            
            ET.SubElement(routes, 'vehicle', {
                'id': f'veh_{i}',
                'type': vtype,
                'route': route,
                'depart': str(time),
                'departLane': 'best',
                'departSpeed': 'max'
            })
            
            time += random.uniform(min_gap, max_gap)
        
        # Write file
        tree = ET.ElementTree(routes)
        ET.indent(tree, space='    ')
        tree.write(self.route_file, encoding='utf-8', xml_declaration=True)
        
        print(f"✓ Generated {n_vehicles} vehicles ({emergency_count} emergency)")
    
    def generate_rush_hour_traffic(self, n_vehicles: int = 1600, duration: int = 3600):
        """Generate rush hour traffic with spikes"""
        routes = ET.Element('routes')
        
        # Vehicle types
        ET.SubElement(routes, 'vType', {
            'id': 'car',
            'accel': '2.6',
            'decel': '4.5',
            'sigma': '0.5',
            'length': '5.0',
            'maxSpeed': '15.0',
            'guiShape': 'passenger'
        })
        
        # Routes
        route_defs = [
            ('route_ns', 'north south'),
            ('route_sn', 'south north'),
            ('route_ew', 'east west'),
            ('route_we', 'west east'),
        ]
        
        for route_id, edges in route_defs:
            ET.SubElement(routes, 'route', {'id': route_id, 'edges': edges})
        
        # Generate with spikes
        time = 0
        for i in range(n_vehicles):
            route = random.choice(route_defs)[0]
            
            # Create traffic spikes every 300 seconds
            if int(time) % 300 < 60:  # Spike period
                gap = random.uniform(0.5, 1.5)
            else:  # Normal period
                gap = random.uniform(1, 3)
            
            ET.SubElement(routes, 'vehicle', {
                'id': f'veh_{i}',
                'type': 'car',
                'route': route,
                'depart': str(time),
                'departLane': 'best',
                'departSpeed': 'max'
            })
            
            time += gap
        
        tree = ET.ElementTree(routes)
        ET.indent(tree, space='    ')
        tree.write(self.route_file, encoding='utf-8', xml_declaration=True)
        
        print(f"✓ Generated rush hour traffic: {n_vehicles} vehicles with spikes")