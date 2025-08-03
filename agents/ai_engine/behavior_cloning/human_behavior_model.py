import random

class HumanBehaviorModel:
    def __init__(self):
        # Placeholder for loading a pre-trained behavior model
        print("Initializing Human Behavior Model...")

    def emulate_typing_speed(self, base_speed=150):
        """Emulates human-like typing speed with variability."""
        return base_speed + random.uniform(-30, 30)

    def emulate_mouse_movement(self):
        """Generates non-linear, slightly randomized mouse movement paths."""
        # This would typically involve more complex algorithms like Bezier curves
        print("Emulating human-like mouse movements...")
        return [ (random.randint(0, 1920), random.randint(0, 1080)) for _ in range(random.randint(5, 15)) ]

    def emulate_scrolling(self):
        """Simulates human scrolling behavior, including pauses."""
        print("Emulating human-like scrolling...")
        scroll_actions = []
        for _ in range(random.randint(1, 4)):
            scroll_actions.append({"scroll_amount": random.randint(100, 800), "pause_duration": random.uniform(0.1, 1.5)})
        return scroll_actions
