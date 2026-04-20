class RiskManager:
    def __init__(self, max_exposure_xlm=1000):
        self.max_exposure = max_exposure_xlm
        self.consecutive_failures = 0
        self.is_halted = False

    def validate_trade(self, arb_opportunity):
        if self.is_halted:
            return False
        
        if arb_opportunity['profit'] < 0.005: # Secondary safety check
            return False
            
        return True

    def report_failure(self):
        self.consecutive_failures += 1
        if self.consecutive_failures >= 3:
            print("⚠️ CIRCUIT BREAKER TRIGGERED: Too many failures.")
            self.is_halted = True

    def report_success(self):
        self.consecutive_failures = 0
