"""
Scheduler worker that runs every minute to fetch Coinbase data and process it
"""
import time
import sys
import os
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(BASE_DIR)

from worker.coinbase_client import fetch_all_coins
from worker.pipeline import process_all_coins


def run_worker_cycle():
    """Single cycle: fetch data and process"""
    print(f"\n🔄 Worker cycle started at {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Fetch all coin data
        tick_data = fetch_all_coins()
        
        # Process all ticks
        process_all_coins(tick_data)
        
        print(f"✅ Worker cycle completed at {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    except Exception as e:
        print(f"❌ Worker cycle failed: {e}\n")


def main():
    """Start the scheduler"""
    print("🚀 Starting Crypto Analytics Worker Scheduler")
    print("📅 Schedule: Every minute")
    print("🪙 Coins: BTC, ETH, SOL")
    print("=" * 50)
    
    scheduler = BlockingScheduler()
    
    # Run every minute
    scheduler.add_job(
        run_worker_cycle,
        trigger=CronTrigger(second=0),  # At :00 seconds every minute
        id="coinbase_fetch",
        name="Fetch Coinbase data and process",
        max_instances=1,  # Prevent overlapping runs
        coalesce=True,
        misfire_grace_time=30
    )
    
    try:
        # Run immediately on start
        run_worker_cycle()
        
        # Start scheduler
        scheduler.start()
    except KeyboardInterrupt:
        print("\n⏹️  Scheduler stopped by user")
        scheduler.shutdown()
    except Exception as e:
        print(f"\n❌ Scheduler error: {e}")
        scheduler.shutdown()
        raise


if __name__ == "__main__":
    main()
