import asyncio
import os
import random
from datetime import datetime
from rich.console import Console
from rich.table import Table
from rich.live import Live
from rich.panel import Panel
from rich.layout import Layout
from rich import box

from bot.data_layer import DataLayer
from bot.arb_engine import ArbEngine
from bot.execution_engine import ExecutionEngine
from bot.risk_manager import RiskManager
from bot.ai_optimizer import AIOptimizer
from bot.liquidation_module import LiquidationModule

console = Console()

class SALABot:
    def __init__(self):
        self.data_layer = DataLayer()
        self.arb_engine = ArbEngine(self.data_layer)
        self.risk_manager = RiskManager()
        self.ai_optimizer = AIOptimizer()
        self.liquidation_module = LiquidationModule(self.data_layer)
        self.execution_engine = ExecutionEngine("S...dummy_secret") # Replace with real secret for production
        self.trades_history = []
        self.total_pnl = 0.0

    def generate_dashboard(self):
        layout = Layout()
        layout.split_column(
            Layout(name="header", size=3),
            Layout(name="body"),
            Layout(name="footer", size=3)
        )
        layout["body"].split_row(
            Layout(name="market_status"),
            Layout(name="opportunities")
        )

        # Header
        header_panel = Panel(
            f"[bold cyan]Stellar Arbitrage & Liquidation Assistant (SALA)[/bold cyan] | "
            f"Status: [green]RUNNING[/green] | PnL: [yellow]{self.total_pnl:+.4f} XLM[/yellow]",
            box=box.DOUBLE
        )
        layout["header"].update(header_panel)

        # Market Status Table
        market_table = Table(title="Market Status", box=box.ROUNDED)
        market_table.add_column("Pool ID", style="dim")
        market_table.add_column("XLM")
        market_table.add_column("USDC")
        market_table.add_column("BTC")
        
        for pool_id, reserves in self.data_layer.pools.items():
            market_table.add_row(
                pool_id, 
                f"{reserves['XLM']:.2f}", 
                f"{reserves['USDC']:.2f}", 
                f"{reserves['BTC']:.4f}"
            )
        layout["market_status"].update(Panel(market_table))

        # Opportunities & Trades
        opp_table = Table(title="Recent Trades", box=box.ROUNDED)
        opp_table.add_column("Time", style="dim")
        opp_table.add_column("Type")
        opp_table.add_column("Path")
        opp_table.add_column("Profit")
        opp_table.add_column("Status")

        for trade in self.trades_history[-10:]:
            status_style = "green" if trade['status'] == "SUCCESS" else "red"
            opp_table.add_row(
                trade['time'],
                trade['type'],
                " -> ".join(trade['path']),
                f"{trade['profit']:.4%}",
                f"[{status_style}]{trade['status']}[/{status_style}]"
            )
        layout["opportunities"].update(Panel(opp_table))

        # Footer
        footer_panel = Panel(
            f"Last Update: {datetime.now().strftime('%H:%M:%S')} | "
            f"Active Liquidation Opportunities: {len(self.liquidation_module.get_liquidation_opportunities())}",
            style="dim"
        )
        layout["footer"].update(footer_panel)

        return layout

    async def run(self):
        pool_ids = ["AMM_XLM_USDC_1", "AMM_USDC_BTC_1", "AMM_BTC_XLM_1"]
        
        # Start background tasks
        asyncio.create_task(self.data_layer.monitor_pools(pool_ids))
        asyncio.create_task(self.liquidation_module.monitor_loop())

        with Live(self.generate_dashboard(), refresh_per_second=4, screen=True) as live:
            while True:
                # 1. Arbitrage Detection
                arb = self.arb_engine.check_triangular_arb(*pool_ids)
                if arb and self.risk_manager.validate_trade(arb):
                    success = await self.execution_engine.execute_trade(arb, "CONTRACT_SALA_EXEC")
                    if success:
                        self.total_pnl += arb['profit'] * 100 # Scaling for simulation visibility
                        self.risk_manager.report_success()
                        status = "SUCCESS"
                    else:
                        self.risk_manager.report_failure()
                        status = "FAILED"
                    
                    self.trades_history.append({
                        "time": datetime.now().strftime('%H:%M:%S'),
                        "type": "ARBITRAGE",
                        "path": arb['path'],
                        "profit": arb['profit'],
                        "status": status
                    })

                # 2. Liquidation Detection
                liq_opps = self.liquidation_module.get_liquidation_opportunities()
                for opp in liq_opps:
                    # In a real scenario, we'd check if it's profitable to liquidate
                    # For now, we simulate execution
                    self.trades_history.append({
                        "time": datetime.now().strftime('%H:%M:%S'),
                        "type": "LIQUIDATION",
                        "path": [f"User:{opp['user'][:8]}"],
                        "profit": 0.05, # Fixed liquidation bonus simulation
                        "status": "SUCCESS"
                    })
                    self.total_pnl += 0.05
                    # Remove from module after "execution" in simulation
                    self.liquidation_module.monitored_positions.remove(opp)

                live.update(self.generate_dashboard())
                await asyncio.sleep(0.5)

if __name__ == "__main__":
    bot = SALABot()
    try:
        asyncio.run(bot.run())
    except KeyboardInterrupt:
        console.print("\n[bold red]Bot stopped by user.[/bold red]")
