import { expect, test } from '@playwright/test';

// TODO: auto populate node list somehow
[
    "bizyair siliconcloud llm api",
    "bizyair joy caption",
    "bizyair joy caption2",
    "bizyair siliconcloud vlm api",
    "bizyair minuszone chatglm3 text encode",
    "bizyair ksampler",
    "bizyair cfgguider",
    "bizyair basicguider",
    "bizyair flipsigmas",
    "bizyair randomnoise",
    "bizyair disablenoise",
    "bizyair basicscheduler",
    "bizyair ksamplerselect",
    "bizyair ksampler(advanced)",
    "bizyair vae decode",
    "bizyair vae encode",
    "bizyair load vae",
    "bizyair load lora",
    "bizyair load controlnet model",
    "bizyair load clip vision",
    "bizyair shared lora loader",
    "bizyair load style model",
    "bizyair loraloader_legacy",
    "bizyair load upscale model",
    "bizyair load diffusion model",
    "bizyair dualcliploader",
    "bizyair triplecliploader",
    "bizyair fluxguidance",
    "bizyair cliptextencoderflux",
    "bizyair conditioningzeroout"
].forEach(nodeName => {
    test(nodeName, async ({ page }) => {
        await page.goto('http://localhost:8188/')
        await page.waitForTimeout(500)
        await page.locator('.workflows-tab-button').click()
        await page.getByText('EmptyWorkflow.json').click()
        await page.locator('#graph-canvas').dblclick({
          position: {
            x: 600,
            y: 300
          }
        })
        // Ref: https://github.com/Comfy-Org/ComfyUI_frontend/blob/57701f6145f622bf17237410c165966fb4aecc75/browser_tests/fixtures/components/ComfyNodeSearchBox.ts
        const input = page.locator(
            '.comfy-vue-node-search-container input[type="text"]'
        )
        const dropdown = page.locator(
            '.comfy-vue-node-search-container .p-autocomplete-list'
        )
        await input.waitFor({ state: 'visible' })
        await input.fill(nodeName)
        await dropdown.waitFor({ state: 'visible' })
        // Wait for some time for the auto complete list to update.
        // The auto complete list is debounced and may take some time to update.
        await page.waitForTimeout(500)
        await dropdown
          .locator('li')
          .nth(0)
          .click()
        await page.waitForTimeout(500)
        await page.mouse.move(700, 350)
        await page.mouse.down()
        await page.mouse.move(1000, 350)
        await page.mouse.up()
        await expect(page).toHaveScreenshot(`move_${nodeName}.png`)
    })
});
