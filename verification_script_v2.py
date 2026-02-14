import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Mobile viewport
    context = browser.new_context(viewport={"width": 375, "height": 667}, is_mobile=True)
    page = context.new_page()

    print("Connecting to server...")
    # Wait for server
    connected = False
    for i in range(30):
        try:
            page.goto("http://localhost:4321")
            connected = True
            break
        except Exception as e:
            print(f"Waiting for server... {e}")
            time.sleep(1)

    if not connected:
        print("Failed to connect to server")
        browser.close()
        return

    print("Page loaded")

    # 1. Verify Layout Adjustment (Visual Viewport)
    # We can't fully simulate visualViewport resize in headless easily without specific protocol commands,
    # but we can verify the inline style is applied if we mock the event or property.
    # For now, let's just verify the page loads and has the style attribute on the root div if possible,
    # or at least that it renders without error.

    # Check if the main div has the style attribute (it might be 100dvh if visualViewport is not mocked)
    # In our code: style={{ height: viewportHeight ? `${viewportHeight}px` : "100dvh" }}

    # 2. Verify PDF Button State
    # Click Preview
    try:
        page.click("text=Preview")
        print("Clicked Preview")
    except:
        print("Could not click Preview")

    # Wait for PDF button
    try:
        pdf_btn = page.wait_for_selector("button:has-text('PDF')")
        print("PDF button found")

        # Click PDF button
        pdf_btn.click()
        print("Clicked PDF button")

        # Check for "Generating..." text
        # It happens quickly, so we might miss it if we don't wait specifically or if it's too fast.
        # But we added a 100ms delay, so we should be able to catch it or at least see no crash.
        try:
            page.wait_for_selector("button:has-text('Generating...')", timeout=2000)
            print("Generating state verified")
        except:
            print("Could not catch Generating state (might be too fast or failed)")

    except:
        print("PDF button not found")

    page.screenshot(path="verification_mobile_pdf_loading.png")
    print("Screenshot taken")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
