import asyncio

async def run(page):
    print("Starting Smart Drain AI Frontend E2E Test...")
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    try:
        await page.set_viewport_size({"width": 1920, "height": 1080})
        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(1000)

        # 1. Login
        print("Verifying login form...")
        await page.wait_for_selector('[data-testid="employee-id-input"]', timeout=5000)
        await page.wait_for_selector('[data-testid="authenticate-btn"]', timeout=5000)
        
        print("Clicking Authenticate...")
        await page.click('[data-testid="authenticate-btn"]', force=True)
        await page.wait_for_timeout(1500)

        # 2. Verify Dashboard
        print("Verifying dashboard loaded...")
        await page.wait_for_selector('[data-testid="nav-dashboard"]', timeout=5000)
        await page.wait_for_selector('[data-testid="stat-total-drains"]', timeout=5000)
        await page.screenshot(path="/app/test_reports/dashboard.png", quality=40, full_page=False)
        print("Dashboard verified & screenshot saved.")

        # 3. Test Navigation tabs
        print("Navigating to Drains...")
        await page.click('[data-testid="nav-drains"]', force=True)
        await page.wait_for_selector('[data-testid="drain-search-input"]', timeout=5000)

        print("Navigating to Analytics...")
        await page.click('[data-testid="nav-analytics"]', force=True)
        await page.wait_for_selector('[data-testid="analytics-view"]', timeout=5000)

        print("Navigating to Alerts...")
        await page.click('[data-testid="nav-alerts"]', force=True)
        await page.wait_for_selector('[data-testid="alert-filter-all"]', timeout=5000)

        # 4. Test Drain Search & Detail Inspection
        print("Returning to Drains to search and inspect D-031...")
        await page.click('[data-testid="nav-drains"]', force=True)
        await page.wait_for_selector('[data-testid="drain-search-input"]', timeout=5000)

        # Search for Malad
        await page.fill('[data-testid="drain-search-input"]', "Malad")
        await page.wait_for_timeout(500)
        await page.wait_for_selector('[data-testid="drain-row-D-031"]', timeout=5000)

        print("Clicking drain D-031 row...")
        await page.click('[data-testid="drain-row-D-031"]', force=True)

        # Verify Detail view
        await page.wait_for_selector('[data-testid="drain-detail-view"]', timeout=5000)
        await page.screenshot(path="/app/test_reports/drain_detail.png", quality=40, full_page=False)
        print("Drain Detail view verified & screenshot saved.")

        # Back to drains list
        await page.click('[data-testid="back-to-drains-btn"]', force=True)
        await page.wait_for_selector('[data-testid="drain-search-input"]', timeout=5000)

        # 5. Logout
        print("Testing logout...")
        await page.click('[data-testid="logout-btn"]', force=True)
        await page.wait_for_selector('[data-testid="authenticate-btn"]', timeout=5000)
        print("Successfully logged out. All E2E frontend tests passed!")

    except Exception as e:
        print(f"Frontend test failed: {str(e)}")
        raise e
